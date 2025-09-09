// debug-auth.js - Script để debug vấn đề authentication
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

const debugAuth = async () => {
  try {
    // 1. Check existing users
    const users = await User.find({});
    console.log('\n=== EXISTING USERS ===');
    users.forEach(user => {
      console.log(`Email: ${user.email}`);
      console.log(`Password Hash: ${user.password}`);
      console.log(`Hash Length: ${user.password.length}`);
      console.log('---');
    });

    // 2. Test password comparison with existing user
    if (users.length > 0) {
      const testUser = users.find(u => u.email === 'teacher@demo.com');
      if (testUser) {
        console.log('\n=== TESTING PASSWORD COMPARISON ===');
        const rawPassword = 'password123';
        
        // Direct bcrypt compare
        const directCompare = await bcrypt.compare(rawPassword, testUser.password);
        console.log(`Direct bcrypt.compare('${rawPassword}', hash): ${directCompare}`);
        
        // Using model method
        const modelCompare = await testUser.comparePassword(rawPassword);
        console.log(`Model comparePassword('${rawPassword}'): ${modelCompare}`);
      }
    }

    // 3. Create a fresh user manually to test
    console.log('\n=== CREATING FRESH TEST USER ===');
    
    // Delete existing test user
    await User.deleteOne({ email: 'test@debug.com' });
    
    // Create new test user
    const testUser = new User({
      name: 'Debug Test',
      email: 'test@debug.com',
      password: 'password123',
      role: 'teacher'
    });

    console.log('Before save - raw password:', 'password123');
    await testUser.save();
    console.log('After save - hashed password:', testUser.password);
    console.log('Hash length:', testUser.password.length);

    // Test comparison immediately
    const immediateTest = await testUser.comparePassword('password123');
    console.log('Immediate password test:', immediateTest);

    // Fetch from DB and test again
    const fetchedUser = await User.findOne({ email: 'test@debug.com' });
    const fetchedTest = await fetchedUser.comparePassword('password123');
    console.log('Fetched from DB password test:', fetchedTest);

  } catch (error) {
    console.error('Debug error:', error);
  } finally {
    mongoose.connection.close();
  }
};

const runDebug = async () => {
  await connectDB();
  await debugAuth();
};

runDebug();