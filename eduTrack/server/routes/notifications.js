const express = require('express');
const Notification = require('../models/Notification');
const { authMiddleware } = require('../middlewares/authMiddleware');

const router = express.Router();

// Lấy thông báo của user (phụ huynh/học sinh)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    
    const notifications = await Notification.find({ 
      recipientEmail: req.user.email 
    })
    .populate('senderId', 'name')
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort({ createdAt: -1 });

    const total = await Notification.countDocuments({ 
      recipientEmail: req.user.email 
    });

    res.json({
      notifications,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Đánh dấu thông báo đã đọc
router.put('/:id/read', authMiddleware, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    // Kiểm tra quyền sở hữu
    if (notification.recipientEmail !== req.user.email) {
      return res.status(403).json({ message: 'Access denied' });
    }

    notification.isRead = true;
    await notification.save();

    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Tạo thông báo chung (giáo viên)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, message, recipientEmail, type = 'general' } = req.body;

    const notification = new Notification({
      title,
      message,
      type,
      recipientEmail,
      senderId: req.user._id
    });

    await notification.save();
    
    // Send push notification
    try {
      await pushNotificationService.sendNotificationToParents(
        [recipientEmail],
        title,
        message,
        {
          notificationId: notification._id,
          type: type,
          senderId: req.user._id
        }
      );
      console.log(`✅ Push notification triggered for ${recipientEmail}`);
    } catch (pushError) {
      console.error('❌ Push notification failed:', pushError);
      // Don't fail the whole request if push notification fails
    }

    res.status(201).json({ 
      message: 'Notification sent successfully', 
      notification 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;