// API Configuration
export const API_BASE_URL = __DEV__
  ? 'http://192.168.1.50:5000/api' // Thay IP này bằng IP máy tính của bạn
  : 'https://your-deployed-backend.com/api';

// Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'auth_token',
  USER: 'user_data'
};

// Colors
export const COLORS = {
  primary: '#6366f1',
  secondary: '#8b5cf6',
  success: '#10b981',
  danger: '#ef4444',
  warning: '#f59e0b',
  background: '#f8fafc',
  white: '#ffffff',
  gray: '#64748b',
  lightGray: '#f1f5f9',
  darkGray: '#374151'
};

// Behavior Colors
export const BEHAVIOR_COLORS = {
  excellent: COLORS.success,
  good: '#3b82f6',
  average: COLORS.warning,
  poor: COLORS.danger
};

// Grade Colors
export const GRADE_COLORS = {
  homework: '#8b5cf6',
  test: '#06b6d4',
  exam: '#ef4444'
};