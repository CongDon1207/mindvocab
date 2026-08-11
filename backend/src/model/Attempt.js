import { createModel } from './sqliteModel.js'

const Attempt = createModel('attempts', (data = {}) => ({
  ...data,
  userAnswer: data.userAnswer ?? '',
  isCorrect: data.isCorrect ?? false,
}))

export default Attempt
