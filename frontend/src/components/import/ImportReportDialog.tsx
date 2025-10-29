import React, { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import api from '@/lib/axios'
import type { ImportJobReport } from '@/types/import'

type ImportReportDialogProps = {
  open: boolean
  onOpenChange: (value: boolean) => void
  jobId: string
}

const ImportReportDialog: React.FC<ImportReportDialogProps> = ({ open, onOpenChange, jobId }) => {
  const [report, setReport] = useState<ImportJobReport | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchReport = async () => {
    if (!jobId) return
    try {
      setLoading(true)
      setError(null)
      const response = await api.get<ImportJobReport>(`/import-jobs/${jobId}/report`)
      setReport(response.data)
    } catch (err: any) {
      const message = err.response?.data?.error || 'Không thể tải báo cáo'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open) {
      fetchReport()
    } else {
      setReport(null)
      setError(null)
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Báo cáo import #{jobId}</DialogTitle>
        </DialogHeader>

        {loading && <p className="text-sm text-muted-foreground">Đang tải báo cáo...</p>}
        {error && <p className="text-sm text-red-500">{error}</p>}

        {!loading && report && (
          <div className="space-y-6">
            <section className="grid gap-2 rounded-md border p-4">
              <h3 className="text-base font-semibold">Tổng quan</h3>
              <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
                <div>
                  <p className="text-muted-foreground">Trạng thái</p>
                  <p className="font-medium">{report.status}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Tổng dòng</p>
                  <p className="font-medium">{report.counters.totalLines}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Đã parse</p>
                  <p className="font-medium">{report.counters.parsedOk}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Enrich thành công</p>
                  <p className="font-medium">{report.counters.enrichedOk}</p>
                </div>
              </div>
            </section>

            <section className="rounded-md border p-4">
              <h3 className="text-base font-semibold mb-2">Bản ghi bỏ qua</h3>
              {report.report.skippedWords.length === 0 ? (
                <p className="text-sm text-muted-foreground">Không có bản ghi nào bị bỏ qua.</p>
              ) : (
                <ul className="space-y-2 text-sm">
                  {report.report.skippedWords.map((item, index) => (
                    <li key={`${item.word}-${index}`} className="rounded bg-slate-100 p-2">
                      <span className="font-medium">{item.word}</span> — {item.reason}
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="rounded-md border p-4">
              <h3 className="text-base font-semibold mb-2">Lỗi chi tiết</h3>
              {report.report.errors.length === 0 ? (
                <p className="text-sm text-muted-foreground">Không ghi nhận lỗi nào.</p>
              ) : (
                <ul className="space-y-2 text-sm">
                  {report.report.errors.map((errItem, index) => (
                    <li key={`${errItem.stage}-${index}`} className="rounded bg-red-50 p-2">
                      <p className="font-medium">{errItem.stage}</p>
                      <p>{errItem.message}</p>
                      {errItem.location && (
                        <p className="text-xs text-muted-foreground">Vị trí: {errItem.location}</p>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        )}

        <DialogFooter className="sm:justify-between">
          <Button type="button" variant="ghost" onClick={fetchReport} disabled={loading}>
            Làm mới
          </Button>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ImportReportDialog

