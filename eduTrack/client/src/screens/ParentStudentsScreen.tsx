import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { Student } from '../utils/types';
import { COLORS } from '../utils/constants';
import Header from '../components/Header';
import StudentCard from '../components/StudentCard';
import Loading from '../components/Loading';
import apiService from '../services/api';

interface Props {
  navigation: any;
}

const ParentStudentsScreen: React.FC<Props> = ({ navigation }) => {
  const { state: authState } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadMyChildren();
  }, []);

  const loadMyChildren = async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setIsLoading(true);
      }

      // Get students where parentEmail matches current user email
      const response = await apiService.getStudents({
        limit: 100 // Get all children
      });

      // Filter students by parent email
      const myChildren = response.students.filter(
        (student: Student) => student.parentEmail === authState.user?.email
      );

      setStudents(myChildren);
    } catch (error: any) {
      console.error('Error loading children:', error);
      Alert.alert('Error', 'Failed to load your children data');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    await loadMyChildren(true);
  };

  const renderStudent = ({ item }: { item: Student }) => (
    <StudentCard
      student={item}
      onPress={() => navigation.navigate('StudentDetail', { studentId: item._id })}
      showActions={false} // Parents can't edit
    />
  );

  const renderEmpty = () => {
    if (isLoading) return null;
    
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="people-outline" size={64} color={COLORS.gray} />
        <Text style={styles.emptyTitle}>No Children Found</Text>
        <Text style={styles.emptyText}>
          No students are registered with your email address.
          Please contact your child's teacher to add your email.
        </Text>
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={20} color={COLORS.primary} />
          <Text style={styles.infoText}>
            Your registered email: {authState.user?.email}
          </Text>
        </View>
      </View>
    );
  };

  const renderHeader = () => (
    <View style={styles.headerInfo}>
      <Text style={styles.headerTitle}>My Children</Text>
      <Text style={styles.headerSubtitle}>
        {students.length} child{students.length !== 1 ? 'ren' : ''} found
      </Text>
    </View>
  );

  if (authState.user?.role !== 'parent') {
    return (
      <View style={styles.container}>
        <Header title="My Children" />
        <View style={styles.accessDenied}>
          <Ionicons name="lock-closed" size={64} color={COLORS.gray} />
          <Text style={styles.accessDeniedText}>
            This section is only available for parents
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="My Children" />
      
      <FlatList
        data={students}
        keyExtractor={(item) => item._id}
        renderItem={renderStudent}
        ListHeaderComponent={students.length > 0 ? renderHeader : undefined}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={students.length === 0 ? styles.emptyContent : styles.content}
      />

      {isLoading && students.length === 0 && (
        <Loading fullScreen text="Loading your children..." />
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
  headerInfo: {
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
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.darkGray,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.gray,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.darkGray,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.gray,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
    padding: 16,
    borderRadius: 12,
    alignSelf: 'stretch',
  },
  infoText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: COLORS.darkGray,
    fontWeight: '500',
  },
  accessDenied: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  accessDeniedText: {
    fontSize: 16,
    color: COLORS.gray,
    textAlign: 'center',
    marginTop: 16,
  },
});

export default ParentStudentsScreen;