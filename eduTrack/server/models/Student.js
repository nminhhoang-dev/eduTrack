const mongoose = require('mongoose');

const gradeSchema = new mongoose.Schema({
  subject: {
    type: String,
    required: true
  },
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 10
  },
  type: {
    type: String,
    enum: ['test', 'exam', 'homework', 'project', 'performance', 'practical', 'essay'],
    default: 'homework'
  },
  date: {
    type: Date,
    default: Date.now
  }
});

const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  studentId: {
    type: String,
    required: true,
    unique: true
  },
  class: {
    type: String,
    required: true
  },
  parentEmail: {
    type: String,
    required: true
  },
  grades: [gradeSchema],
  attendance: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  behavior: {
    type: String,
    enum: ['excellent', 'good', 'average', 'poor'],
    default: 'good'
  },
  notes: {
    type: String,
    default: ''
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Student', studentSchema);