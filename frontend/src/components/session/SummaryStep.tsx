import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { AlertCircle, Calendar, Home, RefreshCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import api from '@/lib/axios'
import type { CompletionResult, Session } from '@/types/session'
import type { Word } from '@/types/word'

type Props = { session: Session }
const labels = { strong: 'Nhớ tốt', reinforce: 'Cần củng cố', forgotten: 'Đã quên' }

const SummaryStep: React.FC<Props> = ({ session }) => {
  const navigate = useNavigate()
  const [result, setResult] = useState<CompletionResult | null>(session.completionResult || null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(!session.completionResult)
  const words = session.wordIds as Word[]

  useEffect(() => {
    if (session.completionResult) return
    api.post<CompletionResult>(`/sessions/${session._id}/complete`).then(({ data }) => setResult(data)).catch((requestError) => {
      setError(requestError.response?.data?.error || 'Không thể lưu kết quả. Hãy thử lại.')
    }).finally(() => setLoading(false))
  }, [session._id, session.completionResult])

  const retrySave = async () => {
    setLoading(true); setError(null)
    try { setResult((await api.post<CompletionResult>(`/sessions/${session._id}/complete`)).data) }
    catch (requestError: any) { setError(requestError.response?.data?.error || 'Không thể lưu kết quả.') }
    finally { setLoading(false) }
  }
  const summary = result?.summary
  const wrongIds = summary?.perWord.filter((item) => item.outcome !== 'strong').map((item) => item.wordId) || []
  const modeLabel = session.mode === 'srs' ? 'SRS đã cập nhật lịch ôn.' : session.mode === 'sequential' ? 'Không thay đổi lịch SRS.' : 'Đây là lượt sửa sai; Stage không thay đổi.'
  const nextReview = (date: string | null) => date ? new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium' }).format(new Date(date)) : 'Không thay đổi'

  return <div className="space-y-5 pb-20">
    <section className="rounded-3xl border border-violet-100 bg-white/70 p-6 shadow-sm"><h2 className="text-2xl font-black text-slate-800">Kết quả session</h2><p className="mt-1 text-sm text-slate-500">{modeLabel}</p>
      {loading && <p className="mt-4 text-sm text-violet-600">Đang lưu kết quả...</p>}
      {error && <div className="mt-4 flex items-center justify-between gap-3 rounded-xl bg-red-50 p-3 text-sm text-red-700"><span>{error}</span><Button size="sm" onClick={retrySave}>Thử lưu lại</Button></div>}
      {summary && <div className="mt-5 grid grid-cols-3 gap-3 text-center"><Metric label="Nhớ tốt" value={summary.strong} color="text-emerald-600" /><Metric label="Cần củng cố" value={summary.reinforce} color="text-amber-600" /><Metric label="Đã quên" value={summary.forgotten} color="text-rose-600" /></div>}
    </section>
    {summary && <section className="rounded-3xl border border-slate-100 bg-white/70 p-6"><h3 className="flex items-center gap-2 font-black text-slate-800"><Calendar className="h-5 w-5 text-violet-600" />Đánh giá từng từ</h3><div className="mt-4 space-y-2">{summary.perWord.map((item) => { const word = words.find((entry) => entry._id === item.wordId); return <div key={item.wordId} className="flex items-center justify-between rounded-xl bg-slate-50 p-3 text-sm"><div><b>{word?.word || item.wordId}</b><span className="ml-2 text-slate-500">{item.correct}/{item.total} · {labels[item.outcome]}</span></div>{session.mode === 'srs' && <span className="text-slate-500">Ôn: {nextReview(item.nextReviewDate)}</span>}</div> })}</div></section>}
    {wrongIds.length > 0 && <Button variant="secondary" onClick={() => navigate(`/folders/${session.folderId._id}`, { state: { retryWords: wrongIds } })}><AlertCircle className="mr-2 h-4 w-4" />Ôn lại từ cần củng cố</Button>}
    <div className="fixed bottom-6 left-1/2 flex w-full max-w-xl -translate-x-1/2 gap-3 px-4"><Button className="flex-1" disabled={session.mode !== 'sequential' || loading || Boolean(error)} onClick={() => api.post('/sessions/next', { previousSessionId: session._id }).then(({ data }) => navigate(`/sessions/${data._id}`))}><RefreshCcw className="mr-2 h-4 w-4" />Ôn tiếp 10 từ</Button><Button variant="outline" onClick={() => navigate(`/folders/${session.folderId._id}`)}><Home className="mr-2 h-4 w-4" />Folder</Button></div>
  </div>
}

const Metric = ({ label, value, color }: { label: string; value: number; color: string }) => <div className="rounded-2xl bg-slate-50 p-3"><p className={`text-2xl font-black ${color}`}>{value}</p><p className="text-xs text-slate-500">{label}</p></div>
export default SummaryStep
