// src/routes/wordRoute.js
import express from 'express';
import { createWord, updateWord, deleteWord } from '../controllers/wordController.js';

const router = express.Router();

// Tạo từ mới
router.post('/', createWord);

// Cập nhật từ
router.put('/:id', updateWord);

// Xóa từ
router.delete('/:id', deleteWord);

export default router;
