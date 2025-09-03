const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['grade_update', 'attendance', 'general'],
    default: 'general'
  },
  recipientEmail: {
    type: String,
    required: true
  },
  studentId: {
    type: String,
    default: null
  },
  isRead: {
    type: Boolean,
    default: false
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Notification', notificationSchema);