import React, { createContext, useContext, useReducer } from 'react';
import { Student, StudentsResponse } from '../utils/types';
import apiService from '../services/api';

interface StudentState {
  students: Student[];
  currentStudent: Student | null;
  isLoading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    total: number;
  };
}

type StudentAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_STUDENTS'; payload: StudentsResponse }
  | { type: 'SET_CURRENT_STUDENT'; payload: Student }
  | { type: 'ADD_STUDENT'; payload: Student }
  | { type: 'UPDATE_STUDENT'; payload: Student }
  | { type: 'DELETE_STUDENT'; payload: string }
  | { type: 'CLEAR_CURRENT_STUDENT' };

interface StudentContextType {
  state: StudentState;
  loadStudents: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    class?: string;
  }) => Promise<void>;
  loadStudent: (id: string) => Promise<void>;
  createStudent: (studentData: {
    name: string;
    studentId: string;
    class: string;
    parentEmail: string;
  }) => Promise<void>;
  updateStudent: (id: string, studentData: any) => Promise<void>;
  deleteStudent: (id: string) => Promise<void>;
  addGrade: (studentId: string, gradeData: {
    subject: string;
    score: number;
    type: string;
  }) => Promise<void>;
  clearCurrentStudent: () => void;
}

const initialState: StudentState = {
  students: [],
  currentStudent: null,
  isLoading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    total: 0,
  },
};

function studentReducer(state: StudentState, action: StudentAction): StudentState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload, error: null };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'SET_STUDENTS':
      return {
        ...state,
        students: action.payload.students,
        pagination: {
          currentPage: action.payload.currentPage,
          totalPages: action.payload.totalPages,
          total: action.payload.total,
        },
        isLoading: false,
        error: null,
      };
    case 'SET_CURRENT_STUDENT':
      return {
        ...state,
        currentStudent: action.payload,
        isLoading: false,
        error: null,
      };
    case 'ADD_STUDENT':
      return {
        ...state,
        students: [action.payload, ...state.students],
        isLoading: false,
        error: null,
      };
    case 'UPDATE_STUDENT':
      return {
        ...state,
        students: state.students.map(student =>
          student._id === action.payload._id ? action.payload : student
        ),
        currentStudent: state.currentStudent?._id === action.payload._id 
          ? action.payload 
          : state.currentStudent,
        isLoading: false,
        error: null,
      };
    case 'DELETE_STUDENT':
      return {
        ...state,
        students: state.students.filter(student => student._id !== action.payload),
        currentStudent: state.currentStudent?._id === action.payload 
          ? null 
          : state.currentStudent,
        isLoading: false,
        error: null,
      };
    case 'CLEAR_CURRENT_STUDENT':
      return { ...state, currentStudent: null };
    default:
      return state;
  }
}

const StudentContext = createContext<StudentContextType | undefined>(undefined);

export function StudentProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(studentReducer, initialState);

  const loadStudents = async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    class?: string;
  }) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await apiService.getStudents(params);
      dispatch({ type: 'SET_STUDENTS', payload: response });
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message || 'Failed to load students' });
    }
  };

  const loadStudent = async (id: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const student = await apiService.getStudent(id);
      dispatch({ type: 'SET_CURRENT_STUDENT', payload: student });
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message || 'Failed to load student' });
    }
  };

  const createStudent = async (studentData: {
    name: string;
    studentId: string;
    class: string;
    parentEmail: string;
  }) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await apiService.createStudent(studentData);
      dispatch({ type: 'ADD_STUDENT', payload: response.student });
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message || 'Failed to create student' });
      throw error;
    }
  };

  const updateStudent = async (id: string, studentData: any) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await apiService.updateStudent(id, studentData);
      dispatch({ type: 'UPDATE_STUDENT', payload: response.student });
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message || 'Failed to update student' });
      throw error;
    }
  };

  const deleteStudent = async (id: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      await apiService.deleteStudent(id);
      dispatch({ type: 'DELETE_STUDENT', payload: id });
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message || 'Failed to delete student' });
      throw error;
    }
  };

  const addGrade = async (studentId: string, gradeData: {
    subject: string;
    score: number;
    type: string;
  }) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await apiService.addGrade(studentId, gradeData);
      dispatch({ type: 'UPDATE_STUDENT', payload: response.student });
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message || 'Failed to add grade' });
      throw error;
    }
  };

  const clearCurrentStudent = () => {
    dispatch({ type: 'CLEAR_CURRENT_STUDENT' });
  };

  const value = {
    state,
    loadStudents,
    loadStudent,
    createStudent,
    updateStudent,
    deleteStudent,
    addGrade,
    clearCurrentStudent,
  };

  return (
    <StudentContext.Provider value={value}>
      {children}
    </StudentContext.Provider>
  );
}

export function useStudent() {
  const context = useContext(StudentContext);
  if (context === undefined) {
    throw new Error('useStudent must be used within a StudentProvider');
  }
  return context;
}