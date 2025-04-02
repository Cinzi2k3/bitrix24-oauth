require('dotenv').config();
const express = require('express');
const axios = require('axios');
const fs = require('fs').promises;
const app = express();

// Kiểm tra biến môi trường
const { CLIENT_ID, CLIENT_SECRET, REDIRECT_URI, BITRIX_DOMAIN, PORT } = process.env;
if (!CLIENT_ID || !CLIENT_SECRET || !REDIRECT_URI || !BITRIX_DOMAIN || !PORT) {
    throw new Error('❌ Thiếu biến môi trường!');
}

// Lưu & đọc token từ file
const saveTokens = async (tokens) => await fs.writeFile('tokens.json', JSON.stringify(tokens, null, 2));
const loadTokens = async () => {
    try { return JSON.parse(await fs.readFile('tokens.json', 'utf8')); } catch { return null; }
};

// Làm mới token
const refreshToken = async () => {
    const tokens = await loadTokens();
    if (!tokens?.refresh_token) throw new Error('❌ Không có refresh token');

    try {
        const response = await axios.post('https://oauth.bitrix.info/oauth/token', null, {
            params: {
                grant_type: 'refresh_token',
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
                refresh_token: tokens.refresh_token,
            }
        });

        await saveTokens(response.data);
        return response.data.access_token;
    } catch (error) {
        console.error('❌ Lỗi refresh token:', error.response?.data || error.message);
        await fs.unlink('tokens.json');
        throw new Error('Vui lòng cài đặt lại ứng dụng!');
    }
};

// Gọi API Bitrix
const callApi = async (action, payload = {}) => {
    let tokens = await loadTokens();
    if (!tokens) throw new Error('❌ Không có token!');
    try {
        const response = await axios.get(`https://${BITRIX_DOMAIN}/rest/${action}`, {
            params: { auth: tokens.access_token, ...payload },
            timeout: 5000,
        });
        return response.data;
    } catch (error) {
        if (error.response?.data?.error === 'expired_token') {
            console.warn('🔄 Token hết hạn, đang làm mới...');
            tokens.access_token = await refreshToken();
            await saveTokens(tokens); // Lưu lại token đã cập nhật
            return callApi(action, payload); // Gọi lại với token mới
        }
        throw new Error(`❌ API lỗi: ${error.message}`);
    }
};

// Cài đặt ứng dụng
app.get('/install', (req, res) => {
    res.redirect(`https://${BITRIX_DOMAIN}/oauth/authorize/?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${REDIRECT_URI}`);
});

// Callback lấy token
app.get('/callback', async (req, res) => {
    const { code } = req.query;
    if (!code) return res.status(400).send('❌ Không có mã xác thực!');

    try {
        const response = await axios.post('https://oauth.bitrix.info/oauth/token', null, {
            params: { grant_type: 'authorization_code', client_id: CLIENT_ID, client_secret: CLIENT_SECRET, redirect_uri: REDIRECT_URI, code }
        });

        await saveTokens(response.data);
        res.send('✅ Cài đặt thành công!');
    } catch (error) {
        res.status(500).send(`Lỗi: ${error.message}`);
    }
});

app.get('/contacts', async (req, res) => {
    try {
        const tokens = await loadTokens();
        if (!tokens || !tokens.access_token) throw new Error('❌ Không có token hợp lệ!');

        // Lấy danh sách contact
        const contactResponse = await axios.get(`${tokens.client_endpoint}crm.contact.list`, {
            params: {
                auth: tokens.access_token,
                select: ["ID", "NAME", "LAST_NAME", "EMAIL", "PHONE", "WEB"]
            }
        });

        const contacts = contactResponse.data.result || [];

        // Lấy danh sách địa chỉ
        const addressResponse = await axios.get(`${tokens.client_endpoint}crm.address.list`, {
            params: {
                auth: tokens.access_token,
                select: ["ENTITY_ID", "ADDRESS_1", "CITY", "REGION", "COUNTRY"]
            }
        });
        const addresses = addressResponse.data.result || [];

        // Kết hợp dữ liệu contact với địa chỉ dựa trên ID
        const contactMap = contacts.map(contact => {
            const address = addresses.find(addr => addr.ENTITY_ID == contact.ID) || {};
            return {
                id: contact.ID,
                name: `${contact.LAST_NAME} ${contact.NAME}`.trim(),
                email: contact.EMAIL ? contact.EMAIL[0]?.VALUE : "Không có email",
                phone: contact.PHONE ? contact.PHONE[0]?.VALUE : "Không có số điện thoại",
                website: contact.WEB ? contact.WEB[0]?.VALUE : "Không có website",
                address: address ? `${address.ADDRESS_1 || ''}, ${address.REGION || ''}, ${address.CITY || ''}, ${address.COUNTRY || ''}`.trim() : "Không có địa chỉ"
            };
        });

        console.log('✅ Danh sách contact đầy đủ:', JSON.stringify(contactMap, null, 2));
        res.json(contactMap);
    } catch (error) {
        console.error('❌ Lỗi gọi API contact:', error.response?.data || error.message);
        res.status(500).json({ error: error.message });
    }
});

// Test API
app.get('/test-api', async (req, res) => res.json(await callApi('crm.contact.list')));

app.listen(PORT, () => console.log(`🚀 Server chạy tại port ${PORT}`));
