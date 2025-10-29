import React, { useState } from 'react'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import api from '@/lib/axios'

type UploadWordsDialogProps = {
  open: boolean
  onOpenChange: (value: boolean) => void
  folderId: string
  onJobCreated: (jobId: string) => void
}

const ACCEPTED_TYPES = ['text/plain', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
const MAX_SIZE_MB = Number(import.meta.env.VITE_IMPORT_MAX_SIZE_MB || 5)

const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`
}

const UploadWordsDialog: React.FC<UploadWordsDialogProps> = ({
  open,
  onOpenChange,
  folderId,
  onJobCreated,
}) => {
  const [file, setFile] = useState<File | null>(null)
  const [allowUpdate, setAllowUpdate] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const resetState = () => {
    setFile(null)
    setAllowUpdate(false)
    setError(null)
    setIsSubmitting(false)
  }

  const handleClose = (value: boolean) => {
    if (!value) {
      resetState()
    }
    onOpenChange(value)
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setError(null)
    const selected = event.target.files?.[0]
    if (!selected) {
      setFile(null)
      return
    }
    const isValidType =
      ACCEPTED_TYPES.includes(selected.type) ||
      selected.name.toLowerCase().endsWith('.txt') ||
      selected.name.toLowerCase().endsWith('.xlsx')
    if (!isValidType) {
      setError('Định dạng không hợp lệ. Chỉ hỗ trợ .txt và .xlsx')
      setFile(null)
      return
    }
    if (selected.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`File vượt quá giới hạn ${MAX_SIZE_MB}MB`)
      setFile(null)
      return
    }
    setFile(selected)
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!file) {
      setError('Vui lòng chọn file cần upload')
      return
    }

    try {
      setIsSubmitting(true)
      setError(null)
      const formData = new FormData()
      formData.append('folderId', folderId)
      formData.append('allowUpdate', allowUpdate ? 'true' : 'false')
      formData.append('file', file)

      const response = await api.post('/import-jobs', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      const jobId = response.data?.jobId
      if (jobId) {
        onJobCreated(jobId)
        handleClose(false)
      } else {
        setError('Không nhận được thông tin job từ server')
      }
    } catch (err: any) {
      const message = err.response?.data?.error || 'Upload thất bại, vui lòng thử lại'
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Upload danh sách từ</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label>Chọn file (.txt hoặc .xlsx)</Label>
            <Input type="file" accept=".txt,.xlsx" onChange={handleFileChange} />
            <p className="text-xs text-gray-500">
              Giới hạn dung lượng: {MAX_SIZE_MB}MB. Mỗi dòng: <code>word: meaning</code> (TXT) hoặc
              dùng header chuẩn (Excel).
            </p>
            {file && (
              <div className="rounded-md border bg-slate-50 p-3 text-sm">
                <div className="font-medium">{file.name}</div>
                <div className="text-muted-foreground">{formatBytes(file.size)}</div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Tùy chọn</Label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="size-4"
                checked={allowUpdate}
                onChange={(e) => setAllowUpdate(e.target.checked)}
              />
              Cho phép cập nhật từ đã có (ghi đè dữ liệu hiện có nếu cần)
            </label>
          </div>

          <div className="space-y-2">
            <Label>Mẫu tham khảo</Label>
            <div className="flex flex-wrap gap-2 text-sm">
              <a
                href="/import-samples/sample.txt"
                className="text-blue-600 hover:underline"
                download
              >
                Tải mẫu TXT
              </a>
              <a
                href="/import-samples/sample.xlsx"
                className="text-blue-600 hover:underline"
                download
              >
                Tải mẫu Excel
              </a>
            </div>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleClose(false)}>
              Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Đang xử lý...' : 'Bắt đầu import'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default UploadWordsDialog

