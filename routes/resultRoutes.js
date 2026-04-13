const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const QuizResult = require('../models/QuizResult');
const Quiz = require('../models/Quiz');

const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Parse student name from headers, fallback to "Student"
    let studentName = req.headers['x-student-name'] || 'Student';
    // Clean name for filesystem safety
    studentName = studentName.replace(/[^a-zA-Z0-9]/g, '_');
    
    let qIndex = req.headers['x-question-index'] || 'Q';
    
    const timeCode = Math.round(Date.now() / 1000);
    cb(null, `${studentName}_Ans${qIndex}_${timeCode}${path.extname(file.originalname)}`);
  }
});
const upload = multer({ storage: storage });

// POST endpoint for specifically uploading subjective images
router.post('/upload-answer', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image uploaded' });
  }
  res.json({ imagePath: `/uploads/${req.file.filename}` });
});

// POST submit a new quiz result
router.post('/', async (req, res) => {
  try {
    const result = new QuizResult(req.body);
    await result.save();
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET a single result by ID, populate the quiz details for generating report
router.get('/:id', async (req, res) => {
  try {
    const result = await QuizResult.findById(req.params.id).populate('quizId');
    if (!result) return res.status(404).json({ error: 'Result not found' });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET all results for a specific quiz (for teacher dashboard)
router.get('/quiz/:quizId', async (req, res) => {
  try {
    const results = await QuizResult.find({ quizId: req.params.quizId }).sort({ createdAt: -1 });
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT to evaluate a student result (Teacher grades subjective)
router.put('/:id/evaluate', async (req, res) => {
  try {
    const { evaluations } = req.body; // Array of { questionId, awardedPoints }
    
    const result = await QuizResult.findById(req.params.id);
    if (!result) return res.status(404).json({ error: 'Result not found' });
    
    let additionalScore = 0;
    
    result.responses.forEach(resp => {
      const evaluation = evaluations.find(e => e.questionId === resp.questionId.toString());
      if (evaluation) {
        resp.awardedPoints = evaluation.awardedPoints;
        additionalScore += evaluation.awardedPoints;
      }
    });
    
    result.totalScore += additionalScore;
    result.isEvaluated = true;
    
    await result.save();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
