export const SCHOOL_CLASSES = [
  'Class Nursery',
  'Class KG',
  'Class I',
  'Class II',
  'Class III',
  'Class IV',
  'Class V',
  'Class VI',
  'Class VII',
  'Class VIII',
  'Class IX',
  'Class X'
] as const;

export type SchoolClass = typeof SCHOOL_CLASSES[number];

export type UserRole = 'principal' | 'teacher' | 'accountant' | 'parent';

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  phone: string;
  avatar: string;
  title: string;
  department?: string;
  assignedClass?: string;
  mfaEnabled: boolean;
}

export interface Teacher {
  id: string;
  empId: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  subject: string;
  department: string;
  qualification: string;
  joiningDate: string;
  experienceYears: number;
  classesAssigned: string[];
  status: 'active' | 'on_leave' | 'inactive';
  attendanceRate: number; // e.g. 96.5%
  salary: {
    basic: number;
    hra: number;
    allowances: number;
    pfDeduction: number;
    taxDeduction: number;
    netPay: number;
  };
  performanceScore: number; // 0 - 100
  studentRating: number; // 1.0 - 5.0
  syllabusProgress: number; // 0 - 100%
  recentNotes?: string;
}

export interface TeacherAttendanceRecord {
  id: string;
  teacherId: string;
  teacherName: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'half_day';
  checkInTime?: string;
  checkOutTime?: string;
  remarks?: string;
}

export interface TeacherSalarySlip {
  id: string;
  slipNo: string;
  teacherId: string;
  teacherName: string;
  empId: string;
  department: string;
  month: string;
  year: number;
  workingDays: number;
  presentDays: number;
  basicPay: number;
  hra: number;
  specialAllowance: number;
  grossEarnings: number;
  providentFund: number;
  professionalTax: number;
  totalDeductions: number;
  netPayable: number;
  status: 'paid' | 'pending' | 'processing';
  paymentDate?: string;
  paymentMode?: 'Bank Transfer' | 'Cheque' | 'UPI' | 'Direct Deposit';
  transactionRef?: string;
}

export interface SubjectMark {
  subject: string;
  marksObtained: number;
  maxMarks: number;
  grade: 'A+' | 'A' | 'B+' | 'B' | 'C' | 'D' | 'F';
  teacherRemarks?: string;
}

export interface StudentAcademicReport {
  term: string;
  examDate: string;
  subjects: SubjectMark[];
  totalObtained: number;
  totalMax: number;
  percentage: number;
  overallGrade: string;
  classRank: number;
  totalStudentsInClass: number;
  attendanceInTerm: number;
  generalConduct: 'Excellent' | 'Good' | 'Needs Improvement';
}

export interface StudentFeeBreakdown {
  admissionFee: number;
  tuitionFee: number;
  festiveFee: number;
  bookFee: number;
  uniformFee: number;
  examFee: number;
  otherFee: number;
}

export interface Student {
  id: string;
  admissionNo: string;
  rollNo: number;
  name: string;
  avatar: string;
  photo?: string;
  grade: string; // e.g. 'Class Nursery', 'Class KG', 'Class I' ... 'Class X'
  section: string; // e.g. 'A'
  gender: 'Male' | 'Female' | 'Other';
  dob: string;
  bloodGroup: string;
  parentName: string;
  fatherName?: string;
  motherName?: string;
  parentPhone: string;
  parentEmail: string;
  address: string;
  attendancePercent: number;
  feeStatus: 'paid' | 'partial' | 'due' | 'overdue';
  totalFees: number;
  paidFees: number;
  pendingFees: number;
  feeBreakdown?: StudentFeeBreakdown;
  academicReports: StudentAcademicReport[];
  status: 'active' | 'graduated' | 'transferred';
  enrollmentDate: string;
}

export interface FeeTransaction {
  id: string;
  receiptNo: string;
  studentId: string;
  studentName: string;
  grade: string;
  section: string;
  amount: number;
  feeType: 'Admission Fee' | 'Tuition Fee' | 'Festive Fee' | 'Book Fee' | 'Uniform Fee' | 'Exam Fee' | 'Computer Lab Fee' | 'Annual Development Fee' | 'Transport Fee' | 'Sports & Cultural Fee';
  feeBreakdown?: StudentFeeBreakdown;
  paymentDate: string;
  paymentMethod: 'UPI' | 'Cash' | 'Net Banking' | 'Debit/Credit Card' | 'Cheque';
  status: 'paid' | 'pending' | 'overdue' | 'failed';
  dueDate: string;
  discount: number;
  lateFine: number;
  collectedBy: string;
  notes?: string;
}

export interface DailyStudentAttendance {
  date: string;
  grade: string;
  section: string;
  markedBy: string;
  records: {
    studentId: string;
    studentName: string;
    rollNo: number;
    status: 'present' | 'absent' | 'leave';
  }[];
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  senderAvatar: string;
  channelId: string; // 'general', 'teachers', 'accounts', 'exam-cell'
  text: string;
  timestamp: string;
  isBroadcast?: boolean;
  isUrgent?: boolean;
  reactions?: { emoji: string; count: number; users: string[] }[];
}

export interface SchoolNotification {
  id: string;
  title: string;
  message: string;
  type: 'fee' | 'attendance' | 'exam' | 'salary' | 'security' | 'general';
  timestamp: string;
  read: boolean;
  priority: 'high' | 'medium' | 'low';
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  action: string;
  category: 'security' | 'fee' | 'attendance' | 'backup' | 'student' | 'teacher' | 'payroll';
  details: string;
  ipAddress: string;
}

export type CalendarEventType = 'holiday' | 'exam' | 'event' | 'reminder';

export interface AcademicCalendarEvent {
  id: string;
  title: string;
  titleHindi?: string;
  type: CalendarEventType;
  startDate: string; // 'YYYY-MM-DD'
  endDate?: string;   // 'YYYY-MM-DD'
  description?: string;
  targetAudience?: string; // e.g. 'All Students & Faculty', 'Class KG to X', 'Teachers Only'
  isSchoolClosed?: boolean;
  createdBy?: string;
  createdAt?: string;
  reminderNoticeSent?: boolean;
}

export interface SchoolSettings {
  schoolName: string;
  schoolNameHindi: string;
  tagline: string;
  affiliationNo: string;
  schoolCode: string;
  principalName: string;
  phone: string;
  email: string;
  website: string;
  address: string;
  academicYear: string;
  currency: string;
  lastBackupDate?: string;
}

export interface SchoolDatabaseState {
  version: string;
  exportDate: string;
  settings: SchoolSettings;
  teachers: Teacher[];
  teacherAttendance: TeacherAttendanceRecord[];
  teacherSalaries: TeacherSalarySlip[];
  students: Student[];
  feeTransactions: FeeTransaction[];
  chatMessages: ChatMessage[];
  auditLogs: AuditLog[];
  calendarEvents?: AcademicCalendarEvent[];
}
