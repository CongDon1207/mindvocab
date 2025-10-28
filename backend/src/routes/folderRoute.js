import express from 'express';
import { createFolder, deleteFolder, getFolderById, listFolders, updateFolder } from '../controllers/folderController.js';

const router = express.Router();



router.post('/', createFolder);

router.get('/', listFolders);

router.put('/:id', updateFolder);

router.delete('/:id', deleteFolder);

router.get('/:id', getFolderById);

export default router;