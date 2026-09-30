import React from 'react';
import { 
  LayoutDashboard, 
  GraduationCap, 
  WalletCards, 
  Users, 
  UserCheck, 
  Receipt, 
  LineChart, 
  FileSpreadsheet, 
  MessageSquareText, 
  Database, 
  ShieldCheck, 
  ChevronRight,
  X,
  School,
  Sparkles,
  Calendar,
  Award,
  FileCheck
} from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';
import { SchoolLogo } from '../common/SchoolLogo';

export type NavTab = 
  | 'dashboard'
  | 'calendar'
  | 'marksheets'
  | 'teachers'
  | 'teacher_payroll'
  | 'students'
  | 'student_attendance'
  | 'fees'
  | 'analytics'
  | 'reports'
  | 'chat'
  | 'backup'
  | 'security';

interface SidebarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  isOpen,
  onClose
}) => {
  const { 
    teachers, 
    students, 
    unreadNotificationCount, 
    chatMessages, 
    currentUser, 
    settings,
    t, 
    isOnline,
    mfaEnabled
  } = useSchool();

  const navItems: { id: NavTab; labelEn: string; labelHi: string; icon: React.ElementType; badge?: string | number; color?: string }[] = [
    { 
      id: 'dashboard', 
      labelEn: 'Dashboard', 
      labelHi: 'डैशबोर्ड अवलोकन', 
      icon: LayoutDashboard,
      color: 'text-indigo-500' 
    },
    { 
      id: 'calendar', 
      labelEn: 'Academic Calendar', 
      labelHi: 'अकादमिक कैलेंडर', 
      icon: Calendar,
      color: 'text-indigo-500' 
    },
    { 
      id: 'marksheets', 
      labelEn: 'Exam Marksheet Generator', 
      labelHi: 'अंकतालिका जनरेटर (Google Sheet)', 
      icon: FileCheck,
      badge: 'Sheet',
      color: 'text-emerald-500' 
    },
    { 
      id: 'teachers', 
      labelEn: 'Teachers & Faculty', 
      labelHi: 'शिक्षक प्रबंधन', 
      icon: GraduationCap, 
      badge: teachers.length,
      color: 'text-blue-500' 
    },
    { 
      id: 'teacher_payroll', 
      labelEn: 'Faculty Payroll & Attendance', 
      labelHi: 'शिक्षक उपस्थिति एवं वेतन', 
      icon: WalletCards,
      color: 'text-emerald-500' 
    },
    { 
      id: 'students', 
      labelEn: 'Student Records', 
      labelHi: 'विद्यार्थी रिकॉर्ड्स', 
      icon: Users, 
      badge: students.length,
      color: 'text-violet-500' 
    },
    { 
      id: 'student_attendance', 
      labelEn: 'Daily Student Attendance', 
      labelHi: 'दैनिक हाज़िरी रजिस्टर', 
      icon: UserCheck,
      color: 'text-cyan-500' 
    },
    { 
      id: 'fees', 
      labelEn: 'Fees & Accounting', 
      labelHi: 'शुल्क प्रबंधन एवं रसीद', 
      icon: Receipt,
      color: 'text-amber-500' 
    },
    { 
      id: 'analytics', 
      labelEn: 'Academic Analytics', 
      labelHi: 'शैक्षणिक विश्लेषण', 
      icon: LineChart,
      color: 'text-pink-500' 
    },
    { 
      id: 'reports', 
      labelEn: 'Custom Report Builder', 
      labelHi: 'कस्टम रिपोर्ट टूल', 
      icon: FileSpreadsheet,
      color: 'text-teal-500' 
    },
    { 
      id: 'chat', 
      labelEn: 'School Chat & Notices', 
      labelHi: 'वार्तालाप एवं सूचनाएं', 
      icon: MessageSquareText,
      badge: chatMessages.length,
      color: 'text-orange-500' 
    },
    { 
      id: 'backup', 
      labelEn: 'Database & Cloud Backup', 
      labelHi: 'डेटाबेस बैकअप एवं क्लाउड', 
      icon: Database,
      color: 'text-sky-500' 
    },
    { 
      id: 'security', 
      labelEn: 'Security & 2FA Audit', 
      labelHi: 'सुरक्षा एवं 2FA ऑडिट', 
      icon: ShieldCheck,
      badge: mfaEnabled ? '2FA' : 'Basic',
      color: 'text-emerald-500' 
    }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar container */}
      <aside 
        className={`fixed lg:sticky top-0 lg:top-16 z-50 lg:z-30 h-full lg:h-[calc(100vh-4rem)] w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top: Mobile header */}
        <div className="p-4 flex items-center justify-between lg:hidden border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <SchoolLogo className="w-8 h-8 rounded-full border border-black bg-yellow-400" />
            <span className="font-bold text-sm text-slate-900 dark:text-white truncate max-w-[170px]">
              {settings.schoolName}
            </span>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            {t('School Modules', 'स्कूल मॉड्यूल')}
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onTabChange(item.id);
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                  isActive 
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 font-bold' 
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : item.color}`} />
                  <span className="truncate">{t(item.labelEn, item.labelHi)}</span>
                </div>

                {item.badge !== undefined && (
                  <span className={`px-2 py-0.5 text-[10px] rounded-full font-bold ml-1 ${
                    isActive 
                      ? 'bg-indigo-700/60 text-indigo-100' 
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 group-hover:bg-slate-200 dark:group-hover:bg-slate-700'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom card: Principal quick summary */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent border border-indigo-500/15">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold text-indigo-900 dark:text-indigo-300 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-indigo-500" />
                {t('Current Mode', 'सक्रिय भूमिका')}
              </span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase bg-indigo-600 text-white">
                {currentUser.role}
              </span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-1">
              {currentUser.name}
            </p>
            <div className="mt-2 pt-2 border-t border-indigo-500/10 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
              <span>{isOnline ? '🟢 Online Sync' : '🟡 Offline Local'}</span>
              <span>v2.4 Pro</span>
            </div>
          </div>
        </div>

      </aside>
    </>
  );
};
