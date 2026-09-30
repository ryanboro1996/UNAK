import React, { useState } from 'react';
import { 
  LineChart, 
  Award, 
  TrendingUp, 
  Sparkles, 
  BookOpen, 
  BarChart3, 
  Users, 
  PieChart, 
  CheckCircle,
  HelpCircle,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';
import { SCHOOL_CLASSES } from '../../types';

export const PerformanceAnalytics: React.FC = () => {
  const { students, teachers, t, openPrintDoc } = useSchool();
  const [selectedTerm, setSelectedTerm] = useState('Mid-Term Exam (2026)');

  // Calculate Toppers
  const sortedStudents = [...students].sort((a, b) => {
    const scA = a.academicReports[0]?.percentage || 0;
    const scB = b.academicReports[0]?.percentage || 0;
    return scB - scA;
  });

  const toppers = sortedStudents.slice(0, 5);

  // Class wise averages for all active school classes
  const activeClassList = Array.from(new Set([
    ...SCHOOL_CLASSES,
    ...students.map(s => s.grade)
  ])).filter(cls => students.some(s => 
    s.grade === cls || 
    (cls === 'Class IX' && s.grade === 'Class 9') || 
    (cls === 'Class X' && s.grade === 'Class 10')
  ));

  const displayClasses = activeClassList.length > 0 ? activeClassList : [...SCHOOL_CLASSES.slice(0, 5)];

  const classAverages = displayClasses.map(cls => {
    const matching = students.filter(s => 
      s.grade === cls || 
      (cls === 'Class IX' && s.grade === 'Class 9') || 
      (cls === 'Class X' && s.grade === 'Class 10')
    );
    if (matching.length === 0) return { grade: cls, avg: 0, count: 0, topper: 'N/A' };
    const totalMarks = matching.reduce((acc, s) => acc + (s.academicReports[0]?.percentage || 75), 0);
    const avg = Math.round((totalMarks / matching.length) * 10) / 10;
    const topSt = matching.sort((a, b) => (b.academicReports[0]?.percentage || 0) - (a.academicReports[0]?.percentage || 0))[0];
    return {
      grade: cls,
      avg,
      count: matching.length,
      topper: topSt ? `${topSt.name} (${topSt.academicReports[0]?.percentage || 0}%)` : 'N/A'
    };
  });

  // Grade distributions (A+, A, B, C, D)
  const gradeCounts = {
    'A+ (90-100%)': students.filter(s => (s.academicReports[0]?.percentage || 0) >= 90).length,
    'A (80-89%)': students.filter(s => {
      const p = s.academicReports[0]?.percentage || 0;
      return p >= 80 && p < 90;
    }).length,
    'B (70-79%)': students.filter(s => {
      const p = s.academicReports[0]?.percentage || 0;
      return p >= 70 && p < 80;
    }).length,
    'C (60-69%)': students.filter(s => {
      const p = s.academicReports[0]?.percentage || 0;
      return p >= 60 && p < 70;
    }).length,
    'Remedial (<60%)': students.filter(s => (s.academicReports[0]?.percentage || 0) < 60).length,
  };

  // Subject averages
  const subjectScores = [
    { subject: 'Mathematics', avg: 86.4, faculty: 'Mrs. Sunita Verma', trend: '+4.2%' },
    { subject: 'Physics & Chemistry', avg: 89.2, faculty: 'Dr. Anand Ramanathan', trend: '+6.1%' },
    { subject: 'Computer Science & AI', avg: 94.8, faculty: 'Mr. Pradeep Choudhary', trend: '+9.5%' },
    { subject: 'English Literature', avg: 88.6, faculty: 'Ms. Kavita Kulkarni', trend: '+3.0%' },
    { subject: 'Social Studies & History', avg: 81.2, faculty: 'Mr. Rakesh Pandey', trend: '+1.8%' },
  ];

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <LineChart className="w-6 h-6 text-pink-600" />
            {t('Student Performance & Examination Analytics', 'विद्यार्थी परीक्षा एवं प्रदर्शन विश्लेषण')}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {t('Deep academic metrics, toppers leaderboard, subject performance, and principal diagnostics.', 'परीक्षा परिणाम, मेधावी सूची, विषय-वार प्रदर्शन एवं प्रगति का सूक्ष्म विश्लेषण।')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedTerm}
            onChange={(e) => setSelectedTerm(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold shadow-xs text-slate-800 dark:text-slate-200"
          >
            <option value="Mid-Term Exam (2026)">Mid-Term Exam (2026)</option>
            <option value="Periodic Test 1 (2026)">Periodic Test 1 (2026)</option>
            <option value="Annual Board Prep (2026)">Annual Board Prep (2026)</option>
          </select>
        </div>
      </div>

      {/* AI Academic Diagnostics Card */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-indigo-500/10 border border-pink-500/20">
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-7 h-7 rounded-lg bg-pink-600 text-white flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
            {t('Principal Executive Academic Intelligence Brief', 'प्राचार्य शैक्षणिक समीक्षा एवं सुझाव')}
          </h3>
        </div>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          {t(
            'Overall school distinction rate stands at 75.0% for the Mid-Term session. Correlation analysis shows students with attendance > 92% scored an average 18% higher marks. Recommend scheduling remedial weekend problem-solving sessions for Class 10-B in Mathematics.',
            'इस अर्धवार्षिक परीक्षा में स्कूल का डिस्टिंक्शन प्रतिशत 75.0% रहा। विश्लेषण से पता चलता है कि 92% से अधिक हाज़िरी वाले छात्रों के अंक 18% बेहतर रहे हैं। कक्षा 10-B के लिए गणित विषय में उपचारात्मक कक्षाएं (Remedial Classes) आयोजित करने की अनुशंसा की जाती है।'
          )}
        </p>
      </div>

      {/* Top 5 Toppers Leaderboard */}
      <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              {t('School Academic Merit List (Top 5 Toppers)', 'स्कूल मेधावी सूची (शीर्ष 5 छात्र)')}
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-medium">{selectedTerm}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {toppers.map((st, idx) => (
            <div
              key={st.id}
              className={`p-4 rounded-2xl border flex flex-col items-center text-center transition-all ${
                idx === 0 
                  ? 'bg-amber-500/10 border-amber-500/30 ring-2 ring-amber-400/20' 
                  : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="relative mb-2">
                <img
                  src={st.avatar}
                  alt={st.name}
                  className="w-14 h-14 rounded-2xl object-cover ring-2 ring-indigo-500/30"
                />
                <span className={`absolute -bottom-2 -right-1 px-1.5 py-0.5 rounded-full text-[10px] font-extrabold text-white ${
                  idx === 0 ? 'bg-amber-500 shadow-md' : 'bg-slate-700'
                }`}>
                  #{idx + 1}
                </span>
              </div>

              <h4 className="font-bold text-xs text-slate-900 dark:text-white mt-1 line-clamp-1">{st.name}</h4>
              <p className="text-[10px] text-slate-400">{st.grade} ({st.section})</p>

              <div className="mt-3 w-full pt-2 border-t border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-xs">
                <span className="font-extrabold text-indigo-600 dark:text-indigo-400">
                  {st.academicReports[0]?.percentage || 90}%
                </span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                  {st.academicReports[0]?.overallGrade || 'A+'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Grid: Class Wise Performance & Grade Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Class Wise Averages */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              {t('Class-wise Academic Comparison', 'कक्षा-वार शैक्षणिक तुलना')}
            </h3>
            <span className="text-xs text-slate-400">Average %</span>
          </div>

          <div className="space-y-4">
            {classAverages.map((ca, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <span>{ca.grade} <span className="text-slate-400 font-normal">({ca.count} students)</span></span>
                  <span className="font-extrabold text-indigo-600 dark:text-indigo-400">{ca.avg}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-pink-500 transition-all duration-700" 
                    style={{ width: `${ca.avg}%` }}
                  />
                </div>
                <div className="text-[10px] text-slate-400 flex justify-between">
                  <span>Class Topper: <strong>{ca.topper}</strong></span>
                  <span>Target: 85%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Grade Distribution Bar */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              {t('Grade Distribution Spread', 'ग्रेड वितरण फैलाव')}
            </h3>
            <span className="text-xs text-slate-400">Total: {students.length} students</span>
          </div>

          <div className="space-y-3">
            {Object.entries(gradeCounts).map(([gradeLabel, count], idx) => {
              const pct = Math.round((count / Math.max(1, students.length)) * 100);
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <span>{gradeLabel}</span>
                    <span className="font-bold text-slate-900 dark:text-white">{count} ({pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        idx === 0 ? 'bg-emerald-500' :
                        idx === 1 ? 'bg-indigo-500' :
                        idx === 2 ? 'bg-blue-500' :
                        idx === 3 ? 'bg-amber-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Subject-Wise Performance Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">
            {t('Department & Subject-Wise Performance Overview', 'विषय एवं संकाय प्रदर्शन')}
          </h3>
          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> +4.9% overall growth
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase font-bold text-[10px] tracking-wider">
              <tr>
                <th className="p-4">{t('Subject Title', 'विषय')}</th>
                <th className="p-4">{t('Faculty In-Charge', 'प्रभारी शिक्षक')}</th>
                <th className="p-4">{t('Average Score', 'औसत अंक')}</th>
                <th className="p-4">{t('Trend vs Last Term', 'प्रगति')}</th>
                <th className="p-4">{t('Quality Rating', 'गुणवत्ता स्तर')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {subjectScores.map((sb, i) => (
                <tr key={i} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                  <td className="p-4 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-indigo-500" />
                    <span>{sb.subject}</span>
                  </td>
                  <td className="p-4 font-medium text-slate-700 dark:text-slate-300">
                    {sb.faculty}
                  </td>
                  <td className="p-4 font-extrabold text-sm text-indigo-600 dark:text-indigo-400">
                    {sb.avg}%
                  </td>
                  <td className="p-4 text-emerald-600 font-bold">
                    {sb.trend}
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                      Exemplary
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
