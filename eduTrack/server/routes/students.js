const express = require('express');
const Student = require('../models/Student');
const Notification = require('../models/Notification');
const { authMiddleware, teacherOnly } = require('../middlewares/authMiddleware');

const router = express.Router();

// Lấy danh sách học sinh (có pagination và search)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', class: className = '' } = req.query;
    const query = {};

    // Nếu là giáo viên thì chỉ xem học sinh của mình
    if (req.user.role === 'teacher') {
      query.teacherId = req.user._id;
    }
    
    // Nếu là phụ huynh thì chỉ xem học sinh có email trùng
    if (req.user.role === 'parent') {
      query.parentEmail = req.user.email;
    }

    // Search theo tên hoặc mã học sinh
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { studentId: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter theo lớp
    if (className) {
      query.class = className;
    }

    const students = await Student.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ name: 1 });

    const total = await Student.countDocuments(query);

    res.json({
      students,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Lấy thông tin một học sinh
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json(student);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Thêm học sinh mới (chỉ giáo viên)
router.post('/', authMiddleware, teacherOnly, async (req, res) => {
  try {
    const { name, studentId, class: className, parentEmail } = req.body;

    // Kiểm tra mã học sinh đã tồn tại
    const existingStudent = await Student.findOne({ studentId });
    if (existingStudent) {
      return res.status(400).json({ message: 'Student ID already exists' });
    }

    const student = new Student({
      name,
      studentId,
      class: className,
      parentEmail,
      teacherId: req.user._id
    });

    await student.save();
    res.status(201).json({ message: 'Student created successfully', student });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Cập nhật thông tin học sinh
router.put('/:id', authMiddleware, teacherOnly, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Kiểm tra quyền sở hữu
    if (student.teacherId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    Object.assign(student, req.body);
    await student.save();

    res.json({ message: 'Student updated successfully', student });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Thêm điểm số
router.post('/:id/grades', authMiddleware, teacherOnly, async (req, res) => {
  try {
    const { subject, score, type } = req.body;
    const student = await Student.findById(req.params.id);
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Kiểm tra quyền sở hữu
    if (student.teacherId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Thêm điểm mới
    student.grades.push({ subject, score, type });
    await student.save();

    // Tạo thông báo cho phụ huynh
    const notification = new Notification({
      title: 'Điểm số mới',
      message: `${student.name} vừa có điểm ${subject}: ${score}/10`,
      type: 'grade_update',
      recipientEmail: student.parentEmail,
      studentId: student.studentId,
      senderId: req.user._id
    });
    await notification.save();

    res.json({ message: 'Grade added successfully', student });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Xóa học sinh
router.delete('/:id', authMiddleware, teacherOnly, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Kiểm tra quyền sở hữu
    if (student.teacherId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await Student.findByIdAndDelete(req.params.id);
    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;