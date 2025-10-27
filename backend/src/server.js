// server.js
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { connectDB } from './config/db.js'; // cần có .js ở cuối vì đang dùng ESM
import folderRoute from './routes/folderRoute.js';

dotenv.config();

const PORT = process.env.PORT || 5001;
const app = express();

// Middleware
app.use(express.json());
if (process.env.NODE_ENV !== 'production') {
  app.use(cors());
}

//
app.use('/api/Folder', folderRoute);


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
