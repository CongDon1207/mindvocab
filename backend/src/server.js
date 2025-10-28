// server.js
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { connectDB } from './config/db.js'; // cần có .js ở cuối vì đang dùng ESM
import folderRoute from './routes/folderRoute.js';
import wordRoute from './routes/wordRoute.js';
import sessionRoute from './routes/sessionRoute.js';

dotenv.config();

const PORT = process.env.PORT || 5001;
const app = express();

// Middleware
app.use(express.json());
if (process.env.NODE_ENV !== 'production') {
  app.use(cors());
}

// Routes
app.use('/api/folders', folderRoute);
app.use('/api/words', wordRoute);
app.use('/api', sessionRoute); // /api/sessions, /api/attempts


// Route kiểm tra server
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, message: 'Server is running' });
});

// Kết nối DB và khởi động server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`✅ Server đang chạy trên cổng ${PORT}`);
  });
}).catch((err) => {
  console.error('❌ Lỗi kết nối MongoDB:', err.message);
});
