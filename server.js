require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const quizRoutes = require('./routes/quizRoutes');
const resultRoutes = require('./routes/resultRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 5000;
// Add a check to prevent multiple connections in serverless environment
let isConnected = false;
const connectToDatabase = async () => {
  if (isConnected) return;
  const db = await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
  isConnected = db.connections[0].readyState;
};

// Use middleware to connect before handling routes
app.use(async (req, res, next) => {
  await connectToDatabase();
  next();
});

// Connect to MongoDB
// mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI)
//   .then(() => console.log('MongoDB connected to quizpro'))
//   .catch(err => console.error('MongoDB connection error:', err));

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/quizzes', quizRoutes);
app.use('/api/results', resultRoutes);
app.use('/api/auth', authRoutes);


// CRITICAL: You MUST add this line for Vercel
module.exports = app;
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });
