const axios = require('axios');
const fs = require('fs').promises;
const { CLIENT_ID, CLIENT_SECRET, REDIRECT_URI, BITRIX_DOMAIN } = process.env;
const { saveTokens } = require('../services/tokenService');

//Cài đặt ứng dụng
exports.installApp = (req, res) => {
  res.redirect(`https://${BITRIX_DOMAIN}/oauth/authorize/?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${REDIRECT_URI}`);
};

//Xử lý callback lấy token
exports.handleCallback = async (req, res) => {
  const { code } = req.query;
  if (!code) return res.status(400).send('❌ Không có mã xác thực!');

  try {
    const response = await axios.post('https://oauth.bitrix.info/oauth/token', null, {
      params: { grant_type: 'authorization_code', client_id: CLIENT_ID, client_secret: CLIENT_SECRET, redirect_uri: REDIRECT_URI, code }
    });
    await saveTokens(response.data);
    res.send('Lấy thành công token!');
  } catch (error) {
    res.status(500).send(`Lỗi: ${error.message}`);
  }
};

// Xử lý cài đặt ứng dụng trên Bitrix24
exports.bitrixInstallHandler = async (req, res) => {
  try {
    const { DOMAIN, APP_SID } = req.query;
    await fs.writeFile('bitrix-config.json', JSON.stringify({
      domain: DOMAIN,
      appSid: APP_SID,
      installedAt: new Date().toISOString()
    }, null, 2));
    res.send(`
      <html><body><p>Ứng dụng đã được cài đặt thành công</p></body></html>
    `);
  } catch (error) {
    console.error('Lỗi xử lý cài đặt:', error);
    res.status(500).send('Lỗi cài đặt ứng dụng');
  }
};
