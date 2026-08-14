import React, { useEffect, useState } from 'react'
import { AlertCircle, CheckCircle2, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import api from '@/lib/axios'
import { isFlexibleMatch } from '@/lib/string-utils'
import type { Question } from '@/types/session'

type Props = { sessionId: string; questions: Question[]; onComplete?: (score: number) => void }

const FillBlankStep: React.FC<Props> = ({ sessionId, questions, onComplete }) => {
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [results, setResults] = useState<Record<number, boolean>>({})
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [score, setScore] = useState(0)
  const wordBank = questions[0]?.bank || []

  useEffect(() => {
    setAnswers({})
    setResults({})
    setIsSubmitted(false)
    setScore(0)
  }, [questions])

  const usedIndex = (word: string) => Object.entries(answers).find(([, answer]) => answer === word)?.[0]

  const setAnswer = (index: number, word: string) => {
    if (isSubmitted) return
    setAnswers((current) => {
      const next = { ...current }
      const previousIndex = Object.entries(current).find(([, answer]) => answer === word)?.[0]
      if (previousIndex !== undefined) delete next[Number(previousIndex)]
      next[index] = word
      return next
    })
  }

  const chooseWord = (word: string) => {
    const previousIndex = usedIndex(word)
    if (previousIndex !== undefined) {
      setAnswers((current) => {
        const next = { ...current }
        delete next[Number(previousIndex)]
        return next
      })
      return
    }
    const emptyIndex = questions.findIndex((_, index) => !answers[index])
    if (emptyIndex >= 0) setAnswer(emptyIndex, word)
  }

  const submit = async () => {
    if (isSubmitted) return
    const nextResults = Object.fromEntries(questions.map((question, index) => [index, isFlexibleMatch(answers[index] || '', question.answer)]))
    const nextScore = Object.values(nextResults).filter(Boolean).length
    setResults(nextResults)
    setScore(nextScore)
    setIsSubmitted(true)
    try {
      await Promise.all([
        ...questions.map((question, index) => api.post('/attempts', {
          sessionId, step: 'FILL_BLANK', wordId: question.wordId,
          userAnswer: answers[index] || '', isCorrect: nextResults[index],
        })),
        api.put(`/sessions/${sessionId}`, { 'fillBlank.score': nextScore }),
      ])
    } catch (error) {
      console.error('Failed to save fill-blank results:', error)
    }
  }

  const blankClass = (index: number) => {
    if (!isSubmitted) return answers[index] ? 'bg-violet-50 border-violet-200 text-violet-800' : 'bg-slate-100 border-slate-200 text-slate-400'
    return results[index] ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
  }

  const filledCount = Object.keys(answers).length

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <Progress filledCount={filledCount} total={questions.length} isSubmitted={isSubmitted} score={score} />
      <WordBank words={wordBank} isSubmitted={isSubmitted} usedIndex={usedIndex} onChoose={chooseWord} />
      <Questions questions={questions} answers={answers} results={results} isSubmitted={isSubmitted} blankClass={blankClass} onClear={(index) => setAnswers((current) => { const next = { ...current }; delete next[index]; return next })} onDrop={setAnswer} />
      <div className="flex justify-center">
        {isSubmitted ? <Button onClick={() => onComplete?.(score)} className="min-w-56 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 py-6 text-xs font-black uppercase tracking-widest">Hoàn thành bước này</Button> : <Button onClick={submit} disabled={filledCount !== questions.length} className="min-w-56 rounded-xl bg-violet-600 py-6 text-xs font-black uppercase tracking-widest">Nộp bài ({filledCount}/{questions.length})</Button>}
      </div>
    </div>
  )
}

