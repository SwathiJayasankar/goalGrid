const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  goals: {
    type: mongoose.Schema.Types.Mixed,
    default: []
  },
  fixedRoutine: {
    type: mongoose.Schema.Types.Mixed,
    default: [
      { id: 1, text: 'Wake up & Morning Ritual', time: '06:00 AM', category: 'health' },
      { id: 2, text: 'Breakfast', time: '08:00 AM', category: 'health' },
      { id: 3, text: 'Work/Study Session 1', time: '09:00 AM', category: 'work' },
      { id: 4, text: 'Lunch Break', time: '01:00 PM', category: 'casual' },
      { id: 5, text: 'Evening Workout', time: '06:00 PM', category: 'health' },
      { id: 6, text: 'Wind down', time: '10:00 PM', category: 'health' }
    ]
  },
  calendarTasks: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  calendarNotes: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  completedRoadmapTasks: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  addedAiTasks: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  journalEntries: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  journalReflections: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  journalMoods: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { minimize: false }); // Disable Mongoose minimizing empty objects so {} persists properly

module.exports = mongoose.model('User', UserSchema);
