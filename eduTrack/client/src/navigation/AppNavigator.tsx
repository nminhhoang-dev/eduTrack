import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '../contexts/AuthContext';
import { RootStackParamList } from '../utils/types';
import { COLORS } from '../utils/constants';
import Loading from '../components/Loading';
import NotificationBadge from '../components/NotificationBadge';

// Screens
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import DashboardScreen from '../screens/DashboardScreen';
import StudentListScreen from '../screens/StudentListScreen';
import StudentDetailScreen from '../screens/StudentDetailScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import TeacherNotificationsScreen from '../screens/TeacherNotificationsScreen';
import ParentStudentsScreen from '../screens/ParentStudentsScreen';
import AddStudentScreen from '../screens/AddStudentScreen';
import EditStudentScreen from '../screens/EditStudentScreen';
import ComposeNotificationScreen from '../screens/ComposeNotificationScreen';

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

// Auth Stack
const AuthStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
};

// Main Tab Navigator
const MainTabs = () => {
  const { state } = useAuth();
  const isTeacher = state.user?.role === 'teacher';
  const isParent = state.user?.role === 'parent';

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Students') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Notifications') {
            return <NotificationBadge color={color} size={size} />;
          } else if (route.name === 'TeacherNotification') {
            iconName = focused ? 'notifications' : 'notifications-outline';
          } else {
            iconName = 'ellipse-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.gray,
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopColor: COLORS.lightGray,
          paddingBottom: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ tabBarLabel: 'Dashboard' }}
      />

      {isTeacher && (
        <Tab.Screen
          name="Students"
          component={StudentListScreen}
          options={{ tabBarLabel: 'Students' }}
        />
      )}

      {isTeacher && (
        <Tab.Screen
          name="TeacherNotification"
          component={TeacherNotificationsScreen}
          options={{ tabBarLabel: 'Sent Notifications' }}
        />
      )}

      {isParent && (
        <Tab.Screen
          name="Notifications"
          component={NotificationsScreen}
          options={{ tabBarLabel: 'Notifications' }}
        />
      )}
    </Tab.Navigator>
  );
};

// Main App Stack
const AppStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen
        name="StudentDetail"
        component={StudentDetailScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AddStudent"
        component={AddStudentScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="EditStudent"
        component={EditStudentScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ParentStudents"
        component={ParentStudentsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ComposeNotification"
        component={ComposeNotificationScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="TeacherNotification"
        component={TeacherNotificationsScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

// Root Navigator
const AppNavigator = () => {
  const { state } = useAuth();

  if (state.isLoading) {
    return <Loading fullScreen text="Loading app..." />;
  }

  return state.isAuthenticated ? <AppStack /> : <AuthStack />;
};

export default AppNavigator;