import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Download, 
  Printer, 
  Filter, 
  CheckSquare, 
  Square, 
  Layers, 
  Sliders, 
  Eye,
  RefreshCw
} from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';
import { SCHOOL_CLASSES } from '../../types';

type EntityType = 'students' | 'teachers' | 'fees' | 'attendance' | 'payroll';

export const CustomReportBuilder: React.FC = () => {
  const { 
    students, 
    teachers, 
    feeTransactions, 
    teacherAttendance, 
    teacherSalaries, 
    t, 
    settings 
  } = useSchool();

  const [entity, setEntity] = useState<EntityType>('students');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Column definitions per entity
  const columnsConfig: Record<EntityType, { key: string; label: string }[]> = {
    students: [
      { key: 'admissionNo', label: 'Admission No' },
      { key: 'rollNo', label: 'Roll No' },
      { key: 'name', label: 'Student Name' },
      { key: 'grade', label: 'Class & Section' },
      { key: 'parentName', label: 'Parent Name' },
      { key: 'parentPhone', label: 'Parent Phone' },
      { key: 'attendancePercent', label: 'Attendance %' },
      { key: 'feeStatus', label: 'Fee Status' },
      { key: 'pendingFees', label: 'Pending Dues' },
    ],
    teachers: [
      { key: 'empId', label: 'Employee ID' },
      { key: 'name', label: 'Teacher Name' },
      { key: 'subject', label: 'Subject' },
      { key: 'department', label: 'Department' },
      { key: 'qualification', label: 'Qualification' },
      { key: 'status', label: 'Status' },
      { key: 'attendanceRate', label: 'Attendance %' },
      { key: 'netPay', label: 'Monthly Net Pay' },
    ],
    fees: [
      { key: 'receiptNo', label: 'Receipt No' },
      { key: 'studentName', label: 'Student Name' },
      { key: 'grade', label: 'Class' },
      { key: 'feeType', label: 'Fee Head' },
      { key: 'amount', label: 'Amount Paid' },
      { key: 'paymentDate', label: 'Date' },
      { key: 'paymentMethod', label: 'Payment Mode' },
      { key: 'status', label: 'Status' },
    ],
    attendance: [
      { key: 'date', label: 'Date' },
      { key: 'teacherName', label: 'Teacher Name' },
      { key: 'status', label: 'Presence Status' },
      { key: 'checkInTime', label: 'Check-In' },
      { key: 'remarks', label: 'Remarks' },
    ],
    payroll: [
      { key: 'slipNo', label: 'Slip Number' },
      { key: 'teacherName', label: 'Faculty' },
      { key: 'month', label: 'Month' },
      { key: 'basicPay', label: 'Basic' },
      { key: 'grossEarnings', label: 'Gross' },
      { key: 'totalDeductions', label: 'Deductions' },
      { key: 'netPayable', label: 'Net Payable' },
      { key: 'status', label: 'Status' },
    ]
  };

  const [selectedColumns, setSelectedColumns] = useState<string[]>(() => {
    return columnsConfig.students.map(c => c.key);
  });

  const handleEntityChange = (newEntity: EntityType) => {
    setEntity(newEntity);
    setSelectedColumns(columnsConfig[newEntity].map(c => c.key));
  };

  const toggleColumn = (key: string) => {
    if (selectedColumns.includes(key)) {
      if (selectedColumns.length > 1) {
        setSelectedColumns(selectedColumns.filter(c => c !== key));
      }
    } else {
      setSelectedColumns([...selectedColumns, key]);
    }
  };

  // Compile data based on current entity and filters
  const getProcessedData = () => {
    switch (entity) {
      case 'students':
        return students.filter(s => {
          const mClass = 
            selectedClass === 'all' || 
            s.grade === selectedClass ||
            (selectedClass === 'Class IX' && s.grade === 'Class 9') ||
            (selectedClass === 'Class 9' && s.grade === 'Class IX') ||
            (selectedClass === 'Class X' && s.grade === 'Class 10') ||
            (selectedClass === 'Class 10' && s.grade === 'Class X');
          const mStatus = statusFilter === 'all' || s.feeStatus === statusFilter;
          return mClass && mStatus;
        }).map(s => ({
          admissionNo: s.admissionNo,
          rollNo: s.rollNo,
          name: s.name,
          grade: `${s.grade}-${s.section}`,
          parentName: s.parentName,
          parentPhone: s.parentPhone,
          attendancePercent: `${s.attendancePercent}%`,
          feeStatus: s.feeStatus.toUpperCase(),
          pendingFees: `₹${s.pendingFees.toLocaleString('en-IN')}`,
        }));

      case 'teachers':
        return teachers.filter(t => {
          const mStatus = statusFilter === 'all' || t.status === statusFilter;
          return mStatus;
        }).map(t => ({
          empId: t.empId,
          name: t.name,
          subject: t.subject,
          department: t.department,
          qualification: t.qualification,
          status: t.status.toUpperCase(),
          attendanceRate: `${t.attendanceRate}%`,
          netPay: `₹${t.salary.netPay.toLocaleString('en-IN')}`
        }));

      case 'fees':
        return feeTransactions.filter(f => {
          const mStatus = statusFilter === 'all' || f.status === statusFilter;
          return mStatus;
        }).map(f => ({
          receiptNo: f.receiptNo,
          studentName: f.studentName,
          grade: `${f.grade}-${f.section}`,
          feeType: f.feeType,
          amount: `₹${f.amount.toLocaleString('en-IN')}`,
          paymentDate: f.paymentDate,
          paymentMethod: f.paymentMethod,
          status: f.status.toUpperCase()
        }));

      case 'attendance':
        return teacherAttendance.map(a => ({
          date: a.date,
          teacherName: a.teacherName,
          status: a.status.toUpperCase(),
          checkInTime: a.checkInTime || '—',
          remarks: a.remarks || 'Regular'
        }));

      case 'payroll':
        return teacherSalaries.map(p => ({
          slipNo: p.slipNo,
          teacherName: p.teacherName,
          month: `${p.month} ${p.year}`,
          basicPay: `₹${p.basicPay.toLocaleString('en-IN')}`,
          grossEarnings: `₹${p.grossEarnings.toLocaleString('en-IN')}`,
          totalDeductions: `₹${p.totalDeductions.toLocaleString('en-IN')}`,
          netPayable: `₹${p.netPayable.toLocaleString('en-IN')}`,
          status: p.status.toUpperCase()
        }));

      default:
        return [];
    }
  };

  const processedData = getProcessedData();

  const exportCSV = () => {
    const activeHeaders = columnsConfig[entity].filter(c => selectedColumns.includes(c.key));
    const headerRow = activeHeaders.map(c => `"${c.label}"`).join(',');
    const rows = processedData.map(row => {
      return activeHeaders.map(h => {
        const val = (row as any)[h.key] ?? '';
        return `"${val}"`;
      }).join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headerRow, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `School_Report_${entity}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const printReport = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-teal-600" />
            {t('Custom School Report Builder', 'कस्टम स्कूल रिपोर्ट टूल')}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {t('Generate custom filtered reports for any school entity, select columns, and export to CSV or print.', 'कस्टम रिपोर्ट तैयार करें, कॉलम चुनें, फ़िल्टर लगाएं एवं एक्सेल CSV में डाउनलोड करें।')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={printReport}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs"
          >
            <Printer className="w-4 h-4" />
            <span>{t('Print Report', 'प्रिंट रिपोर्ट')}</span>
          </button>

          <button
            onClick={exportCSV}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-teal-600/20 active:scale-95 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>{t('Export CSV Data', 'CSV डाउनलोड करें')}</span>
          </button>
        </div>
      </div>

      {/* Control Panel: Entity, Filters & Column Picker */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        
        {/* Step 1: Entity Selector */}
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
            {t('1. Select Module / Entity', '1. मॉड्यूल चुनें')}
          </label>
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'students', label: 'Students Roster', labelHi: 'विद्यार्थी रिकॉर्ड' },
              { id: 'teachers', label: 'Teachers & Faculty', labelHi: 'शिक्षक संकाय' },
              { id: 'fees', label: 'Fee Transactions', labelHi: 'शुल्क लेनदेन' },
              { id: 'attendance', label: 'Faculty Attendance', labelHi: 'शिक्षक हाज़िरी' },
              { id: 'payroll', label: 'Staff Payroll & Slips', labelHi: 'वेतन पर्ची' },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => handleEntityChange(item.id as EntityType)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  entity === item.id
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {t(item.label, item.labelHi)}
              </button>
            ))}
          </div>
        </div>

        {/* Step 2: Filter criteria */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-4">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            {t('2. Filter Criteria:', '2. फ़िल्टर:')}
          </span>

          {entity === 'students' && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-600 dark:text-slate-400">Class:</span>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-700"
              >
                <option value="all">All Classes</option>
                {SCHOOL_CLASSES.map(cls => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
                <option value="Class 9">Class 9</option>
                <option value="Class 10">Class 10</option>
              </select>
            </div>
          )}

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-600 dark:text-slate-400">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-700"
            >
              <option value="all">All Records</option>
              {entity === 'students' && (
                <>
                  <option value="paid">Fees Paid</option>
                  <option value="partial">Partially Paid</option>
                  <option value="overdue">Fee Overdue</option>
                </>
              )}
              {entity === 'teachers' && (
                <>
                  <option value="active">Active On Duty</option>
                  <option value="on_leave">On Approved Leave</option>
                </>
              )}
              {entity === 'fees' && (
                <>
                  <option value="paid">Cleared Receipts</option>
                  <option value="overdue">Pending Invoices</option>
                </>
              )}
            </select>
          </div>
        </div>

        {/* Step 3: Column Chooser */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
            {t('3. Select Output Columns:', '3. प्रदर्शित कॉलम चुनें:')}
          </span>
          <div className="flex flex-wrap gap-2">
            {columnsConfig[entity].map(col => {
              const isSelected = selectedColumns.includes(col.key);
              return (
                <button
                  key={col.key}
                  onClick={() => toggleColumn(col.key)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    isSelected
                      ? 'bg-teal-50 dark:bg-teal-950/40 border-teal-300 dark:border-teal-800 text-teal-700 dark:text-teal-300'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'
                  }`}
                >
                  {isSelected ? <CheckSquare className="w-3.5 h-3.5 text-teal-600" /> : <Square className="w-3.5 h-3.5 text-slate-400" />}
                  <span>{col.label}</span>
                </button>
              );
            })}
          </div>
        </div>

      </div>

      {/* Live Preview Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden printable-document">
        
        {/* Printable School Header (shows only when printing) */}
        <div className="hidden print:block p-6 border-b text-center">
          <h1 className="text-2xl font-bold">{settings.schoolName}</h1>
          <p className="text-xs text-slate-500">{settings.address} • Affiliation: {settings.affiliationNo}</p>
          <h2 className="text-base font-bold mt-2 uppercase tracking-wider underline">
            Official Report: {entity.toUpperCase()} ({new Date().toISOString().slice(0, 10)})
          </h2>
        </div>

        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-teal-500" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              {t('Live Report Preview', 'रिपोर्ट पूर्वावलोकन')}
            </h3>
          </div>
          <span className="text-xs font-bold text-teal-600 dark:text-teal-400">
            {processedData.length} records matching criteria
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase font-bold text-[10px] tracking-wider">
              <tr>
                {columnsConfig[entity]
                  .filter(c => selectedColumns.includes(c.key))
                  .map(col => (
                    <th key={col.key} className="p-4">{col.label}</th>
                  ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {processedData.length === 0 ? (
                <tr>
                  <td colSpan={selectedColumns.length} className="p-8 text-center text-slate-400">
                    {t('No records found matching the chosen filters.', 'कोई रिकॉर्ड नहीं मिला।')}
                  </td>
                </tr>
              ) : (
                processedData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                    {columnsConfig[entity]
                      .filter(c => selectedColumns.includes(c.key))
                      .map(col => (
                        <td key={col.key} className="p-4 font-medium text-slate-800 dark:text-slate-200">
                          {(row as any)[col.key] || '—'}
                        </td>
                      ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
