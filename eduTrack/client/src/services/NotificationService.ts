import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

class NotificationService {
  private expoPushToken: string | null = null;

  async registerForPushNotificationsAsync() {
    let token;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.warn('Failed to get push token for push notification!');
        return null;
      }
      
      try {
        const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
        if (!projectId) {
          throw new Error('Project ID not found');
        }
        
        token = (await Notifications.getExpoPushTokenAsync({
          projectId,
        })).data;
        
        console.log('📱 Expo Push Token:', token);
      } catch (e) {
        console.warn('Error getting push token:', e);
        // For development, we can still work without push tokens
        return null;
      }
    } else {
      console.warn('Must use physical device for Push Notifications');
      return null;
    }

    this.expoPushToken = token;
    return token;
  }

  getExpoPushToken() {
    return this.expoPushToken;
  }

  // Listen for notifications when app is in foreground
  addNotificationListener(callback: (notification: any) => void) {
    const subscription = Notifications.addNotificationReceivedListener(callback);
    return subscription;
  }

  // Listen for notification tap when app is in background
  addNotificationResponseListener(callback: (response: any) => void) {
    const subscription = Notifications.addNotificationResponseReceivedListener(callback);
    return subscription;
  }

  // Show local notification (for testing)
  async showLocalNotification(title: string, body: string, data?: any) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: 'default',
      },
      trigger: null, // Show immediately
    });
  }

  // Get notification history
  async getNotificationHistory() {
    return await Notifications.getPresentedNotificationsAsync();
  }

  // Clear all notifications
  async clearAllNotifications() {
    await Notifications.dismissAllNotificationsAsync();
  }
}

export default new NotificationService();