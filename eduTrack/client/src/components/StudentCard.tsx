import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Student } from '../utils/types';
import { COLORS, BEHAVIOR_COLORS } from '../utils/constants';

interface StudentCardProps {
  student: Student;
  onPress: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  showActions?: boolean;
}

const StudentCard: React.FC<StudentCardProps> = ({ 
  student, 
  onPress, 
  onEdit, 
  onDelete,
  showActions = false 
}) => {
  // Calculate average grade
  const averageGrade = student.grades.length > 0 
    ? student.grades.reduce((sum, grade) => sum + grade.score, 0) / student.grades.length
    : 0;

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.header}>
        <View style={styles.studentInfo}>
          <Text style={styles.name}>{student.name}</Text>
          <Text style={styles.studentId}>ID: {student.studentId}</Text>
          <Text style={styles.class}>Class: {student.class}</Text>
        </View>
        
        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Avg Grade</Text>
            <Text style={[styles.statValue, { color: averageGrade >= 8 ? COLORS.success : averageGrade >= 6.5 ? COLORS.warning : COLORS.danger }]}>
              {averageGrade.toFixed(1)}
            </Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Attendance</Text>
            <Text style={styles.statValue}>{student.attendance}%</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.footer}>
        <View style={[styles.behaviorBadge, { backgroundColor: BEHAVIOR_COLORS[student.behavior] }]}>
          <Text style={styles.behaviorText}>
            {student.behavior.charAt(0).toUpperCase() + student.behavior.slice(1)}
          </Text>
        </View>
        
        {showActions && (
          <View style={styles.actions}>
            {onEdit && (
              <TouchableOpacity onPress={onEdit} style={styles.actionButton}>
                <Ionicons name="pencil" size={16} color={COLORS.primary} />
              </TouchableOpacity>
            )}
            {onDelete && (
              <TouchableOpacity onPress={onDelete} style={styles.actionButton}>
                <Ionicons name="trash" size={16} color={COLORS.danger} />
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginVertical: 6,
    marginHorizontal: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  studentInfo: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.darkGray,
    marginBottom: 4,
  },
  studentId: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 2,
  },
  class: {
    fontSize: 14,
    color: COLORS.gray,
  },
  stats: {
    alignItems: 'flex-end',
  },
  statItem: {
    alignItems: 'center',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.gray,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.darkGray,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  actions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
});

export default StudentCard;