const axios = require('axios');
const fs = require('fs').promises;
const { loadTokens, saveTokens } = require('./tokenService');
const { CLIENT_ID, CLIENT_SECRET, BITRIX_DOMAIN } = process.env;

// Hàm này sẽ được gọi khi token hết hạn
// Nó sẽ lấy refresh token từ file tokens.json và gọi API để lấy access token mới
const refreshToken = async () => {
  const tokens = await loadTokens();
  if (!tokens?.refresh_token) throw new Error('❌ Không có refresh token');

  try {
    const res = await axios.post('https://oauth.bitrix.info/oauth/token', null, {
      params: {
        grant_type: 'refresh_token',
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        refresh_token: tokens.refresh_token,
      }
    });
    await saveTokens(res.data);
    return res.data.access_token;
  } catch (err) {
    await fs.unlink('tokens.json');
    throw new Error('Vui lòng cài đặt lại ứng dụng!');
  }
};

// Hàm này sẽ được gọi để gọi API của Bitrix24
// Nó sẽ tự động xử lý việc làm mới token nếu token hết hạn
exports.callApi = async (action, payload = {}) => {
  let tokens = await loadTokens();
  if (!tokens) throw new Error('❌ Không có token!');

  try {
    const res = await axios.get(`https://${BITRIX_DOMAIN}/rest/${action}`, {
      params: { auth: tokens.access_token, ...payload },
      timeout: 5000,
    });
    return res.data;
  } catch (err) {
    if (err.response?.data?.error === 'expired_token') {
      tokens.access_token = await refreshToken();
      await saveTokens(tokens);
      return exports.callApi(action, payload);
    }
    throw new Error(`❌ API lỗi: ${err.message}`);
  }
};
