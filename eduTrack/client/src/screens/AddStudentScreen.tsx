import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useStudent } from '../contexts/StudentContext';
import { COLORS, BEHAVIOR_COLORS } from '../utils/constants';
import Header from '../components/Header';
import Loading from '../components/Loading';

interface Props {
  navigation: any;
}

const AddStudentScreen: React.FC<Props> = ({ navigation }) => {
  const { state, createStudent } = useStudent();
  const [formData, setFormData] = useState({
    name: '',
    studentId: '',
    class: '',
    parentEmail: '',
    attendance: '100',
    behavior: 'good' as 'excellent' | 'good' | 'average' | 'poor',
    notes: '',
  });

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.name || !formData.studentId || !formData.class || !formData.parentEmail) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (!formData.parentEmail.includes('@')) {
      Alert.alert('Error', 'Please enter a valid parent email address');
      return;
    }

    const attendance = parseInt(formData.attendance);
    if (isNaN(attendance) || attendance < 0 || attendance > 100) {
      Alert.alert('Error', 'Attendance must be a number between 0 and 100');
      return;
    }

    try {
      await createStudent({
        name: formData.name.trim(),
        studentId: formData.studentId.trim().toUpperCase(),
        class: formData.class.trim(),
        parentEmail: formData.parentEmail.toLowerCase().trim(),
      });

      Alert.alert('Success', 'Student created successfully', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="Add Student"
        showBack
        onBackPress={() => navigation.goBack()}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardContainer}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Student Name *</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="person-outline" size={20} color={COLORS.gray} />
                <TextInput
                  style={styles.textInput}
                  value={formData.name}
                  onChangeText={(value) => updateField('name', value)}
                  placeholder="Enter student full name"
                  autoCapitalize="words"
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Student ID *</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="card-outline" size={20} color={COLORS.gray} />
                <TextInput
                  style={styles.textInput}
                  value={formData.studentId}
                  onChangeText={(value) => updateField('studentId', value)}
                  placeholder="e.g., SV001, STU2024001"
                  autoCapitalize="characters"
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Class *</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="school-outline" size={20} color={COLORS.gray} />
                <TextInput
                  style={styles.textInput}
                  value={formData.class}
                  onChangeText={(value) => updateField('class', value)}
                  placeholder="e.g., 10A1, Grade 5B"
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Parent Email *</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="mail-outline" size={20} color={COLORS.gray} />
                <TextInput
                  style={styles.textInput}
                  value={formData.parentEmail}
                  onChangeText={(value) => updateField('parentEmail', value)}
                  placeholder="parent@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Initial Attendance (%)</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="calendar-outline" size={20} color={COLORS.gray} />
                <TextInput
                  style={styles.textInput}
                  value={formData.attendance}
                  onChangeText={(value) => updateField('attendance', value)}
                  placeholder="100"
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Initial Behavior</Text>
              <View style={styles.pickerContainer}>
                <Ionicons name="happy-outline" size={20} color={COLORS.gray} />
                <View style={styles.pickerWrapper}>
                  <Picker
                    selectedValue={formData.behavior}
                    onValueChange={(value) => updateField('behavior', value)}
                    style={styles.picker}
                    itemStyle={{ height: 50, fontSize: 18 }}
                  >
                    <Picker.Item label="Excellent" value="excellent" />
                    <Picker.Item label="Good" value="good" />
                    <Picker.Item label="Average" value="average" />
                    <Picker.Item label="Poor" value="poor" />
                  </Picker>
                </View>
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Notes (Optional)</Text>
              <View style={styles.textAreaWrapper}>
                <TextInput
                  style={styles.textArea}
                  value={formData.notes}
                  onChangeText={(value) => updateField('notes', value)}
                  placeholder="Additional notes about the student..."
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>
            </View>

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
              disabled={state.isLoading}
            >
              {state.isLoading ? (
                <Loading text="Creating..." />
              ) : (
                <Text style={styles.submitButtonText}>Add Student</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
  },
  form: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.darkGray,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  textInput: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: COLORS.darkGray,
    marginLeft: 12,
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  pickerWrapper: {
    flex: 1,
    height: 50,
    justifyContent: 'center',
    marginLeft: 12,
  },
  picker: {
    flex: 1,
    height: 50,
    color: COLORS.darkGray,
  },
  textAreaWrapper: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  textArea: {
    fontSize: 16,
    color: COLORS.darkGray,
    minHeight: 100,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AddStudentScreen;