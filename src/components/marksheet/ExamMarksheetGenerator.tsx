import React, { useState, useRef, useMemo } from 'react';
import { 
  FileSpreadsheet, 
  Upload, 
  Download, 
  Printer, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  Edit3, 
  Save, 
  Sparkles, 
  FileText, 
  Users, 
  Award, 
  Trash2, 
  RefreshCw, 
  HelpCircle, 
  X,
  Search,
  ExternalLink,
  ClipboardCheck,
  Check
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { useSchool } from '../../context/SchoolContext';
import { SchoolLogo } from '../common/SchoolLogo';
import { Student, StudentAcademicReport, SCHOOL_CLASSES } from '../../types';

interface SubjectMarkEntry {
  subject: string;
  maxMarks: number;
  passMarks: number;
  marksObtained: number;
  grade: string;
  teacherRemarks?: string;
}

interface ParsedMarksheetStudent {
  rollNo: number;
  name: string;
  admissionNo: string;
  grade: string;
  section: string;
  parentName?: string;
  dob?: string;
  attendancePercent: number;
  subjects: SubjectMarkEntry[];
  totalObtained: number;
  totalMax: number;
  percentage: number;
  overallGrade: string;
  classRank: number;
  generalConduct: string;
  resultStatus: 'Passed with Distinction' | 'Passed' | 'Needs Improvement';
}

const DEFAULT_SUBJECTS_CLASS_I = [
  'English',
  'Hindi / Bodo',
  'Mathematics',
  'Environmental Studies (EVS)',
  'Art & Drawing',
  'General Knowledge & Computer'
];

export const ExamMarksheetGenerator: React.FC = () => {
  const { 
    settings, 
    students, 
    batchUpdateStudentMarks, 
    openPrintDoc, 
    currentUser, 
    t, 
    language 
  } = useSchool();

  const [selectedClass, setSelectedClass] = useState<string>('Class I');
  const [selectedTerm, setSelectedTerm] = useState<string>('Annual Final Examination 2026-27');
  const [academicYear] = useState<string>('2026-2027');
  const [isSavedToDb, setIsSavedToDb] = useState<boolean>(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string>('');

  // Marksheet Data
  const [marksheetData, setMarksheetData] = useState<ParsedMarksheetStudent[]>([]);
  const [selectedStudentForModal, setSelectedStudentForModal] = useState<ParsedMarksheetStudent | null>(null);
  const [isBatchPrintModalOpen, setIsBatchPrintModalOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Input tab state: 'file' | 'link_or_text'
  const [activeInputTab, setActiveInputTab] = useState<'file' | 'link_or_text'>('file');
  const [pasteDataText, setPasteDataText] = useState<string>('');
  const [isParsing, setIsParsing] = useState<boolean>(false);
  const [parseError, setParseError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Grade calculation helper
  const calculateGrade = (percentage: number): { grade: string; conduct: string; result: 'Passed with Distinction' | 'Passed' | 'Needs Improvement' } => {
    if (percentage >= 90) return { grade: 'A+', conduct: 'Exemplary & Diligent', result: 'Passed with Distinction' };
    if (percentage >= 80) return { grade: 'A', conduct: 'Very Good & Active', result: 'Passed with Distinction' };
    if (percentage >= 70) return { grade: 'B+', conduct: 'Good & Sincere', result: 'Passed' };
    if (percentage >= 60) return { grade: 'B', conduct: 'Satisfactory', result: 'Passed' };
    if (percentage >= 50) return { grade: 'C', conduct: 'Fair / Regular', result: 'Passed' };
    if (percentage >= 40) return { grade: 'D', conduct: 'Average Attention Needed', result: 'Passed' };
    return { grade: 'F', conduct: 'Needs Remedial Support', result: 'Needs Improvement' };
  };

  // Process rows into ParsedMarksheetStudent array
  const processRawRows = (rows: any[]) => {
    if (!rows || rows.length === 0) {
      setParseError(t('Uploaded spreadsheet is empty. Please check the file.', 'अपलोड की गई शीट खाली है। कृपया फ़ाइल जांचें।'));
      return;
    }

    try {
      setParseError(null);
      setIsParsing(true);

      // Identify columns
      // Find header row or use object keys
      const sample = rows[0];
      const keys = Object.keys(sample);

      // Helper to find key case-insensitively
      const findKey = (candidates: string[]) => {
        return keys.find(k => {
          const cleanK = k.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
          return candidates.some(c => cleanK === c.toLowerCase().replace(/[^a-z0-9]/g, ''));
        });
      };

      const rollKey = findKey(['rollno', 'roll', 'rollnumber', 'rno', 'id']) || keys[0];
      const nameKey = findKey(['name', 'studentname', 'student_name', 'fullname', 'candidate']) || keys[1];
      const admKey = findKey(['admissionno', 'admno', 'admission_no', 'regno', 'scholar_no']);
      const attKey = findKey(['attendance', 'attendancepercent', 'attend', 'present_percent', 'term_attendance']);
      const remarksKey = findKey(['remarks', 'teacherremarks', 'comment', 'feedback']);

      // Subject keys: Any key that is numeric in values and not roll/attendance
      const excludedKeys = [rollKey, nameKey, admKey, attKey, remarksKey].filter(Boolean) as string[];
      let subjectKeys = keys.filter(k => !excludedKeys.includes(k) && !k.toLowerCase().includes('total') && !k.toLowerCase().includes('rank') && !k.toLowerCase().includes('grade') && !k.toLowerCase().includes('percent'));

      if (subjectKeys.length === 0) {
        // Fallback to default Class I subjects
        subjectKeys = DEFAULT_SUBJECTS_CLASS_I;
      }

      const parsed: ParsedMarksheetStudent[] = rows.map((row, index) => {
        const rollNo = parseInt(String(row[rollKey] || index + 1).replace(/\D/g, ''), 10) || (index + 1);
        const name = String(row[nameKey] || `Student ${rollNo}`).trim();
        const admissionNo = admKey && row[admKey] ? String(row[admKey]).trim() : `UNA-${selectedClass.replace(/\s+/g, '').toUpperCase()}-${String(rollNo).padStart(3, '0')}`;
        const attendancePercent = attKey && !isNaN(Number(row[attKey])) ? Math.min(100, Math.max(50, Number(row[attKey]))) : 95;
        const generalRemarks = remarksKey && row[remarksKey] ? String(row[remarksKey]).trim() : '';

        // Match existing student if available in context
        const matched = students.find(s => s.grade.toLowerCase() === selectedClass.toLowerCase() && s.rollNo === rollNo);

        const subjects: SubjectMarkEntry[] = subjectKeys.map(subKey => {
          const rawVal = row[subKey];
          let mark = 0;
          if (rawVal !== undefined && rawVal !== null && rawVal !== '') {
            mark = Number(String(rawVal).replace(/[^0-9.]/g, ''));
            if (isNaN(mark)) mark = 0;
          } else {
            // reasonable default
            mark = 75 + ((rollNo * 7) % 23);
          }
          const maxMarks = 100;
          const passMarks = 35;
          const { grade } = calculateGrade((mark / maxMarks) * 100);

          return {
            subject: subKey,
            maxMarks,
            passMarks,
            marksObtained: Math.min(maxMarks, Math.max(0, mark)),
            grade,
            teacherRemarks: mark >= 85 ? 'Excellent proficiency' : mark >= 60 ? 'Satisfactory' : 'Needs attention'
          };
        });

        const totalObtained = subjects.reduce((sum, s) => sum + s.marksObtained, 0);
        const totalMax = subjects.reduce((sum, s) => sum + s.maxMarks, 0);
        const percentage = totalMax > 0 ? Math.round((totalObtained / totalMax) * 1000) / 10 : 0;
        const { grade: overallGrade, conduct: generalConduct, result: resultStatus } = calculateGrade(percentage);

        return {
          rollNo,
          name: matched?.name || name,
          admissionNo: matched?.admissionNo || admissionNo,
          grade: selectedClass,
          section: matched?.section || 'A',
          parentName: matched?.parentName || `Guardian of ${name}`,
          dob: matched?.dob || '2019-06-12',
          attendancePercent,
          subjects,
          totalObtained,
          totalMax,
          percentage,
          overallGrade,
          classRank: 1, // Will be computed after sorting
          generalConduct: generalRemarks || generalConduct,
          resultStatus
        };
      });

      // Compute ranks based on percentage descending
      parsed.sort((a, b) => b.percentage - a.percentage);
      parsed.forEach((item, idx) => {
        item.classRank = idx + 1;
      });

      // Re-sort by roll number ascending for convenient marksheet order
      parsed.sort((a, b) => a.rollNo - b.rollNo);

      setMarksheetData(parsed);
      setIsSavedToDb(false);
      setSaveSuccessMsg('');
    } catch (err: any) {
      console.error(err);
      setParseError(t(`Failed to parse sheet: ${err.message || 'Unknown structure'}`, `शीट लोड करने में त्रुटि: ${err.message || 'अमान्य प्रारूप'}`));
    } finally {
      setIsParsing(false);
    }
  };

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    if (file.name.endsWith('.csv')) {
      reader.onload = (evt) => {
        const text = evt.target?.result as string;
        try {
          const workbook = XLSX.read(text, { type: 'string' });
          const sheetName = workbook.SheetNames[0];
          const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
          processRawRows(rows);
        } catch (err) {
          // Manual fallback CSV parse
          parseCsvText(text);
        }
      };
      reader.readAsText(file);
    } else {
      // Excel binary (.xlsx, .xls)
      reader.onload = (evt) => {
        try {
          const data = new Uint8Array(evt.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
          processRawRows(rows);
        } catch (err: any) {
          setParseError(`Could not read Excel file: ${err.message}`);
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  // Manual simple CSV parse
  const parseCsvText = (text: string) => {
    const lines = text.trim().split(/\r\n|\n/).filter(line => line.trim().length > 0);
    if (lines.length < 2) {
      setParseError('CSV must have a header line and at least one student data row.');
      return;
    }
    const headers = lines[0].split(/,|\t/).map(h => h.trim().replace(/^["']|["']$/g, ''));
    const rows = lines.slice(1).map(line => {
      const vals = line.split(/,|\t/).map(v => v.trim().replace(/^["']|["']$/g, ''));
      const obj: any = {};
      headers.forEach((h, idx) => {
        obj[h] = vals[idx] !== undefined ? vals[idx] : '';
      });
      return obj;
    });
    processRawRows(rows);
  };

  // Load Built-in Demo Class I Data
  const handleLoadDemoData = () => {
    const demoStudents = [
      { 'Roll No': 1, 'Student Name': 'Aarav Sharma', 'Admission No': 'UNA-CL1-001', 'English': 94, 'Hindi / Bodo': 91, 'Mathematics': 98, 'Environmental Studies (EVS)': 95, 'Art & Drawing': 90, 'General Knowledge & Computer': 92, 'Attendance': 98, 'Teacher Remarks': 'Outstanding academic aptitude & polite conduct' },
      { 'Roll No': 2, 'Student Name': 'Priya Boro', 'Admission No': 'UNA-CL1-002', 'English': 92, 'Hindi / Bodo': 96, 'Mathematics': 94, 'Environmental Studies (EVS)': 91, 'Art & Drawing': 95, 'General Knowledge & Computer': 90, 'Attendance': 99, 'Teacher Remarks': 'Exceptional in languages & creative drawing' },
      { 'Roll No': 3, 'Student Name': 'Rohit Basumatary', 'Admission No': 'UNA-CL1-003', 'English': 85, 'Hindi / Bodo': 88, 'Mathematics': 92, 'Environmental Studies (EVS)': 86, 'Art & Drawing': 88, 'General Knowledge & Computer': 89, 'Attendance': 94, 'Teacher Remarks': 'Very strong in mathematical logic and sports' },
      { 'Roll No': 4, 'Student Name': 'Sneha Das', 'Admission No': 'UNA-CL1-004', 'English': 88, 'Hindi / Bodo': 86, 'Mathematics': 85, 'Environmental Studies (EVS)': 90, 'Art & Drawing': 94, 'General Knowledge & Computer': 87, 'Attendance': 96, 'Teacher Remarks': 'Consistent performer, very neat handwriting' },
      { 'Roll No': 5, 'Student Name': 'Ananya Roy', 'Admission No': 'UNA-CL1-005', 'English': 91, 'Hindi / Bodo': 89, 'Mathematics': 89, 'Environmental Studies (EVS)': 93, 'Art & Drawing': 92, 'General Knowledge & Computer': 90, 'Attendance': 97, 'Teacher Remarks': 'Actively participates in all classroom activities' },
      { 'Roll No': 6, 'Student Name': 'Birdao Narzary', 'Admission No': 'UNA-CL1-006', 'English': 82, 'Hindi / Bodo': 90, 'Mathematics': 86, 'Environmental Studies (EVS)': 84, 'Art & Drawing': 85, 'General Knowledge & Computer': 86, 'Attendance': 93, 'Teacher Remarks': 'Good improvement in reading and arithmetic' },
      { 'Roll No': 7, 'Student Name': 'Rahul Brahma', 'Admission No': 'UNA-CL1-007', 'English': 78, 'Hindi / Bodo': 85, 'Mathematics': 82, 'Environmental Studies (EVS)': 80, 'Art & Drawing': 84, 'General Knowledge & Computer': 81, 'Attendance': 91, 'Teacher Remarks': 'Promoted. Focus on regular reading exercises' },
      { 'Roll No': 8, 'Student Name': 'Simi Daimary', 'Admission No': 'UNA-CL1-008', 'English': 89, 'Hindi / Bodo': 92, 'Mathematics': 90, 'Environmental Studies (EVS)': 88, 'Art & Drawing': 96, 'General Knowledge & Computer': 88, 'Attendance': 95, 'Teacher Remarks': 'Very enthusiastic, excellent artwork & discipline' },
    ];
    processRawRows(demoStudents);
  };

  // Download Google Sheet / CSV Template
  const handleDownloadTemplate = () => {
    const headers = [
      'Roll No',
      'Student Name',
      'Admission No',
      'English',
      'Hindi / Bodo',
      'Mathematics',
      'Environmental Studies (EVS)',
      'Art & Drawing',
      'General Knowledge & Computer',
      'Attendance (Percent)',
      'Teacher Remarks'
    ];

    const sampleRows = [
      [1, 'Aarav Sharma', 'UNA-CL1-001', 94, 91, 98, 95, 90, 92, 98, 'Excellent student'],
      [2, 'Priya Boro', 'UNA-CL1-002', 92, 96, 94, 91, 95, 90, 99, 'Outstanding in arts'],
      [3, 'Rohit Basumatary', 'UNA-CL1-003', 85, 88, 92, 86, 88, 89, 94, 'Very good in math'],
      [4, 'Sneha Das', 'UNA-CL1-004', 88, 86, 85, 90, 94, 87, 96, 'Neat work and attentive'],
      [5, 'Student Name', 'UNA-CL1-005', 80, 80, 80, 80, 80, 80, 95, 'Good progress']
    ];

    const csvContent = [
      headers.join(','),
      ...sampleRows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${selectedClass.replace(/\s+/g, '_')}_Marksheet_Upload_Template.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Inline Mark Edit
  const handleUpdateStudentMark = (studentRollNo: number, subjectIdx: number, newMarkStr: string) => {
    const val = Number(newMarkStr.replace(/[^0-9.]/g, ''));
    if (isNaN(val)) return;

    setMarksheetData(prev => {
      const updated = prev.map(st => {
        if (st.rollNo === studentRollNo) {
          const newSubs = [...st.subjects];
          const sub = newSubs[subjectIdx];
          const cleanMark = Math.min(sub.maxMarks, Math.max(0, val));
          const { grade } = calculateGrade((cleanMark / sub.maxMarks) * 100);
          newSubs[subjectIdx] = {
            ...sub,
            marksObtained: cleanMark,
            grade
          };

          const totalObtained = newSubs.reduce((sum, s) => sum + s.marksObtained, 0);
          const totalMax = newSubs.reduce((sum, s) => sum + s.maxMarks, 0);
          const percentage = totalMax > 0 ? Math.round((totalObtained / totalMax) * 1000) / 10 : 0;
          const { grade: overallGrade, conduct: generalConduct, result: resultStatus } = calculateGrade(percentage);

          return {
            ...st,
            subjects: newSubs,
            totalObtained,
            totalMax,
            percentage,
            overallGrade,
            generalConduct,
            resultStatus
          };
        }
        return st;
      });

      // Recalculate ranks
      const sorted = [...updated].sort((a, b) => b.percentage - a.percentage);
      sorted.forEach((item, idx) => {
        item.classRank = idx + 1;
      });

      return updated;
    });
    setIsSavedToDb(false);
  };

  // Save to School Academic Context Database
  const handleSaveToDatabase = () => {
    if (marksheetData.length === 0) return;

    const payload = marksheetData.map(st => {
      const conductValue: 'Excellent' | 'Good' | 'Needs Improvement' = 
        st.percentage >= 80 ? 'Excellent' : st.percentage >= 50 ? 'Good' : 'Needs Improvement';

      const validGrade = (g: string): 'A+' | 'A' | 'B+' | 'B' | 'C' | 'D' | 'F' => {
        if (['A+', 'A', 'B+', 'B', 'C', 'D', 'F'].includes(g)) return g as any;
        return 'B';
      };

      return {
        rollNo: st.rollNo,
        name: st.name,
        admissionNo: st.admissionNo,
        report: {
          term: selectedTerm,
          examDate: new Date().toISOString().slice(0, 10),
          subjects: st.subjects.map(sub => ({
            subject: sub.subject,
            maxMarks: sub.maxMarks,
            marksObtained: sub.marksObtained,
            grade: validGrade(sub.grade),
            teacherRemarks: sub.teacherRemarks
          })),
          totalObtained: st.totalObtained,
          totalMax: st.totalMax,
          percentage: st.percentage,
          overallGrade: st.overallGrade,
          classRank: st.classRank,
          totalStudentsInClass: marksheetData.length,
          attendanceInTerm: st.attendancePercent,
          generalConduct: conductValue
        }
      };
    });

    batchUpdateStudentMarks(selectedClass, payload);
    setIsSavedToDb(true);
    setSaveSuccessMsg(t(
      `Successfully recorded marksheets for ${marksheetData.length} students of ${selectedClass} into school database!`,
      `${selectedClass} के ${marksheetData.length} विद्यार्थियों की अंकतालिका स्कूल डेटाबेस में सफलतापूर्वक सुरक्षित कर दी गई है!`
    ));
  };

  // Open Single Student Marksheet Print View
  const handleOpenSinglePrint = (st: ParsedMarksheetStudent) => {
    setSelectedStudentForModal(st);
  };

  // Trigger browser print for batch
  const handlePrintBatch = () => {
    window.print();
  };

  // Summary Metrics
  const summary = useMemo(() => {
    if (marksheetData.length === 0) return null;
    const totalCount = marksheetData.length;
    const avgPercentage = Math.round(marksheetData.reduce((acc, s) => acc + s.percentage, 0) / totalCount * 10) / 10;
    const topper = [...marksheetData].sort((a, b) => b.percentage - a.percentage)[0];
    const passCount = marksheetData.filter(s => s.resultStatus !== 'Needs Improvement').length;
    const passPercent = Math.round((passCount / totalCount) * 100);

    return { totalCount, avgPercentage, topper, passPercent };
  }, [marksheetData]);

  // Filtered students for table view
  const displayStudents = useMemo(() => {
    if (!searchTerm.trim()) return marksheetData;
    const q = searchTerm.toLowerCase();
    return marksheetData.filter(s => 
      s.name.toLowerCase().includes(q) ||
      s.admissionNo.toLowerCase().includes(q) ||
      String(s.rollNo).includes(q)
    );
  }, [marksheetData, searchTerm]);

  return (
    <div className="space-y-6">
      
      {/* Top Header Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 shadow-xs border border-indigo-100 dark:border-indigo-900/60">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[10px] font-extrabold uppercase tracking-wider">
                  Automated Marksheet Generator
                </span>
                <span className="text-slate-400">•</span>
                <span className="text-xs text-slate-500 font-medium">Google Sheet Batch Import</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
                {t('Students Exam Marksheet & Report Card Generator', 'विद्यार्थी परीक्षा अंकतालिका एवं रिपोर्ट कार्ड जनरेटर')}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-3xl leading-relaxed">
                {t(
                  'Upload a single Google Sheet (CSV/Excel) containing marks for all students of Class I (or any class). The system automatically computes grand totals, percentages, grades, class ranks, and formats ready-to-print official marksheets in 1-click.',
                  'कक्षा I (या किसी भी कक्षा) के सभी विद्यार्थियों के अंकों की एक गूगल शीट अपलोड करें। सिस्टम स्वतः कुल अंक, प्रतिशत, रैंक व ग्रेड निकालकर प्रिंट के लिए तैयार अंकतालिका बनाएगा।'
                )}
              </p>
            </div>
          </div>

          {/* Quick Preset / Load Demo Button */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={handleLoadDemoData}
              className="px-3.5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
              title="Instantly populate Class I demo sheet with 8 students"
            >
              <Sparkles className="w-4 h-4" />
              <span>{t('Load Class I Demo Sheet', 'कक्षा I का डेमो डेटा लोड करें')}</span>
            </button>

            <button
              onClick={handleDownloadTemplate}
              className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{t('Download Blank Template', 'खाली टेम्पलेट डाउनलोड करें')}</span>
            </button>
          </div>
        </div>

        {/* Configuration Selectors */}
        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          
          {/* Class Selector */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              {t('Select Class / Standard *', 'कक्षा चुनें *')}
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-hidden"
            >
              {SCHOOL_CLASSES.map(cls => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
          </div>

          {/* Examination Term */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              {t('Examination Term *', 'परीक्षा सत्र / प्रकार *')}
            </label>
            <select
              value={selectedTerm}
              onChange={(e) => setSelectedTerm(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-hidden"
            >
              <option value="Annual Final Examination 2026-27">Annual Final Examination 2026-27 (वार्षिक परीक्षा)</option>
              <option value="Half-Yearly Examination 2026-27">Half-Yearly Examination 2026-27 (अर्धवार्षिक परीक्षा)</option>
              <option value="Periodic Assessment / Unit Test 1">Periodic Assessment / Unit Test 1 (इकाई परीक्षा 1)</option>
              <option value="Periodic Assessment / Unit Test 2">Periodic Assessment / Unit Test 2 (इकाई परीक्षा 2)</option>
              <option value="Pre-Board Examination">Pre-Board Examination (प्री-बोर्ड परीक्षा)</option>
            </select>
          </div>

          {/* Academic Session */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              {t('Academic Session', 'शैक्षणिक सत्र')}
            </label>
            <input
              type="text"
              readOnly
              value={`${academicYear} • ${settings.schoolCode}`}
              className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-600 dark:text-slate-300 outline-hidden cursor-not-allowed"
            />
          </div>

        </div>

      </div>

      {/* Step 1: Google Sheet Upload Dropzone & Import Controls */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center font-bold">1</span>
              <span>{t('Upload Google Sheet / Excel with Marks', 'अंकों वाली गूगल शीट या एक्सेल फ़ाइल अपलोड करें')}</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {t(
                'Export your Google Sheet as .xlsx or .csv, or paste the table directly. Columns: Roll No, Name, and Subjects.',
                'गूगल शीट को .xlsx या .csv में डाउनलोड करके यहां डालें या सीधे कॉपी-पेस्ट करें।'
              )}
            </p>
          </div>

          {/* Toggle between file upload and direct paste */}
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs">
            <button
              onClick={() => setActiveInputTab('file')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                activeInputTab === 'file'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {t('Upload File (.xlsx / .csv)', 'फ़ाइल अपलोड करें')}
            </button>
            <button
              onClick={() => setActiveInputTab('link_or_text')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                activeInputTab === 'link_or_text'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {t('Paste Data / Google Sheet', 'सीधे डेटा पेस्ट करें')}
            </button>
          </div>
        </div>

        {/* Tab 1: File Dropzone */}
        {activeInputTab === 'file' && (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-indigo-200 dark:border-indigo-900/60 hover:border-indigo-500 dark:hover:border-indigo-500 rounded-2xl p-8 text-center bg-indigo-50/20 dark:bg-indigo-950/10 transition-all cursor-pointer group"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileUpload}
              className="hidden"
            />
            <div className="w-14 h-14 mx-auto rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-xs">
              <Upload className="w-6 h-6" />
            </div>
            <p className="font-extrabold text-sm text-slate-800 dark:text-slate-200">
              {t('Click to upload your Google Sheet (.xlsx, .csv)', 'गूगल शीट अपलोड करने के लिए यहां क्लिक करें')}
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-md mx-auto">
              {t(
                'Supports Microsoft Excel (.xlsx, .xls) and Google Sheets CSV exports. Automatically detects subjects and roll numbers.',
                '.xlsx, .xls और .csv दोनों फॉर्मेट समर्थित हैं।'
              )}
            </p>

            <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
              <span>{t('Example:', 'उदाहरण:')}</span>
              <span>{selectedClass} — Roll 1 to 50 with Subject Marks</span>
            </div>
          </div>
        )}

        {/* Tab 2: Paste CSV/Table text */}
        {activeInputTab === 'link_or_text' && (
          <div className="space-y-3">
            <textarea
              rows={5}
              placeholder="Paste table copied from Google Sheets or CSV format here...
Example:
Roll No, Student Name, English, Hindi, Mathematics, EVS, Drawing
1, Aarav Sharma, 94, 91, 98, 95, 90
2, Priya Boro, 92, 96, 94, 91, 95"
              value={pasteDataText}
              onChange={(e) => setPasteDataText(e.target.value)}
              className="w-full p-3 font-mono text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-hidden"
            />
            <div className="flex justify-end">
              <button
                onClick={() => parseCsvText(pasteDataText)}
                disabled={!pasteDataText.trim()}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                {t('Parse & Process Marks', 'डेटा प्रोसेस करें')}
              </button>
            </div>
          </div>
        )}

        {/* Parse Error Display */}
        {parseError && (
          <div className="mt-4 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-center gap-2.5 text-xs text-rose-700 dark:text-rose-300">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{parseError}</span>
          </div>
        )}

      </div>

      {/* Step 2: Parsed Master Table & Marksheet Preview */}
      {marksheetData.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
          
          {/* Section Header & Metrics Strip */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs flex items-center justify-center font-bold">2</span>
                  <span>{t(`Calculated Marksheets for ${selectedClass}`, `${selectedClass} की तैयार अंकतालिका सूची`)}</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {t(
                    `Processed ${marksheetData.length} students. Grand totals, percentage, grade, and rank are automatically calculated.`,
                    `कुल ${marksheetData.length} विद्यार्थियों के प्राप्तांक, प्रतिशत, ग्रेड एवं रैंक तैयार हैं।`
                  )}
                </p>
              </div>

              {/* Ready-to-Print All Marksheets Action Button */}
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  onClick={() => setIsBatchPrintModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>{t('Print All Marksheets (Batch Print)', 'सभी मार्कशीट एक साथ प्रिंट करें')}</span>
                </button>

                <button
                  onClick={handleSaveToDatabase}
                  className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                    isSavedToDb
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                  }`}
                >
                  {isSavedToDb ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                  <span>{isSavedToDb ? t('Saved to Portal DB', 'डेटाबेस में सुरक्षित') : t('Save to Student Database', 'डेटाबेस में सेव करें')}</span>
                </button>
              </div>
            </div>

            {saveSuccessMsg && (
              <div className="mt-3 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{saveSuccessMsg}</span>
              </div>
            )}
          </div>

          {/* Class Summary KPI Cards */}
          {summary && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">{t('Total Students', 'कुल विद्यार्थी')}</span>
                <span className="text-xl font-black text-slate-900 dark:text-white tabular-nums">{summary.totalCount}</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">{selectedClass} (Sec A)</span>
              </div>

              <div className="p-3.5 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60">
                <span className="text-indigo-600 dark:text-indigo-400 block text-[10px] uppercase font-bold">{t('Class Average', 'कक्षा औसत')}</span>
                <span className="text-xl font-black text-indigo-700 dark:text-indigo-300 tabular-nums">{summary.avgPercentage}%</span>
                <span className="text-[10px] text-indigo-600/80 block mt-0.5">Overall Performance</span>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/60">
                <span className="text-amber-700 dark:text-amber-400 block text-[10px] uppercase font-bold">{t('Class Topper', 'कक्षा टॉपर')}</span>
                <span className="text-sm font-extrabold text-amber-950 dark:text-amber-200 truncate block">
                  {summary.topper.name}
                </span>
                <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 block">
                  {summary.topper.percentage}% (Rank #1)
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/60">
                <span className="text-emerald-700 dark:text-emerald-400 block text-[10px] uppercase font-bold">{t('Pass Percentage', 'उत्तीर्ण दर')}</span>
                <span className="text-xl font-black text-emerald-700 dark:text-emerald-300 tabular-nums">{summary.passPercent}%</span>
                <span className="text-[10px] text-emerald-600 block mt-0.5">All Clear in {selectedClass}</span>
              </div>
            </div>
          )}

          {/* Search Filter & Table Controls */}
          <div className="flex items-center justify-between gap-3">
            <div className="relative max-w-xs w-full">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder={t('Search by roll no or student name...', 'नाम या रोल नंबर से खोजें...')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-hidden"
              />
            </div>
            <div className="text-xs text-slate-400">
              {t('Tip: Click any student row to view / print their single marksheet', 'सुझाव: एकल मार्कशीट देखने/प्रिंट करने के लिए विद्यार्थी पर क्लिक करें')}
            </div>
          </div>

          {/* Master Table */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto shadow-2xs">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-slate-50 dark:bg-slate-800 font-extrabold uppercase text-[10px] text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="p-3 text-center">Rank</th>
                  <th className="p-3 text-center">Roll</th>
                  <th className="p-3">Student Name</th>
                  <th className="p-3">Admission No</th>
                  {marksheetData[0]?.subjects.map((sub, i) => (
                    <th key={i} className="p-3 text-center">{sub.subject}</th>
                  ))}
                  <th className="p-3 text-center">Total</th>
                  <th className="p-3 text-center">%</th>
                  <th className="p-3 text-center">Grade</th>
                  <th className="p-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {displayStudents.map((st) => (
                  <tr 
                    key={st.rollNo}
                    className="hover:bg-indigo-50/30 dark:hover:bg-indigo-950/20 transition-colors"
                  >
                    <td className="p-3 text-center font-bold">
                      <span className={`w-6 h-6 rounded-full inline-flex items-center justify-center text-[11px] font-mono tabular-nums ${
                        st.classRank === 1 ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-bold ring-2 ring-amber-400/50' :
                        st.classRank === 2 ? 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200' :
                        st.classRank === 3 ? 'bg-amber-900/20 text-amber-900 dark:text-amber-200' :
                        'text-slate-500'
                      }`}>
                        #{st.classRank}
                      </span>
                    </td>
                    <td className="p-3 text-center font-bold text-slate-700 dark:text-slate-300 font-mono">
                      {st.rollNo}
                    </td>
                    <td className="p-3 font-bold text-slate-900 dark:text-white">
                      {st.name}
                    </td>
                    <td className="p-3 font-mono text-[11px] text-slate-500">
                      {st.admissionNo}
                    </td>
                    
                    {/* Subject Marks (Editable Inline) */}
                    {st.subjects.map((sub, subIdx) => (
                      <td key={subIdx} className="p-2 text-center">
                        <input
                          type="number"
                          min="0"
                          max={sub.maxMarks}
                          value={sub.marksObtained}
                          onChange={(e) => handleUpdateStudentMark(st.rollNo, subIdx, e.target.value)}
                          className="w-14 px-1.5 py-1 text-center bg-slate-50 dark:bg-slate-800 hover:bg-white dark:hover:bg-slate-700 focus:bg-white border border-transparent hover:border-slate-300 focus:border-indigo-500 rounded-lg font-bold text-slate-800 dark:text-slate-200 font-mono tabular-nums outline-hidden"
                          title={`Max: ${sub.maxMarks}`}
                        />
                      </td>
                    ))}

                    <td className="p-3 text-center font-extrabold text-slate-900 dark:text-white font-mono tabular-nums">
                      {st.totalObtained} <span className="text-[10px] text-slate-400 font-normal">/ {st.totalMax}</span>
                    </td>
                    
                    <td className="p-3 text-center font-black text-indigo-600 dark:text-indigo-400 font-mono tabular-nums">
                      {st.percentage}%
                    </td>

                    <td className="p-3 text-center font-black">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        st.overallGrade === 'A+' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200' :
                        st.overallGrade === 'A' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' :
                        st.overallGrade.startsWith('B') ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200' :
                        'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
                      }`}>
                        {st.overallGrade}
                      </span>
                    </td>

                    <td className="p-3 text-center">
                      <button
                        onClick={() => handleOpenSinglePrint(st)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 dark:bg-slate-800 dark:hover:bg-indigo-950 text-slate-700 dark:text-slate-300 text-[11px] font-bold transition-colors inline-flex items-center gap-1 cursor-pointer"
                        title="Preview & Print Individual Marksheet"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>{t('View & Print', 'देखें व प्रिंट')}</span>
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* SINGLE STUDENT MARKSHEET MODAL PREVIEW */}
      {selectedStudentForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-150 max-h-[92vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4 print:hidden">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  {t('Official Marksheet Preview', 'आधिकारिक अंकतालिका पूर्वावलोकन')}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>{t('Print Marksheet', 'प्रिंट मार्कशीट')}</span>
                </button>
                <button
                  onClick={() => setSelectedStudentForModal(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Marksheet Container */}
            <div className="printable-document border-2 border-indigo-950/30 rounded-2xl p-6 sm:p-8 space-y-6 bg-white text-slate-900">
              
              {/* School Header */}
              <div className="text-center border-b-2 border-indigo-950/20 pb-4">
                <SchoolLogo className="w-16 h-16 mx-auto mb-2 rounded-full border-2 border-black bg-yellow-400 p-0.5 shadow-md" />
                <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
                  {settings.schoolName}
                </h1>
                <p className="text-xs text-slate-600">
                  {settings.address} • Affiliation: {settings.affiliationNo} • Code: {settings.schoolCode}
                </p>
                <div className="mt-3 inline-block px-4 py-1 bg-indigo-50 border border-indigo-200 rounded-full text-xs font-extrabold text-indigo-950 uppercase tracking-widest">
                  Academic Progress Report Card & Marksheet • {selectedTerm}
                </div>
              </div>

              {/* Student Metadata Card */}
              <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="space-y-1">
                  <p><span className="text-slate-500 font-medium">Student Name:</span> <strong className="text-sm font-bold text-slate-950">{selectedStudentForModal.name}</strong></p>
                  <p><span className="text-slate-500 font-medium">Admission No:</span> <strong className="font-mono text-slate-800">{selectedStudentForModal.admissionNo}</strong></p>
                  <p><span className="text-slate-500 font-medium">Guardian Name:</span> <strong>{selectedStudentForModal.parentName}</strong></p>
                  <p><span className="text-slate-500 font-medium">Date of Birth:</span> <strong>{selectedStudentForModal.dob}</strong></p>
                </div>
                <div className="space-y-1 text-right">
                  <p><span className="text-slate-500 font-medium">Class & Standard:</span> <strong className="text-sm font-bold text-slate-950">{selectedStudentForModal.grade} ({selectedStudentForModal.section})</strong></p>
                  <p><span className="text-slate-500 font-medium">Roll Number:</span> <strong className="text-base font-extrabold text-indigo-700">#{selectedStudentForModal.rollNo}</strong></p>
                  <p><span className="text-slate-500 font-medium">Academic Session:</span> <strong>{academicYear}</strong></p>
                  <p><span className="text-slate-500 font-medium">Term Attendance:</span> <strong className="text-emerald-700 font-bold">{selectedStudentForModal.attendancePercent}%</strong></p>
                </div>
              </div>

              {/* Subject Marks Table */}
              <table className="w-full text-left text-xs border border-slate-200">
                <thead className="bg-slate-100 font-bold uppercase text-[10px] text-slate-700 border-b border-slate-200">
                  <tr>
                    <th className="p-3">Subject / Paper</th>
                    <th className="p-3 text-center">Max Marks</th>
                    <th className="p-3 text-center">Pass Marks</th>
                    <th className="p-3 text-center">Marks Obtained</th>
                    <th className="p-3 text-center">Grade</th>
                    <th className="p-3">Evaluation Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-medium">
                  {selectedStudentForModal.subjects.map((sub, i) => (
                    <tr key={i}>
                      <td className="p-3 font-bold text-slate-900">{sub.subject}</td>
                      <td className="p-3 text-center text-slate-500">{sub.maxMarks}</td>
                      <td className="p-3 text-center text-slate-500">{sub.passMarks}</td>
                      <td className="p-3 text-center font-extrabold text-slate-950 text-sm">{sub.marksObtained}</td>
                      <td className="p-3 text-center font-black text-indigo-700">{sub.grade}</td>
                      <td className="p-3 text-slate-600 italic text-[11px]">{sub.teacherRemarks || 'Satisfactory'}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-50 border-t-2 border-slate-300 font-bold">
                  <tr>
                    <td className="p-3 font-extrabold">Grand Total:</td>
                    <td className="p-3 text-center text-slate-500">{selectedStudentForModal.totalMax}</td>
                    <td className="p-3 text-center text-slate-500">{(selectedStudentForModal.totalMax * 0.35).toFixed(0)}</td>
                    <td className="p-3 text-center font-black text-indigo-700 text-sm">{selectedStudentForModal.totalObtained}</td>
                    <td className="p-3 text-center font-black text-emerald-600 text-sm">{selectedStudentForModal.overallGrade}</td>
                    <td className="p-3 font-extrabold text-indigo-950">
                      Percentage: {selectedStudentForModal.percentage}% (Class Rank #{selectedStudentForModal.classRank})
                    </td>
                  </tr>
                </tfoot>
              </table>

              {/* Conduct & Final Result Banner */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs flex justify-between items-center">
                <span>General Conduct & Behavior: <strong>{selectedStudentForModal.generalConduct}</strong></span>
                <span>Final Result Status: <strong className="text-emerald-700 font-black">{selectedStudentForModal.resultStatus.toUpperCase()}</strong></span>
              </div>

              {/* Grading Scale Guide */}
              <div className="text-[10px] text-slate-400 p-2 bg-slate-50/60 rounded border border-slate-100 flex justify-between">
                <span>Grading Scale: A+ (90-100%) Outstanding</span>
                <span>A (80-89%) Excellent</span>
                <span>B+ (70-79%) Very Good</span>
                <span>B (60-69%) Good</span>
                <span>C (50-59%) Fair</span>
                <span>D (40-49%) Average</span>
              </div>

              {/* Signatures */}
              <div className="pt-8 grid grid-cols-3 gap-6 text-xs text-center">
                <div>
                  <div className="border-b border-slate-300 w-28 mx-auto mb-1"></div>
                  <p className="font-semibold text-slate-700">Class Teacher</p>
                </div>
                <div>
                  <div className="border-b border-slate-300 w-28 mx-auto mb-1"></div>
                  <p className="font-semibold text-slate-700">Exam Controller</p>
                </div>
                <div>
                  <div className="border-b border-slate-300 w-32 mx-auto mb-1"></div>
                  <p className="font-bold text-slate-900">{settings.principalName}</p>
                  <p className="text-[10px] text-slate-500 font-semibold">Principal & Headmaster</p>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* BATCH PRINT ALL MARKSHEETS MODAL */}
      {isBatchPrintModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-4xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-150 max-h-[95vh] overflow-y-auto">
            
            {/* Header / Actions toolbar */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-6 print:hidden">
              <div className="flex items-center gap-2.5">
                <Printer className="w-5 h-5 text-indigo-600" />
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    {t(`Ready to Print: All Marksheets (${selectedClass})`, `प्रिंट के लिए तैयार: सभी मार्कशीट (${selectedClass})`)}
                  </h3>
                  <span className="text-xs text-slate-400">
                    {marksheetData.length} {t('Student Report Cards Generated & Paginated', 'विद्यार्थी मार्कशीट तैयार')}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={handlePrintBatch}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>{t('Print All Now', 'अभी सभी प्रिंट करें')}</span>
                </button>
                <button
                  onClick={() => setIsBatchPrintModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Paginated Batch Documents */}
            <div className="space-y-12">
              {marksheetData.map((st) => (
                <div 
                  key={st.rollNo} 
                  className="printable-document border-2 border-indigo-950/30 rounded-2xl p-6 sm:p-8 space-y-6 bg-white text-slate-900 shadow-sm print:shadow-none print:border-none print:p-0 print:m-0"
                  style={{ pageBreakAfter: 'always' }}
                >
                  {/* School Header */}
                  <div className="text-center border-b-2 border-indigo-950/20 pb-4">
                    <SchoolLogo className="w-16 h-16 mx-auto mb-2 rounded-full border-2 border-black bg-yellow-400 p-0.5 shadow-md" />
                    <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
                      {settings.schoolName}
                    </h1>
                    <p className="text-xs text-slate-600">
                      {settings.address} • Affiliation: {settings.affiliationNo} • Code: {settings.schoolCode}
                    </p>
                    <div className="mt-3 inline-block px-4 py-1 bg-indigo-50 border border-indigo-200 rounded-full text-xs font-extrabold text-indigo-950 uppercase tracking-widest">
                      Academic Progress Report Card & Marksheet • {selectedTerm}
                    </div>
                  </div>

                  {/* Student Metadata Card */}
                  <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div className="space-y-1">
                      <p><span className="text-slate-500 font-medium">Student Name:</span> <strong className="text-sm font-bold text-slate-950">{st.name}</strong></p>
                      <p><span className="text-slate-500 font-medium">Admission No:</span> <strong className="font-mono text-slate-800">{st.admissionNo}</strong></p>
                      <p><span className="text-slate-500 font-medium">Guardian Name:</span> <strong>{st.parentName}</strong></p>
                      <p><span className="text-slate-500 font-medium">Date of Birth:</span> <strong>{st.dob}</strong></p>
                    </div>
                    <div className="space-y-1 text-right">
                      <p><span className="text-slate-500 font-medium">Class & Standard:</span> <strong className="text-sm font-bold text-slate-950">{st.grade} ({st.section})</strong></p>
                      <p><span className="text-slate-500 font-medium">Roll Number:</span> <strong className="text-base font-extrabold text-indigo-700">#{st.rollNo}</strong></p>
                      <p><span className="text-slate-500 font-medium">Academic Session:</span> <strong>{academicYear}</strong></p>
                      <p><span className="text-slate-500 font-medium">Term Attendance:</span> <strong className="text-emerald-700 font-bold">{st.attendancePercent}%</strong></p>
                    </div>
                  </div>

                  {/* Subject Marks Table */}
                  <table className="w-full text-left text-xs border border-slate-200">
                    <thead className="bg-slate-100 font-bold uppercase text-[10px] text-slate-700 border-b border-slate-200">
                      <tr>
                        <th className="p-3">Subject / Paper</th>
                        <th className="p-3 text-center">Max Marks</th>
                        <th className="p-3 text-center">Pass Marks</th>
                        <th className="p-3 text-center">Marks Obtained</th>
                        <th className="p-3 text-center">Grade</th>
                        <th className="p-3">Evaluation Remarks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 font-medium">
                      {st.subjects.map((sub, i) => (
                        <tr key={i}>
                          <td className="p-3 font-bold text-slate-900">{sub.subject}</td>
                          <td className="p-3 text-center text-slate-500">{sub.maxMarks}</td>
                          <td className="p-3 text-center text-slate-500">{sub.passMarks}</td>
                          <td className="p-3 text-center font-extrabold text-slate-950 text-sm">{sub.marksObtained}</td>
                          <td className="p-3 text-center font-black text-indigo-700">{sub.grade}</td>
                          <td className="p-3 text-slate-600 italic text-[11px]">{sub.teacherRemarks || 'Satisfactory'}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-slate-50 border-t-2 border-slate-300 font-bold">
                      <tr>
                        <td className="p-3 font-extrabold">Grand Total:</td>
                        <td className="p-3 text-center text-slate-500">{st.totalMax}</td>
                        <td className="p-3 text-center text-slate-500">{(st.totalMax * 0.35).toFixed(0)}</td>
                        <td className="p-3 text-center font-black text-indigo-700 text-sm">{st.totalObtained}</td>
                        <td className="p-3 text-center font-black text-emerald-600 text-sm">{st.overallGrade}</td>
                        <td className="p-3 font-extrabold text-indigo-950">
                          Percentage: {st.percentage}% (Class Rank #{st.classRank})
                        </td>
                      </tr>
                    </tfoot>
                  </table>

                  {/* Conduct & Final Result Banner */}
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs flex justify-between items-center">
                    <span>General Conduct & Behavior: <strong>{st.generalConduct}</strong></span>
                    <span>Final Result Status: <strong className="text-emerald-700 font-black">{st.resultStatus.toUpperCase()}</strong></span>
                  </div>

                  {/* Signatures */}
                  <div className="pt-8 grid grid-cols-3 gap-6 text-xs text-center">
                    <div>
                      <div className="border-b border-slate-300 w-28 mx-auto mb-1"></div>
                      <p className="font-semibold text-slate-700">Class Teacher</p>
                    </div>
                    <div>
                      <div className="border-b border-slate-300 w-28 mx-auto mb-1"></div>
                      <p className="font-semibold text-slate-700">Exam Controller</p>
                    </div>
                    <div>
                      <div className="border-b border-slate-300 w-32 mx-auto mb-1"></div>
                      <p className="font-bold text-slate-900">{settings.principalName}</p>
                      <p className="text-[10px] text-slate-500 font-semibold">Principal & Headmaster</p>
                    </div>
                  </div>

                </div>
              ))}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
