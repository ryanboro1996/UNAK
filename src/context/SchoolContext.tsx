import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Teacher, 
  Student, 
  FeeTransaction, 
  TeacherSalarySlip, 
  TeacherAttendanceRecord, 
  ChatMessage, 
  AuditLog, 
  SchoolNotification, 
  SchoolSettings,
  UserProfile,
  UserRole,
  SchoolDatabaseState,
  AcademicCalendarEvent
} from '../types';
import { 
  initialSettings, 
  defaultUsers, 
  initialTeachers, 
  initialTeacherAttendance, 
  initialTeacherSalaries, 
  initialStudents, 
  initialFeeTransactions, 
  initialChatMessages, 
  initialNotifications, 
  initialAuditLogs,
  initialCalendarEvents
} from '../data/initialData';

interface PrintDocumentState {
  type: 'fee_receipt' | 'salary_slip' | 'report_card' | 'batch_marksheet';
  data: any;
}

interface SchoolContextType {
  // User & Roles
  currentUser: UserProfile;
  availableUsers: UserProfile[];
  switchUser: (userId: string) => void;
  switchRole: (role: UserRole) => void;
  isPrincipal: boolean;
  isTeacher: boolean;
  isAccountant: boolean;
  isParent: boolean;

  // Settings
  settings: SchoolSettings;
  updateSettings: (updates: Partial<SchoolSettings>) => void;

  // Teachers
  teachers: Teacher[];
  addTeacher: (teacher: Omit<Teacher, 'id' | 'attendanceRate'>) => void;
  updateTeacher: (id: string, updates: Partial<Teacher>) => void;
  deleteTeacher: (id: string) => void;
  teacherAttendance: TeacherAttendanceRecord[];
  markTeacherAttendance: (teacherId: string, status: TeacherAttendanceRecord['status'], remarks?: string) => void;
  teacherSalaries: TeacherSalarySlip[];
  createSalarySlip: (slip: Omit<TeacherSalarySlip, 'id' | 'slipNo'>) => void;
  updateSalaryStatus: (id: string, status: TeacherSalarySlip['status']) => void;

  // Students
  students: Student[];
  addStudent: (student: Omit<Student, 'id' | 'academicReports'>) => Student;
  updateStudent: (id: string, updates: Partial<Student>) => void;
  deleteStudent: (id: string) => void;
  recordStudentAttendance: (grade: string, section: string, attendanceMap: Record<string, boolean>) => void;
  addStudentReport: (studentId: string, report: Student['academicReports'][0]) => void;
  batchUpdateStudentMarks: (
    grade: string, 
    reports: { rollNo: number; name?: string; admissionNo?: string; report: Student['academicReports'][0] }[]
  ) => void;

  // Academic Calendar & Principal Events
  calendarEvents: AcademicCalendarEvent[];
  addCalendarEvent: (event: Omit<AcademicCalendarEvent, 'id' | 'createdAt'>) => AcademicCalendarEvent;
  updateCalendarEvent: (id: string, updates: Partial<AcademicCalendarEvent>) => void;
  deleteCalendarEvent: (id: string) => void;
  sendEventReminder: (eventId: string) => void;

  // Fees
  feeTransactions: FeeTransaction[];
  collectFee: (fee: Omit<FeeTransaction, 'id' | 'receiptNo'>) => FeeTransaction;
  updateFeeStatus: (id: string, status: FeeTransaction['status']) => void;
  sendFeeReminder: (studentId: string) => void;

  // Chat
  chatMessages: ChatMessage[];
  sendMessage: (channelId: string, text: string, isBroadcast?: boolean, isUrgent?: boolean) => void;
  addReaction: (messageId: string, emoji: string) => void;

  // Notifications
  notifications: SchoolNotification[];
  unreadNotificationCount: number;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  addNotification: (title: string, message: string, type: SchoolNotification['type'], priority?: SchoolNotification['priority']) => void;

