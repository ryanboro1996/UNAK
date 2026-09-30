import React from 'react';
import { 
  Users, 
  GraduationCap, 
  Receipt, 
  UserCheck, 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight, 
  AlertCircle, 
  CheckCircle, 
  Calendar, 
  CreditCard, 
  Send, 
  ShieldCheck, 
  Download, 
  FileText,
  DollarSign,
  Award,
  BellRing,
  FileSpreadsheet,
  FileCheck
} from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';
import { NavTab } from '../layout/Sidebar';
import { SchoolLogo } from '../common/SchoolLogo';
import { AcademicCalendar } from '../calendar/AcademicCalendar';

interface DynamicDashboardProps {
  onNavigate: (tab: NavTab) => void;
  onOpenQuickCollectFee: () => void;
  onOpenQuickAddStudent: () => void;
  onOpenQuickAddTeacher: () => void;
}

export const DynamicDashboard: React.FC<DynamicDashboardProps> = ({
  onNavigate,
  onOpenQuickCollectFee,
  onOpenQuickAddStudent,
  onOpenQuickAddTeacher
}) => {
  const { 
    teachers, 
    teacherAttendance, 
    teacherSalaries, 
    students, 
    feeTransactions, 
    currentUser, 
    settings, 
    language,
    t, 
    syncWithCloud,
    isSyncing,
    notifications
  } = useSchool();

  // Calculations
  const totalStudents = students.length;
  const totalTeachers = teachers.length;

  // Teacher attendance today
  const today = new Date().toISOString().slice(0, 10);
  const todayTeacherRecords = teacherAttendance.filter(r => r.date === today);
  const presentTeachers = todayTeacherRecords.filter(r => r.status === 'present').length;
  const teacherAttendancePercent = todayTeacherRecords.length > 0 
    ? Math.round((presentTeachers / todayTeacherRecords.length) * 100) 
    : 87.5;

  // Student average attendance
  const studentAvgAttendance = totalStudents > 0 
    ? Math.round(students.reduce((acc, s) => acc + s.attendancePercent, 0) / totalStudents * 10) / 10 
    : 92.4;

  // Financial stats
  const totalFeesBilled = students.reduce((acc, s) => acc + s.totalFees, 0);
  const totalFeesCollected = students.reduce((acc, s) => acc + s.paidFees, 0);
  const totalFeesPending = students.reduce((acc, s) => acc + s.pendingFees, 0);
  const feeCollectionPercent = totalFeesBilled > 0 
    ? Math.round((totalFeesCollected / totalFeesBilled) * 100) 
    : 72;

  // Staff payroll this month
  const totalMonthlyPayroll = teacherSalaries
    .filter(s => s.month.toLowerCase() === 'september')
    .reduce((acc, s) => acc + s.netPayable, 0);

  // Defaulters count
  const overdueStudents = students.filter(s => s.feeStatus === 'overdue' || s.feeStatus === 'due');

  // Academic top performers
  const topStudents = [...students].sort((a, b) => {
    const scoreA = a.academicReports[0]?.percentage || 0;
    const scoreB = b.academicReports[0]?.percentage || 0;
    return scoreB - scoreA;
  }).slice(0, 4);

  return (
    <div className="space-y-6">
      
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-700 via-indigo-600 to-sky-600 text-white p-6 sm:p-8 shadow-xl shadow-indigo-600/10">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 max-w-2xl">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-black bg-yellow-400 p-0.5 shadow-xl shrink-0 self-start sm:self-center">
              <SchoolLogo className="w-full h-full rounded-full" />
            </div>
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold text-indigo-100 mb-2">
                <Calendar className="w-3.5 h-3.5" />
                <span>{t('Academic Session 2026-2027', 'शैक्षणिक सत्र 2026-2027')}</span>
                <span>•</span>
                <span>{settings.schoolCode}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {t('Welcome back,', 'स्वागत है,')} {currentUser.name}
              </h2>
              <p className="mt-1.5 text-indigo-100 text-xs sm:text-sm font-normal leading-relaxed">
                {language === 'hi' 
                  ? `${settings.schoolNameHindi} के प्रशासनिक पोर्टल में आपका स्वागत है। अनुशासन, गुणवत्तापूर्ण शिक्षण एवं समग्र विकास के लिए डैशबोर्ड सक्रिय है।`
                  : `${settings.schoolName} Executive Portal. Leading with academic excellence, student character growth, and disciplined administration.`}
              </p>
            </div>
          </div>

          {/* Institution Credential Card (Replaces the shifted buttons for clean, un-cluttered welcome) */}
          <div className="shrink-0 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 sm:p-5 text-xs text-indigo-100 min-w-[240px] space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-indigo-200 uppercase font-semibold tracking-wider">{t('Institution Profile', 'संस्थान विवरण')}</span>
              <span className="flex items-center gap-1.5 text-emerald-300 font-bold text-[10px]">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                {t('Active Session', 'सत्र सक्रिय')}
              </span>
            </div>
            <div className="pt-1 border-t border-white/10 space-y-1">
              <p className="font-extrabold text-white text-sm">{settings.schoolName}</p>
              <p className="text-[11px] text-indigo-200">Affiliation: <strong>{settings.affiliationNo}</strong></p>
              <p className="text-[11px] text-indigo-200">Principal: <strong>{settings.principalName}</strong></p>
            </div>
          </div>
        </div>

        {/* Decorative background shapes */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute right-1/3 -top-10 w-48 h-48 bg-sky-400/20 rounded-full blur-xl pointer-events-none" />
      </div>

      {/* Institution Vital Stats & Central Access Strip */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <div>
            <span className="font-bold text-slate-800 dark:text-slate-200 block text-xs">
              {t('Institution Vital Stats & Quick Access:', 'संस्थान वर्तमान सांख्यिकी एवं त्वरित टूल्स:')}
            </span>
            <span className="text-[11px] text-slate-400 font-normal">
              {t('Real-time campus roster, exam tools, reports & broadcast suites', 'कैंपस नामांकन, परीक्षा टूल्स, रिपोर्ट्स एवं परिपत्र')}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Shifted Action 1: Exam Marksheets */}
          <button
            onClick={() => onNavigate('marksheets')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/60 dark:hover:bg-amber-900/60 border border-amber-200 dark:border-amber-800/80 text-amber-800 dark:text-amber-200 font-bold transition-all active:scale-95 cursor-pointer shadow-2xs"
            title="Generate Exam Marksheets via Google Sheet"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>{t('Exam Marksheets', 'अंकतालिका')}</span>
          </button>

          {/* Shifted Action 2: School Reports */}
          <button
            onClick={() => onNavigate('reports')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/60 dark:hover:bg-teal-900/60 border border-teal-200 dark:border-teal-800/80 text-teal-800 dark:text-teal-200 font-bold transition-all active:scale-95 cursor-pointer shadow-2xs"
            title="School Reports & Custom Ledger Builder"
          >
            <FileText className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span>{t('School Reports', 'स्कूल रिपोर्ट')}</span>
          </button>

          {/* Shifted Action 3: Notice / Broadcast */}
          <button
            onClick={() => onNavigate('chat')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 dark:bg-orange-950/60 dark:hover:bg-orange-900/60 border border-orange-200 dark:border-orange-800/80 text-orange-800 dark:text-orange-200 font-bold transition-all active:scale-95 cursor-pointer shadow-2xs"
            title="Broadcast Circular & School Notices"
          >
            <Send className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
            <span>{t('Notice / Broadcast', 'सूचना जारी करें')}</span>
          </button>

          <span className="hidden sm:inline-block w-px h-5 bg-slate-200 dark:bg-slate-700 mx-0.5" />

          {/* Roster Badges */}
          <button 
            onClick={() => onNavigate('students')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold transition-all active:scale-95 cursor-pointer"
            title="View Student Roster"
          >
            <Users className="w-3.5 h-3.5 text-indigo-500" />
            <span>{totalStudents} {t('Students', 'विद्यार्थी')}</span>
          </button>

          <button 
            onClick={() => onNavigate('teachers')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold transition-all active:scale-95 cursor-pointer"
            title="View Faculty Directory"
          >
            <GraduationCap className="w-3.5 h-3.5 text-blue-500" />
            <span>{totalTeachers} {t('Faculty', 'शिक्षक')}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Total Students */}
        <div 
          onClick={() => onNavigate('students')}
          className="cursor-pointer bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-indigo-400 dark:hover:border-indigo-600 transition-all hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {t('Total Students', 'कुल विद्यार्थी')}
            </span>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{totalStudents}</span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center">
              <TrendingUp className="w-3 h-3 mr-0.5" /> +100% active
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>{t('Avg Attendance', 'औसत हाज़िरी')}:</span>
            <span className="font-bold text-slate-700 dark:text-slate-200">{studentAvgAttendance}%</span>
          </div>
        </div>

        {/* Card 2: Total Teachers */}
        <div 
          onClick={() => onNavigate('teachers')}
          className="cursor-pointer bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-blue-400 dark:hover:border-blue-600 transition-all hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {t('Teachers & Faculty', 'शिक्षक एवं फैकल्टी')}
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{totalTeachers}</span>
            <span className="text-xs text-blue-600 dark:text-blue-400 font-semibold">
              {teachers.filter(t => t.status === 'active').length} on duty
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>{t("Today's Attendance", 'आज की उपस्थिति')}:</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">{teacherAttendancePercent}%</span>
          </div>
        </div>

        {/* Card 3: Fee Collection */}
        <div 
          onClick={() => onNavigate('fees')}
          className="cursor-pointer bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-emerald-400 dark:hover:border-emerald-600 transition-all hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {t('Fee Collection', 'शुल्क वसूली')}
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Receipt className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
              ₹{(totalFeesCollected / 1000).toFixed(1)}k
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              / ₹{(totalFeesBilled / 1000).toFixed(0)}k
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex-1 mr-2">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-500">{t('Progress', 'प्रगति')}:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{feeCollectionPercent}%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${feeCollectionPercent}%` }}
                />
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenQuickCollectFee();
              }}
              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold shrink-0 transition-colors shadow-xs active:scale-95 flex items-center gap-1 cursor-pointer"
              title={t('Collect Fee Now', 'फीस जमा करें')}
            >
              <CreditCard className="w-3 h-3" />
              <span>{t('Collect', 'जमा')}</span>
            </button>
          </div>
        </div>

        {/* Card 4: Monthly Payroll & Defaulters */}
        <div 
          onClick={() => onNavigate('teacher_payroll')}
          className="cursor-pointer bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-amber-400 dark:hover:border-amber-600 transition-all hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {t('Faculty Payroll (Sep)', 'वेतन वितरण (सितंबर)')}
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
              ₹{(totalMonthlyPayroll / 1000).toFixed(1)}k
            </span>
            <span className="text-xs text-emerald-600 font-semibold">
              Disbursed
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>{t('Overdue Dues', 'बकाया छात्र')}:</span>
            <span className="font-bold text-rose-600 dark:text-rose-400">{overdueStudents.length} students</span>
          </div>
        </div>

      </div>

      {/* Main Grid: Charts & Operations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Financial Flow & Attendance Trends */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Revenue vs Expenses Chart (SVG based) */}
          <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  {t('Financial Health: Fee Revenue vs Faculty Expenses', 'वित्तीय विश्लेषण: शुल्क प्राप्ति बनाम शिक्षक वेतन')}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t('Monthly cash flow comparison for 2026', 'मासिक वित्तीय संतुलन')}
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs font-semibold">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-xs bg-indigo-600"></div>
                  <span className="text-slate-600 dark:text-slate-300">{t('Fee Income', 'शुल्क आय')}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-xs bg-rose-500"></div>
                  <span className="text-slate-600 dark:text-slate-300">{t('Salaries & Ops', 'वेतन व्यय')}</span>
                </div>
              </div>
            </div>

            {/* Visual Bar representation */}
            <div className="space-y-4">
              {[
                { month: 'Jun 2026', income: 420000, expense: 380000 },
                { month: 'Jul 2026', income: 680000, expense: 410000 },
                { month: 'Aug 2026', income: 540000, expense: 410000 },
                { month: 'Sep 2026 (Current)', income: totalFeesCollected, expense: totalMonthlyPayroll },
              ].map((row, idx) => {
                const maxVal = 700000;
                const incomePercent = Math.min(100, Math.round((row.income / maxVal) * 100));
                const expensePercent = Math.min(100, Math.round((row.expense / maxVal) * 100));

                return (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-300">
                      <span>{row.month}</span>
                      <div className="flex gap-4">
                        <span className="text-indigo-600 dark:text-indigo-400">₹{row.income.toLocaleString('en-IN')}</span>
                        <span className="text-rose-600 dark:text-rose-400">₹{row.expense.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 h-4 bg-slate-50 dark:bg-slate-950 p-0.5 rounded-lg border border-slate-100 dark:border-slate-800">
                      <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-sm overflow-hidden flex justify-end">
                        <div 
                          className="bg-indigo-600 h-full rounded-sm transition-all duration-700" 
                          style={{ width: `${incomePercent}%` }}
                        />
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-sm overflow-hidden">
                        <div 
                          className="bg-rose-500 h-full rounded-sm transition-all duration-700" 
                          style={{ width: `${expensePercent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-5 p-3 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-between text-xs">
              <span className="text-indigo-900 dark:text-indigo-300 font-medium">
                {t('Surplus Reserve Balance:', 'संचित वित्तीय लाभ:')} <strong className="font-bold text-indigo-700 dark:text-indigo-200">₹1,25,800</strong>
              </span>
              <button 
                onClick={() => onNavigate('fees')}
                className="text-indigo-600 dark:text-indigo-400 hover:underline font-bold"
              >
                {t('View Detailed Ledger →', 'पूरा लेज़र देखें →')}
              </button>
            </div>
          </div>

          {/* Quick Actions Bar */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-3">
              {t('Principal Quick Action Panel', 'प्राचार्य त्वरित क्रिया पैनल')}
            </h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button
                onClick={() => onNavigate('marksheets')}
                className="p-3 rounded-xl border border-indigo-200 dark:border-indigo-800/60 bg-indigo-50/40 dark:bg-indigo-950/20 hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-left transition-all group shadow-xs active:scale-95 cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center mb-2 group-hover:scale-110 transition-transform shadow-xs">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <p className="font-bold text-xs text-indigo-950 dark:text-indigo-200">{t('Exam Marksheets', 'अंकतालिका जनरेटर')}</p>
                <p className="text-[10px] text-indigo-700 dark:text-indigo-400 mt-0.5">{t('Google Sheet Import', 'गूगल शीट अपलोड')}</p>
              </button>

              <button
                onClick={() => onNavigate('reports')}
                className="p-3 rounded-xl border border-teal-200 dark:border-teal-800/60 bg-teal-50/40 dark:bg-teal-950/20 hover:border-teal-500 hover:bg-teal-50 dark:hover:bg-teal-950/40 text-left transition-all group shadow-xs active:scale-95 cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center mb-2 group-hover:scale-110 transition-transform shadow-xs">
                  <FileText className="w-4 h-4" />
                </div>
                <p className="font-bold text-xs text-teal-950 dark:text-teal-200">{t('School Reports', 'स्कूल रिपोर्ट')}</p>
                <p className="text-[10px] text-teal-700 dark:text-teal-400 mt-0.5">{t('CSV & PDF Builder', 'कस्टम रिपोर्ट')}</p>
              </button>

              <button
                onClick={() => onNavigate('chat')}
                className="p-3 rounded-xl border border-orange-200 dark:border-orange-800/60 bg-orange-50/40 dark:bg-orange-950/20 hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950/40 text-left transition-all group shadow-xs active:scale-95 cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-orange-500 text-white flex items-center justify-center mb-2 group-hover:scale-110 transition-transform shadow-xs">
                  <Send className="w-4 h-4" />
                </div>
                <p className="font-bold text-xs text-orange-950 dark:text-orange-200">{t('Notice / Broadcast', 'सूचना जारी करें')}</p>
                <p className="text-[10px] text-orange-700 dark:text-orange-400 mt-0.5">{t('School Circulars & Alerts', 'परिपत्र एवं अलर्ट')}</p>
              </button>

              <button
                onClick={onOpenQuickCollectFee}
                className="p-3 rounded-xl border border-amber-200 dark:border-amber-800/60 bg-amber-50/40 dark:bg-amber-950/20 hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-left transition-all group shadow-xs active:scale-95 cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center mb-2 group-hover:scale-110 transition-transform shadow-xs">
                  <CreditCard className="w-4 h-4" />
                </div>
                <p className="font-bold text-xs text-amber-950 dark:text-amber-200">{t('Collect Fee', 'शुल्क जमा करें')}</p>
                <p className="text-[10px] text-amber-700 dark:text-amber-400 mt-0.5">{t('Issue Receipt', 'रसीद बनाएं')}</p>
              </button>

              <button
                onClick={onOpenQuickAddStudent}
                className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 text-left transition-all group active:scale-95 cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <Users className="w-4 h-4" />
                </div>
                <p className="font-bold text-xs text-slate-800 dark:text-slate-200">{t('Enroll Student', 'विद्यार्थी जोड़ें')}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{t('New Admission', 'नया दाखिला')}</p>
              </button>

              <button
                onClick={onOpenQuickAddTeacher}
                className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-950/30 text-left transition-all group active:scale-95 cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <p className="font-bold text-xs text-slate-800 dark:text-slate-200">{t('Add Faculty', 'शिक्षक नियुक्त करें')}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{t('Staff Onboarding', 'नया शिक्षक')}</p>
              </button>

              <button
                onClick={() => onNavigate('student_attendance')}
                className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-cyan-500 hover:bg-cyan-50/50 dark:hover:bg-cyan-950/30 text-left transition-all group active:scale-95 cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-cyan-100 dark:bg-cyan-950 text-cyan-600 dark:text-cyan-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <UserCheck className="w-4 h-4" />
                </div>
                <p className="font-bold text-xs text-slate-800 dark:text-slate-200">{t('Mark Attendance', 'हाज़िरी भरें')}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{t('Daily Register', 'कक्षा रजिस्टर')}</p>
              </button>

              <button
                onClick={() => onNavigate('calendar')}
                className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 text-left transition-all group active:scale-95 cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <Calendar className="w-4 h-4" />
                </div>
                <p className="font-bold text-xs text-slate-800 dark:text-slate-200">{t('Academic Calendar', 'अकादमिक कैलेंडर')}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{t('Holidays & Exams', 'अवकाश एवं परीक्षा')}</p>
              </button>
            </div>
          </div>

        </div>

        {/* Right 1 Col: Top Academic Performers & Live Notifications */}
        <div className="space-y-6">
          
          {/* Academic Toppers */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  {t('Top Academic Performers', 'शीर्ष मेधावी छात्र')}
                </h3>
              </div>
              <button 
                onClick={() => onNavigate('analytics')}
                className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
              >
                {t('View All', 'सभी देखें')}
              </button>
            </div>

            <div className="space-y-3">
              {topStudents.map((st, i) => (
                <div key={st.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                    i === 0 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300 ring-2 ring-amber-400/40' :
                    i === 1 ? 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200' :
                    i === 2 ? 'bg-amber-700/20 text-amber-800 dark:text-amber-200' :
                    'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}>
                    #{i + 1}
                  </div>
                  <img src={st.avatar} alt={st.name} className="w-8 h-8 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{st.name}</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">{st.grade} ({st.section})</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400">
                      {st.academicReports[0]?.percentage || 90}%
                    </span>
                    <p className="text-[9px] font-bold text-emerald-600">Grade A+</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pending Fee Alerts */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  {t('Fee Defaulters Alert', 'फीस बकाया चेतावनी')}
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                {overdueStudents.length} {t('Pending', 'बकाया')}
              </span>
            </div>

            <div className="space-y-2.5">
              {overdueStudents.slice(0, 3).map((st) => (
                <div key={st.id} className="p-3 rounded-xl border border-rose-100 dark:border-rose-900/30 bg-rose-50/40 dark:bg-rose-950/20 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 dark:text-slate-200">{st.name}</span>
                    <span className="font-extrabold text-rose-600 dark:text-rose-400">₹{st.pendingFees.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                    <span>{st.grade} • {st.parentPhone}</span>
                    <span className="uppercase font-semibold text-rose-500">{st.feeStatus}</span>
                  </div>
                </div>
              ))}
            </div>

            <button 
              onClick={() => onNavigate('fees')}
              className="mt-3 w-full py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors"
            >
              {t('Manage All Defaulters & Send SMS', 'सभी को नोटिस एवं SMS भेजें')}
            </button>
          </div>

        </div>

      </div>

      {/* Principal Academic Calendar Section (Grid View on Dashboard) */}
      <div className="pt-2">
        <AcademicCalendar
          embeddedInDashboard={true}
          onNavigateToCalendar={() => onNavigate('calendar')}
        />
      </div>

    </div>
  );
};
