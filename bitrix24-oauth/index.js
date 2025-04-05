require('dotenv').config();
const express = require('express');
const config = require('./config');
const cors = require('cors');
const logger = require('./middleware/logger');
const corsOptions = require('./middleware/corsConfig');

const authRoutes = require('./routes/authRoutes');
const contactRoutes = require('./routes/contactRoutes');
const miscRoutes = require('./routes/miscRoutes');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors(corsOptions));
app.use(logger);

app.use('/', authRoutes);
app.use('/', contactRoutes);
app.use('/', miscRoutes);

app.listen(config.PORT, () => console.log(`🚀 Server chạy tại port ${config.PORT}`));
