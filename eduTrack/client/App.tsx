import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/contexts/AuthContext';
import { StudentProvider } from './src/contexts/StudentContext';
import { NotificationProvider } from './src/contexts/NotificationContext';
import AppNavigator from './src/navigation/AppNavigator';
import { COLORS } from './src/utils/constants';
import NotificationService from './src/services/NotificationService';

export default function App() {
  useEffect(() => {
    // Initialize notifications
    const initNotifications = async () => {
      try {
        await NotificationService.registerForPushNotificationsAsync();

        // Listen for notifications when app is open
        const notificationListener = NotificationService.addNotificationListener((notification) => {
          console.log('Notification received in foreground:', notification);
        });

        // Listen for notification taps
        const responseListener = NotificationService.addNotificationResponseListener((response) => {
          console.log('Notification tapped:', response);
          // TODO: Navigate to specific screen based on notification data
        });

        return () => {
          notificationListener.remove();
          responseListener.remove();
        };
      } catch (error) {
        console.error('Error initializing notifications:', error);
      }
    };

    initNotifications();
  }, []);

  return (
    <NavigationContainer>
      <AuthProvider>
        <StudentProvider>
          <NotificationProvider>
            <StatusBar style="light" backgroundColor={COLORS.primary} />
            <AppNavigator />
          </NotificationProvider>
        </StudentProvider>
      </AuthProvider>
    </NavigationContainer>
  );
}