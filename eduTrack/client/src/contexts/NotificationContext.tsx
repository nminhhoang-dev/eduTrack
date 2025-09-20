import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import NotificationService from '../services/NotificationService';
import apiService from '../services/api';
import { Notification } from '../utils/types';

interface NotificationContextType {
  unreadCount: number;
  refreshNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { state: authState } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (authState.isAuthenticated) {
      initializeNotifications();
      loadUnreadCount();
    }
  }, [authState.isAuthenticated]);

  const initializeNotifications = async () => {
    // Set up notification listeners
    const notificationListener = NotificationService.addNotificationListener((notification) => {
      console.log('Received notification:', notification);
      
      // Refresh unread count when notification received
      loadUnreadCount();
      
      // Show local notification for better UX
      if (notification.request?.content) {
        const content = notification.request.content;
        console.log(`New notification: ${content.title} - ${content.body}`);
      }
    });

    const responseListener = NotificationService.addNotificationResponseListener((response) => {
      console.log('Notification tapped:', response);
      // TODO: Navigate to specific screen based on notification data
    });

    return () => {
      notificationListener.remove();
      responseListener.remove();
    };
  };

  const loadUnreadCount = async () => {
    try {
      const response = await apiService.getNotifications({ limit: 100 });
      const unread = response.notifications.filter((n: Notification) => !n.isRead);
      setUnreadCount(unread.length);
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };

  const refreshNotifications = async () => {
    await loadUnreadCount();
  };

  const value = {
    unreadCount,
    refreshNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}