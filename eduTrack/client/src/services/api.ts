import axios, { AxiosInstance, AxiosResponse } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL, STORAGE_KEYS } from '../utils/constants';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor để tự động thêm token
    this.api.interceptors.request.use(
      async (config) => {
        try {
          const token = await SecureStore.getItemAsync(STORAGE_KEYS.TOKEN);
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        } catch (error) {
          console.error('Error getting token:', error);
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor để handle errors
    this.api.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      async (error) => {
        if (error.response?.status === 401) {
          // Token expired, clear storage
          await SecureStore.deleteItemAsync(STORAGE_KEYS.TOKEN);
          await SecureStore.deleteItemAsync(STORAGE_KEYS.USER);
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth methods
  async login(email: string, password: string) {
    const response = await this.api.post('/auth/login', { email, password });
    return response.data;
  }

  async register(userData: {
    email: string;
    password: string;
    name: string;
    role: string;
    phone?: string;
  }) {
    const response = await this.api.post('/auth/register', userData);
    return response.data;
  }

  async getCurrentUser() {
    const response = await this.api.get('/auth/me');
    return response.data;
  }

  // Student methods
  async getStudents(params?: {
    page?: number;
    limit?: number;
    search?: string;
    class?: string;
  }) {
    const response = await this.api.get('/students', { params });
    return response.data;
  }

  async getStudent(id: string) {
    const response = await this.api.get(`/students/${id}`);
    return response.data;
  }

  async createStudent(studentData: {
    name: string;
    studentId: string;
    class: string;
    parentEmail: string;
  }) {
    const response = await this.api.post('/students', studentData);
    return response.data;
  }

  async updateStudent(id: string, studentData: any) {
    const response = await this.api.put(`/students/${id}`, studentData);
    return response.data;
  }

  async deleteStudent(id: string) {
    const response = await this.api.delete(`/students/${id}`);
    return response.data;
  }

  async addGrade(studentId: string, gradeData: {
    subject: string;
    score: number;
    type: string;
  }) {
    const response = await this.api.post(`/students/${studentId}/grades`, gradeData);
    return response.data;
  }

  // Notification methods
  async getNotifications(params?: {
    page?: number;
    limit?: number;
  }) {
    const response = await this.api.get('/notifications', { params });
    return response.data;
  }


  async getSentNotifications(params?: { page?: number; limit?: number }) {
  const response = await this.api.get('/notifications/sent', { params });
  return response.data;
  }


  async markNotificationAsRead(id: string) {
    const response = await this.api.put(`/notifications/${id}/read`);
    return response.data;
  }

  async createNotification(notificationData: {
    title: string;
    message: string;
    recipientEmail: string;
    type?: string;
  }) {
    const response = await this.api.post('/notifications', notificationData);
    return response.data;
  }
}

export default new ApiService();