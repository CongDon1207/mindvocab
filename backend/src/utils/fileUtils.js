import fs from 'fs'
import fsPromises from 'fs/promises'
import path from 'path'

export function ensureDirSync(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true })
  }
}

export async function ensureDir(dirPath) {
  await fsPromises.mkdir(dirPath, { recursive: true })
}

export async function moveFile(source, destination) {
  await ensureDir(path.dirname(destination))
  await fsPromises.rename(source, destination)
}

export async function removeDir(targetPath) {
  try {
    await fsPromises.rm(targetPath, { recursive: true, force: true })
  } catch (error) {
    // swallow cleanup errors to avoid crashing pipeline
    console.warn(`[import] Không thể xoá thư mục tạm: ${error.message}`)
  }
}

export function resolveStorageDir() {
  const root = process.env.IMPORT_STORAGE_DIR || path.join(process.cwd(), 'storage', 'imports')
  ensureDirSync(root)
  return root
}

export function resolveTempDir() {
  const root = process.env.IMPORT_TEMP_DIR || path.join(process.cwd(), 'storage', 'tmp')
  ensureDirSync(root)
  return root
}

