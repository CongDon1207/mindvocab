import React, { useEffect, useMemo, useState } from 'react'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import api from '@/lib/axios'
import type { ImportJob, ImportJobStatus } from '@/types/import'
import ImportReportDialog from './ImportReportDialog'

type ImportStatusDrawerProps = {
  open: boolean
  onOpenChange: (value: boolean) => void
  jobId: string | null
  onJobFinished?: (job: ImportJob) => void
}

const STATUS_LABELS: Record<ImportJobStatus, string> = {
  PENDING: 'Đang chờ xử lý',
  PARSING: 'Đang phân tích file',
  ENRICHING: 'Đang gọi AI',
  SAVING: 'Đang lưu dữ liệu',
  DONE: 'Hoàn tất',
  FAILED: 'Thất bại',
}

const STATUS_CLASS: Record<ImportJobStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  PARSING: 'bg-blue-100 text-blue-700',
  ENRICHING: 'bg-indigo-100 text-indigo-700',
  SAVING: 'bg-teal-100 text-teal-700',
  DONE: 'bg-emerald-100 text-emerald-700',
  FAILED: 'bg-red-100 text-red-700',
}

const ImportStatusDrawer: React.FC<ImportStatusDrawerProps> = ({
  open,
  onOpenChange,
  jobId,
  onJobFinished,
}) => {
  const [job, setJob] = useState<ImportJob | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [reportOpen, setReportOpen] = useState(false)
  const [hasEmittedFinish, setHasEmittedFinish] = useState(false)

  const pollInterval = Number(import.meta.env.VITE_IMPORT_POLL_INTERVAL_MS || 2000)

  useEffect(() => {
    if (!open || !jobId) {
      setJob(null)
      setError(null)
      setHasEmittedFinish(false)
      return
    }

    let isMounted = true
    let timer: number | null = null

    const fetchStatus = async () => {
      try {
        const response = await api.get<ImportJob>(`/import-jobs/${jobId}`)
        if (!isMounted) return
        setJob(response.data)
        setError(null)
      } catch (err: any) {
        const message = err.response?.data?.error || 'Không thể tải trạng thái import'
        if (isMounted) {
          setError(message)
        }
      }
    }

    fetchStatus()
    timer = window.setInterval(fetchStatus, pollInterval)

    return () => {
      isMounted = false
      if (timer) {
        window.clearInterval(timer)
      }
    }
  }, [open, jobId, pollInterval])

  useEffect(() => {
    if (!job || hasEmittedFinish) return
    if (job.status === 'DONE' || job.status === 'FAILED') {
      setHasEmittedFinish(true)
      onJobFinished?.(job)
    }
  }, [job, hasEmittedFinish, onJobFinished])

  const progressValue = useMemo(() => {
    if (!job) return 0
    const total = job.progress?.totalRecords || 0
    if (!total) return job.status === 'DONE' ? 100 : 10
    const processed = job.progress?.processedRecords || 0
    return Math.min(Math.round((processed / total) * 100), 100)
  }, [job])

  const recentErrors = job?.report?.errors?.slice(-5) || []

  return (
    <>
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Import words</DrawerTitle>
            <DrawerDescription>
              Theo dõi tiến độ import cho job {jobId ? `#${jobId}` : ''}
            </DrawerDescription>
          </DrawerHeader>

          {!job && !error && (
            <p className="text-sm text-muted-foreground">Đang khởi tạo job...</p>
          )}
          {error && <p className="text-sm text-red-500">{error}</p>}

          {job && (
            <div className="space-y-6">
              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Trạng thái hiện tại</span>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_CLASS[job.status]}`}
                  >
                    {STATUS_LABELS[job.status]}
                  </span>
                </div>
                <Progress value={progressValue} />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>
                    Đã xử lý: {job.progress?.processedRecords || 0}/
                    {job.progress?.totalRecords || '?'}
                  </span>
                  <span>Cập nhật lúc: {new Date(job.updatedAt).toLocaleTimeString()}</span>
                </div>
              </section>

              <section className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded border p-3">
                  <p className="text-muted-foreground text-xs uppercase">Tổng dòng</p>
                  <p className="text-lg font-semibold">{job.counters.totalLines}</p>
                </div>
                <div className="rounded border p-3">
                  <p className="text-muted-foreground text-xs uppercase">Đã parse hợp lệ</p>
                  <p className="text-lg font-semibold">{job.counters.parsedOk}</p>
                </div>
                <div className="rounded border p-3">
                  <p className="text-muted-foreground text-xs uppercase">Enrich thành công</p>
                  <p className="text-lg font-semibold">{job.counters.enrichedOk}</p>
                </div>
                <div className="rounded border p-3">
                  <p className="text-muted-foreground text-xs uppercase">Bỏ qua trùng</p>
                  <p className="text-lg font-semibold">{job.counters.duplicatesSkipped}</p>
                </div>
              </section>

              <section className="rounded border p-3">
                <p className="mb-2 text-sm font-semibold">Lỗi gần nhất</p>
                {recentErrors.length === 0 ? (
                  <p className="text-xs text-muted-foreground">Chưa có lỗi nào.</p>
                ) : (
                  <ul className="space-y-2 text-xs">
                    {recentErrors.map((item, index) => (
                      <li key={`${item.stage}-${index}`} className="rounded bg-red-50 p-2">
                        <p className="font-medium">{item.stage}</p>
                        <p>{item.message}</p>
                        {item.location && (
                          <p className="text-[10px] text-muted-foreground">
                            Vị trí: {item.location}
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>
          )}

          <DrawerFooter>
            <Button variant="outline" onClick={() => setReportOpen(true)} disabled={!job}>
              Xem báo cáo chi tiết
            </Button>
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Đóng
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {jobId && (
        <ImportReportDialog open={reportOpen} onOpenChange={setReportOpen} jobId={jobId} />
      )}
    </>
  )
}

export default ImportStatusDrawer

