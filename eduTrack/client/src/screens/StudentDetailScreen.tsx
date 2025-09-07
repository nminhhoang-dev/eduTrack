import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useStudent } from '../contexts/StudentContext';
import { useAuth } from '../contexts/AuthContext';
import { Grade } from '../utils/types';
import { COLORS, BEHAVIOR_COLORS, GRADE_COLORS } from '../utils/constants';
import Header from '../components/Header';
import Loading from '../components/Loading';
import Chart from '../components/Chart';

interface Props {
  navigation: any;
  route: {
    params: {
      studentId: string;
    };
  };
}

const StudentDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { studentId } = route.params;
  const { state: authState } = useAuth();
  const { state, loadStudent, addGrade, clearCurrentStudent } = useStudent();
  const [showAddGradeModal, setShowAddGradeModal] = useState(false);
  const [gradeForm, setGradeForm] = useState({
    subject: '',
    score: '',
    type: 'homework' as 'homework' | 'test' | 'exam',
  });

  useEffect(() => {
    loadStudent(studentId);
    return () => clearCurrentStudent();
  }, [studentId]);

  const handleAddGrade = async () => {
    if (!gradeForm.subject || !gradeForm.score) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const score = parseFloat(gradeForm.score);
    if (isNaN(score) || score < 0 || score > 10) {
      Alert.alert('Error', 'Score must be a number between 0 and 10');
      return;
    }

    try {
      await addGrade(studentId, {
        subject: gradeForm.subject,
        score: score,
        type: gradeForm.type,
      });

      setShowAddGradeModal(false);
      setGradeForm({ subject: '', score: '', type: 'homework' });
      Alert.alert('Success', 'Grade added successfully');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const renderGradeItem = (grade: Grade, index: number) => (
    <View key={index} style={styles.gradeItem}>
      <View style={styles.gradeHeader}>
        <Text style={styles.gradeSubject}>{grade.subject}</Text>
        <Text style={styles.gradeScore}>{grade.score}/10</Text>
      </View>
      <View style={styles.gradeFooter}>
        <View style={[styles.gradeType, { backgroundColor: GRADE_COLORS[grade.type] }]}>
          <Text style={styles.gradeTypeText}>
            {grade.type.charAt(0).toUpperCase() + grade.type.slice(1)}
          </Text>
        </View>
        <Text style={styles.gradeDate}>
          {new Date(grade.date).toLocaleDateString()}
        </Text>
      </View>
    </View>
  );

  const AddGradeModal = () => (
    <Modal
      visible={showAddGradeModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowAddGradeModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add New Grade</Text>
            <TouchableOpacity onPress={() => setShowAddGradeModal(false)}>
              <Ionicons name="close" size={24} color={COLORS.gray} />
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Subject</Text>
              <TextInput
                style={styles.textInput}
                value={gradeForm.subject}
                onChangeText={(text) => setGradeForm({ ...gradeForm, subject: text })}
                placeholder="e.g., Math, English, Science"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Score (0-10)</Text>
              <TextInput
                style={styles.textInput}
                value={gradeForm.score}
                onChangeText={(text) => setGradeForm({ ...gradeForm, score: text })}
                placeholder="e.g., 8.5"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Type</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={gradeForm.type}
                  onValueChange={(value) => setGradeForm({ ...gradeForm, type: value })}
                >
                  <Picker.Item label="Homework" value="homework" />
                  <Picker.Item label="Test" value="test" />
                  <Picker.Item label="Exam" value="exam" />
                </Picker>
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowAddGradeModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleAddGrade}>
                <Text style={styles.saveButtonText}>Add Grade</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );

  if (state.isLoading && !state.currentStudent) {
    return <Loading fullScreen text="Loading student..." />;
  }

  if (!state.currentStudent) {
    return (
      <View style={styles.container}>
        <Header title="Student Detail" showBack onBackPress={() => navigation.goBack()} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Student not found</Text>
        </View>
      </View>
    );
  }

  const student = state.currentStudent;
  const isTeacher = authState.user?.role === 'teacher';

  // Calculate average grade
  const averageGrade = student.grades.length > 0
    ? student.grades.reduce((sum, grade) => sum + grade.score, 0) / student.grades.length
    : 0;

  return (
    <View style={styles.container}>
      <Header
        title={student.name}
        showBack
        onBackPress={() => navigation.goBack()}
        rightElement={
          isTeacher ? (
            <TouchableOpacity onPress={() => setShowAddGradeModal(true)}>
              <Ionicons name="add" size={24} color={COLORS.white} />
            </TouchableOpacity>
          ) : undefined
        }
      />

      <ScrollView style={styles.content}>
        {/* Student Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <View>
              <Text style={styles.studentName}>{student.name}</Text>
              <Text style={styles.studentId}>ID: {student.studentId}</Text>
              <Text style={styles.studentClass}>Class: {student.class}</Text>
            </View>
            <View style={styles.averageContainer}>
              <Text style={styles.averageLabel}>Average</Text>
              <Text style={[
                styles.averageScore,
                { color: averageGrade >= 8 ? COLORS.success : averageGrade >= 6.5 ? COLORS.warning : COLORS.danger }
              ]}>
                {averageGrade.toFixed(1)}
              </Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{student.attendance}%</Text>
              <Text style={styles.statLabel}>Attendance</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{student.grades.length}</Text>
              <Text style={styles.statLabel}>Grades</Text>
            </View>
            <View style={styles.behaviorBox}>
              <View style={[styles.behaviorBadge, { backgroundColor: BEHAVIOR_COLORS[student.behavior] }]}>
                <Text style={styles.behaviorText}>
                  {student.behavior.charAt(0).toUpperCase() + student.behavior.slice(1)}
                </Text>
              </View>
            </View>
          </View>

          {student.notes && (
            <View style={styles.notesSection}>
              <Text style={styles.notesLabel}>Notes:</Text>
              <Text style={styles.notesText}>{student.notes}</Text>
            </View>
          )}
        </View>

        {/* Chart */}
        {student.grades.length > 0 && (
          <Chart grades={student.grades} type="line" />
        )}

        {/* Grades List */}
        <View style={styles.gradesSection}>
          <View style={styles.gradesSectionHeader}>
            <Text style={styles.sectionTitle}>All Grades</Text>
            {isTeacher && (
              <TouchableOpacity
                style={styles.addGradeButton}
                onPress={() => setShowAddGradeModal(true)}
              >
                <Text style={styles.addGradeButtonText}>Add Grade</Text>
              </TouchableOpacity>
            )}
          </View>

          {student.grades.length > 0 ? (
            <View style={styles.gradesList}>
              {student.grades
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((grade, index) => renderGradeItem(grade, index))}
            </View>
          ) : (
            <View style={styles.noGradesContainer}>
              <Ionicons name="school-outline" size={48} color={COLORS.gray} />
              <Text style={styles.noGradesText}>No grades yet</Text>
              {isTeacher && (
                <TouchableOpacity
                  style={styles.firstGradeButton}
                  onPress={() => setShowAddGradeModal(true)}
                >
                  <Text style={styles.firstGradeButtonText}>Add First Grade</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {isTeacher && <AddGradeModal />}
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: COLORS.gray,
  },
  infoCard: {
    backgroundColor: COLORS.white,
    margin: 16,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  infoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  studentName: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.darkGray,
  },
  studentId: {
    fontSize: 14,
    color: COLORS.gray,
    marginTop: 4,
  },
  studentClass: {
    fontSize: 14,
    color: COLORS.gray,
    marginTop: 2,
  },
  averageContainer: {
    alignItems: 'center',
  },
  averageLabel: {
    fontSize: 12,
    color: COLORS.gray,
  },
  averageScore: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  statBox: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.darkGray,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 4,
  },
  behaviorBox: {
    alignItems: 'center',
  },
  behaviorBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  behaviorText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '500',
  },
  notesSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  notesLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.darkGray,
    marginBottom: 4,
  },
  notesText: {
    fontSize: 14,
    color: COLORS.gray,
    lineHeight: 20,
  },
  gradesSection: {
    margin: 16,
  },
  gradesSectionHeader: {
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
  addGradeButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  addGradeButtonText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '500',
  },
  gradesList: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  gradeItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  gradeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  gradeSubject: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.darkGray,
  },
  gradeScore: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  gradeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  gradeType: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  gradeTypeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '500',
  },
  gradeDate: {
    fontSize: 12,
    color: COLORS.gray,
  },
  noGradesContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  noGradesText: {
    fontSize: 16,
    color: COLORS.gray,
    marginTop: 12,
    marginBottom: 16,
  },
  firstGradeButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  firstGradeButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    width: '90%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.darkGray,
  },
  modalContent: {
    padding: 20,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.darkGray,
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: COLORS.darkGray,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 12,
  },
  cancelButtonText: {
    fontSize: 16,
    color: COLORS.gray,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  saveButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default StudentDetailScreen;