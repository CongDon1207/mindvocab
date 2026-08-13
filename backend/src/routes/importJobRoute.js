import express from 'express'
import multer from 'multer'
import path from 'node:path'
import { createImportJob, getImportJobStatus, getImportJobReportHandler, previewImportJob } from '../controllers/importJobController.js'
import { resolveTempDir } from '../utils/fileUtils.js'

const router = express.Router()
const upload = multer({ storage: multer.diskStorage({ destination: (_req, _file, done) => done(null, resolveTempDir()), filename: (_req, file, done) => done(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`) }), limits: { fileSize: Number(process.env.IMPORT_MAX_SIZE_MB || 5) * 1024 * 1024 }, fileFilter: (_req, file, done) => path.extname(file.originalname).toLowerCase() === '.xlsx' ? done(null, true) : done(new Error('Only .xlsx files are supported.')) })

router.post('/preview', upload.single('file'), previewImportJob)
router.post('/', upload.single('file'), createImportJob)
router.get('/:id', getImportJobStatus)
router.get('/:id/report', getImportJobReportHandler)
export default router
