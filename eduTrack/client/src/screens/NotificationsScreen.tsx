import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { Notification, NotificationsResponse } from '../utils/types';
import { COLORS } from '../utils/constants';
import Header from '../components/Header';
import Loading from '../components/Loading';
import apiService from '../services/api';

interface Props {
  navigation: any;
}

const NotificationsScreen: React.FC<Props> = ({ navigation }) => {
  const { state: authState } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = useCallback(async (pageNum = 1, append = false) => {
    try {
      if (!append) setIsLoading(true);
      
      const response: NotificationsResponse = await apiService.getNotifications({
        page: pageNum,
        limit: 20,
      });

      if (append) {
        setNotifications(prev => [...prev, ...response.notifications]);
      } else {
        setNotifications(response.notifications);
      }
      
      setTotalPages(response.totalPages);
      setPage(pageNum);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load notifications');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadNotifications(1, false);
  }, []);

  const loadMore = useCallback(async () => {
    if (loadingMore || page >= totalPages) return;

    setLoadingMore(true);
    const nextPage = page + 1;
    await loadNotifications(nextPage, true);
  }, [loadingMore, page, totalPages]);

  const markAsRead = async (notification: Notification) => {
    if (notification.isRead) return;

    try {
      await apiService.markNotificationAsRead(notification._id);
      
      // Update local state
      setNotifications(prev =>
        prev.map(item =>
          item._id === notification._id ? { ...item, isRead: true } : item
        )
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to mark as read');
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'grade_update':
        return 'school-outline';
      case 'attendance':
        return 'calendar-outline';
      default:
        return 'information-circle-outline';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'grade_update':
        return COLORS.success;
      case 'attendance':
        return COLORS.warning;
      default:
        return COLORS.primary;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInDays < 7) {
      return `${diffInDays}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const renderNotification = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      style={[styles.notificationCard, !item.isRead && styles.unreadCard]}
      onPress={() => markAsRead(item)}
    >
      <View style={styles.notificationHeader}>
        <View style={styles.iconContainer}>
          <Ionicons
            name={getNotificationIcon(item.type) as keyof typeof Ionicons.glyphMap}
            size={20}
            color={getNotificationColor(item.type)}
          />
        </View>
        
        <View style={styles.notificationContent}>
          <Text style={[styles.notificationTitle, !item.isRead && styles.unreadTitle]}>
            {item.title}
          </Text>
          <Text style={styles.notificationMessage}>{item.message}</Text>
          
          <View style={styles.notificationFooter}>
            <Text style={styles.senderName}>From: {item.senderId.name}</Text>
            <Text style={styles.notificationDate}>{formatDate(item.createdAt)}</Text>
          </View>
        </View>

        {!item.isRead && <View style={styles.unreadDot} />}
      </View>
    </TouchableOpacity>
  );

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <Loading text="Loading more..." />
      </View>
    );
  };

  const renderEmpty = () => {
    if (isLoading) return null;
    
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="notifications-outline" size={64} color={COLORS.gray} />
        <Text style={styles.emptyText}>No notifications yet</Text>
        <Text style={styles.emptySubtext}>
          You'll see updates from teachers here
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Header title="Notifications" />
      
      <FlatList
        data={notifications}
        keyExtractor={(item) => item._id}
        renderItem={renderNotification}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        contentContainerStyle={notifications.length === 0 ? styles.emptyContent : styles.content}
      />

      {isLoading && notifications.length === 0 && (
        <Loading fullScreen text="Loading notifications..." />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    paddingVertical: 8,
  },
  emptyContent: {
    flexGrow: 1,
  },
  notificationCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.darkGray,
    marginBottom: 4,
  },
  unreadTitle: {
    fontWeight: '600',
    color: COLORS.darkGray,
  },
  notificationMessage: {
    fontSize: 14,
    color: COLORS.gray,
    lineHeight: 20,
    marginBottom: 8,
  },
  notificationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  senderName: {
    fontSize: 12,
    color: COLORS.gray,
    fontStyle: 'italic',
  },
  notificationDate: {
    fontSize: 12,
    color: COLORS.gray,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    marginLeft: 8,
    marginTop: 4,
  },
  footerLoader: {
    paddingVertical: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.darkGray,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.gray,
    textAlign: 'center',
  },
});

export default NotificationsScreen;