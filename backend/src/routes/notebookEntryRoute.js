import express from 'express';
import {
    getNotebookEntries,
    createNotebookEntry,
    getNotebookEntryById,
    updateNotebookEntry,
    deleteNotebookEntry,
    importExercises,
    submitReview
} from '../controllers/notebookEntryController.js';
import multer from 'multer';
import path from 'path';

// Setup multer for temp files
const upload = multer({ dest: path.join(path.resolve(), 'temp-uploads/') });

const router = express.Router();

router.route('/')
    .get(getNotebookEntries)
    .post(createNotebookEntry);

router.route('/:id')
    .get(getNotebookEntryById)
    .put(updateNotebookEntry)
    .delete(deleteNotebookEntry);

router.post('/:id/exercises/import', upload.single('file'), importExercises);
router.post('/:id/review', submitReview);

export default router;
