// server.js
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { connectDB } from './config/db.js'; // cần có .js ở cuối vì đang dùng ESM
import folderRoute from './routes/folderRoute.js';
import wordRoute from './routes/wordRoute.js';
import sessionRoute from './routes/sessionRoute.js';
import importJobRoute from './routes/importJobRoute.js';
import path from 'path';

dotenv.config();

const PORT = process.env.PORT || 5001;
const __dirname = path.resolve();
const app = express();



// Middleware
app.use(express.json());
if (process.env.NODE_ENV !== 'production') {
  app.use(cors());
}

// Routes - PHẢI ĐẶT TRƯỚC catch-all route
app.use('/api/folders', folderRoute);
app.use('/api/words', wordRoute);
app.use('/api', sessionRoute); // /api/sessions, /api/attempts
app.use('/api/import-jobs', importJobRoute);

// Route kiểm tra server
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, message: 'Server is running' });
});

// Production: Serve static files + SPA catch-all
if (process.env.NODE_ENV == 'production') {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  // Catch-all CUỐI CÙNG - chỉ cho non-API routes
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
  });
}

// Kết nối DB và khởi động server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`✅ Server đang chạy trên cổng ${PORT}`);
  });
}).catch((err) => {
  console.error('❌ Lỗi kết nối MongoDB:', err.message);
});
