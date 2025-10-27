import express from 'express';
import { createFolder, getFolderById, listFolders } from '../controllers/folderController.js';

const router = express.Router();



router.post('/', createFolder);

router.get('/', listFolders);

router.get('/:id', getFolderById);

export default router;