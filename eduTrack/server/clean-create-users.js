// clean-create-users.js - Script để tạo lại users sạch sẽ
require('dotenv').config();
const mongoose = require('mongoose');
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

const cleanAndCreateUsers = async () => {
  try {
    // Clear all existing users
    await User.deleteMany({});
    console.log('✅ Cleared all existing users');

    // Create users one by one with explicit logging
    console.log('\n📝 Creating new users...');

    // Teacher
    const teacher = new User({
      name: 'Teacher Demo',
      email: 'teacher@demo.com',
      password: 'password123',
      role: 'teacher',
      phone: '+84901234567'
    });
    await teacher.save();
    console.log('✅ Created teacher:', teacher.email);

    // Parent
    const parent = new User({
      name: 'Parent Demo',
      email: 'parent@demo.com',
      password: 'password123',
      role: 'parent',
      phone: '+84907654321'
    });
    await parent.save();
    console.log('✅ Created parent:', parent.email);

    // Student
    const student = new User({
      name: 'Student Demo',
      email: 'student@demo.com',
      password: 'password123',
      role: 'student',
      phone: '+84909876543'
    });
    await student.save();
    console.log('✅ Created student:', student.email);
    
    console.log('\n🎉 All users created successfully!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
  }
};

const run = async () => {
  await connectDB();
  await cleanAndCreateUsers();
};

run();