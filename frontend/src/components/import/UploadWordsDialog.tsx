import React, { useState } from 'react'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import api from '@/lib/axios'

type Props = { open: boolean; onOpenChange: (value: boolean) => void; folderId: string; onJobCreated: (jobId: string) => void }
type Preview = { totalLines: number; validRows: number; duplicates: string[]; existingWords: string[]; errors: { location?: string; message: string }[] }
const headers = 'word | meaning_vi | pos | ipa | note | ex1_en | ex1_vi | ex2_en | ex2_vi | fill_en'
const prompt = `Please communicate with me in Vietnamese. If I have not given you a word list, only ask me to send the list. When I give a list, return only a Markdown table with exactly these columns in this order: ${headers}. Keep all listed words, write concise Vietnamese meanings, use noun/verb/adj/adv/prep/phrase/idiom/other for pos, and leave only ipa or note empty when needed. Make two distinct natural examples and one different fill_en sentence (7-18 words); every English sentence must contain the word exactly once. In note, state common context, collocations, or important usage cautions.`

export default function UploadWordsDialog({ open, onOpenChange, folderId, onJobCreated }: Props) {
  const [tab, setTab] = useState<'paste' | 'file'>('paste'); const [tableContent, setTableContent] = useState(''); const [file, setFile] = useState<File | null>(null)
  const [duplicatePolicy, setDuplicatePolicy] = useState<'skip' | 'fill_missing' | 'overwrite'>('skip'); const [preview, setPreview] = useState<Preview | null>(null); const [error, setError] = useState(''); const [loading, setLoading] = useState(false)
  const close = (value: boolean) => { if (!value) { setTableContent(''); setFile(null); setPreview(null); setError('') }; onOpenChange(value) }
  const formData = () => { const data = new FormData(); data.append('folderId', folderId); if (tab === 'paste') data.append('tableContent', tableContent); else if (file) data.append('file', file); return data }
  const previewImport = async () => { try { setLoading(true); setError(''); const response = await api.post<Preview>('/import-jobs/preview', formData(), { headers: { 'Content-Type': 'multipart/form-data' } }); setPreview(response.data) } catch (err: any) { setError(err.response?.data?.error || 'Cannot preview this import.') } finally { setLoading(false) } }
  const submit = async () => { try { setLoading(true); setError(''); const data = formData(); data.append('duplicatePolicy', duplicatePolicy); const response = await api.post('/import-jobs', data, { headers: { 'Content-Type': 'multipart/form-data' } }); onJobCreated(response.data.jobId); close(false) } catch (err: any) { setError(err.response?.data?.error || 'Import failed.') } finally { setLoading(false) } }
  const copyPrompt = async () => { await navigator.clipboard.writeText(prompt); window.open('https://chatgpt.com/', '_blank', 'noopener,noreferrer') }
  const canPreview = tab === 'paste' ? Boolean(tableContent.trim()) : Boolean(file)
  return <Dialog open={open} onOpenChange={close}><DialogContent className="sm:max-w-[680px]"><DialogHeader><DialogTitle>Nhập danh sách từ</DialogTitle></DialogHeader>
    <div className="flex gap-2"><Button size="sm" variant={tab === 'paste' ? 'default' : 'outline'} onClick={() => setTab('paste')}>Dán bảng từ ChatGPT</Button><Button size="sm" variant={tab === 'file' ? 'default' : 'outline'} onClick={() => setTab('file')}>Upload Excel</Button></div>
    {tab === 'paste' ? <div className="grid gap-2"><div className="flex justify-between gap-3"><Label>Bảng Markdown</Label><Button type="button" size="sm" variant="outline" onClick={copyPrompt}>Mở ChatGPT và sao chép prompt</Button></div><Textarea rows={10} value={tableContent} onChange={(event) => { setTableContent(event.target.value); setPreview(null) }} placeholder={`| ${headers} |`} /><p className="text-xs text-muted-foreground">Dán nguyên bảng Markdown do ChatGPT trả về.</p></div> : <div className="grid gap-2"><Label>File Excel (.xlsx)</Label><Input type="file" accept=".xlsx" onChange={(event) => { setFile(event.target.files?.[0] || null); setPreview(null) }} /><a href="/import-samples/sample.xlsx" download className="text-sm text-blue-600 hover:underline">Tải mẫu Excel 10 cột</a></div>}
    <div className="grid gap-2"><Label>Trùng từ</Label><select value={duplicatePolicy} onChange={(event) => setDuplicatePolicy(event.target.value as typeof duplicatePolicy)} className="rounded border px-3 py-2 text-sm"><option value="skip">Bỏ qua từ đã có</option><option value="fill_missing">Chỉ điền trường đang trống</option><option value="overwrite">Ghi đè nội dung, giữ tiến độ SRS</option></select></div>
    {preview && <div className="rounded border p-3 text-sm space-y-1"><p>{preview.validRows}/{preview.totalLines} dòng hợp lệ.</p><p>{preview.duplicates.length} từ trùng trong bảng; {preview.existingWords.length} từ đã có trong folder.</p>{preview.errors.slice(0, 5).map((item, index) => <p className="text-red-600" key={index}>{item.location}: {item.message}</p>)}</div>}
    {error && <p className="text-sm text-red-600">{error}</p>}<DialogFooter><Button variant="outline" onClick={() => close(false)}>Hủy</Button><Button variant="outline" disabled={!canPreview || loading} onClick={previewImport}>Kiểm tra</Button><Button disabled={!preview || preview.errors.length > 0 || loading} onClick={submit}>Import</Button></DialogFooter>
  </DialogContent></Dialog>
}
