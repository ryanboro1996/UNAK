import React, { useState, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Search, 
  Filter, 
  Clock, 
  Sparkles, 
  BellRing, 
  AlertCircle, 
  CheckCircle2, 
  Trash2, 
  Edit3, 
  X, 
  School, 
  FileText, 
  Users, 
  GraduationCap, 
  Share2,
  CalendarCheck2,
  Bookmark
} from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';
import { AcademicCalendarEvent, CalendarEventType, SCHOOL_CLASSES } from '../../types';

interface AcademicCalendarProps {
  embeddedInDashboard?: boolean;
  onNavigateToCalendar?: () => void;
}

export const AcademicCalendar: React.FC<AcademicCalendarProps> = ({
  embeddedInDashboard = false,
  onNavigateToCalendar
}) => {
  const { 
    calendarEvents, 
    addCalendarEvent, 
    updateCalendarEvent, 
    deleteCalendarEvent, 
    sendEventReminder,
    currentUser, 
    isPrincipal, 
    settings, 
    t, 
    language 
  } = useSchool();

  // Calendar View State - Defaulting to October 2026 (matching academic session events)
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 9, 1)); // October 2026
  const [selectedEventType, setSelectedEventType] = useState<'all' | CalendarEventType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<AcademicCalendarEvent | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Form State
  const [formData, setFormData] = useState<{
    title: string;
    titleHindi: string;
    type: CalendarEventType;
    startDate: string;
    endDate: string;
    targetAudience: string;
    isSchoolClosed: boolean;
    description: string;
    sendImmediateNotice: boolean;
  }>({
    title: '',
    titleHindi: '',
    type: 'holiday',
    startDate: new Date().toISOString().slice(0, 10),
    endDate: '',
    targetAudience: 'All Students & Staff',
    isSchoolClosed: true,
    description: '',
    sendImmediateNotice: false
  });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNamesEn = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const monthNamesHi = [
    'जनवरी', 'फ़रवरी', 'मार्च', 'अप्रैल', 'मई', 'जून',
    'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'
  ];

  const daysOfWeekEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const daysOfWeekHi = ['रवि', 'सोम', 'मंगल', 'बुध', 'गुरु', 'शुक्र', 'शनि'];

  // Days in month calculations
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  // Navigation Handlers
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    // Session default is October 2026
    setCurrentDate(new Date(2026, 9, 1));
  };

  // Filter events
  const filteredEvents = useMemo(() => {
    return calendarEvents.filter(ev => {
      if (selectedEventType !== 'all' && ev.type !== selectedEventType) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = ev.title.toLowerCase().includes(q) || (ev.titleHindi && ev.titleHindi.toLowerCase().includes(q));
        const matchDesc = ev.description && ev.description.toLowerCase().includes(q);
        const matchTarget = ev.targetAudience && ev.targetAudience.toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchTarget) return false;
      }
      return true;
    });
  }, [calendarEvents, selectedEventType, searchQuery]);

  // Events within currently visible month
  const currentMonthEvents = useMemo(() => {
    const monthStr = String(month + 1).padStart(2, '0');
    const prefix = `${year}-${monthStr}`;
    return filteredEvents.filter(ev => {
      const startPrefix = ev.startDate.slice(0, 7);
      const endPrefix = ev.endDate ? ev.endDate.slice(0, 7) : startPrefix;
      return startPrefix === prefix || endPrefix === prefix;
    });
  }, [filteredEvents, year, month]);

  // Stats for the month
  const monthStats = useMemo(() => {
    const holidays = currentMonthEvents.filter(e => e.type === 'holiday').length;
    const exams = currentMonthEvents.filter(e => e.type === 'exam').length;
    const events = currentMonthEvents.filter(e => e.type === 'event').length;
    const reminders = currentMonthEvents.filter(e => e.type === 'reminder').length;
    return { holidays, exams, events, reminders, total: currentMonthEvents.length };
  }, [currentMonthEvents]);

  // Get events on a specific day 'YYYY-MM-DD'
  const getEventsForDate = (dateStr: string) => {
    return filteredEvents.filter(ev => {
      if (ev.startDate === dateStr) return true;
      if (ev.endDate) {
        return dateStr >= ev.startDate && dateStr <= ev.endDate;
      }
      return false;
    });
  };

  // Open add event modal for a specific day
  const handleOpenAddForDate = (dateStr: string) => {
    setFormData({
      title: '',
      titleHindi: '',
      type: 'holiday',
      startDate: dateStr,
      endDate: '',
      targetAudience: 'All Students & Staff',
      isSchoolClosed: true,
      description: '',
      sendImmediateNotice: false
    });
    setIsEditing(false);
    setSelectedEvent(null);
    setIsAddModalOpen(true);
  };

  // Open event details
  const handleEventClick = (e: React.MouseEvent, ev: AcademicCalendarEvent) => {
    e.stopPropagation();
    setSelectedEvent(ev);
    setIsDetailModalOpen(true);
  };

  // Open edit modal
  const handleEditClick = (ev: AcademicCalendarEvent) => {
    setSelectedEvent(ev);
    setFormData({
      title: ev.title,
      titleHindi: ev.titleHindi || '',
      type: ev.type,
      startDate: ev.startDate,
      endDate: ev.endDate || '',
      targetAudience: ev.targetAudience || 'All Students & Staff',
      isSchoolClosed: !!ev.isSchoolClosed,
      description: ev.description || '',
      sendImmediateNotice: false
    });
    setIsEditing(true);
    setIsDetailModalOpen(false);
    setIsAddModalOpen(true);
  };

  // Save Event (Add or Edit)
  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.startDate) return;

    if (isEditing && selectedEvent) {
      updateCalendarEvent(selectedEvent.id, {
        title: formData.title.trim(),
        titleHindi: formData.titleHindi.trim() || undefined,
        type: formData.type,
        startDate: formData.startDate,
        endDate: formData.endDate ? formData.endDate : undefined,
        targetAudience: formData.targetAudience,
        isSchoolClosed: formData.isSchoolClosed,
        description: formData.description.trim() || undefined
      });
      if (formData.sendImmediateNotice) {
        sendEventReminder(selectedEvent.id);
      }
    } else {
      const newEv = addCalendarEvent({
        title: formData.title.trim(),
        titleHindi: formData.titleHindi.trim() || undefined,
        type: formData.type,
        startDate: formData.startDate,
        endDate: formData.endDate ? formData.endDate : undefined,
        targetAudience: formData.targetAudience,
        isSchoolClosed: formData.isSchoolClosed,
        description: formData.description.trim() || undefined,
        createdBy: `${currentUser.name} (${currentUser.title})`
      });
      if (formData.sendImmediateNotice) {
        sendEventReminder(newEv.id);
      }
    }

    setIsAddModalOpen(false);
    setSelectedEvent(null);
    setIsEditing(false);
  };

  // Delete Event
  const handleDelete = (id: string) => {
    if (confirm(t('Are you sure you want to delete this event from the academic calendar?', 'क्या आप इस कार्यक्रम को अकादमिक कैलेंडर से हटाना चाहते हैं?'))) {
      deleteCalendarEvent(id);
      setIsDetailModalOpen(false);
      setSelectedEvent(null);
    }
  };

  // Color helper for badges and cells
  const getEventTypeTheme = (type: CalendarEventType) => {
    switch (type) {
      case 'holiday':
        return {
          bg: 'bg-amber-100 dark:bg-amber-950/70',
          text: 'text-amber-800 dark:text-amber-200',
          border: 'border-amber-200 dark:border-amber-800/80',
          dot: 'bg-amber-500',
          label: t('School Holiday', 'विद्यालय अवकाश'),
          labelHi: 'विद्यालय अवकाश'
        };
      case 'exam':
        return {
          bg: 'bg-indigo-100 dark:bg-indigo-950/70',
          text: 'text-indigo-800 dark:text-indigo-200',
          border: 'border-indigo-200 dark:border-indigo-800/80',
          dot: 'bg-indigo-600',
          label: t('Exam Date', 'परीक्षा तिथि'),
          labelHi: 'परीक्षा तिथि'
        };
      case 'event':
        return {
          bg: 'bg-emerald-100 dark:bg-emerald-950/70',
          text: 'text-emerald-800 dark:text-emerald-200',
          border: 'border-emerald-200 dark:border-emerald-800/80',
          dot: 'bg-emerald-500',
          label: t('School Event', 'विद्यालय समारोह'),
          labelHi: 'विद्यालय समारोह'
        };
      case 'reminder':
        return {
          bg: 'bg-sky-100 dark:bg-sky-950/70',
          text: 'text-sky-800 dark:text-sky-200',
          border: 'border-sky-200 dark:border-sky-800/80',
          dot: 'bg-sky-500',
          label: t('Event Reminder', 'अनुस्मारक सूचना'),
          labelHi: 'अनुस्मारक सूचना'
        };
    }
  };

  return (
    <div className={`bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden ${
      embeddedInDashboard ? '' : 'p-6'
    }`}>
      
      {/* Top Header & Principal Action Bar */}
      <div className={`border-b border-slate-100 dark:border-slate-800 ${
        embeddedInDashboard ? 'p-4 sm:p-5' : 'pb-5 mb-6'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Title & Session Info */}
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <CalendarIcon className="w-4 h-4" />
              </div>
              <h2 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <span>{t('Academic Calendar & School Schedule', 'अकादमिक कैलेंडर एवं अवकाश समय-सारणी')}</span>
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {t(
                'Principal administrative portal to set school holidays, examination date-sheets, and event reminders in grid view.',
                'प्राचार्य प्रशासनिक पैनल: स्कूल अवकाश, परीक्षा तिथियां एवं कार्यक्रम अनुस्मारक निर्धारित करें।'
              )}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Principal Add Button */}
            <button
              onClick={() => {
                setFormData({
                  title: '',
                  titleHindi: '',
                  type: 'holiday',
                  startDate: `${year}-${String(month + 1).padStart(2, '0')}-15`,
                  endDate: '',
                  targetAudience: 'All Students & Staff',
                  isSchoolClosed: true,
                  description: '',
                  sendImmediateNotice: false
                });
                setIsEditing(false);
                setSelectedEvent(null);
                setIsAddModalOpen(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
              title={t('Set School Holiday, Exam Date, or Event Reminder', 'नया अवकाश, परीक्षा तिथि या रिमाइंडर जोड़ें')}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t('Set Holiday / Exam / Event', 'अवकाश / परीक्षा / इवेंट जोड़ें')}</span>
            </button>

            {embeddedInDashboard && onNavigateToCalendar && (
              <button
                onClick={onNavigateToCalendar}
                className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition-colors cursor-pointer"
              >
                {t('Full Calendar View →', 'पूरा कैलेंडर देखें →')}
              </button>
            )}
          </div>

        </div>

        {/* Stats Strip & Month Controller */}
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Month Navigation */}
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <button
                onClick={handlePrevMonth}
                className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 font-extrabold text-sm text-slate-900 dark:text-white tabular-nums min-w-[130px] text-center">
                {language === 'hi' ? monthNamesHi[month] : monthNamesEn[month]} {year}
              </span>
              <button
                onClick={handleNextMonth}
                className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={handleToday}
              className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
            >
              {t('Current Term', 'वर्तमान सत्र')}
            </button>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl text-xs">
            <button
              onClick={() => setSelectedEventType('all')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                selectedEventType === 'all'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {t('All', 'सभी')} ({monthStats.total})
            </button>

            <button
              onClick={() => setSelectedEventType('holiday')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                selectedEventType === 'holiday'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-amber-700 dark:text-amber-300 hover:bg-amber-100/50'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              <span>{t('Holidays', 'अवकाश')}</span>
              <span className="tabular-nums font-mono opacity-80">({monthStats.holidays})</span>
            </button>

            <button
              onClick={() => setSelectedEventType('exam')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                selectedEventType === 'exam'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100/50'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              <span>{t('Exams', 'परीक्षा')}</span>
              <span className="tabular-nums font-mono opacity-80">({monthStats.exams})</span>
            </button>

            <button
              onClick={() => setSelectedEventType('event')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                selectedEventType === 'event'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100/50'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              <span>{t('Events', 'समारोह')}</span>
              <span className="tabular-nums font-mono opacity-80">({monthStats.events})</span>
            </button>

            <button
              onClick={() => setSelectedEventType('reminder')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                selectedEventType === 'reminder'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-sky-700 dark:text-sky-300 hover:bg-sky-100/50'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              <span>{t('Reminders', 'अनुस्मारक')}</span>
              <span className="tabular-nums font-mono opacity-80">({monthStats.reminders})</span>
            </button>
          </div>

        </div>

      </div>

      {/* Main Calendar Grid View */}
      <div className={embeddedInDashboard ? 'p-4 sm:p-5' : 'p-0'}>
        
        {/* Day of Week Headers */}
        <div className="grid grid-cols-7 gap-px bg-slate-200 dark:bg-slate-800 rounded-t-xl overflow-hidden text-center text-xs font-bold">
          {daysOfWeekEn.map((day, idx) => {
            const isSunday = idx === 0;
            return (
              <div 
                key={day} 
                className={`py-2 px-1 bg-slate-50 dark:bg-slate-850 ${
                  isSunday ? 'text-rose-600 dark:text-rose-400 font-extrabold' : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                <span>{language === 'hi' ? daysOfWeekHi[idx] : day}</span>
              </div>
            );
          })}
        </div>

        {/* Calendar Days Matrix */}
        <div className="grid grid-cols-7 gap-px bg-slate-200 dark:bg-slate-800 border-x border-b border-slate-200 dark:border-slate-800 rounded-b-xl overflow-hidden">
          
          {/* Previous month filler cells */}
          {Array.from({ length: firstDayOfMonth }).map((_, i) => {
            const prevMonthDay = daysInPrevMonth - firstDayOfMonth + i + 1;
            return (
              <div 
                key={`prev-${i}`} 
                className="bg-slate-50/50 dark:bg-slate-900/40 min-h-[85px] sm:min-h-[105px] p-1.5 opacity-40 select-none"
              >
                <span className="text-xs text-slate-400 tabular-nums">{prevMonthDay}</span>
              </div>
            );
          })}

          {/* Current month days */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            const dayEvents = getEventsForDate(dateStr);
            const isToday = dateStr === new Date().toISOString().slice(0, 10);
            const dayOfWeek = (firstDayOfMonth + i) % 7;
            const isSunday = dayOfWeek === 0;

            return (
              <div
                key={dateStr}
                onClick={() => handleOpenAddForDate(dateStr)}
                className={`group relative bg-white dark:bg-slate-900 min-h-[90px] sm:min-h-[110px] p-1.5 sm:p-2 transition-colors hover:bg-slate-50/90 dark:hover:bg-slate-800/60 cursor-pointer flex flex-col justify-between ${
                  isToday ? 'ring-2 ring-indigo-500 ring-inset z-10' : ''
                }`}
                title={t(`Click to add event on ${dateStr}`, `${dateStr} पर नया कार्यक्रम जोड़ने के लिए क्लिक करें`)}
              >
                {/* Day Header */}
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold tabular-nums inline-flex items-center justify-center rounded-full w-5 h-5 ${
                    isToday 
                      ? 'bg-indigo-600 text-white shadow-xs' 
                      : isSunday 
                        ? 'text-rose-600 dark:text-rose-400 font-black' 
                        : 'text-slate-700 dark:text-slate-300'
                  }`}>
                    {dayNum}
                  </span>

                  {/* Add icon on hover for principal */}
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-0.5">
                    <Plus className="w-3 h-3" />
                  </span>
                </div>

                {/* Event Tags inside the cell */}
                <div className="mt-1 space-y-1 flex-1 overflow-hidden">
                  {dayEvents.slice(0, 2).map((ev) => {
                    const theme = getEventTypeTheme(ev.type);
                    return (
                      <div
                        key={ev.id}
                        onClick={(e) => handleEventClick(e, ev)}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-semibold border truncate transition-all hover:scale-102 shadow-2xs ${theme.bg} ${theme.text} ${theme.border}`}
                        title={`${ev.title} (${theme.label})`}
                      >
                        <span className="truncate block">
                          {language === 'hi' && ev.titleHindi ? ev.titleHindi : ev.title}
                        </span>
                      </div>
                    );
                  })}

                  {dayEvents.length > 2 && (
                    <div className="text-[9px] font-bold text-slate-500 dark:text-slate-400 pl-0.5">
                      +{dayEvents.length - 2} {t('more', 'और')}
                    </div>
                  )}
                </div>

                {/* Day status indicator if school is closed */}
                {dayEvents.some(e => e.isSchoolClosed) && (
                  <div className="mt-0.5 text-[9px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-tighter truncate">
                    • {t('Holiday / Closed', 'अवकाश')}
                  </div>
                )}
              </div>
            );
          })}

          {/* Next month filler cells to complete the 7-col grid */}
          {(() => {
            const totalCells = firstDayOfMonth + daysInMonth;
            const remaining = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
            return Array.from({ length: remaining }).map((_, i) => (
              <div 
                key={`next-${i}`} 
                className="bg-slate-50/50 dark:bg-slate-900/40 min-h-[85px] sm:min-h-[105px] p-1.5 opacity-40 select-none"
              >
                <span className="text-xs text-slate-400 tabular-nums">{i + 1}</span>
              </div>
            ));
          })()}

        </div>

      </div>

      {/* Upcoming Events Summary List Bar */}
      <div className={`border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 ${
        embeddedInDashboard ? 'p-4 sm:p-5' : 'p-5 mt-6'
      }`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Bookmark className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white uppercase tracking-wider">
              {t(`Highlights & Reminders: ${language === 'hi' ? monthNamesHi[month] : monthNamesEn[month]} ${year}`, `मुख्य कार्यक्रम एवं परीक्षा अनुस्मारक: ${monthNamesHi[month]} ${year}`)}
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-semibold tabular-nums">
            {currentMonthEvents.length} {t('Scheduled items', 'निर्धारित')}
          </span>
        </div>

        {currentMonthEvents.length === 0 ? (
          <div className="p-4 text-center rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-500">
            {t('No events or holidays set for this month yet. Click any day to add one!', 'इस महीने के लिए कोई अवकाश या कार्यक्रम नहीं है। जोड़ने के लिए किसी भी तारीख पर क्लिक करें!')}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {currentMonthEvents.slice(0, 6).map(ev => {
              const theme = getEventTypeTheme(ev.type);
              return (
                <div
                  key={ev.id}
                  onClick={(e) => handleEventClick(e, ev)}
                  className={`p-3 rounded-xl border bg-white dark:bg-slate-900 hover:border-indigo-400 dark:hover:border-indigo-600 transition-all cursor-pointer shadow-2xs group flex flex-col justify-between`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${theme.bg} ${theme.text} ${theme.border}`}>
                        {theme.label}
                      </span>
                      <span className="text-[11px] font-mono tabular-nums text-slate-500 dark:text-slate-400">
                        {ev.startDate}{ev.endDate ? ` → ${ev.endDate}` : ''}
                      </span>
                    </div>

                    <h4 className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
                      {language === 'hi' && ev.titleHindi ? ev.titleHindi : ev.title}
                    </h4>

                    {ev.description && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {ev.description}
                      </p>
                    )}
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                    <span className="truncate">Audience: <strong>{ev.targetAudience || 'All School'}</strong></span>
                    {ev.isSchoolClosed && (
                      <span className="font-bold text-rose-600 dark:text-rose-400 shrink-0">Closed</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ADD / EDIT EVENT MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <CalendarIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    {isEditing 
                      ? t('Edit Academic Calendar Event', 'कैलेंडर कार्यक्रम संपादित करें')
                      : t('Set School Holiday / Exam / Reminder', 'नया अवकाश, परीक्षा तिथि या रिमाइंडर निर्धारित करें')}
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    {t('Principal Authorized Action', 'प्राचार्य अधिकृत प्रशासनिक आदेश')}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-4">
              
              {/* Event Type Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {t('Event Classification *', 'प्रकार / श्रेणी *')}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'holiday' as CalendarEventType, label: t('Holiday', 'अवकाश'), icon: '🏖️' },
                    { id: 'exam' as CalendarEventType, label: t('Exam Date', 'परीक्षा तिथि'), icon: '📝' },
                    { id: 'event' as CalendarEventType, label: t('School Event', 'समारोह'), icon: '🚩' },
                    { id: 'reminder' as CalendarEventType, label: t('Reminder', 'अनुस्मारक'), icon: '🔔' }
                  ].map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setFormData({
                        ...formData,
                        type: cat.id,
                        isSchoolClosed: cat.id === 'holiday'
                      })}
                      className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                        formData.type === cat.id
                          ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold shadow-xs'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="text-base mb-0.5">{cat.icon}</div>
                      <span className="text-xs">{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Event Title (English) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('Event / Holiday Title (English) *', 'कार्यक्रम या अवकाश का नाम (अंग्रेज़ी) *')}
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Durga Puja Vacation, Class X Pre-Board Exam, Science Fair..."
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 outline-hidden font-medium"
                />
              </div>

              {/* Event Title (Hindi / Bodo) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('Title in Hindi / Regional Script (Optional)', 'शीर्षक हिंदी / क्षेत्रीय भाषा में (वैकल्पिक)')}
                </label>
                <input
                  type="text"
                  placeholder="उदा. दुर्गा पूजा अवकाश, प्री-बोर्ड गणित परीक्षा..."
                  value={formData.titleHindi}
                  onChange={(e) => setFormData({ ...formData, titleHindi: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 outline-hidden font-medium"
                />
              </div>

              {/* Dates Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t('Start Date *', 'प्रारंभ तिथि *')}
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono focus:ring-2 focus:ring-indigo-500 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t('End Date (For multi-day vacation)', 'अंतिम तिथि (यदि अवकाश कई दिनों का हो)')}
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    min={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono focus:ring-2 focus:ring-indigo-500 outline-hidden"
                  />
                </div>
              </div>

              {/* Target Audience Dropdown */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('Target Audience / Classes', 'संबद्ध कक्षा / लक्षित समूह')}
                </label>
                <select
                  value={formData.targetAudience}
                  onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 outline-hidden font-medium"
                >
                  <option value="All Students & Staff">All Students & Staff (संपूर्ण विद्यालय)</option>
                  <option value="Class KG to X">Class KG to X (कक्षा KG से X तक)</option>
                  <option value="Class IX to X">Class IX to X (Secondary Batches)</option>
                  <option value="Class I to V">Class I to V (Primary Wing)</option>
                  <option value="Class VI to VIII">Class VI to VIII (Middle Wing)</option>
                  <option value="Teachers & Faculty Only">Teachers & Faculty Only (केवल शिक्षक संकाय)</option>
                  <option value="Parents & Guardians">Parents & Guardians (अभिभावक)</option>
                  {SCHOOL_CLASSES.map(cls => (
                    <option key={cls} value={cls}>{cls} Specific</option>
                  ))}
                </select>
              </div>

              {/* School Closed Toggle */}
              <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <span className="font-bold text-xs text-slate-800 dark:text-slate-200 block">
                    {t('School Closed / Classes Suspended', 'विद्यालय अवकाश / कक्षाएं स्थगित')}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {t('Mark as non-working day on attendance register', 'हाज़िरी रजिस्टर में अवकाश के रूप में दर्ज होगा')}
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={formData.isSchoolClosed}
                  onChange={(e) => setFormData({ ...formData, isSchoolClosed: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 rounded-sm focus:ring-indigo-500"
                />
              </div>

              {/* Description / Circular Text */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('Description / Circular Instructions', 'विवरण / परिपत्र निर्देश')}
                </label>
                <textarea
                  rows={2}
                  placeholder="Add specific instructions, exam timings, dress code, syllabus covered, or office reopening date..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 outline-hidden font-medium"
                />
              </div>

              {/* Broadcast Alert Checkbox */}
              <div className="flex items-center gap-2 pt-1 text-xs">
                <input
                  type="checkbox"
                  id="broadcastCheck"
                  checked={formData.sendImmediateNotice}
                  onChange={(e) => setFormData({ ...formData, sendImmediateNotice: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 rounded-sm focus:ring-indigo-500"
                />
                <label htmlFor="broadcastCheck" className="text-slate-700 dark:text-slate-300 font-medium cursor-pointer">
                  {t('Send instant notification alert to all teachers and portal dashboards', 'सभी शिक्षकों एवं डैशबोर्ड पर तत्काल अलर्ट सूचना भेजें')}
                </label>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors"
                >
                  {t('Cancel', 'रद्द करें')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md transition-all active:scale-95"
                >
                  {isEditing ? t('Save Changes', 'बदलाव सुरक्षित करें') : t('Confirm & Set Event', 'कार्यक्रम निर्धारित करें')}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* EVENT DETAILS MODAL */}
      {isDetailModalOpen && selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-150">
            
            {(() => {
              const theme = getEventTypeTheme(selectedEvent.type);
              return (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${theme.bg} ${theme.text} ${theme.border}`}>
                      {theme.label}
                    </span>
                    <button
                      onClick={() => setIsDetailModalOpen(false)}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                      {selectedEvent.title}
                    </h3>
                    {selectedEvent.titleHindi && (
                      <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mt-0.5">
                        {selectedEvent.titleHindi}
                      </p>
                    )}
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">{t('Date:', 'तारीख:')}</span>
                      <strong className="font-mono text-slate-900 dark:text-slate-100">
                        {selectedEvent.startDate}
                        {selectedEvent.endDate ? ` to ${selectedEvent.endDate}` : ''}
                      </strong>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-500">{t('Applicable To:', 'लक्षित वर्ग:')}</span>
                      <strong className="text-slate-900 dark:text-slate-100">
                        {selectedEvent.targetAudience || 'All Students & Staff'}
                      </strong>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-500">{t('Campus Status:', 'कैंपस स्थिति:')}</span>
                      <strong className={selectedEvent.isSchoolClosed ? 'text-rose-600 font-bold' : 'text-emerald-600 font-bold'}>
                        {selectedEvent.isSchoolClosed ? 'School Closed (अवकाश)' : 'Classes Normal (कक्षाएं यथावत)'}
                      </strong>
                    </div>

                    {selectedEvent.createdBy && (
                      <div className="flex justify-between pt-1 border-t border-slate-200/60 dark:border-slate-700/60 text-[10px]">
                        <span className="text-slate-400">{t('Authorized By:', 'द्वारा अनुमोदित:')}</span>
                        <span className="text-slate-600 dark:text-slate-300 font-medium">{selectedEvent.createdBy}</span>
                      </div>
                    )}
                  </div>

                  {selectedEvent.description && (
                    <div>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        {t('Notice / Instructions:', 'निर्देश / परिपत्र:')}
                      </span>
                      <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800 leading-relaxed">
                        {selectedEvent.description}
                      </p>
                    </div>
                  )}

                  {/* Principal Actions */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <button
                      onClick={() => sendEventReminder(selectedEvent.id)}
                      className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-bold text-xs transition-colors flex items-center gap-1.5"
                      title={t('Send Reminder Notification to School', 'अनुस्मारक सूचना भेजें')}
                    >
                      <BellRing className="w-3.5 h-3.5" />
                      <span>{t('Send Reminder', 'रिमाइंडर भेजें')}</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditClick(selectedEvent)}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition-colors flex items-center gap-1"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>{t('Edit', 'संपादित')}</span>
                      </button>

                      <button
                        onClick={() => handleDelete(selectedEvent.id)}
                        className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 font-bold text-xs transition-colors flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>{t('Delete', 'हटाएं')}</span>
                      </button>
                    </div>
                  </div>

                </div>
              );
            })()}

          </div>
        </div>
      )}

    </div>
  );
};
