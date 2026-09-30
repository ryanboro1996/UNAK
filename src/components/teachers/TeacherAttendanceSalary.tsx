import React, { useState } from 'react';
import { 
  UserCheck, 
  WalletCards, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Printer, 
  Download, 
  Send, 
  AlertCircle, 
  Calendar,
  Check,
  Search,
  Filter,
  DollarSign
} from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';
import { TeacherAttendanceRecord, TeacherSalarySlip } from '../../types';

export const TeacherAttendanceSalary: React.FC = () => {
  const { 
    teachers, 
    teacherAttendance, 
    markTeacherAttendance, 
    teacherSalaries, 
    updateSalaryStatus, 
    openPrintDoc,
    t,
    settings
  } = useSchool();

  const [activeSubTab, setActiveSubTab] = useState<'attendance' | 'payroll'>('attendance');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [searchSalary, setSearchSalary] = useState('');
  const [payrollMonth, setPayrollMonth] = useState('September 2026');

  // Attendance metrics for selected date
  const recordsForDate = teacherAttendance.filter(r => r.date === selectedDate);
  const presentCount = recordsForDate.filter(r => r.status === 'present').length;
  const lateCount = recordsForDate.filter(r => r.status === 'late').length;
  const absentCount = recordsForDate.filter(r => r.status === 'absent' || r.status === 'half_day').length;

  const markAllTeachersPresent = () => {
    teachers.forEach(tch => {
      markTeacherAttendance(tch.id, 'present', 'On time');
    });
  };

  const exportPayrollCSV = () => {
    const headers = ['Slip No', 'Teacher Name', 'Emp ID', 'Department', 'Month', 'Gross Earnings', 'Deductions', 'Net Payable', 'Status', 'Payment Mode'];
    const rows = teacherSalaries.map(s => [
      s.slipNo,
      `"${s.teacherName}"`,
      s.empId,
      `"${s.department}"`,
      `${s.month} ${s.year}`,
      s.grossEarnings,
      s.totalDeductions,
      s.netPayable,
      s.status,
      s.paymentMode || 'N/A'
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Teacher_Payroll_Sheet_${payrollMonth.replace(' ', '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredSalaries = teacherSalaries.filter(s => 
    s.teacherName.toLowerCase().includes(searchSalary.toLowerCase()) ||
    s.empId.toLowerCase().includes(searchSalary.toLowerCase()) ||
    s.slipNo.toLowerCase().includes(searchSalary.toLowerCase())
  );

  const totalPayrollAmount = teacherSalaries.reduce((acc, s) => acc + s.netPayable, 0);
  const paidSalariesCount = teacherSalaries.filter(s => s.status === 'paid').length;

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <WalletCards className="w-6 h-6 text-emerald-600" />
            {t('Faculty Attendance & Payroll Center', 'शिक्षक उपस्थिति एवं वेतन केंद्र')}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {t('Mark daily faculty registers, calculate salary components, and print automated pay slips.', 'दैनिक शिक्षक हाज़िरी दर्ज करें एवं मासिक वेतन पर्ची जारी करें।')}
          </p>
        </div>

        {/* Tab Toggle buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl w-fit">
          <button
            onClick={() => setActiveSubTab('attendance')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeSubTab === 'attendance'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>{t('Daily Attendance Register', 'दैनिक उपस्थिति रजिस्टर')}</span>
          </button>
          <button
            onClick={() => setActiveSubTab('payroll')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeSubTab === 'payroll'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <WalletCards className="w-4 h-4" />
            <span>{t('Monthly Salary & Payroll', 'मासिक वेतन एवं पेरोल')}</span>
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: ATTENDANCE */}
      {activeSubTab === 'attendance' && (
        <div className="space-y-6">
          
          {/* Controls bar */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-500" />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{t('Date:', 'दिनांक:')}</span>
              </div>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Attendance Summary counters */}
            <div className="flex items-center gap-4 text-xs font-bold">
              <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                {t('Present:', 'उपस्थित:')} {presentCount} / {teachers.length}
              </span>
              <span className="text-amber-500 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                {t('Late:', 'देर से:')} {lateCount}
              </span>
              <span className="text-rose-500 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                {t('Absent/Leave:', 'अवकाश:')} {absentCount}
              </span>
            </div>

            <button
              onClick={markAllTeachersPresent}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs active:scale-95 transition-all flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{t('Mark All Present', 'सभी को उपस्थित करें')}</span>
            </button>
          </div>

          {/* Teacher Attendance Register Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase font-bold text-[10px] tracking-wider">
                  <tr>
                    <th className="p-4">{t('Teacher / Faculty', 'शिक्षक विवरण')}</th>
                    <th className="p-4">{t('Department & Subject', 'विभाग व विषय')}</th>
                    <th className="p-4">{t('Check-In Time', 'आगमन समय')}</th>
                    <th className="p-4">{t('Status', 'स्थिति')}</th>
                    <th className="p-4">{t('Quick Actions', 'कार्रवाई')}</th>
                    <th className="p-4">{t('Remarks / Notes', 'टिप्पणी')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {teachers.map((tch) => {
                    const record = teacherAttendance.find(r => r.teacherId === tch.id && r.date === selectedDate);
                    const currentStatus = record?.status || (tch.status === 'on_leave' ? 'absent' : 'present');

                    return (
                      <tr key={tch.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                        
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <img src={tch.avatar} alt={tch.name} className="w-9 h-9 rounded-xl object-cover" />
                            <div>
                              <p className="font-bold text-slate-900 dark:text-white leading-tight">{tch.name}</p>
                              <p className="text-[10px] font-mono text-slate-400">{tch.empId}</p>
                            </div>
                          </div>
                        </td>

                        <td className="p-4">
                          <p className="font-semibold text-slate-800 dark:text-slate-200">{tch.subject}</p>
                          <p className="text-[11px] text-slate-400">{tch.department}</p>
                        </td>

                        <td className="p-4">
                          <span className="font-mono text-slate-600 dark:text-slate-300 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {record?.checkInTime || (currentStatus === 'present' ? '07:45 AM' : '—')}
                          </span>
                        </td>

                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                            currentStatus === 'present' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' :
                            currentStatus === 'late' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' :
                            'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                          }`}>
                            {currentStatus === 'present' && <CheckCircle2 className="w-3 h-3" />}
                            {currentStatus === 'absent' && <XCircle className="w-3 h-3" />}
                            {currentStatus}
                          </span>
                        </td>

                        <td className="p-4">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => markTeacherAttendance(tch.id, 'present')}
                              title="Mark Present"
                              className={`p-1.5 rounded-lg font-bold text-xs transition-colors ${
                                currentStatus === 'present'
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-slate-100 dark:bg-slate-800 hover:bg-emerald-100 hover:text-emerald-700 text-slate-600'
                              }`}
                            >
                              P
                            </button>
                            <button
                              onClick={() => markTeacherAttendance(tch.id, 'late', 'Arrived after assembly')}
                              title="Mark Late"
                              className={`p-1.5 rounded-lg font-bold text-xs transition-colors ${
                                currentStatus === 'late'
                                  ? 'bg-amber-500 text-white'
                                  : 'bg-slate-100 dark:bg-slate-800 hover:bg-amber-100 hover:text-amber-700 text-slate-600'
                              }`}
                            >
                              L
                            </button>
                            <button
                              onClick={() => markTeacherAttendance(tch.id, 'absent', 'Approved Leave')}
                              title="Mark Absent / Leave"
                              className={`p-1.5 rounded-lg font-bold text-xs transition-colors ${
                                currentStatus === 'absent'
                                  ? 'bg-rose-600 text-white'
                                  : 'bg-slate-100 dark:bg-slate-800 hover:bg-rose-100 hover:text-rose-700 text-slate-600'
                              }`}
                            >
                              A
                            </button>
                          </div>
                        </td>

                        <td className="p-4 text-slate-500 dark:text-slate-400">
                          {record?.remarks || 'Regular schedule'}
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* SUB-TAB 2: PAYROLL */}
      {activeSubTab === 'payroll' && (
        <div className="space-y-6">
          
          {/* Payroll KPI Header */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('Total Monthly Payroll', 'कुल मासिक वेतन व्यय')}</span>
              <p className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white">
                ₹{totalPayrollAmount.toLocaleString('en-IN')}
              </p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
                {teacherSalaries.length} staff records
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('Disbursement Status', 'भुगतान स्थिति')}</span>
              <p className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white">
                {paidSalariesCount} / {teacherSalaries.length}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {Math.round((paidSalariesCount / Math.max(1, teacherSalaries.length)) * 100)}% {t('credited via NEFT', 'बैंक खाते में स्थानांतरित')}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-indigo-900 dark:text-indigo-300 uppercase tracking-wider">{t('Automated Payroll Slips', 'स्वचालित पेरोल शीट्स')}</span>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  {t('Export bank payment advisory or generate official school salary slips.', 'बैंक एडवाइजरी एवं आधिकारिक वेतन पर्ची बनाएं।')}
                </p>
              </div>
              <button
                onClick={exportPayrollCSV}
                className="mt-3 w-fit inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{t('Export CSV Sheet', 'CSV शीट डाउनलोड करें')}</span>
              </button>
            </div>

          </div>

          {/* Search & Month Filter */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder={t('Search by staff name, emp ID or slip no...', 'नाम, आईडी या पर्ची नंबर खोजें...')}
                value={searchSalary}
                onChange={(e) => setSearchSalary(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">{t('Cycle:', 'चक्र:')}</span>
              <select
                value={payrollMonth}
                onChange={(e) => setPayrollMonth(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
              >
                <option value="September 2026">September 2026</option>
                <option value="August 2026">August 2026</option>
                <option value="July 2026">July 2026</option>
              </select>
            </div>
          </div>

          {/* Salaries Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase font-bold text-[10px] tracking-wider">
                  <tr>
                    <th className="p-4">{t('Pay Slip No', 'पर्ची नंबर')}</th>
                    <th className="p-4">{t('Faculty Member', 'शिक्षक विवरण')}</th>
                    <th className="p-4">{t('Earnings (Basic + HRA + Allow)', 'कुल आय')}</th>
                    <th className="p-4">{t('Deductions (PF + Tax)', 'कटौती')}</th>
                    <th className="p-4">{t('Net Payable', 'शुद्ध देय राशि')}</th>
                    <th className="p-4">{t('Status', 'भुगतान स्थिति')}</th>
                    <th className="p-4 text-right">{t('Action', 'कार्रवाई')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredSalaries.map((slip) => (
                    <tr key={slip.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                      
                      <td className="p-4 font-mono font-bold text-slate-700 dark:text-slate-300">
                        {slip.slipNo}
                      </td>

                      <td className="p-4">
                        <p className="font-bold text-slate-900 dark:text-white leading-tight">{slip.teacherName}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{slip.empId} • {slip.department}</p>
                      </td>

                      <td className="p-4 font-semibold text-slate-700 dark:text-slate-300">
                        ₹{slip.grossEarnings.toLocaleString('en-IN')}
                      </td>

                      <td className="p-4 font-semibold text-rose-600 dark:text-rose-400">
                        -₹{slip.totalDeductions.toLocaleString('en-IN')}
                      </td>

                      <td className="p-4">
                        <span className="font-extrabold text-sm text-emerald-600 dark:text-emerald-400">
                          ₹{slip.netPayable.toLocaleString('en-IN')}
                        </span>
                      </td>

                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                          slip.status === 'paid' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' :
                          slip.status === 'processing' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' :
                          'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                        }`}>
                          {slip.status === 'paid' && <CheckCircle2 className="w-3 h-3" />}
                          {slip.status}
                        </span>
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {slip.status !== 'paid' && (
                            <button
                              onClick={() => updateSalaryStatus(slip.id, 'paid')}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition-colors"
                            >
                              {t('Disburse', 'भुगतान करें')}
                            </button>
                          )}
                          <button
                            onClick={() => openPrintDoc('salary_slip', slip)}
                            title="Print Official Salary Slip"
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
