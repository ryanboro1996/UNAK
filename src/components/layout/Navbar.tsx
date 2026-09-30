import React, { useState } from 'react';
import { 
  Bell, 
  Search, 
  Moon, 
  Sun, 
  Wifi, 
  WifiOff, 
  ShieldCheck, 
  ShieldAlert, 
  RefreshCw, 
  Menu, 
  UserCheck, 
  Languages, 
  SlidersHorizontal,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Printer,
  School,
  Edit2,
  X
} from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';
import { UserRole } from '../../types';

import { SchoolLogo } from '../common/SchoolLogo';

interface NavbarProps {
  onMenuToggle: () => void;
  onGlobalSearchClick?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onMenuToggle }) => {
  const { 
    currentUser, 
    availableUsers, 
    switchUser, 
    settings,
    updateSettings,
    isOnline, 
    isSyncing, 
    syncWithCloud, 
    toggleOnlineMode,
    darkMode, 
    toggleDarkMode, 
    language, 
    toggleLanguage, 
    t,
    notifications,
    unreadNotificationCount,
    markNotificationRead,
    markAllNotificationsRead,
    mfaEnabled,
    fontSize,
    setFontSize,
    highContrast,
    toggleHighContrast
  } = useSchool();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showAccessibility, setShowAccessibility] = useState(false);
  const [showSchoolSettingsModal, setShowSchoolSettingsModal] = useState(false);

  // School settings edit form
  const [schoolForm, setSchoolForm] = useState({
    schoolName: settings.schoolName,
    schoolNameHindi: settings.schoolNameHindi,
    tagline: settings.tagline,
    affiliationNo: settings.affiliationNo,
    schoolCode: settings.schoolCode,
    principalName: settings.principalName,
    address: settings.address,
    phone: settings.phone,
    email: settings.email,
    academicYear: settings.academicYear
  });

  const handleSaveSchoolSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(schoolForm);
    setShowSchoolSettingsModal(false);
  };

  const roleColors: Record<UserRole, { badge: string; text: string }> = {
    principal: { badge: 'bg-purple-100 text-purple-700 dark:bg-purple-950/70 dark:text-purple-300 border-purple-200 dark:border-purple-800', text: 'Principal & Director' },
    teacher: { badge: 'bg-blue-100 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300 border-blue-200 dark:border-blue-800', text: 'Faculty / Teacher' },
    accountant: { badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800', text: 'Accountant' },
    parent: { badge: 'bg-amber-100 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300 border-amber-200 dark:border-amber-800', text: 'Parent Portal' }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="px-4 lg:px-6 h-16 flex items-center justify-between gap-4">
        
        {/* Left: Mobile menu toggle + School Branding */}
        <div className="flex items-center gap-3">
          <button 
            onClick={onMenuToggle}
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5">
            <button 
              onClick={() => {
                setSchoolForm({
                  schoolName: settings.schoolName,
                  schoolNameHindi: settings.schoolNameHindi,
                  tagline: settings.tagline,
                  affiliationNo: settings.affiliationNo,
                  schoolCode: settings.schoolCode,
                  principalName: settings.principalName,
                  address: settings.address,
                  phone: settings.phone,
                  email: settings.email,
                  academicYear: settings.academicYear
                });
                setShowSchoolSettingsModal(true);
              }}
              title={t("Edit School Name & Profile", "स्कूल का नाम एवं विवरण बदलें")}
              className="w-10 h-10 rounded-full flex items-center justify-center shadow-md shadow-indigo-500/20 hover:scale-105 active:scale-95 transition-all cursor-pointer overflow-hidden p-0.5 bg-yellow-400 border-2 border-black"
            >
              <SchoolLogo className="w-full h-full rounded-full" />
            </button>
            <div className="hidden sm:block text-left">
              <button
                onClick={() => {
                  setSchoolForm({
                    schoolName: settings.schoolName,
                    schoolNameHindi: settings.schoolNameHindi,
                    tagline: settings.tagline,
                    affiliationNo: settings.affiliationNo,
                    schoolCode: settings.schoolCode,
                    principalName: settings.principalName,
                    address: settings.address,
                    phone: settings.phone,
                    email: settings.email,
                    academicYear: settings.academicYear
                  });
                  setShowSchoolSettingsModal(true);
                }}
                className="group flex items-center gap-1.5 text-left"
                title={t("Click to change school name", "स्कूल का नाम बदलने के लिए क्लिक करें")}
              >
                <h1 className="text-base font-bold text-slate-900 dark:text-white leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {language === 'hi' ? settings.schoolNameHindi : settings.schoolName}
                </h1>
                <Edit2 className="w-3 h-3 text-slate-400 group-hover:text-indigo-500 opacity-60 group-hover:opacity-100 transition-all" />
              </button>
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-medium">
                <span>{settings.affiliationNo}</span>
                <span>•</span>
                <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{settings.academicYear}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Center: Cloud Status Banner */}
        <div className="hidden md:flex items-center gap-2 bg-slate-100 dark:bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-200/80 dark:border-slate-700/60 text-xs">
          <button 
            onClick={toggleOnlineMode}
            title={isOnline ? "Simulated Online (Click to toggle offline)" : "Offline Mode (Click to toggle online)"}
            className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 hover:opacity-80 transition-opacity"
          >
            {isOnline ? (
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <Wifi className="w-3.5 h-3.5" />
                <span>{t('Cloud Active', 'क्लाउड सक्रिय')}</span>
              </span>
            ) : (
              <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
                <WifiOff className="w-3.5 h-3.5" />
                <span>{t('Offline Mode', 'ऑफ़लाइन मोड')}</span>
              </span>
            )}
          </button>
          <span className="text-slate-300 dark:text-slate-600">|</span>
          <button 
            onClick={syncWithCloud}
            disabled={isSyncing}
            className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium disabled:opacity-50"
            title="Sync Database Now"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? t('Syncing...', 'सिंक हो रहा...') : t('Sync', 'सिंक')}</span>
          </button>
        </div>

        {/* Right Controls: Accessibility, Language, DarkMode, Notifs, User Switcher */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Language Toggle */}
          <button
            onClick={toggleLanguage}
            title={language === 'en' ? "हिंदी में बदलें (Switch to Hindi)" : "Switch to English"}
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1 text-xs font-semibold"
          >
            <Languages className="w-4 h-4 text-indigo-500" />
            <span className="hidden sm:inline">{language === 'en' ? 'EN' : 'हिन्दी'}</span>
          </button>

          {/* Accessibility Settings Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowAccessibility(!showAccessibility)}
              title="Accessibility & Font Controls"
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>

            {showAccessibility && (
              <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-3 z-50 text-xs">
                <div className="font-semibold text-slate-900 dark:text-white mb-2 flex items-center justify-between">
                  <span>{t('Accessibility', 'पहुंच नियंत्रण')}</span>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-slate-500 dark:text-slate-400 block mb-1 font-medium">{t('Font Size', 'फ़ॉन्ट का आकार')}</label>
                    <div className="grid grid-cols-3 gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-lg">
                      <button 
                        onClick={() => setFontSize('normal')}
                        className={`py-1 rounded text-center font-medium ${fontSize === 'normal' ? 'bg-white dark:bg-slate-700 shadow-xs text-indigo-600 dark:text-indigo-300' : 'text-slate-600 dark:text-slate-400'}`}
                      >
                        A
                      </button>
                      <button 
                        onClick={() => setFontSize('large')}
                        className={`py-1 rounded text-center font-medium text-sm ${fontSize === 'large' ? 'bg-white dark:bg-slate-700 shadow-xs text-indigo-600 dark:text-indigo-300' : 'text-slate-600 dark:text-slate-400'}`}
                      >
                        A+
                      </button>
                      <button 
                        onClick={() => setFontSize('xlarge')}
                        className={`py-1 rounded text-center font-medium text-base ${fontSize === 'xlarge' ? 'bg-white dark:bg-slate-700 shadow-xs text-indigo-600 dark:text-indigo-300' : 'text-slate-600 dark:text-slate-400'}`}
                      >
                        A++
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700">
                    <span className="text-slate-600 dark:text-slate-300 font-medium">{t('High Contrast', 'उच्च कंट्रास्ट')}</span>
                    <button
                      onClick={toggleHighContrast}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${highContrast ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'}`}
                    >
                      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${highContrast ? 'translate-x-4.5' : 'translate-x-1'}`} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
              aria-label="View notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadNotificationCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white dark:ring-slate-900 animate-pulse"></span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="p-3.5 border-b border-slate-100 dark:border-slate-700/80 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">{t('Notifications', 'सूचनाएं')}</span>
                    {unreadNotificationCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 text-xs font-semibold">
                        {unreadNotificationCount} {t('new', 'नई')}
                      </span>
                    )}
                  </div>
                  {unreadNotificationCount > 0 && (
                    <button 
                      onClick={markAllNotificationsRead}
                      className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                    >
                      {t('Mark all read', 'सब पढ़ा हुआ चिह्नित करें')}
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700/50">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-slate-400 text-xs">
                      {t('No notifications yet', 'कोई नई सूचना नहीं है')}
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div 
                        key={notif.id}
                        onClick={() => markNotificationRead(notif.id)}
                        className={`p-3 text-xs flex gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors ${!notif.read ? 'bg-indigo-50/40 dark:bg-indigo-950/20' : ''}`}
                      >
                        <div className="mt-0.5 shrink-0">
                          {notif.type === 'fee' && <div className="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">₹</div>}
                          {notif.type === 'attendance' && <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center"><UserCheck className="w-3.5 h-3.5" /></div>}
                          {notif.type === 'salary' && <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center"><CheckCircle2 className="w-3.5 h-3.5" /></div>}
                          {notif.type === 'security' && <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 flex items-center justify-center"><ShieldCheck className="w-3.5 h-3.5" /></div>}
                          {notif.type === 'general' && <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center"><Bell className="w-3.5 h-3.5" /></div>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">{notif.title}</p>
                            <span className="text-[10px] text-slate-400 shrink-0">{notif.timestamp}</span>
                          </div>
                          <p className="text-slate-600 dark:text-slate-400 line-clamp-2 mt-0.5">{notif.message}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Active User Switcher Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
            >
              <img 
                src={currentUser.avatar} 
                alt={currentUser.name} 
                className="w-8 h-8 rounded-lg object-cover ring-2 ring-indigo-500/30"
              />
              <div className="hidden md:block text-left">
                <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight truncate max-w-[120px]">
                  {currentUser.name}
                </p>
                <p className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400">
                  {currentUser.role.toUpperCase()}
                </p>
              </div>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-2 z-50">
                <div className="p-3 border-b border-slate-100 dark:border-slate-700/80 mb-1">
                  <p className="text-xs font-bold text-slate-900 dark:text-white">{currentUser.name}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">{currentUser.title}</p>
                  <div className="mt-2 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">{t('Security Status:', 'सुरक्षा स्थिति:')}</span>
                    <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                      <ShieldCheck className="w-3 h-3" />
                      {mfaEnabled ? 'MFA 2FA Active' : 'Basic Password'}
                    </span>
                  </div>
                </div>

                <div className="px-2 py-1 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  {t('Switch Demo Role', 'भूमिका बदलें (डेमो रोल)')}
                </div>

                <div className="space-y-1">
                  {availableUsers.map((usr) => (
                    <button
                      key={usr.id}
                      onClick={() => {
                        switchUser(usr.id);
                        setShowUserMenu(false);
                      }}
                      className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-left text-xs transition-colors ${
                        currentUser.id === usr.id 
                          ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-bold' 
                          : 'hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <img src={usr.avatar} alt={usr.name} className="w-7 h-7 rounded-lg object-cover" />
                      <div className="flex-1 min-w-0">
                        <p className="truncate font-semibold">{usr.name}</p>
                        <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold border ${roleColors[usr.role].badge}`}>
                          {roleColors[usr.role].text}
                        </span>
                      </div>
                      {currentUser.id === usr.id && (
                        <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* School Name & Institutional Profile Modal */}
      {showSchoolSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div className="flex items-center gap-3">
                <SchoolLogo className="w-11 h-11 rounded-full border-2 border-yellow-400 p-0.5 bg-yellow-400" />
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    {t('School Name & Institutional Settings', 'स्कूल का नाम एवं संस्थान विवरण')}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {t('Changes apply immediately to receipts, pay slips and reports', 'बदलाव तुरंत सभी रसीदों, रिपोर्टों एवं सैलरी स्लिप पर लागू होंगे')}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowSchoolSettingsModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSchoolSettings} className="space-y-4 text-xs">
              
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {t('School Full Name (English)', 'स्कूल का नाम (अंग्रेजी में)')}
                </label>
                <input
                  type="text"
                  required
                  value={schoolForm.schoolName}
                  onChange={(e) => setSchoolForm({ ...schoolForm, schoolName: e.target.value })}
                  placeholder="e.g. St. Xavier International Senior Secondary School"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {t('School Name in Hindi / Regional Script', 'स्कूल का नाम (हिंदी में)')}
                </label>
                <input
                  type="text"
                  value={schoolForm.schoolNameHindi}
                  onChange={(e) => setSchoolForm({ ...schoolForm, schoolNameHindi: e.target.value })}
                  placeholder="उदा. सेंट जेवियर इंटरनेशनल स्कूल"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {t('Affiliation / Board Code', 'एफिलिएशन / बोर्ड कोड')}
                  </label>
                  <input
                    type="text"
                    value={schoolForm.affiliationNo}
                    onChange={(e) => setSchoolForm({ ...schoolForm, affiliationNo: e.target.value })}
                    placeholder="CBSE-AFF/2026/894201"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-mono text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {t('School Center Code', 'स्कूल कोड')}
                  </label>
                  <input
                    type="text"
                    value={schoolForm.schoolCode}
                    onChange={(e) => setSchoolForm({ ...schoolForm, schoolCode: e.target.value })}
                    placeholder="SCH-4029"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-mono text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {t('Principal / Director Name', 'प्राचार्य / निदेशक का नाम')}
                  </label>
                  <input
                    type="text"
                    value={schoolForm.principalName}
                    onChange={(e) => setSchoolForm({ ...schoolForm, principalName: e.target.value })}
                    placeholder="Dr. Rajeshwar Sharma"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {t('Current Academic Session', 'शैक्षणिक सत्र')}
                  </label>
                  <input
                    type="text"
                    value={schoolForm.academicYear}
                    onChange={(e) => setSchoolForm({ ...schoolForm, academicYear: e.target.value })}
                    placeholder="2026-2027"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {t('School Address & Location', 'स्कूल का पता')}
                </label>
                <input
                  type="text"
                  value={schoolForm.address}
                  onChange={(e) => setSchoolForm({ ...schoolForm, address: e.target.value })}
                  placeholder="Sector 14, Institutional Area, Rohini, New Delhi - 110085"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {t('Phone Contact', 'फ़ोन नंबर')}
                  </label>
                  <input
                    type="text"
                    value={schoolForm.phone}
                    onChange={(e) => setSchoolForm({ ...schoolForm, phone: e.target.value })}
                    placeholder="+91 (011) 2894-3321"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {t('Official Email', 'आधिकारिक ईमेल')}
                  </label>
                  <input
                    type="email"
                    value={schoolForm.email}
                    onChange={(e) => setSchoolForm({ ...schoolForm, email: e.target.value })}
                    placeholder="principal@school.edu.in"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowSchoolSettingsModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 font-semibold text-slate-700 dark:text-slate-300"
                >
                  {t('Cancel', 'रद्द करें')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md shadow-indigo-600/20"
                >
                  {t('Save School Profile', 'विवरण सुरक्षित करें')}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}
    </header>
  );
};
