import express from 'express'
import { createWord, updateWord, deleteWord } from '../controllers/wordController.js'

const router = express.Router()
router.post('/', createWord)
router.put('/:id', updateWord)
router.delete('/:id', deleteWord)

export default router
