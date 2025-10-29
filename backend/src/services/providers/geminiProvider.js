const GEMINI_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta'

function buildPrompt(items) {
  const schema = {
    id: 'number (copy from input)',
    word: 'string (must match input word exactly)',
    pos: "string (one of noun|verb|adj|adv|prep|phrase|idiom|other)",
    ipa: 'string (valid IPA symbols, no explanations)',
    note: 'string (<= 2 câu, mẹo nhớ ngắn gọn)',
    examples: [
      {
        en: 'string (bắt buộc, câu chứa chính xác word; giữ nguyên phrasal verb nếu có)',
        vi: 'string (bắt buộc, dịch ngắn gọn, khác với meaning_vi)',
        source: "'inferred'",
      },
      {
        en: 'string (bắt buộc, khác câu 1, chứa đúng word)',
        vi: 'string (bắt buộc)',
        source: "'inferred'",
      },
    ],
    tags: ['optional string array'],
  }

  const instructions = [
    'Bạn là trợ lý ngôn ngữ. Điền thông tin thiếu cho danh sách từ vựng dựa trên nghĩa tiếng Việt.',
    'Trả về JSON thuần (không dùng Markdown, không thêm giải thích).',
    'Phải trả mảng JSON với cùng số phần tử như input, giữ nguyên thứ tự.',
    'Mỗi phần tử phải tuân thủ schema sau:',
    JSON.stringify(schema, null, 2),
    'Quy tắc:',
    '- Nếu input đã có pos/ipa/note thì giữ nguyên giá trị đó.',
    '- Nếu input đã có 1 (hoặc 2) ví dụ thì giữ nguyên các ví dụ hiện có và BỔ SUNG cho đủ 2 ví dụ tổng cộng.',
    '- Nghĩa_vi trong input đại diện cho ngữ cảnh chính, chọn nghĩa phổ biến khớp ngữ cảnh đó.',
    '- BẮT BUỘC trả về đúng 2 ví dụ trong mảng "examples". Cả 2 câu đều phải chứa chính xác từ mục tiêu (không biến thể sai chính tả).',
    '- IPA chỉ gồm ký tự IPA hợp lệ, không thêm ký tự khác.',
    '- Tất cả trường do bạn suy luận phải gắn source:"inferred".',
    '- Không để trống ví dụ. Nếu không chắc, tạo câu trung tính, đơn giản nhưng tự nhiên và đúng ngữ pháp.',
    `Input: ${JSON.stringify(items, null, 2)}`,
  ]

  return instructions.join('\n')
}

export class GeminiProvider {
  constructor({ apiKey, model = 'gemini-2.5-flash', timeoutMs = 30000 }) {
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
