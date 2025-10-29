import express from 'express'
import multer from 'multer'
import path from 'path'
import { createImportJob, getImportJobStatus, getImportJobReportHandler } from '../controllers/importJobController.js'
import { resolveTempDir } from '../utils/fileUtils.js'

const router = express.Router()

const allowedMimeTypes = new Set([
  'text/plain',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
])

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, resolveTempDir())
    },
    filename: (_req, file, cb) => {
      const timestamp = Date.now()
      const safeName = file.originalname.replace(/\s+/g, '_')
      cb(null, `${timestamp}-${safeName}`)
    },
  }),
  limits: {
    fileSize: Number(process.env.IMPORT_MAX_SIZE_MB || 5) * 1024 * 1024,
  },
  fileFilter: (_req, file, cb) => {
    if (allowedMimeTypes.has(file.mimetype)) {
      cb(null, true)
    } else if (path.extname(file.originalname).toLowerCase() === '.txt') {
      cb(null, true)
    } else if (path.extname(file.originalname).toLowerCase() === '.xlsx') {
      cb(null, true)
    } else {
      cb(new Error('Định dạng file không hợp lệ (chỉ nhận .txt, .xlsx)'))
    }
  },
})

router.post('/', upload.single('file'), createImportJob)
router.get('/:id', getImportJobStatus)
router.get('/:id/report', getImportJobReportHandler)

export default router

