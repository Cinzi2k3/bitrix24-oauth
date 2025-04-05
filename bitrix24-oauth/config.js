// config.js
require('dotenv').config(); // Đảm bảo nạp biến từ file .env

const { CLIENT_ID, CLIENT_SECRET, REDIRECT_URI, BITRIX_DOMAIN, PORT } = process.env;

// Kiểm tra các biến môi trường bắt buộc
if (!CLIENT_ID || !CLIENT_SECRET || !REDIRECT_URI || !BITRIX_DOMAIN || !PORT) {
    throw new Error('❌ Thiếu biến môi trường!');
}

module.exports = {
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI,
    BITRIX_DOMAIN,
    PORT
};
