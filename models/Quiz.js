const mongoose = require('mongoose');

const OptionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  isCorrect: { type: Boolean, required: true, default: false }
});

const QuestionSchema = new mongoose.Schema({
  type: { type: String, enum: ['multiple-choice', 'subjective'], default: 'multiple-choice' },
  text: { type: String, required: true },
  imagePath: { type: String, default: null }, // URL/path to uploaded image if any
  options: [OptionSchema], // Empty if subjective
  points: { type: Number, default: 1 },
  explanation: { type: String, default: '' }
});

const QuizSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  questions: [QuestionSchema],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Quiz', QuizSchema);
