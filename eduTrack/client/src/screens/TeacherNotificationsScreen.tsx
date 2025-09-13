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

const TeacherNotificationsScreen: React.FC<Props> = ({ navigation }) => {
  const { state: authState } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    loadSentNotifications();
  }, []);

  const loadSentNotifications = useCallback(async (pageNum = 1, append = false) => {
  try {
    if (!append) setIsLoading(true);
    
    const response: NotificationsResponse = await apiService.getSentNotifications({
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
    Alert.alert('Error', error.message || 'Failed to load sent notifications');
  } finally {
    setIsLoading(false);
    setRefreshing(false);
    setLoadingMore(false);
  }
}, []);


  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadSentNotifications(1, false);
  }, [loadSentNotifications]);

  const loadMore = useCallback(async () => {
    if (loadingMore || page >= totalPages) return;

    setLoadingMore(true);
    const nextPage = page + 1;
    await loadSentNotifications(nextPage, true);
  }, [loadingMore, page, totalPages, loadSentNotifications]);

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
    <View style={styles.notificationCard}>
      <View style={styles.notificationHeader}>
        <View style={[styles.iconContainer, { backgroundColor: `${getNotificationColor(item.type)}20` }]}>
          <Ionicons
            name={getNotificationIcon(item.type) as keyof typeof Ionicons.glyphMap}
            size={20}
            color={getNotificationColor(item.type)}
          />
        </View>
        
        <View style={styles.notificationContent}>
          <Text style={styles.notificationTitle}>{item.title}</Text>
          <Text style={styles.notificationMessage}>{item.message}</Text>
          
          <View style={styles.notificationFooter}>
            <Text style={styles.recipientText}>To: {item.recipientEmail}</Text>
            <Text style={styles.notificationDate}>{formatDate(item.createdAt)}</Text>
          </View>
        </View>

        <View style={styles.statusContainer}>
          <View style={[styles.statusDot, { backgroundColor: item.isRead ? COLORS.success : COLORS.warning }]} />
          <Text style={styles.statusText}>
            {item.isRead ? 'Read' : 'Unread'}
          </Text>
        </View>
      </View>
    </View>
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
        <Ionicons name="paper-plane-outline" size={64} color={COLORS.gray} />
        <Text style={styles.emptyText}>No notifications sent yet</Text>
        <Text style={styles.emptySubtext}>
          Start sending notifications to parents from the compose screen
        </Text>
        <TouchableOpacity 
          style={styles.composeButton}
          onPress={() => navigation.navigate('ComposeNotification')}
        >
          <Ionicons name="add" size={20} color={COLORS.white} />
          <Text style={styles.composeButtonText}>Send Notification</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderHeader = () => (
    <View style={styles.headerStats}>
      <Text style={styles.statsTitle}>Sent Notifications</Text>
      <Text style={styles.statsSubtitle}>
        {notifications.length} notification{notifications.length !== 1 ? 's' : ''} sent
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Header 
        title="Sent Notifications" 
      />
      
      <FlatList
        data={notifications}
        keyExtractor={(item) => item._id}
        renderItem={renderNotification}
        ListHeaderComponent={notifications.length > 0 ? renderHeader : undefined}
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
        <Loading fullScreen text="Loading sent notifications..." />
      )}

      {/* Compose FAB */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => navigation.navigate('ComposeNotification')}
      >
        <Ionicons name="add" size={24} color={COLORS.white} />
      </TouchableOpacity>
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
  headerStats: {
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.darkGray,
    marginBottom: 4,
  },
  statsSubtitle: {
    fontSize: 14,
    color: COLORS.gray,
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
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.darkGray,
    marginBottom: 4,
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
  recipientText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '500',
  },
  notificationDate: {
    fontSize: 12,
    color: COLORS.gray,
  },
  statusContainer: {
    alignItems: 'center',
    marginLeft: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 10,
    color: COLORS.gray,
    fontWeight: '500',
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
    marginBottom: 24,
  },
  composeButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  composeButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
});

export default TeacherNotificationsScreen;