function Progress({ filledCount, total, isSubmitted, score }: { filledCount: number; total: number; isSubmitted: boolean; score: number }) {
  return <div className="space-y-3 px-2"><div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400"><span>{isSubmitted ? 'HOÀN THÀNH BÀI TẬP' : `ĐÃ ĐIỀN: ${filledCount} / ${total}`}</span>{isSubmitted && <span className={score >= total * 0.7 ? 'text-emerald-500' : 'text-amber-500'}>{score}/{total} CÂU ĐÚNG</span>}</div>{!isSubmitted && <div className="h-1.5 overflow-hidden rounded-full bg-slate-200/50"><div className="h-full rounded-full bg-gradient-to-r from-violet-400 to-fuchsia-400 transition-all duration-500" style={{ width: `${(filledCount / total) * 100}%` }} /></div>}</div>
}

function WordBank({ words, isSubmitted, usedIndex, onChoose }: { words: string[]; isSubmitted: boolean; usedIndex: (word: string) => string | undefined; onChoose: (word: string) => void }) {
  return <div className="sticky top-[90px] z-20"><Card className="overflow-hidden rounded-3xl border-2 border-violet-100/50 bg-white/80 shadow-lg backdrop-blur-xl"><CardContent className="p-4 md:p-6"><div className="mb-4 flex items-center justify-between"><div className="flex items-center gap-2"><span className="rounded-lg bg-violet-500 p-1.5 text-white"><Sparkles className="size-3" /></span><h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Ngân hàng từ</h3></div><span className="text-[9px] font-bold text-violet-400">BẤM HOẶC KÉO TỪ VÀO Ô TRỐNG</span></div><div className="flex flex-wrap gap-2">{words.map((word) => { const index = usedIndex(word); return <button key={word} draggable={!isSubmitted} disabled={isSubmitted} onDragStart={(event) => event.dataTransfer.setData('text/plain', word)} onClick={() => onChoose(word)} className={`rounded-xl border-2 px-4 py-2 text-xs font-bold transition-all ${index !== undefined ? 'border-violet-300 bg-violet-100 text-violet-700' : 'border-white bg-white text-slate-700 hover:border-violet-200 hover:shadow-sm'}`}>{word}{index !== undefined && <span className="ml-1.5 rounded bg-violet-500 px-1.5 py-0.5 text-[9px] text-white">{Number(index) + 1}</span>}</button> })}</div></CardContent></Card></div>
}

function Questions({ questions, answers, results, isSubmitted, blankClass, onClear, onDrop }: { questions: Question[]; answers: Record<number, string>; results: Record<number, boolean>; isSubmitted: boolean; blankClass: (index: number) => string; onClear: (index: number) => void; onDrop: (index: number, word: string) => void }) {
  return <Card className="overflow-hidden rounded-[2rem] border-white bg-white/70 shadow-xl shadow-violet-500/5 backdrop-blur-md"><CardContent className="space-y-6 p-8 md:p-10">{questions.map((question, index) => { const [before, after = ''] = question.prompt.split('_____'); return <div key={question.wordId} className={`rounded-3xl border-2 p-6 ${isSubmitted && !results[index] ? 'border-rose-100 bg-rose-50/50' : 'border-white bg-white/40'}`}><div className="flex items-start gap-4"><span className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-xl border bg-white text-xs font-black text-slate-400">{index + 1}</span><p className="flex-1 pt-1 text-lg leading-relaxed text-slate-700"><span>{before}</span><button type="button" disabled={isSubmitted} onClick={() => onClear(index)} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); onDrop(index, event.dataTransfer.getData('text/plain')) }} className={`mx-2 inline-flex min-w-36 align-baseline justify-center rounded-xl border-2 px-4 py-1.5 font-bold transition-all ${blankClass(index)}`}>{answers[index] || '...'}</button><span>{after}</span>{isSubmitted && !results[index] && <span className="ml-2 inline-block rounded-lg border border-emerald-100 bg-emerald-50 px-2 py-1 text-sm font-bold text-emerald-600">{question.answer}</span>}</p>{isSubmitted && (results[index] ? <CheckCircle2 className="mt-2 text-emerald-500" /> : <AlertCircle className="mt-2 text-rose-500" />)}</div></div> })}</CardContent></Card>
}

export default FillBlankStep
