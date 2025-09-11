import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNotifications } from '../contexts/NotificationContext';
import { COLORS } from '../utils/constants';

interface NotificationBadgeProps {
  color: string;
  size: number;
  focused?: boolean;
}

const NotificationBadge: React.FC<NotificationBadgeProps> = ({ 
  color, 
  size, 
  focused = false 
}) => {
  const { unreadCount } = useNotifications();

  return (
    <View style={styles.container}>
      <Ionicons 
        name={focused ? 'notifications' : 'notifications-outline'} 
        size={size} 
        color={color} 
      />
      {unreadCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    right: -6,
    top: -3,
    backgroundColor: COLORS.danger,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: 'bold',
    paddingHorizontal: 2,
  },
});

export default NotificationBadge;