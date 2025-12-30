import express from 'express';
import { createFolder, deleteFolder, getFolderById, getFolderStats, getReviewDashboard, listFolders, updateFolder } from '../controllers/folderController.js';
import { getWordsInFolder } from '../controllers/wordController.js';

const router = express.Router();

router.get('/review-dashboard', getReviewDashboard);

router.post('/', createFolder);

router.get('/', listFolders);

router.put('/:id', updateFolder);

router.delete('/:id', deleteFolder);

// Lấy danh sách từ trong folder (đặt trước /:id để tránh conflict)
router.get('/:id/words', getWordsInFolder);

router.get('/:id/stats', getFolderStats);

router.get('/:id', getFolderById);

export default router;