
/**
 * So sánh câu trả lời của người dùng với đáp án đúng một cách linh hoạt.
 * Chấp nhận các biến thể phổ biến như số nhiều (s/es), quá khứ (ed), V-ing.
 * 
 * @param userAnswer Từ người dùng chọn/nhập (thường là dạng nguyên thể từ Word Bank)
 * @param correctAnswer Đáp án đúng trong câu (có thể là dạng đã chia)
 */
export const isFlexibleMatch = (userAnswer: string, correctAnswer: string): boolean => {
    if (!userAnswer || !correctAnswer) return false

    const user = userAnswer.toLowerCase().trim()
    const correct = correctAnswer.toLowerCase().trim()

    // 1. Chính xác tuyệt đối
    if (user === correct) return true

    // 2. Bỏ qua một số ký tự đặc biệt cuối câu nếu có (như dấu chấm câu lọt vào)
    const cleanCorrect = correct.replace(/[.,!?;:]$/, '')
    if (user === cleanCorrect) return true

    // 3. User là gốc, Correct là biến thể
    // Các hậu tố phổ biến
    const suffixes = ['s', 'es', 'd', 'ed', 'ing', "'s"]

    // Check 3.1: Ghép trực tiếp (work -> worked, works)
    for (const suffix of suffixes) {
        if (correct === user + suffix) return true
        if (cleanCorrect === user + suffix) return true
    }

    // Check 3.2: Quy tắc y -> i (study -> studies, studied)
    if (user.endsWith('y')) {
        const base = user.slice(0, -1) // stud
        if (correct === base + 'ies') return true
        if (correct === base + 'ied') return true
    }

    // Check 3.3: Gấp đôi phụ âm cuối (stop -> stopped, stopping)
    // Chỉ áp dụng cho từ có độ dài >= 3 để tránh sai sót
    if (user.length >= 3) {
        const lastChar = user[user.length - 1]
        const isConsonant = /^[bcdfghjklmnpqrstvwxyz]$/.test(lastChar)
        if (isConsonant) {
            if (correct === user + lastChar + 'ed') return true
            if (correct === user + lastChar + 'ing') return true
        }
    }

    // Check 3.4: Bỏ 'e' cuối + ing/ed (make -> making, lived)
    if (user.endsWith('e')) {
        const base = user.slice(0, -1) // mak
        if (correct === base + 'ing') return true
        if (correct === base + 'd') return true // live -> lived
    }

    return false
}
