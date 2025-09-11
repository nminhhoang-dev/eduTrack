import React, { useState, useEffect } from 'react';
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
import { useAuth } from '../contexts/AuthContext';
import { Student } from '../utils/types';
import { COLORS } from '../utils/constants';
import Header from '../components/Header';
import Loading from '../components/Loading';
import apiService from '../services/api';
import NotificationService from '../services/NotificationService';

interface Props {
  navigation: any;
}

const ComposeNotificationScreen: React.FC<Props> = ({ navigation }) => {
  const { state: authState } = useAuth();
  const { state: studentState, loadStudents } = useStudent();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'general' as 'grade_update' | 'attendance' | 'general',
    recipientType: 'all' as 'all' | 'specific' | 'class',
    recipientEmail: '',
    className: '',
    studentId: '',
  });

  const [classes, setClasses] = useState<string[]>([]);
  const [parentEmails, setParentEmails] = useState<string[]>([]);

  useEffect(() => {
    loadStudents({ limit: 100 });
  }, []);

  useEffect(() => {
    if (studentState.students.length > 0) {
      // Extract unique classes
      const uniqueClasses = [...new Set(studentState.students.map(s => s.class))];
      setClasses(uniqueClasses);

      // Extract unique parent emails
      const uniqueEmails = [...new Set(studentState.students.map(s => s.parentEmail))];
      setParentEmails(uniqueEmails);
    }
  }, [studentState.students]);

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getRecipientEmails = (): string[] => {
    switch (formData.recipientType) {
      case 'all':
        return [...new Set(studentState.students.map(s => s.parentEmail))];
      
      case 'specific':
        return [formData.recipientEmail];
      
      case 'class':
        return [...new Set(
          studentState.students
            .filter(s => s.class === formData.className)
            .map(s => s.parentEmail)
        )];
      
      default:
        return [];
    }
  };

  const handleSend = async () => {
    // Validation
    if (!formData.title.trim() || !formData.message.trim()) {
      Alert.alert('Error', 'Please fill in title and message');
      return;
    }

    if (formData.recipientType === 'specific' && !formData.recipientEmail) {
      Alert.alert('Error', 'Please select a recipient email');
      return;
    }

    if (formData.recipientType === 'class' && !formData.className) {
      Alert.alert('Error', 'Please select a class');
      return;
    }

    try {
      setIsLoading(true);
      const recipientEmails = getRecipientEmails();
      
      if (recipientEmails.length === 0) {
        Alert.alert('Error', 'No recipients found for your selection');
        return;
      }

      // Send notification to each recipient
      const promises = recipientEmails.map(email => 
        apiService.createNotification({
          title: formData.title.trim(),
          message: formData.message.trim(),
          type: formData.type,
          recipientEmail: email,
        })
      );

      await Promise.all(promises);

      // Show local notification for testing
      await NotificationService.showLocalNotification(
        'Notification Sent!',
        `Your message has been sent to ${recipientEmails.length} parent(s)`,
        { type: 'notification_sent' }
      );

      Alert.alert(
        'Success!', 
        `Notification sent to ${recipientEmails.length} parent(s)`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );

    } catch (error: any) {
      console.error('Send notification error:', error);
      Alert.alert('Error', error.message || 'Failed to send notification');
    } finally {
      setIsLoading(false);
    }
  };

  const getRecipientCount = () => {
    return getRecipientEmails().length;
  };

  return (
    <View style={styles.container}>
      <Header
        title="Send Notification"
        showBack
        onBackPress={() => navigation.goBack()}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardContainer}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.form}>
            
            {/* Title */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Title *</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="text-outline" size={20} color={COLORS.gray} />
                <TextInput
                  style={styles.textInput}
                  value={formData.title}
                  onChangeText={(value) => updateField('title', value)}
                  placeholder="Notification title..."
                  maxLength={100}
                />
              </View>
            </View>

            {/* Message */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Message *</Text>
              <View style={styles.textAreaWrapper}>
                <TextInput
                  style={styles.textArea}
                  value={formData.message}
                  onChangeText={(value) => updateField('message', value)}
                  placeholder="Type your message here..."
                  multiline
                  numberOfLines={6}
                  textAlignVertical="top"
                  maxLength={500}
                />
              </View>
              <Text style={styles.characterCount}>
                {formData.message.length}/500 characters
              </Text>
            </View>

            {/* Type */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Type</Text>
              <View style={styles.pickerContainer}>
                <Ionicons name="flag-outline" size={20} color={COLORS.gray} />
                <View style={styles.pickerWrapper}>
                  <Picker
                    selectedValue={formData.type}
                    onValueChange={(value) => updateField('type', value)}
                    style={styles.picker}
                  >
                    <Picker.Item label="General" value="general" />
                    <Picker.Item label="Grade Update" value="grade_update" />
                    <Picker.Item label="Attendance" value="attendance" />
                  </Picker>
                </View>
              </View>
            </View>

            {/* Recipient Type */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Send To</Text>
              <View style={styles.pickerContainer}>
                <Ionicons name="people-outline" size={20} color={COLORS.gray} />
                <View style={styles.pickerWrapper}>
                  <Picker
                    selectedValue={formData.recipientType}
                    onValueChange={(value) => updateField('recipientType', value)}
                    style={styles.picker}
                  >
                    <Picker.Item label="All Parents" value="all" />
                    <Picker.Item label="Specific Parent" value="specific" />
                    <Picker.Item label="Class Parents" value="class" />
                  </Picker>
                </View>
              </View>
            </View>

            {/* Specific Email Selection */}
            {formData.recipientType === 'specific' && (
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Parent Email</Text>
                <View style={styles.pickerContainer}>
                  <Ionicons name="mail-outline" size={20} color={COLORS.gray} />
                  <View style={styles.pickerWrapper}>
                    <Picker
                      selectedValue={formData.recipientEmail}
                      onValueChange={(value) => updateField('recipientEmail', value)}
                      style={styles.picker}
                    >
                      <Picker.Item label="Select parent..." value="" />
                      {parentEmails.map(email => (
                        <Picker.Item key={email} label={email} value={email} />
                      ))}
                    </Picker>
                  </View>
                </View>
              </View>
            )}

            {/* Class Selection */}
            {formData.recipientType === 'class' && (
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Class</Text>
                <View style={styles.pickerContainer}>
                  <Ionicons name="school-outline" size={20} color={COLORS.gray} />
                  <View style={styles.pickerWrapper}>
                    <Picker
                      selectedValue={formData.className}
                      onValueChange={(value) => updateField('className', value)}
                      style={styles.picker}
                    >
                      <Picker.Item label="Select class..." value="" />
                      {classes.map(className => (
                        <Picker.Item key={className} label={className} value={className} />
                      ))}
                    </Picker>
                  </View>
                </View>
              </View>
            )}

            {/* Recipient Count */}
            <View style={styles.recipientInfo}>
              <Ionicons name="information-circle" size={20} color={COLORS.primary} />
              <Text style={styles.recipientText}>
                This notification will be sent to {getRecipientCount()} parent(s)
              </Text>
            </View>

            {/* Send Button */}
            <TouchableOpacity
              style={styles.sendButton}
              onPress={handleSend}
              disabled={isLoading || getRecipientCount() === 0}
            >
              {isLoading ? (
                <Loading text="Sending..." />
              ) : (
                <>
                  <Ionicons name="send" size={20} color={COLORS.white} />
                  <Text style={styles.sendButtonText}>Send Notification</Text>
                </>
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
    minHeight: 120,
  },
  characterCount: {
    fontSize: 12,
    color: COLORS.gray,
    textAlign: 'right',
    marginTop: 4,
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
  recipientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  recipientText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: COLORS.darkGray,
    fontWeight: '500',
  },
  sendButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    height: 56,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  sendButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default ComposeNotificationScreen;