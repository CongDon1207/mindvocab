// src/routes/wordRoute.js
import express from 'express';
import { createWord, updateWord, deleteWord, enrichWord } from '../controllers/wordController.js';

const router = express.Router();

// Tạo từ mới
router.post('/', createWord);

// Cập nhật từ
router.put('/:id', updateWord);

// Enrich từ bằng AI
router.post('/:id/enrich', enrichWord);

// Xóa từ
router.delete('/:id', deleteWord);

export default router;
