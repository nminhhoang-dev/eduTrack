const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  name: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['teacher', 'parent', 'student'],
    required: true
  },
  phone: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Hash password trước khi save
userSchema.pre('save', async function(next) {
  // Only hash if password is modified (and not already hashed)
  if (!this.isModified('password')) return next();
  
  try {
    console.log('Pre-save: Original password:', this.password);
    
    // Check if password is already hashed (bcrypt hashes start with $2a$, $2b$, or $2y$)
    if (this.password.match(/^\$2[aby]\$/)) {
      console.log('Password already hashed, skipping...');
      return next();
    }
    
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    console.log('Pre-save: Hashed password:', this.password);
    next();
  } catch (error) {
    console.error('Pre-save error:', error);
    next(error);
  }
});

// Method để compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    console.log('Comparing:', candidatePassword, 'with hash:', this.password);
    const result = await bcrypt.compare(candidatePassword, this.password);
    console.log('Comparison result:', result);
    return result;
  } catch (error) {
    console.error('Compare password error:', error);
    return false;
  }
};

module.exports = mongoose.model('User', userSchema);