const mongoose = require('mongoose');

const ResponseSchema = new mongoose.Schema({
  questionId: { type: mongoose.Schema.Types.ObjectId, required: true },
  selectedOptionId: { type: mongoose.Schema.Types.ObjectId, default: null }, // Null for subjective or skipped
  subjectiveImagePath: { type: String, default: null }, // Hand-written answer upload
  isCorrect: { type: Boolean, default: false }, // Ignored for subjective
  awardedPoints: { type: Number, default: 0 }, // For subjective grading
  timeSpentOnQuestion: { type: Number, default: 0 } // In milliseconds
});

const QuizResultSchema = new mongoose.Schema({
  quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
  studentName: { type: String, required: true },
  totalScore: { type: Number, required: true },
  maxScore: { type: Number, required: true },
  timeUsed: { type: Number, required: true }, // Total time in milliseconds
  responses: [ResponseSchema],
  isEvaluated: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('QuizResult', QuizResultSchema);
