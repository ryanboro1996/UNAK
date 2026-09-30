/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { SchoolProvider, useSchool } from './context/SchoolContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar, NavTab } from './components/layout/Sidebar';
import { DynamicDashboard } from './components/dashboard/DynamicDashboard';
import { TeacherManagement } from './components/teachers/TeacherManagement';
import { TeacherAttendanceSalary } from './components/teachers/TeacherAttendanceSalary';
import { StudentManagement } from './components/students/StudentManagement';
import { StudentAttendance } from './components/students/StudentAttendance';
import { FeeManagement } from './components/fees/FeeManagement';
import { PerformanceAnalytics } from './components/analytics/PerformanceAnalytics';
import { CustomReportBuilder } from './components/reports/CustomReportBuilder';
import { SchoolChat } from './components/chat/SchoolChat';
import { BackupSystem } from './components/backup/BackupSystem';
import { SecurityMFA } from './components/security/SecurityMFA';
import { AcademicCalendar } from './components/calendar/AcademicCalendar';
import { ExamMarksheetGenerator } from './components/marksheet/ExamMarksheetGenerator';
import { PrintModals } from './components/modals/PrintModals';
import { Student } from './types';
import { 
  LayoutDashboard, 
  GraduationCap, 
  Users, 
  Receipt, 
  MessageSquareText, 
  ShieldCheck, 
  WifiOff,
  BellRing
} from 'lucide-react';

const MainLayout: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedStudentForFee, setSelectedStudentForFee] = useState<Student | null>(null);
  const [openAddStudentModal, setOpenAddStudentModal] = useState(false);

  const { isOnline, notifications, unreadNotificationCount, t } = useSchool();

  const handleQuickCollectFee = () => {
    setActiveTab('fees');
  };

  const handleQuickAddStudent = () => {
    setOpenAddStudentModal(true);
    setActiveTab('students');
  };

  const handleQuickAddTeacher = () => {
    setActiveTab('teachers');
  };

  const handleCollectFeeForStudent = (student: Student) => {
    setSelectedStudentForFee(student);
    setActiveTab('fees');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      
      {/* Offline Alert Strip if offline mode is simulated or detected */}
      {!isOnline && (
        <div className="no-print bg-amber-500 text-slate-950 px-4 py-1.5 text-xs font-bold text-center flex items-center justify-center gap-2 shadow-sm z-50">
          <WifiOff className="w-3.5 h-3.5" />
          <span>{t('Offline Mode: Changes are saved to local database & will sync to cloud automatically.', 'ऑफ़लाइन मोड: सभी बदलाव स्थानीय डेटाबेस में सुरक्षित हैं एवं इंटरनेट उपलब्ध होने पर स्वतः सिंक हो जाएंगे।')}</span>
        </div>
      )}

      {/* Top Navbar */}
      <div className="no-print">
        <Navbar onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
      </div>

      {/* Main Workspace */}
      <div className="flex-1 flex max-w-[1920px] w-full mx-auto">
        
        {/* Navigation Sidebar */}
        <div className="no-print">
          <Sidebar
            activeTab={activeTab}
            onTabChange={setActiveTab}
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
          />
        </div>

        {/* Dynamic Content Area */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 pb-20 lg:pb-8">
          {activeTab === 'dashboard' && (
            <DynamicDashboard
              onNavigate={setActiveTab}
              onOpenQuickCollectFee={handleQuickCollectFee}
              onOpenQuickAddStudent={handleQuickAddStudent}
              onOpenQuickAddTeacher={handleQuickAddTeacher}
            />
          )}

          {activeTab === 'calendar' && (
            <AcademicCalendar
              embeddedInDashboard={false}
              onNavigateToCalendar={() => setActiveTab('calendar')}
            />
          )}

          {activeTab === 'marksheets' && (
            <ExamMarksheetGenerator />
          )}

          {activeTab === 'teachers' && (
            <TeacherManagement />
          )}

          {activeTab === 'teacher_payroll' && (
            <TeacherAttendanceSalary />
          )}

          {activeTab === 'students' && (
            <StudentManagement
              onCollectFeeForStudent={handleCollectFeeForStudent}
              initialOpenAddModal={openAddStudentModal}
              onClearInitialAddModal={() => setOpenAddStudentModal(false)}
            />
          )}

          {activeTab === 'student_attendance' && (
            <StudentAttendance />
          )}

          {activeTab === 'fees' && (
            <FeeManagement
              initialStudentForFee={selectedStudentForFee}
              onClearInitialStudent={() => setSelectedStudentForFee(null)}
            />
          )}

          {activeTab === 'analytics' && (
            <PerformanceAnalytics />
          )}

          {activeTab === 'reports' && (
            <CustomReportBuilder />
          )}

          {activeTab === 'chat' && (
            <SchoolChat />
          )}

          {activeTab === 'backup' && (
            <BackupSystem />
          )}

          {activeTab === 'security' && (
            <SecurityMFA />
          )}
        </main>
      </div>

      {/* Mobile Bottom Quick Bar */}
      <div className="no-print lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-3 py-2 flex items-center justify-around text-[10px] font-bold">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center gap-0.5 ${
            activeTab === 'dashboard' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Home</span>
        </button>

        <button
          onClick={() => setActiveTab('teachers')}
          className={`flex flex-col items-center gap-0.5 ${
            activeTab === 'teachers' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>Teachers</span>
        </button>

        <button
          onClick={() => setActiveTab('students')}
          className={`flex flex-col items-center gap-0.5 ${
            activeTab === 'students' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Students</span>
        </button>

        <button
          onClick={() => setActiveTab('fees')}
          className={`flex flex-col items-center gap-0.5 ${
            activeTab === 'fees' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>Fees</span>
        </button>

        <button
          onClick={() => setActiveTab('chat')}
          className={`flex flex-col items-center gap-0.5 ${
            activeTab === 'chat' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500'
          }`}
        >
          <MessageSquareText className="w-4 h-4" />
          <span>Notices</span>
        </button>
      </div>

      {/* Global Printable Document Modal */}
      <PrintModals />

    </div>
  );
};

export default function App() {
  return (
    <SchoolProvider>
      <MainLayout />
    </SchoolProvider>
  );
}
