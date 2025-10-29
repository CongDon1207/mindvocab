import { GeminiProvider } from './providers/geminiProvider.js'

function createProviderInstance(name) {
  switch (name) {
    case 'gemini':
      return new GeminiProvider({
        apiKey: process.env.GEMINI_API_KEY,
        model: process.env.GEMINI_MODEL,
        timeoutMs: Number(process.env.AI_TIMEOUT_MS || 30000),
      })
    default:
      return null
  }
}

export function buildProviderChain() {
  const primary = (process.env.AI_PROVIDER || 'gemini').toLowerCase()
  const fallbacks = (process.env.AI_FALLBACKS || '')
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean)

  const providerNames = [primary, ...fallbacks].filter((value, index, array) => array.indexOf(value) === index)
  return providerNames
    .map((name) => ({ name, instance: createProviderInstance(name) }))
    .filter((entry) => entry.instance)
}

