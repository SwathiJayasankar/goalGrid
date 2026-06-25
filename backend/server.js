const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const plannerRoutes = require('./routes/planner');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: 'http://localhost:3000', // Allow React frontend
  credentials: true
}));
app.use(express.json());

// MongoDB Connection
const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/productive';
mongoose.connect(mongoURI)
  .then(() => console.log('✓ Successfully connected to MongoDB'))
  .catch((err) => console.error('✗ MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/planner', plannerRoutes);

// Root path diagnostic
app.get('/', (req, res) => {
  res.json({ message: 'GoalGrid API is running' });
});

// Start Server
const server = app.listen(PORT, () => {
  console.log(`✓ Backend server is running on port ${PORT}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`✗ Port ${PORT} is already in use. Stop the process using this port or set a different PORT in .env.`);
  } else {
    console.error('✗ Server error:', err);
  }
  process.exit(1);
});