  // Backup & Cloud Sync
  isOnline: boolean;
  isSyncing: boolean;
  toggleOnlineMode: () => void;
  syncWithCloud: () => Promise<void>;
  exportDatabaseJSON: () => string;
  restoreDatabaseJSON: (jsonString: string) => { success: boolean; message: string };
  resetDatabaseToDefaults: () => void;

  // Security & MFA
  mfaEnabled: boolean;
  mfaVerified: boolean;
  toggleMFA: (enabled: boolean) => void;
  verifyMFA: (code: string) => boolean;
  auditLogs: AuditLog[];
  addAuditLog: (action: string, category: AuditLog['category'], details: string) => void;

  // UI, Theme & Accessibility
  darkMode: boolean;
  toggleDarkMode: () => void;
  highContrast: boolean;
  toggleHighContrast: () => void;
  fontSize: 'normal' | 'large' | 'xlarge';
  setFontSize: (size: 'normal' | 'large' | 'xlarge') => void;
  language: 'en' | 'hi';
  toggleLanguage: () => void;
  t: (en: string, hi: string) => string;

  // Print Modal
  activePrintDoc: PrintDocumentState | null;
  openPrintDoc: (type: PrintDocumentState['type'], data: any) => void;
  closePrintDoc: () => void;
}

const STORAGE_KEY = 'vidya_erp_school_data_v2';
const THEME_KEY = 'vidya_erp_theme';

const SchoolContext = createContext<SchoolContextType | undefined>(undefined);

