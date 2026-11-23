import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

type Accent = 'en-US' | 'en-GB'

export function useLocalSpeech() {
  const [activeId, setActiveId] = useState<string | null>(null)
  const current = useRef<{ id: string; utterance: SpeechSynthesisUtterance } | null>(null)

  const stop = useCallback(() => {
    current.current = null
    if ('speechSynthesis' in window) window.speechSynthesis.cancel()
    setActiveId(null)
  }, [])

  const speak = useCallback((id: string, text: string, accent?: Accent) => {
    if (current.current?.id === id) {
      stop()
      return
    }

    stop()
    if (!text.trim()) return
    if (!('speechSynthesis' in window) || !('SpeechSynthesisUtterance' in window)) {
      toast.error('Speech is not supported in this browser.')
      return
    }

    const voices = window.speechSynthesis.getVoices().filter(voice =>
      voice.localService === true && /^en(?:-|$)/i.test(voice.lang.replace('_', '-'))
    )
    const voice = accent
      ? voices.find(candidate => candidate.lang.replace('_', '-').toLowerCase() === accent.toLowerCase())
      : voices.find(candidate => candidate.lang.replace('_', '-').toLowerCase() === 'en-us')
        ?? voices.find(candidate => candidate.default)
        ?? voices[0]

    if (!voice) {
      toast.error(accent
        ? `No local ${accent} voice is available. Install one and try again.`
        : 'No local English voice is available. Install one and try again.')
      return
    }

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.voice = voice
    utterance.lang = voice.lang
    utterance.rate = 0.9
    utterance.onend = () => {
      if (current.current?.utterance !== utterance) return
      current.current = null
      setActiveId(null)
    }
    utterance.onerror = event => {
      if (current.current?.utterance !== utterance) return
      current.current = null
      setActiveId(null)
      if (event.error !== 'interrupted' && event.error !== 'canceled') {
        toast.error('Speech could not be played. Please try again.')
      }
    }

    current.current = { id, utterance }
    setActiveId(id)
    try {
      window.speechSynthesis.speak(utterance)
    } catch {
      current.current = null
      setActiveId(null)
      toast.error('Speech could not be played. Please try again.')
    }
  }, [stop])

  useEffect(() => {
    if ('speechSynthesis' in window) window.speechSynthesis.getVoices()
    return () => {
      current.current = null
      if ('speechSynthesis' in window) window.speechSynthesis.cancel()
    }
  }, [])

  return { activeId, speak, stop }
}
