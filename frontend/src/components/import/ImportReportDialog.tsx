import React, { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import api from '@/lib/axios'
import type { ImportJobReport } from '@/types/import'

export default function ImportReportDialog({ open, onOpenChange, jobId }: { open: boolean; onOpenChange: (value: boolean) => void; jobId: string }) {
  const [report, setReport] = useState<ImportJobReport | null>(null)
  useEffect(() => { if (open) api.get<ImportJobReport>(`/import-jobs/${jobId}/report`).then((response) => setReport(response.data)) }, [open, jobId])
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent><DialogHeader><DialogTitle>Báo cáo import</DialogTitle></DialogHeader>{report && <div className="space-y-4 text-sm"><div className="grid grid-cols-2 gap-2"><p>Hợp lệ: {report.counters.validRows}</p><p>Đã tạo: {report.counters.createdCount}</p><p>Đã cập nhật: {report.counters.updatedCount}</p><p>Đã bỏ qua: {report.counters.skippedCount}</p></div><ul>{report.report.skippedWords.map((item, index) => <li key={index}>{item.word}: {item.reason}</li>)}</ul><ul className="text-amber-700">{(report.report.warnings || []).map((item, index) => <li key={index}>{item.location}: {item.message}</li>)}</ul><ul className="text-red-600">{report.report.errors.map((item, index) => <li key={index}>{item.location}: {item.message}</li>)}</ul></div>}<DialogFooter><Button onClick={() => onOpenChange(false)}>Đóng</Button></DialogFooter></DialogContent></Dialog>
}
