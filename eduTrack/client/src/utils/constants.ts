export const API_BASE_URL = __DEV__
  ? 'http://10.0.2.2:5000/api' 
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
  primaryDark: '#4338ca',
  primaryLight: '#818cf8',
  success: '#10b981',
  danger: '#ef4444',
  warning: '#f59e0b',
  background: '#f8fafc',
  white: '#ffffff',
  surfaceTint: '#f8faff',
  border: '#e2e8f0',
  gray: '#64748b',
  lightGray: '#f1f5f9',
  darkGray: '#374151'
};

// Gradients are reserved for app chrome, page canvases, and selected summary areas.
export const GRADIENTS = {
  page: ['#f8fafc', '#f5f7ff', '#eef2ff'] as const,
  header: [COLORS.primaryDark, COLORS.primary, COLORS.primaryLight] as const,
  hero: ['#4f46e5', COLORS.primary, COLORS.primaryLight] as const,
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