export const SchoolProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Theme & Accessibility States
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem(THEME_KEY);
    return saved ? saved === 'dark' : false;
  });
  const [highContrast, setHighContrast] = useState<boolean>(false);
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal');
  const [language, setLanguage] = useState<'en' | 'hi'>('en');

  // Sync dark mode with HTML class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem(THEME_KEY, 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem(THEME_KEY, 'light');
    }
  }, [darkMode]);

  // Online / Offline & Cloud Sync State
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Security & MFA
  const [mfaEnabled, setMfaEnabled] = useState<boolean>(true);
  const [mfaVerified, setMfaVerified] = useState<boolean>(true);

  // Active User State
  const [availableUsers] = useState<UserProfile[]>(defaultUsers);
  const [currentUser, setCurrentUser] = useState<UserProfile>(defaultUsers[0]);

  // School Data State
  const [settings, setSettings] = useState<SchoolSettings>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_settings`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.schoolName && !parsed.schoolName.includes('Delhi')) {
          return parsed;
        }
      } catch (e) {}
    }
    return initialSettings;
  });

  const [teachers, setTeachers] = useState<Teacher[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_teachers`);
    return saved ? JSON.parse(saved) : initialTeachers;
  });

  const [teacherAttendance, setTeacherAttendance] = useState<TeacherAttendanceRecord[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_t_attendance`);
    return saved ? JSON.parse(saved) : initialTeacherAttendance;
  });

  const [teacherSalaries, setTeacherSalaries] = useState<TeacherSalarySlip[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_salaries`);
    return saved ? JSON.parse(saved) : initialTeacherSalaries;
  });

  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_students`);
    return saved ? JSON.parse(saved) : initialStudents;
  });

  const [feeTransactions, setFeeTransactions] = useState<FeeTransaction[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_fees`);
    return saved ? JSON.parse(saved) : initialFeeTransactions;
  });

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_chat`);
    return saved ? JSON.parse(saved) : initialChatMessages;
  });

  const [notifications, setNotifications] = useState<SchoolNotification[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_notifs`);
    return saved ? JSON.parse(saved) : initialNotifications;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_audit`);
    return saved ? JSON.parse(saved) : initialAuditLogs;
  });

  const [calendarEvents, setCalendarEvents] = useState<AcademicCalendarEvent[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_calendar_events`);
    return saved ? JSON.parse(saved) : initialCalendarEvents;
  });

  // Print modal state
  const [activePrintDoc, setActivePrintDoc] = useState<PrintDocumentState | null>(null);

  // Persistence effects
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_settings`, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_calendar_events`, JSON.stringify(calendarEvents));
  }, [calendarEvents]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_teachers`, JSON.stringify(teachers));
  }, [teachers]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_t_attendance`, JSON.stringify(teacherAttendance));
  }, [teacherAttendance]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_salaries`, JSON.stringify(teacherSalaries));
  }, [teacherSalaries]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_students`, JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_fees`, JSON.stringify(feeTransactions));
  }, [feeTransactions]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_chat`, JSON.stringify(chatMessages));
  }, [chatMessages]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_notifs`, JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_audit`, JSON.stringify(auditLogs));
  }, [auditLogs]);

  // Helper for bilingual translation
  const t = (en: string, hi: string) => (language === 'hi' ? hi : en);

  const toggleLanguage = () => {
    setLanguage(prev => (prev === 'en' ? 'hi' : 'en'));
  };

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  const toggleHighContrast = () => {
    setHighContrast(prev => !prev);
  };

  const toggleOnlineMode = () => {
    setIsOnline(prev => !prev);
    addAuditLog(`Simulated network changed to ${!isOnline ? 'Online' : 'Offline'}`, 'backup', 'User toggled network connectivity state');
  };

  const syncWithCloud = async () => {
    setIsSyncing(true);
    await new Promise(r => setTimeout(r, 1200));
    setIsSyncing(false);
    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
    setSettings(prev => ({ ...prev, lastBackupDate: now }));
    addNotification('Cloud Synchronized', 'All school databases, fee ledgers, and attendance records synced with cloud backup node.', 'general', 'low');
    addAuditLog('Cloud Database Sync', 'backup', 'Encrypted cloud snapshot generated and validated');
  };

  // User switching
  const switchUser = (userId: string) => {
    const user = availableUsers.find(u => u.id === userId);
    if (user) {
      setCurrentUser(user);
      if (user.mfaEnabled) {
        setMfaVerified(true); // Pre-verified in session
      }
      addAuditLog(`Switched active profile to ${user.name} (${user.role})`, 'security', `Session resumed as ${user.title}`);
    }
  };

  const switchRole = (role: UserRole) => {
    const user = availableUsers.find(u => u.role === role);
    if (user) {
      switchUser(user.id);
    }
  };

  const isPrincipal = currentUser.role === 'principal';
  const isTeacher = currentUser.role === 'teacher';
  const isAccountant = currentUser.role === 'accountant';
  const isParent = currentUser.role === 'parent';

  // Audit Log helper
  const addAuditLog = (action: string, category: AuditLog['category'], details: string) => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      user: currentUser.name,
      role: currentUser.role,
      action,
      category,
      details,
      ipAddress: '192.168.1.' + (10 + Math.floor(Math.random() * 80))
    };
    setAuditLogs(prev => [newLog, ...prev.slice(0, 99)]);
  };

  // Notifications helper
  const addNotification = (
    title: string, 
    message: string, 
    type: SchoolNotification['type'], 
    priority: SchoolNotification['priority'] = 'medium'
  ) => {
    const newNotif: SchoolNotification = {
      id: `notif-${Date.now()}`,
      title,
      message,
      type,
      timestamp: 'Just now',
      read: false,
      priority
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const unreadNotificationCount = notifications.filter(n => !n.read).length;

  // Settings
  const updateSettings = (updates: Partial<SchoolSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
    addAuditLog('Updated School Settings', 'security', `Fields modified: ${Object.keys(updates).join(', ')}`);
  };

  // Teachers CRUD
  const addTeacher = (data: Omit<Teacher, 'id' | 'attendanceRate'>) => {
    const newTeacher: Teacher = {
      ...data,
      id: `tch-${Date.now()}`,
      attendanceRate: 100
    };
    setTeachers(prev => [newTeacher, ...prev]);
    addAuditLog(`Added Teacher ${newTeacher.name}`, 'teacher', `EmpID: ${newTeacher.empId}, Subject: ${newTeacher.subject}`);
    addNotification('New Faculty Member Enrolled', `${newTeacher.name} appointed as ${newTeacher.subject} faculty.`, 'general');
  };

  const updateTeacher = (id: string, updates: Partial<Teacher>) => {
    setTeachers(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    const target = teachers.find(t => t.id === id);
    addAuditLog(`Updated Teacher Record: ${target?.name || id}`, 'teacher', `Fields updated: ${Object.keys(updates).join(', ')}`);
  };

  const deleteTeacher = (id: string) => {
    const target = teachers.find(t => t.id === id);
    setTeachers(prev => prev.filter(t => t.id !== id));
    addAuditLog(`Removed Faculty Profile: ${target?.name || id}`, 'teacher', 'Faculty profile archived');
  };

  const markTeacherAttendance = (teacherId: string, status: TeacherAttendanceRecord['status'], remarks?: string) => {
    const teacher = teachers.find(t => t.id === teacherId);
    if (!teacher) return;

    const today = new Date().toISOString().slice(0, 10);
    const existingIndex = teacherAttendance.findIndex(r => r.teacherId === teacherId && r.date === today);
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    let updatedAttendance = [...teacherAttendance];
    if (existingIndex >= 0) {
      updatedAttendance[existingIndex] = {
        ...updatedAttendance[existingIndex],
        status,
        remarks: remarks || updatedAttendance[existingIndex].remarks,
        checkInTime: status === 'present' || status === 'late' ? nowTime : undefined
      };
    } else {
      updatedAttendance.unshift({
        id: `ta-${Date.now()}`,
        teacherId,
        teacherName: teacher.name,
        date: today,
        status,
        checkInTime: status === 'present' || status === 'late' ? nowTime : undefined,
        remarks
      });
    }
    setTeacherAttendance(updatedAttendance);

    // Recalculate quick attendance rate
    const teacherLogs = updatedAttendance.filter(r => r.teacherId === teacherId);
    const presentCount = teacherLogs.filter(r => r.status === 'present').length;
    const rate = Math.round((presentCount / Math.max(teacherLogs.length, 1)) * 1000) / 10;
    updateTeacher(teacherId, { attendanceRate: rate });

    addAuditLog(`Marked Attendance for ${teacher.name}`, 'attendance', `Status set to ${status}`);
  };

  const createSalarySlip = (slip: Omit<TeacherSalarySlip, 'id' | 'slipNo'>) => {
    const newSlip: TeacherSalarySlip = {
      ...slip,
      id: `sal-${Date.now()}`,
      slipNo: `PAY-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`
    };
    setTeacherSalaries(prev => [newSlip, ...prev]);
    addAuditLog(`Generated Salary Slip for ${newSlip.teacherName}`, 'payroll', `Amount: ₹${newSlip.netPayable.toLocaleString('en-IN')}`);
    addNotification('Salary Slip Generated', `Disbursement slip ${newSlip.slipNo} created for ${newSlip.teacherName}`, 'salary');
  };

  const updateSalaryStatus = (id: string, status: TeacherSalarySlip['status']) => {
    setTeacherSalaries(prev => prev.map(s => {
      if (s.id === id) {
        return {
          ...s,
          status,
          paymentDate: status === 'paid' ? new Date().toISOString().slice(0, 10) : s.paymentDate,
          transactionRef: status === 'paid' ? (s.transactionRef || `TXN-HDFC-${Math.floor(10000000 + Math.random() * 90000000)}`) : s.transactionRef
        };
      }
      return s;
    }));
    addAuditLog(`Salary Slip Status Changed: ${id}`, 'payroll', `Status updated to ${status}`);
  };

  // Students CRUD
  const addStudent = (data: Omit<Student, 'id' | 'academicReports'>): Student => {
    const newStudent: Student = {
      ...data,
      id: `stu-${Date.now()}`,
      academicReports: []
    };
    setStudents(prev => [newStudent, ...prev]);
    addAuditLog(`Enrolled New Student: ${newStudent.name}`, 'student', `Adm No: ${newStudent.admissionNo}, Class: ${newStudent.grade}-${newStudent.section}`);
    addNotification('New Student Enrolled', `${newStudent.name} admitted to ${newStudent.grade} - Section ${newStudent.section}`, 'general');
    return newStudent;
  };

  const updateStudent = (id: string, updates: Partial<Student>) => {
    setStudents(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    const target = students.find(s => s.id === id);
    addAuditLog(`Updated Student Record: ${target?.name || id}`, 'student', `Fields: ${Object.keys(updates).join(', ')}`);
  };

  const deleteStudent = (id: string) => {
    const target = students.find(s => s.id === id);
    setStudents(prev => prev.filter(s => s.id !== id));
    addAuditLog(`Archived Student Profile: ${target?.name || id}`, 'student', 'Student profile deactivated');
  };

  const recordStudentAttendance = (grade: string, section: string, attendanceMap: Record<string, boolean>) => {
    // Update student's attendance percentage
    setStudents(prev => prev.map(st => {
      if (st.grade === grade && st.section === section && attendanceMap[st.id] !== undefined) {
        const isPresent = attendanceMap[st.id];
        // small nudge in attendance
        const delta = isPresent ? 0.3 : -1.2;
        const newPercent = Math.min(100, Math.max(50, Math.round((st.attendancePercent + delta) * 10) / 10));
        return { ...st, attendancePercent: newPercent };
      }
      return st;
    }));
    addAuditLog(`Class Attendance Recorded: ${grade}-${section}`, 'attendance', `Marked attendance for class roster`);
    addNotification('Attendance Submitted', `Daily register submitted for ${grade} (${section})`, 'attendance', 'low');
  };

  const addStudentReport = (studentId: string, report: Student['academicReports'][0]) => {
    setStudents(prev => prev.map(st => {
      if (st.id === studentId) {
        return {
          ...st,
          academicReports: [report, ...st.academicReports.filter(r => r.term !== report.term)]
        };
      }
      return st;
    }));
    const target = students.find(s => s.id === studentId);
    addAuditLog(`Generated Report Card for ${target?.name || studentId}`, 'student', `Term: ${report.term}, Grade: ${report.overallGrade}`);
    addNotification('Report Card Released', `Academic progress card generated for ${target?.name}`, 'exam');
  };

  const batchUpdateStudentMarks = (
    grade: string, 
    reports: { rollNo: number; name?: string; admissionNo?: string; report: Student['academicReports'][0] }[]
  ) => {
    setStudents(prev => {
      let updated = [...prev];
      reports.forEach(item => {
        const idx = updated.findIndex(st => 
          (st.grade.toLowerCase() === grade.toLowerCase() && st.rollNo === item.rollNo) ||
          (item.admissionNo && st.admissionNo.toLowerCase() === item.admissionNo.toLowerCase()) ||
          (item.name && st.grade.toLowerCase() === grade.toLowerCase() && st.name.toLowerCase() === item.name.toLowerCase())
        );

        if (idx !== -1) {
          const current = updated[idx];
          const newReports = [
            item.report,
            ...current.academicReports.filter(r => r.term !== item.report.term)
          ];
          updated[idx] = {
            ...current,
            academicReports: newReports
          };
        } else {
          const newStudent: Student = {
            id: `stu-sheet-${Date.now()}-${item.rollNo}`,
            admissionNo: item.admissionNo || `UNA-${grade.replace(/\s+/g, '').toUpperCase()}-${String(item.rollNo).padStart(3, '0')}`,
            rollNo: item.rollNo,
            name: item.name || `Student ${item.rollNo}`,
            avatar: `https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80`,
            grade: grade,
            section: 'A',
            gender: item.rollNo % 2 === 0 ? 'Female' : 'Male',
            dob: '2019-05-15',
            bloodGroup: 'B+',
            parentName: `Parent of ${item.name || `Roll ${item.rollNo}`}`,
            parentPhone: `+91 98540 ${10000 + item.rollNo}`,
            parentEmail: `parent.roll${item.rollNo}@example.com`,
            address: 'Khagrabari, Chirang, Assam - 783380',
            enrollmentDate: '2026-04-01',
            status: 'active',
            attendancePercent: item.report.attendanceInTerm || 95,
            feeStatus: 'paid',
            totalFees: 18000,
            paidFees: 18000,
            pendingFees: 0,
            academicReports: [item.report]
          };
          updated.push(newStudent);
        }
      });
      return updated;
    });

    addAuditLog(`Batch Marksheet Upload: ${grade}`, 'student', `Uploaded marks for ${reports.length} students via Google Sheet`);
    addNotification('Marksheets Generated', `Exam marksheet successfully processed for ${reports.length} students of ${grade}`, 'exam', 'high');
  };

  // Academic Calendar & Events
  const addCalendarEvent = (data: Omit<AcademicCalendarEvent, 'id' | 'createdAt'>): AcademicCalendarEvent => {
    const newEvent: AcademicCalendarEvent = {
      ...data,
      id: `evt-${Date.now()}`,
      createdAt: new Date().toISOString().slice(0, 10),
      createdBy: data.createdBy || `${currentUser.name} (${currentUser.title})`
    };
    setCalendarEvents(prev => [...prev, newEvent]);
    addAuditLog(`Calendar Event Added: ${newEvent.title}`, 'security', `Type: ${newEvent.type}, Date: ${newEvent.startDate}`);
    addNotification(`New ${newEvent.type.toUpperCase()}: ${newEvent.title}`, `Date: ${newEvent.startDate}. Target: ${newEvent.targetAudience || 'All School'}`, 'exam', 'medium');
    return newEvent;
  };

  const updateCalendarEvent = (id: string, updates: Partial<AcademicCalendarEvent>) => {
    setCalendarEvents(prev => prev.map(ev => ev.id === id ? { ...ev, ...updates } : ev));
    addAuditLog(`Calendar Event Updated: ${id}`, 'security', `Updated fields in academic calendar`);
  };

  const deleteCalendarEvent = (id: string) => {
    const target = calendarEvents.find(e => e.id === id);
    setCalendarEvents(prev => prev.filter(ev => ev.id !== id));
    addAuditLog(`Calendar Event Deleted: ${target?.title || id}`, 'security', `Removed event from school calendar`);
    addNotification('Calendar Event Removed', `Event "${target?.title || id}" was deleted from the academic calendar.`, 'general');
  };

  const sendEventReminder = (eventId: string) => {
    const ev = calendarEvents.find(e => e.id === eventId);
    if (!ev) return;
    setCalendarEvents(prev => prev.map(e => e.id === eventId ? { ...e, reminderNoticeSent: true } : e));
    addNotification(`Reminder Alert: ${ev.title}`, `Scheduled for ${ev.startDate}. Target audience: ${ev.targetAudience || 'All Students & Staff'}. ${ev.description || ''}`, 'exam', 'high');
    addAuditLog(`Broadcast Reminder Sent: ${ev.title}`, 'security', `Alert sent to all portal users for date ${ev.startDate}`);
  };

  // Fees
  const collectFee = (feeData: Omit<FeeTransaction, 'id' | 'receiptNo'>): FeeTransaction => {
    const receiptNo = `REC-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newTx: FeeTransaction = {
      ...feeData,
      id: `fee-rec-${Date.now()}`,
      receiptNo
    };

    setFeeTransactions(prev => [newTx, ...prev]);

    // Update student's paidFees & feeStatus
    setStudents(prev => prev.map(st => {
      if (st.id === feeData.studentId) {
        const newPaid = st.paidFees + feeData.amount;
        const newPending = Math.max(0, st.totalFees - newPaid);
        let newStatus: Student['feeStatus'] = 'paid';
        if (newPending === 0) newStatus = 'paid';
        else if (newPaid > 0) newStatus = 'partial';
        else newStatus = 'due';

        return {
          ...st,
          paidFees: newPaid,
          pendingFees: newPending,
          feeStatus: newStatus
        };
      }
      return st;
    }));

    addAuditLog(`Collected Fee: ${receiptNo}`, 'fee', `Received ₹${feeData.amount.toLocaleString('en-IN')} for ${feeData.studentName} via ${feeData.paymentMethod}`);
    addNotification('Fee Collection Logged', `Receipt ${receiptNo} generated for ₹${feeData.amount.toLocaleString('en-IN')} (${feeData.studentName})`, 'fee');

    return newTx;
  };

  const updateFeeStatus = (id: string, status: FeeTransaction['status']) => {
    setFeeTransactions(prev => prev.map(f => f.id === id ? { ...f, status } : f));
  };

  const sendFeeReminder = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return;

    addNotification('Payment Reminder Dispatched', `SMS and Email fee alert sent to ${student.parentName} (${student.parentPhone}) for ₹${student.pendingFees.toLocaleString('en-IN')}`, 'fee', 'high');
    addAuditLog(`Fee Reminder Sent to Parent`, 'fee', `Notice for student ${student.name}, pending amount ₹${student.pendingFees}`);
  };

  // Chat
  const sendMessage = (channelId: string, text: string, isBroadcast = false, isUrgent = false) => {
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: currentUser.role,
      senderAvatar: currentUser.avatar,
      channelId,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isBroadcast,
      isUrgent
    };
    setChatMessages(prev => [...prev, newMsg]);

    if (isBroadcast || isUrgent) {
      addNotification(`School Broadcast: ${currentUser.name}`, text.slice(0, 80) + '...', 'general', 'high');
    }
  };

  const addReaction = (messageId: string, emoji: string) => {
    setChatMessages(prev => prev.map(msg => {
      if (msg.id === messageId) {
        const reactions = msg.reactions || [];
        const existing = reactions.find(r => r.emoji === emoji);
        if (existing) {
          if (existing.users.includes(currentUser.id)) {
            // Remove reaction
            const newUsers = existing.users.filter(u => u !== currentUser.id);
            return {
              ...msg,
              reactions: newUsers.length > 0
                ? reactions.map(r => r.emoji === emoji ? { ...r, count: newUsers.length, users: newUsers } : r)
                : reactions.filter(r => r.emoji !== emoji)
            };
          } else {
            // Add reaction
            return {
              ...msg,
              reactions: reactions.map(r => r.emoji === emoji ? { ...r, count: r.count + 1, users: [...r.users, currentUser.id] } : r)
            };
          }
        } else {
          return {
            ...msg,
            reactions: [...reactions, { emoji, count: 1, users: [currentUser.id] }]
          };
        }
      }
      return msg;
    }));
  };

  // Security & MFA
  const toggleMFA = (enabled: boolean) => {
    setMfaEnabled(enabled);
    addAuditLog(`Multi-Factor Authentication ${enabled ? 'Enabled' : 'Disabled'}`, 'security', `MFA policy modified by ${currentUser.name}`);
    addNotification('Security Policy Updated', `MFA two-step verification is now ${enabled ? 'active' : 'inactive'} on school accounts.`, 'security');
  };

  const verifyMFA = (code: string): boolean => {
    // 6 digit simulator (accepts any 6 digit number or default '123456' / '894201')
    if (code.length === 6 && /^\d+$/.test(code)) {
      setMfaVerified(true);
      addAuditLog('MFA Verification Successful', 'security', `User ${currentUser.name} verified TOTP token`);
      return true;
    }
    return false;
  };

  // Backup & Restore
  const exportDatabaseJSON = (): string => {
    const state: SchoolDatabaseState = {
      version: '2.0.0',
      exportDate: new Date().toISOString(),
      settings,
      teachers,
      teacherAttendance,
      teacherSalaries,
      students,
      feeTransactions,
      chatMessages,
      auditLogs,
      calendarEvents
    };
    addAuditLog('Database Backup Downloaded', 'backup', `Exported full school snapshot (v${state.version})`);
    return JSON.stringify(state, null, 2);
  };

  const restoreDatabaseJSON = (jsonString: string): { success: boolean; message: string } => {
    try {
      const data: Partial<SchoolDatabaseState> = JSON.parse(jsonString);
      if (!data.version || !data.teachers || !data.students) {
        return { success: false, message: 'Invalid backup format. Missing core school data entities.' };
      }
      if (data.settings) setSettings(data.settings);
      if (data.teachers) setTeachers(data.teachers);
      if (data.teacherAttendance) setTeacherAttendance(data.teacherAttendance);
      if (data.teacherSalaries) setTeacherSalaries(data.teacherSalaries);
      if (data.students) setStudents(data.students);
      if (data.feeTransactions) setFeeTransactions(data.feeTransactions);
      if (data.chatMessages) setChatMessages(data.chatMessages);
      if (data.auditLogs) setAuditLogs(data.auditLogs);
      if (data.calendarEvents) setCalendarEvents(data.calendarEvents);

      addAuditLog('Database Restored from Backup', 'backup', `Successfully restored backup from ${data.exportDate || 'uploaded archive'}`);
      addNotification('Database Restored', 'School records have been successfully replaced with the uploaded backup archive.', 'general', 'high');
      return { success: true, message: `Backup restored successfully! Loaded ${data.teachers.length} teachers and ${data.students.length} students.` };
    } catch (err: any) {
      return { success: false, message: 'JSON syntax error: Could not parse uploaded backup file.' };
    }
  };

  const resetDatabaseToDefaults = () => {
    setSettings(initialSettings);
    setTeachers(initialTeachers);
    setTeacherAttendance(initialTeacherAttendance);
    setTeacherSalaries(initialTeacherSalaries);
    setStudents(initialStudents);
    setFeeTransactions(initialFeeTransactions);
    setChatMessages(initialChatMessages);
    setNotifications(initialNotifications);
    setAuditLogs(initialAuditLogs);
    setCalendarEvents(initialCalendarEvents);
    localStorage.clear();
    addAuditLog('Database Reset to Defaults', 'backup', 'All tables reset to factory seed data');
  };

  // Print Modals
  const openPrintDoc = (type: PrintDocumentState['type'], data: any) => {
    setActivePrintDoc({ type, data });
  };

  const closePrintDoc = () => {
    setActivePrintDoc(null);
  };

  return (
    <SchoolContext.Provider
      value={{
        currentUser,
        availableUsers,
        switchUser,
        switchRole,
        isPrincipal,
        isTeacher,
        isAccountant,
        isParent,

        settings,
        updateSettings,

        teachers,
        addTeacher,
        updateTeacher,
        deleteTeacher,
        teacherAttendance,
        markTeacherAttendance,
        teacherSalaries,
        createSalarySlip,
        updateSalaryStatus,

        students,
        addStudent,
        updateStudent,
        deleteStudent,
        recordStudentAttendance,
        addStudentReport,
        batchUpdateStudentMarks,

        calendarEvents,
        addCalendarEvent,
        updateCalendarEvent,
        deleteCalendarEvent,
        sendEventReminder,

        feeTransactions,
        collectFee,
        updateFeeStatus,
        sendFeeReminder,

        chatMessages,
        sendMessage,
        addReaction,

        notifications,
        unreadNotificationCount,
        markNotificationRead,
        markAllNotificationsRead,
        addNotification,

        isOnline,
        isSyncing,
        toggleOnlineMode,
        syncWithCloud,
        exportDatabaseJSON,
        restoreDatabaseJSON,
        resetDatabaseToDefaults,

        mfaEnabled,
        mfaVerified,
        toggleMFA,
        verifyMFA,
        auditLogs,
        addAuditLog,

        darkMode,
        toggleDarkMode,
        highContrast,
        toggleHighContrast,
        fontSize,
        setFontSize,
        language,
        toggleLanguage,
        t,

        activePrintDoc,
        openPrintDoc,
        closePrintDoc
      }}
    >
      <div className={`min-h-screen ${highContrast ? 'contrast-125' : ''} ${
        fontSize === 'large' ? 'text-lg' : fontSize === 'xlarge' ? 'text-xl' : 'text-base'
      }`}>
        {children}
      </div>
    </SchoolContext.Provider>
  );
};

export const useSchool = () => {
  const context = useContext(SchoolContext);
  if (!context) {
    throw new Error('useSchool must be used within a SchoolProvider');
  }
  return context;
};
