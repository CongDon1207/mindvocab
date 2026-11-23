import { Volume2, Square } from 'lucide-react'
import { Button } from '@/components/ui/button'

type Example = { en: string; vi: string; source?: 'user' | 'inferred' }

interface FlashcardExamplesProps {
  ex1?: Example
  ex2?: Example
  activeId: string | null
  onSpeak: (id: string, text: string) => void
}

export default function FlashcardExamples({ ex1, ex2, activeId, onSpeak }: FlashcardExamplesProps) {
  const examples = [ex1, ex2]
  if (!examples.some(example => example?.en?.trim())) return null

  return (
    <div className="space-y-4 pt-4">
      <p className="text-[9px] font-black uppercase tracking-widest text-slate-300">EXAMPLES IN CONTEXT</p>
      <div className="space-y-3">
        {examples.map((example, index) => {
          if (!example?.en?.trim()) return null
          const id = `example-${index}`
          const isActive = activeId === id
          return (
            <div key={id} className="space-y-2 rounded-2xl bg-white/50 p-5 border border-white shadow-sm hover:bg-white/80 transition-colors">
              <div className="flex items-start justify-between gap-2">
                <p className="flex-1 text-base font-bold text-slate-700 leading-relaxed">{example.en}</p>
                {example.source === 'inferred' && (
                  <span className="inline-flex items-center whitespace-nowrap px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-tighter bg-violet-100 text-violet-600 border border-violet-200">
                    AI MAGIC
                  </span>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={event => { event.stopPropagation(); onSpeak(id, example.en) }}
                  aria-label={isActive ? `Stop example ${index + 1}` : `Listen to example ${index + 1}`}
                  title={isActive ? 'Stop' : 'Listen'}
                  className="shrink-0 text-violet-600"
                >
                  {isActive ? <Square /> : <Volume2 />}
                </Button>
              </div>
              {example.vi && (
                <p className="text-sm text-slate-500 font-medium italic leading-relaxed">{example.vi}</p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
