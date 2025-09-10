import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useStudent } from '../contexts/StudentContext';
import { COLORS } from '../utils/constants';
import Header from '../components/Header';
import Loading from '../components/Loading';

interface Props {
  navigation: any;
}

const DashboardScreen: React.FC<Props> = ({ navigation }) => {
  const { state: authState, logout } = useAuth();
  const { state: studentState, loadStudents } = useStudent();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (authState.user?.role === 'teacher') {
      loadStudents({ limit: 5 });
    }
  }, [authState.user]);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', onPress: logout },
      ]
    );
  };

  const onRefresh = async () => {
    setRefreshing(true);
    if (authState.user?.role === 'teacher') {
      await loadStudents({ limit: 5 });
    }
    setRefreshing(false);
  };

  // Stats for teacher
  const getTeacherStats = () => {
    const students = studentState.students;
    const totalStudents = students.length;
    
    let totalGrades = 0;
    let gradeCount = 0;
    let attendanceSum = 0;
    
    students.forEach(student => {
      student.grades.forEach(grade => {
        totalGrades += grade.score;
        gradeCount++;
      });
      attendanceSum += student.attendance;
    });
    
    return {
      totalStudents,
      avgGrade: gradeCount > 0 ? (totalGrades / gradeCount).toFixed(1) : '0.0',
      avgAttendance: totalStudents > 0 ? Math.round(attendanceSum / totalStudents) : 0,
    };
  };

  const stats = authState.user?.role === 'teacher' ? getTeacherStats() : null;

  return (
    <View style={styles.container}>
      <Header
        title="Dashboard"
        rightElement={
          <TouchableOpacity onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color={COLORS.white} />
          </TouchableOpacity>
        }
      />

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>
            Welcome back, {authState.user?.name}!
          </Text>
          <Text style={styles.roleText}>
            Role: {authState.user?.role?.toUpperCase()}
          </Text>
        </View>

        {/* Teacher Dashboard */}
        {authState.user?.role === 'teacher' && (
          <>
            {/* Quick Stats */}
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <Ionicons name="people" size={24} color={COLORS.primary} />
                <Text style={styles.statNumber}>{stats?.totalStudents || 0}</Text>
                <Text style={styles.statLabel}>Total Students</Text>
              </View>
              
              <View style={styles.statCard}>
                <Ionicons name="school" size={24} color={COLORS.success} />
                <Text style={styles.statNumber}>{stats?.avgGrade || '0.0'}</Text>
                <Text style={styles.statLabel}>Avg Grade</Text>
              </View>
              
              <View style={styles.statCard}>
                <Ionicons name="calendar" size={24} color={COLORS.warning} />
                <Text style={styles.statNumber}>{stats?.avgAttendance || 0}%</Text>
                <Text style={styles.statLabel}>Avg Attendance</Text>
              </View>
            </View>

            {/* Quick Actions */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Quick Actions</Text>
              
              <TouchableOpacity
                style={styles.actionCard}
                onPress={() => navigation.navigate('Students')}
              >
                <Ionicons name="people-outline" size={24} color={COLORS.primary} />
                <View style={styles.actionText}>
                  <Text style={styles.actionTitle}>Manage Students</Text>
                  <Text style={styles.actionSubtitle}>View and edit student information</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={COLORS.gray} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionCard}
                onPress={() => navigation.navigate('Notifications')}
              >
                <Ionicons name="notifications-outline" size={24} color={COLORS.secondary} />
                <View style={styles.actionText}>
                  <Text style={styles.actionTitle}>Send Notifications</Text>
                  <Text style={styles.actionSubtitle}>Send updates to parents</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={COLORS.gray} />
              </TouchableOpacity>
            </View>

            {/* Recent Students */}
            {studentState.students.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Recent Students</Text>
                  <TouchableOpacity onPress={() => navigation.navigate('Students')}>
                    <Text style={styles.seeAllText}>See All</Text>
                  </TouchableOpacity>
                </View>

                {studentState.students.slice(0, 3).map((student) => (
                  <TouchableOpacity
                    key={student._id}
                    style={styles.studentCard}
                    onPress={() => navigation.navigate('StudentDetail', { studentId: student._id })}
                  >
                    <View style={styles.studentInfo}>
                      <Text style={styles.studentName}>{student.name}</Text>
                      <Text style={styles.studentClass}>Class: {student.class}</Text>
                    </View>
                    <View style={styles.studentStats}>
                      <Text style={styles.studentGrade}>
                        {student.grades.length > 0 
                          ? (student.grades.reduce((sum, g) => sum + g.score, 0) / student.grades.length).toFixed(1)
                          : '0.0'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </>
        )}

        {/* Parent Dashboard */}
        {authState.user?.role === 'parent' && (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>My Children</Text>
              
              <TouchableOpacity
                style={styles.actionCard}
                onPress={() => navigation.navigate('ParentStudents')}
              >
                <Ionicons name="people-outline" size={24} color={COLORS.primary} />
                <View style={styles.actionText}>
                  <Text style={styles.actionTitle}>View Children Progress</Text>
                  <Text style={styles.actionSubtitle}>Check grades and attendance</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={COLORS.gray} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionCard}
                onPress={() => navigation.navigate('Notifications')}
              >
                <Ionicons name="notifications-outline" size={24} color={COLORS.secondary} />
                <View style={styles.actionText}>
                  <Text style={styles.actionTitle}>View Notifications</Text>
                  <Text style={styles.actionSubtitle}>Updates from teachers</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={COLORS.gray} />
              </TouchableOpacity>
            </View>
          </>
        )}

        {studentState.isLoading && <Loading />}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
  },
  welcomeSection: {
    backgroundColor: COLORS.white,
    margin: 16,
    padding: 20,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.darkGray,
    marginBottom: 4,
  },
  roleText: {
    fontSize: 14,
    color: COLORS.gray,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  statCard: {
    backgroundColor: COLORS.white,
    flex: 1,
    marginHorizontal: 4,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.darkGray,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.gray,
    textAlign: 'center',
    marginTop: 4,
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.darkGray,
  },
  seeAllText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
  },
  actionCard: {
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  actionText: {
    flex: 1,
    marginLeft: 12,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.darkGray,
  },
  actionSubtitle: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 2,
  },
  studentCard: {
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.darkGray,
  },
  studentClass: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 2,
  },
  studentStats: {
    alignItems: 'center',
  },
  studentGrade: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  infoCard: {
    backgroundColor: COLORS.lightGray,
    flexDirection: 'row',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: COLORS.gray,
    lineHeight: 20,
  },
});

export default DashboardScreen;