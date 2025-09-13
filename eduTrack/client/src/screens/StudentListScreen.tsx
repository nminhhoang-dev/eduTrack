import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStudent } from '../contexts/StudentContext';
import { useAuth } from '../contexts/AuthContext';
import { Student } from '../utils/types';
import { COLORS } from '../utils/constants';
import Header from '../components/Header';
import StudentCard from '../components/StudentCard';
import Loading from '../components/Loading';

interface Props {
  navigation: any;
}

const StudentListScreen: React.FC<Props> = ({ navigation }) => {
  const { state: authState } = useAuth();
  const { state, loadStudents, deleteStudent } = useStudent();
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    if (authState.user?.role === 'teacher') {
      loadStudents({ page: 1, search: searchQuery });
      setPage(1);
    }
  }, [searchQuery]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadStudents({ page: 1, search: searchQuery });
    setPage(1);
    setRefreshing(false);
  }, [searchQuery]);

  const loadMore = useCallback(async () => {
    if (loadingMore || page >= state.pagination.totalPages) return;

    setLoadingMore(true);
    const nextPage = page + 1;
    await loadStudents({ page: nextPage, search: searchQuery });
    setPage(nextPage);
    setLoadingMore(false);
  }, [loadingMore, page, state.pagination.totalPages, searchQuery]);

  const handleDeleteStudent = (student: Student) => {
    Alert.alert(
      'Delete Student',
      `Are you sure you want to delete ${student.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteStudent(student._id);
              Alert.alert('Success', 'Student deleted successfully');
            } catch (error: any) {
              Alert.alert('Error', error.message);
            }
          },
        },
      ]
    );
  };

  const handleEditStudent = (student: Student) => {
    navigation.navigate('EditStudent', { student });
  };

  const handleAddStudent = () => {
    navigation.navigate('AddStudent');
  };

  const renderStudent = ({ item }: { item: Student }) => (
    <StudentCard
      student={item}
      onPress={() => navigation.navigate('StudentDetail', { studentId: item._id })}
      onEdit={() => handleEditStudent(item)}
      onDelete={() => handleDeleteStudent(item)}
      showActions={authState.user?.role === 'teacher'}
    />
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
    if (state.isLoading) return null;
    
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="people-outline" size={64} color={COLORS.gray} />
        <Text style={styles.emptyText}>
          {searchQuery ? 'No students found for your search' : 'No students yet'}
        </Text>
        {!searchQuery && authState.user?.role === 'teacher' && (
          <TouchableOpacity style={styles.addButton} onPress={handleAddStudent}>
            <Text style={styles.addButtonText}>Add First Student</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  // Sticky header component
  const StickyHeader = React.useMemo(() => (
    <View style={styles.stickyHeader}>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={COLORS.gray} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search students..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
          clearButtonMode="while-editing"
          autoCorrect={false}
          autoCapitalize="none"
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color={COLORS.gray} />
          </TouchableOpacity>
        ) : null}
      </View>

      <View style={styles.resultHeader}>
        <Text style={styles.resultCount}>
          {state.pagination.total} student{state.pagination.total !== 1 ? 's' : ''}
        </Text>
        {authState.user?.role === 'teacher' && (
          <TouchableOpacity style={styles.addStudentButton} onPress={handleAddStudent}>
            <Ionicons name="add" size={20} color={COLORS.white} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  ), [searchQuery, state.pagination.total, authState.user?.role]);

  if (authState.user?.role !== 'teacher') {
    return (
      <View style={styles.container}>
        <Header title="Students" />
        <View style={styles.accessDenied}>
          <Ionicons name="lock-closed" size={64} color={COLORS.gray} />
          <Text style={styles.accessDeniedText}>
            This section is only available for teachers
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Students" />
      
      <FlatList
        data={state.students}
        keyExtractor={(item) => item._id}
        renderItem={renderStudent}
        ListHeaderComponent={StickyHeader}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        stickyHeaderIndices={[0]}
        contentContainerStyle={state.students.length === 0 ? styles.emptyContent : undefined}
      />

      {state.isLoading && state.students.length === 0 && (
        <Loading fullScreen text="Loading students..." />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  stickyHeader: {
    backgroundColor: COLORS.background,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    marginHorizontal: 12,
    color: COLORS.darkGray,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultCount: {
    fontSize: 14,
    color: COLORS.gray,
    fontWeight: '500',
  },
  addStudentButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContent: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.gray,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  addButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  footerLoader: {
    paddingVertical: 20,
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

export default StudentListScreen;