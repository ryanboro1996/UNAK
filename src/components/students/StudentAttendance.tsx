import React, { useState } from 'react';
import { 
  UserCheck, 
  Calendar, 
  Check, 
  X, 
  Save, 
  Download, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  Printer
} from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';
import { SCHOOL_CLASSES } from '../../types';
import { SchoolLogo } from '../common/SchoolLogo';

export const StudentAttendance: React.FC = () => {
  const { students, recordStudentAttendance, t, settings } = useSchool();

  const [selectedGrade, setSelectedGrade] = useState('Class 10');
  const [selectedSection, setSelectedSection] = useState('A');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().slice(0, 10));

  // Filter students in selected class & section
  const classStudents = students.filter(s => {
    const isMatchingGrade = 
      s.grade === selectedGrade ||
      (selectedGrade === 'Class IX' && s.grade === 'Class 9') ||
      (selectedGrade === 'Class 9' && s.grade === 'Class IX') ||
      (selectedGrade === 'Class X' && s.grade === 'Class 10') ||
      (selectedGrade === 'Class 10' && s.grade === 'Class X');
    return isMatchingGrade && s.section === selectedSection;
  });

  // Local attendance state for current date & class
  const [attendanceMap, setAttendanceMap] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    classStudents.forEach(s => {
      initial[s.id] = true; // default present
    });
    return initial;
  });

  const [isSaved, setIsSaved] = useState(false);

  const toggleStudent = (id: string) => {
    setAttendanceMap(prev => ({
      ...prev,
      [id]: prev[id] === undefined ? false : !prev[id]
    }));
    setIsSaved(false);
  };

  const markAll = (status: boolean) => {
    const updated: Record<string, boolean> = {};
    classStudents.forEach(s => {
      updated[s.id] = status;
    });
    setAttendanceMap(updated);
    setIsSaved(false);
  };

  const handleSave = () => {
    recordStudentAttendance(selectedGrade, selectedSection, attendanceMap);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const presentCount = classStudents.filter(s => attendanceMap[s.id] !== false).length;
  const absentCount = classStudents.length - presentCount;
  const attendancePercent = classStudents.length > 0 
    ? Math.round((presentCount / classStudents.length) * 100) 
    : 100;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-cyan-600" />
            {t('Daily Student Attendance Register', 'दैनिक छात्र उपस्थिति रजिस्टर')}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {t('Take roll-call attendance class-wise, calculate daily presence metrics, and sync parent SMS alerts.', 'कक्षा-वार उपस्थिति दर्ज करें एवं औसत हाज़िरी की गणना करें।')}
          </p>
        </div>

        <button
          onClick={handleSave}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-cyan-600/20 active:scale-95 transition-all"
        >
          {isSaved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          <span>{isSaved ? t('Saved Successfully!', 'दर्ज कर ली गई!') : t('Submit Attendance Register', 'हाज़िरी रजिस्टर सहेजें')}</span>
        </button>
      </div>

      {/* Class & Date Selector Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-4">
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">{t('Class:', 'कक्षा:')}</span>
            <select
              value={selectedGrade}
              onChange={(e) => {
                setSelectedGrade(e.target.value);
                setIsSaved(false);
              }}
              className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700"
            >
              {SCHOOL_CLASSES.map(cls => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
              <option value="Class 9">Class 9</option>
              <option value="Class 10">Class 10</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">{t('Section:', 'सेक्शन:')}</span>
            <select
              value={selectedSection}
              onChange={(e) => {
                setSelectedSection(e.target.value);
                setIsSaved(false);
              }}
              className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700"
            >
              <option value="A">Section A</option>
              <option value="B">Section B</option>
              <option value="Sci">Section Sci</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-cyan-500" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700"
            />
          </div>
        </div>

        {/* Quick Batch Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => markAll(true)}
            className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold hover:bg-emerald-100 transition-colors"
          >
            {t('All Present', 'सभी उपस्थित')}
          </button>
          <button
            onClick={() => markAll(false)}
            className="px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-xs font-bold hover:bg-rose-100 transition-colors"
          >
            {t('Clear All', 'हटाएं')}
          </button>
        </div>

      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
          <span className="text-slate-400 font-medium block">{t('Total in Register', 'कुल विद्यार्थी')}</span>
          <span className="text-xl font-extrabold text-slate-800 dark:text-slate-200 mt-1 block">{classStudents.length}</span>
        </div>
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
          <span className="text-slate-400 font-medium block">{t('Present Today', 'उपस्थित')}</span>
          <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1 block">{presentCount}</span>
        </div>
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
          <span className="text-slate-400 font-medium block">{t('Absent', 'अनुपस्थित')}</span>
          <span className="text-xl font-extrabold text-rose-600 dark:text-rose-400 mt-1 block">{absentCount}</span>
        </div>
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
          <span className="text-slate-400 font-medium block">{t('Attendance %', 'हाज़िरी प्रतिशत')}</span>
          <span className="text-xl font-extrabold text-cyan-600 dark:text-cyan-400 mt-1 block">{attendancePercent}%</span>
        </div>
      </div>

      {/* Student Roster Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase font-bold text-[10px] tracking-wider">
              <tr>
                <th className="p-4">{t('Roll', 'रोल')}</th>
                <th className="p-4">{t('Student Name', 'विद्यार्थी का नाम')}</th>
                <th className="p-4">{t('Parent Contact', 'अभिभावक फोन')}</th>
                <th className="p-4">{t('Annual Attendance %', 'वार्षिक औसत')}</th>
                <th className="p-4 text-center">{t('Status Toggle', 'स्थिति')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {classStudents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
                    {t('No students enrolled in this class & section yet.', 'इस कक्षा में कोई विद्यार्थी नहीं है।')}
                  </td>
                </tr>
              ) : (
                classStudents.map((st) => {
                  const isPresent = attendanceMap[st.id] !== false;

                  return (
                    <tr 
                      key={st.id} 
                      className={`transition-colors ${
                        isPresent ? 'hover:bg-slate-50/70 dark:hover:bg-slate-800/40' : 'bg-rose-50/20 dark:bg-rose-950/10'
                      }`}
                    >
                      <td className="p-4 font-mono font-bold text-slate-700 dark:text-slate-300">
                        #{st.rollNo}
                      </td>

                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img src={st.avatar} alt={st.name} className="w-8 h-8 rounded-xl object-cover" />
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white">{st.name}</p>
                            <p className="text-[10px] font-mono text-slate-400">{st.admissionNo}</p>
                          </div>
                        </div>
                      </td>

                      <td className="p-4 font-medium text-slate-600 dark:text-slate-300">
                        {st.parentPhone}
                      </td>

                      <td className="p-4">
                        <span className="font-bold text-slate-800 dark:text-slate-200">{st.attendancePercent}%</span>
                      </td>

                      <td className="p-4 text-center">
                        <button
                          onClick={() => toggleStudent(st.id)}
                          className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full font-bold text-xs transition-all active:scale-95 ${
                            isPresent
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-rose-600 text-white shadow-xs'
                          }`}
                        >
                          {isPresent ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                          <span>{isPresent ? t('Present', 'उपस्थित') : t('Absent', 'अनुपस्थित')}</span>
                        </button>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
