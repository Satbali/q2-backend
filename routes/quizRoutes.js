const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Quiz = require('../models/Quiz');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// POST route to upload an image and get back its path
router.post('/upload-image', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image uploaded' });
  }
  res.json({ imagePath: `/uploads/${req.file.filename}` });
});

// GET all quizzes
router.get('/', async (req, res) => {
  try {
    const quizzes = await Quiz.find({}, 'title description createdAt');
    res.json(quizzes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET a single quiz by ID
router.get('/:id', async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ error: 'Quiz not found' });
    res.json(quiz);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST to create a new quiz (either manually or parsed from JSON uploaded by frontend)
// POST to create a new quiz, or UPDATE if title already exists
router.post('/', async (req, res) => {
  try {
    const { title, description, questions } = req.body;
    
    // Attempt to update existing quiz by title, or create new if not found
    const quiz = await Quiz.findOneAndUpdate(
      { title }, 
      { description, questions }, 
      { new: true, upsert: true }
    );
    
    res.status(201).json(quiz);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT to update an existing quiz by ID specifically (Edit Mode)
router.put('/:id', async (req, res) => {
  try {
    const { title, description, questions } = req.body;
    const quiz = await Quiz.findByIdAndUpdate(
      req.params.id,
      { title, description, questions },
      { new: true }
    );
    if (!quiz) return res.status(404).json({ error: 'Quiz not found' });
    res.json(quiz);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
