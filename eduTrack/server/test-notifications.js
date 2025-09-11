// test-notifications.js - Script để test notifications
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
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

const createTestNotifications = async () => {
  try {
    // Get teacher and parent users
    const teacher = await User.findOne({ email: 'teacher@demo.com' });
    const parent = await User.findOne({ email: 'parent@demo.com' });

    if (!teacher || !parent) {
      console.log('❌ Teacher or Parent not found. Run clean-create-users.js first');
      return;
    }

    // Create test notifications
    const notifications = [
      {
        title: '📚 New Grade Posted',
        message: 'Your child Nguyen Van An has received a new grade in Mathematics: 9.5/10. Great work!',
        type: 'grade_update',
        recipientEmail: parent.email,
        senderId: teacher._id,
        isRead: false,
        createdAt: new Date()
      },
      {
        title: '📅 Attendance Update',
        message: 'Monthly attendance report: Your child has 95% attendance this month.',
        type: 'attendance',
        recipientEmail: parent.email,
        senderId: teacher._id,
        isRead: false,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
      },
      {
        title: '👨‍🏫 Parent-Teacher Meeting',
        message: 'Parent-teacher meeting scheduled for next Friday at 2:00 PM. Please confirm your attendance.',
        type: 'general',
        recipientEmail: parent.email,
        senderId: teacher._id,
        isRead: true,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
      },
      {
        title: '🏆 Student Achievement',
        message: 'Congratulations! Your child has been selected for the science competition.',
        type: 'general',
        recipientEmail: parent.email,
        senderId: teacher._id,
        isRead: false,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
      },
      {
        title: '📝 Homework Reminder',
        message: 'Reminder: Mathematics homework is due tomorrow. Please ensure your child completes it.',
        type: 'general',
        recipientEmail: parent.email,
        senderId: teacher._id,
        isRead: true,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 1 week ago
      }
    ];

    // Clear existing test notifications
    await Notification.deleteMany({ recipientEmail: parent.email });
    console.log('🧹 Cleared existing notifications');

    // Insert new notifications
    await Notification.insertMany(notifications);
    console.log(`✅ Created ${notifications.length} test notifications`);

    // Count unread notifications
    const unreadCount = notifications.filter(n => !n.isRead).length;
    console.log(`📬 Unread notifications: ${unreadCount}`);
    console.log(`📧 All notifications sent to: ${parent.email}`);

    console.log('\n🎯 Test the app now:');
    console.log('1. Login as parent@demo.com / password123');
    console.log('2. Check Notifications tab (should show badge with unread count)');
    console.log('3. Login as teacher@demo.com / password123'); 
    console.log('4. Send new notification from Notifications screen');

  } catch (error) {
    console.error('❌ Error creating test notifications:', error);
  } finally {
    mongoose.connection.close();
  }
};

const run = async () => {
  await connectDB();
  await createTestNotifications();
};

run();