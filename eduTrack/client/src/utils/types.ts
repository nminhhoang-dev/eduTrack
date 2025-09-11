// User types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'teacher' | 'parent' | 'student';
  phone: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

// Student types
export interface Grade {
  _id?: string;
  subject: string;
  score: number;
  type: 'homework' | 'test' | 'exam';
  date: string;
}

export interface Student {
  _id: string;
  name: string;
  studentId: string;
  class: string;
  parentEmail: string;
  grades: Grade[];
  attendance: number;
  behavior: 'excellent' | 'good' | 'average' | 'poor';
  notes: string;
  teacherId: string;
  createdAt: string;
  updatedAt: string;
}

export interface StudentsResponse {
  students: Student[];
  totalPages: number;
  currentPage: number;
  total: number;
}

// Notification types
export interface Notification {
  _id: string;
  title: string;
  message: string;
  type: 'grade_update' | 'attendance' | 'general';
  recipientEmail: string;
  studentId?: string;
  isRead: boolean;
  senderId: {
    _id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface NotificationsResponse {
  notifications: Notification[];
  totalPages: number;
  currentPage: number;
  total: number;
}

// Navigation types
export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Dashboard: undefined;
  MainTabs: undefined;
  StudentList: undefined;
  StudentDetail: { studentId: string };
  Notifications: undefined;
  AddStudent: undefined;
  EditStudent: { student: Student };
  ParentStudents: undefined;
  ComposeNotification: undefined;
};

// API Response types
export interface ApiResponse<T = any> {
  message: string;
  data?: T;
}