const GEMINI_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta'

function buildPrompt(items) {
  const schema = {
    id: 'number (copy exactly from input)',
    word: 'string (must match input word exactly)',
    pos: 'string (one of: noun|verb|adj|adv|prep|phrase|idiom|other)',
    ipa: 'string (valid IPA notation only, no brackets or explanations)',
    note: 'string (1-2 sentences in Vietnamese, memory tip or usage note)',
    examples: [
      {
        en: 'string (required, English sentence containing the exact word)',
        vi: 'string (required, Vietnamese translation, different from meaning_vi)',
        source: "'inferred'",
      },
      {
        en: 'string (required, different from example 1, contains exact word)',
        vi: 'string (required, Vietnamese translation)',
        source: "'inferred'",
      },
    ],
    tags: ['optional string array'],
  }

  const instructions = [
    'You are a language assistant. Fill in missing information for vocabulary items based on their Vietnamese meanings.',
    '',
    'OUTPUT FORMAT:',
    '- Return pure JSON only (no markdown, no code blocks, no explanations).',
    '- Return a JSON array with the SAME number of elements as input, in the SAME order.',
    '',
    'SCHEMA (each item must follow):',
    JSON.stringify(schema, null, 2),
    '',
    'RULES:',
    '1. Preserve existing values: If input already has pos/ipa/note, keep them unchanged.',
    '2. Preserve existing examples: If input has 1 or 2 examples, keep them and ADD more to reach exactly 2 total.',
    '3. Context matching: The meaning_vi field represents the primary context. Choose the most common meaning that matches this context.',
    '4. Examples requirement: MUST return exactly 2 examples in the "examples" array. Both sentences must contain the exact target word (no misspellings, preserve phrasal verbs).',
    '5. IPA format: Use only valid IPA characters, no slashes, brackets, or extra characters.',
    '6. Source marking: All fields you infer must have source: "inferred".',
    '7. No empty examples: If unsure, create neutral, simple but natural and grammatically correct sentences.',
    '8. Vietnamese fields: The "note" and "vi" fields in examples must be in Vietnamese.',
    '',
    'INPUT:',
    JSON.stringify(items, null, 2),
  ]

  return instructions.join('\n')
}

export class GeminiProvider {
  constructor({ apiKey, model = 'gemini-3-flash-preview', timeoutMs = 30000 }) {
    this.apiKey = apiKey
    this.model = model
    this.timeoutMs = timeoutMs
  }

  get name() {
    return 'gemini'
  }

  async enrich(items) {
    if (!this.apiKey) {
      throw new Error('Thiếu GEMINI_API_KEY')
    }
    if (!items.length) {
      return []
    }

    const prompt = buildPrompt(
      items.map((item, index) => ({
        id: index,
        word: item.word,
        meaning_vi: item.meaning_vi,
        pos: item.pos || '',
        ipa: item.ipa || '',
        note: item.note || '',
        examples: item.examples || [],
        tags: item.tags || [],
      }))
    )

    const url = `${GEMINI_ENDPOINT}/models/${this.model}:generateContent?key=${this.apiKey}`
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs)

    try {
      // Quan sát độ dài prompt để theo dõi rủi ro timeout (không log nội dung)
      try {
        console.log(`[import][gemini] promptChars=${prompt.length}`)
      } catch (_) {}
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: prompt }],
            },
          ],
        }),
        signal: controller.signal,
      })

      if (!response.ok) {
        const body = await response.text()
        throw new Error(`Gemini trả lỗi ${response.status}: ${body}`)
      }

      const data = await response.json()
      const text =
        data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
        data?.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data

      if (!text) {
        throw new Error('Gemini không trả về nội dung')
      }

      const cleaned = text.replace(/```json|```/g, '').trim()
      // Log kích thước phản hồi để chẩn đoán cắt/thiếu item
      try {
        console.log(`[import][gemini] responseChars=${cleaned.length}`)
      } catch (_) {}
      const parsed = JSON.parse(cleaned)
      if (!Array.isArray(parsed)) {
        throw new Error('Gemini trả về dữ liệu không phải mảng JSON')
      }
      return parsed
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Gemini timeout')
      }
      throw error
    } finally {
      clearTimeout(timeout)
    }
  }
}
