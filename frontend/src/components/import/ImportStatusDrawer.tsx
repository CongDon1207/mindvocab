import React, { useEffect, useState } from 'react'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter } from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import api from '@/lib/axios'
import type { ImportJob } from '@/types/import'
import ImportReportDialog from './ImportReportDialog'

type Props = { open: boolean; onOpenChange: (value: boolean) => void; jobId: string | null; onJobFinished?: (job: ImportJob) => void }
const label = { PENDING: 'Đang chờ', SAVING: 'Đang lưu dữ liệu', DONE: 'Hoàn tất', FAILED: 'Thất bại' }

export default function ImportStatusDrawer({ open, onOpenChange, jobId, onJobFinished }: Props) {
  const [job, setJob] = useState<ImportJob | null>(null); const [reportOpen, setReportOpen] = useState(false)
  useEffect(() => { if (!open || !jobId) return; let active = true; const load = async () => { const result = await api.get<ImportJob>(`/import-jobs/${jobId}`); if (active) { setJob(result.data); if (['DONE', 'FAILED'].includes(result.data.status)) onJobFinished?.(result.data) } }; load(); const timer = window.setInterval(load, 1500); return () => { active = false; window.clearInterval(timer) } }, [open, jobId, onJobFinished])
  return <><Drawer open={open} onOpenChange={onOpenChange}><DrawerContent><DrawerHeader><DrawerTitle>Import words</DrawerTitle><DrawerDescription>{job ? label[job.status] : 'Đang khởi tạo...'}</DrawerDescription></DrawerHeader>{job && <div className="space-y-4 px-4"><Progress value={job.status === 'DONE' ? 100 : job.progress.totalRecords ? job.progress.processedRecords / job.progress.totalRecords * 100 : 10} /><div className="grid grid-cols-2 gap-3 text-sm"><p>Tổng dòng: <b>{job.counters.totalLines}</b></p><p>Hợp lệ: <b>{job.counters.validRows}</b></p><p>Đã tạo: <b>{job.counters.createdCount}</b></p><p>Đã cập nhật: <b>{job.counters.updatedCount}</b></p><p>Đã bỏ qua: <b>{job.counters.skippedCount}</b></p><p>Lỗi: <b>{job.counters.failedCount}</b></p></div></div>}<DrawerFooter><Button variant="outline" disabled={!job} onClick={() => setReportOpen(true)}>Xem báo cáo</Button><Button variant="ghost" onClick={() => onOpenChange(false)}>Đóng</Button></DrawerFooter></DrawerContent></Drawer>{jobId && <ImportReportDialog open={reportOpen} onOpenChange={setReportOpen} jobId={jobId} />}</>
}
