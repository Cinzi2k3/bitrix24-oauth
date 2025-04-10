require('dotenv').config();
const express = require('express');
const cors = require('cors');
const logger = require('./middleware/logger');
const corsOptions = require('./middleware/corsConfig');

const authRoutes = require('./routes/authRoutes');
const contactRoutes = require('./routes/contactRoutes');
const miscRoutes = require('./routes/miscRoutes');

const ngrok = require('ngrok'); // Thêm Ngrok
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors(corsOptions));
app.use(logger);

app.use('/', authRoutes);
app.use('/', contactRoutes);
app.use('/', miscRoutes);

// Hàm khởi động server và Ngrok
async function startServer() {
  try {
    // Khởi động server Express
    const server = await new Promise((resolve, reject) => {
      const serverInstance = app.listen(port, () => {
        console.log(`🚀 Server chạy tại port ${port}`);
        resolve(serverInstance);
      }).on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          console.error(`❌ Cổng ${port} đã được sử dụng`);
          reject(new Error(`Cổng ${port} đã được sử dụng`));
        } else {
          reject(err);
        }
      });
    });

    // Đợi 1 giây để đảm bảo server ổn định
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Khởi động Ngrok
    const ngrokUrl = await ngrok.connect({
      addr: port,
      authtoken: process.env.NGROK_AUTH_TOKEN // Sử dụng token từ .env (nếu có)
    });
    console.log(`🌐 Ngrok URL: ${ngrokUrl}`);

    // Cập nhật REDIRECT_URI nếu cần (ví dụ cho OAuth)
    process.env.REDIRECT_URI = `${ngrokUrl}/callback`;
    console.log(`🔗 REDIRECT_URI: ${process.env.REDIRECT_URI}`);

    return server; // Trả về instance server nếu cần
  } catch (err) {
    console.error('❌ Lỗi khởi chạy server hoặc Ngrok:', err.message);
    console.error('Chi tiết lỗi:', err.stack);
    process.exit(1);
  }
}

// Chạy server và Ngrok
startServer();