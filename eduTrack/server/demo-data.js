// demo-data.js - Chạy script này để tạo dữ liệu demo
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Student = require('./models/Student');
const Notification = require('./models/Notification');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

const createDemoData = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Student.deleteMany({});
    await Notification.deleteMany({});
    console.log('Cleared existing data');

    // Create demo users (password will be auto-hashed by pre-save middleware)
    const teacherUser = new User({
      name: 'Teacher Demo',
      email: 'teacher@demo.com',
      password: 'password123', // Will be hashed automatically
      role: 'teacher',
      phone: '+84901234567'
    });

    const parentUser = new User({
      name: 'Parent Demo',
      email: 'parent@demo.com', 
      password: 'password123', // Will be hashed automatically
      role: 'parent',
      phone: '+84907654321'
    });

    const studentUser = new User({
      name: 'Student Demo',
      email: 'student@demo.com',
      password: 'password123', // Will be hashed automatically
      role: 'student',
      phone: '+84909876543'
    });

    await teacherUser.save();
    await parentUser.save();
    await studentUser.save();
    console.log('Created demo users');

    // Create demo students
    const students = [
      {
        name: 'Nguyen Van An',
        studentId: 'SV001',
        class: '10A1',
        parentEmail: 'parent@demo.com',
        grades: [
          { subject: 'Math', score: 8.5, type: 'test', date: new Date('2024-01-15') },
          { subject: 'English', score: 7.0, type: 'homework', date: new Date('2024-01-20') },
          { subject: 'Physics', score: 9.0, type: 'exam', date: new Date('2024-02-01') },
          { subject: 'Math', score: 7.5, type: 'homework', date: new Date('2024-02-10') },
          { subject: 'Chemistry', score: 8.0, type: 'test', date: new Date('2024-02-15') },
        ],
        attendance: 95,
        behavior: 'excellent',
        notes: 'Excellent student with great potential in mathematics',
        teacherId: teacherUser._id
      },
      {
        name: 'Tran Thi Binh',
        studentId: 'SV002', 
        class: '10A1',
        parentEmail: 'parent@demo.com',
        grades: [
          { subject: 'Literature', score: 9.5, type: 'essay', date: new Date('2024-01-18') },
          { subject: 'History', score: 8.0, type: 'test', date: new Date('2024-01-25') },
          { subject: 'English', score: 8.5, type: 'exam', date: new Date('2024-02-05') },
          { subject: 'Math', score: 6.5, type: 'homework', date: new Date('2024-02-12') },
        ],
        attendance: 88,
        behavior: 'good',
        notes: 'Strong in languages, needs improvement in math',
        teacherId: teacherUser._id
      },
      {
        name: 'Le Van Cuong', 
        studentId: 'SV003',
        class: '10A2',
        parentEmail: 'parent@demo.com',
        grades: [
          { subject: 'Physics', score: 9.0, type: 'exam', date: new Date('2024-01-22') },
          { subject: 'Chemistry', score: 8.5, type: 'test', date: new Date('2024-01-28') },
          { subject: 'Math', score: 9.5, type: 'homework', date: new Date('2024-02-03') },
          { subject: 'Biology', score: 7.5, type: 'test', date: new Date('2024-02-14') },
        ],
        attendance: 92,
        behavior: 'excellent',
        notes: 'Outstanding performance in sciences',
        teacherId: teacherUser._id
      },
      {
        name: 'Pham Thi Dung',
        studentId: 'SV004',
        class: '10B1', 
        parentEmail: 'parent@demo.com',
        grades: [
          { subject: 'Art', score: 9.5, type: 'project', date: new Date('2024-01-12') },
          { subject: 'Music', score: 8.0, type: 'performance', date: new Date('2024-01-26') },
          { subject: 'English', score: 7.5, type: 'test', date: new Date('2024-02-08') },
        ],
        attendance: 85,
        behavior: 'good', 
        notes: 'Very creative student, excels in arts',
        teacherId: teacherUser._id
      },
      {
        name: 'Hoang Van Em',
        studentId: 'SV005',
        class: '10B1',
        parentEmail: 'parent@demo.com', 
        grades: [
          { subject: 'Physical Education', score: 10.0, type: 'practical', date: new Date('2024-01-16') },
          { subject: 'Geography', score: 7.0, type: 'test', date: new Date('2024-01-30') },
          { subject: 'Math', score: 6.0, type: 'homework', date: new Date('2024-02-06') },
        ],
        attendance: 78,
        behavior: 'average',
        notes: 'Good at sports, needs academic support',
        teacherId: teacherUser._id
      }
    ];

    const createdStudents = await Student.insertMany(students);
    console.log(`Created ${createdStudents.length} demo students`);

    // Create demo notifications
    const notifications = [
      {
        title: 'New Grade Added',
        message: 'Nguyen Van An received a new grade in Math: 8.5/10',
        type: 'grade_update',
        recipientEmail: 'parent@demo.com',
        studentId: 'SV001',
        senderId: teacherUser._id,
        createdAt: new Date('2024-02-10')
      },
      {
        title: 'Attendance Update', 
        message: 'Monthly attendance report is now available',
        type: 'attendance',
        recipientEmail: 'parent@demo.com',
        senderId: teacherUser._id,
        createdAt: new Date('2024-02-05')
      },
      {
        title: 'Parent-Teacher Meeting',
        message: 'Parent-teacher meeting scheduled for next Friday at 2 PM',
        type: 'general',
        recipientEmail: 'parent@demo.com', 
        senderId: teacherUser._id,
        createdAt: new Date('2024-02-01')
      }
    ];

    await Notification.insertMany(notifications);
    console.log(`Created ${notifications.length} demo notifications`);

    console.log('\n=== Demo Data Created Successfully! ===');
    console.log('Login credentials:');
    console.log('Teacher: teacher@demo.com / password123');
    console.log('Parent: parent@demo.com / password123');
    console.log('Student: student@demo.com / password123');

  } catch (error) {
    console.error('Error creating demo data:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run the script
const runScript = async () => {
  await connectDB();
  await createDemoData();
};

runScript();