import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  Phone, 
  Mail, 
  Award, 
  CreditCard, 
  FileText, 
  Trash2, 
  Edit3, 
  X, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  Printer,
  Calendar,
  MapPin,
  Sparkles,
  Receipt,
  IndianRupee,
  Layers,
  Download,
  FileSpreadsheet,
  Upload,
  Camera
} from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';
import { Student, FeeTransaction, SCHOOL_CLASSES } from '../../types';
import { SchoolLogo } from '../common/SchoolLogo';

interface StudentManagementProps {
  onCollectFeeForStudent?: (student: Student) => void;
  initialOpenAddModal?: boolean;
  onClearInitialAddModal?: () => void;
  onNavigateToIdCards?: (studentId?: string) => void;
}

export const StudentManagement: React.FC<StudentManagementProps> = ({ 
  onCollectFeeForStudent,
  initialOpenAddModal,
  onClearInitialAddModal,
  onNavigateToIdCards
}) => {
  const { 
    students, 
    addStudent, 
    updateStudent, 
    deleteStudent, 
    sendFeeReminder, 
    openPrintDoc, 
    collectFee,
    currentUser,
    settings,
    t 
  } = useSchool();

  const [searchQuery, setSearchQuery] = useState('');
  const [classFilter, setClassFilter] = useState('all');
  const [feeStatusFilter, setFeeStatusFilter] = useState('all');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(!!initialOpenAddModal);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPdfExportModalOpen, setIsPdfExportModalOpen] = useState(false);

  // Export filtered students to CSV
  const exportFilteredStudentsCSV = () => {
    const headers = [
      'Roll No',
      'Admission No',
      'Student Name',
      'Class',
      'Section',
      'Gender',
      'Date of Birth',
      'Blood Group',
      'Parent Name',
      'Parent Phone',
      'Parent Email',
      'Address',
      'Attendance Rate (%)',
      'Total Annual Fees (INR)',
      'Paid Fees (INR)',
      'Pending Balance (INR)',
      'Fee Payment Status',
      'Latest Academic Score (%)',
      'Overall Grade'
    ];

    const rows = filteredStudents.map(st => {
      const rep = st.academicReports?.[0];
      return [
        st.rollNo,
        `"${st.admissionNo}"`,
        `"${st.name}"`,
        `"${st.grade}"`,
        `"${st.section}"`,
        `"${st.gender}"`,
        `"${st.dob}"`,
        `"${st.bloodGroup}"`,
        `"${st.parentName}"`,
        `"${st.parentPhone}"`,
        `"${st.parentEmail || ''}"`,
        `"${st.address.replace(/"/g, '""')}"`,
        st.attendancePercent,
        st.totalFees,
        st.paidFees,
        st.pendingFees,
        `"${st.feeStatus.toUpperCase()}"`,
        rep ? rep.percentage : '—',
        rep ? `"${rep.overallGrade}"` : '—'
      ];
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const classTag = classFilter !== 'all' ? classFilter.replace(/\s+/g, '_') : 'All_Classes';
    const statusTag = feeStatusFilter !== 'all' ? feeStatusFilter : 'All_Status';
    link.setAttribute('download', `Students_Roster_${classTag}_${statusTag}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Sync initialOpenAddModal
  React.useEffect(() => {
    if (initialOpenAddModal) {
      setIsAddModalOpen(true);
      if (onClearInitialAddModal) onClearInitialAddModal();
    }
  }, [initialOpenAddModal, onClearInitialAddModal]);

  // New Student Form State with Detailed Fee Heads
  const [formData, setFormData] = useState({
    admissionNo: '',
    rollNo: 1,
    name: '',
    grade: 'Class Nursery',
    section: 'A',
    gender: 'Male' as Student['gender'],
    dob: '2022-04-15',
    bloodGroup: 'B+',
    parentName: '',
    fatherName: '',
    motherName: '',
    photo: '',
    parentPhone: '+91 ',
    parentEmail: '',
    address: 'Khagrabari, Chirang, Assam',
    
    // Itemized School Fee Heads
    admissionFee: 3500,
    tuitionFee: 11000,
    festiveFee: 1000,
    bookFee: 2500,
    uniformFee: 2200,
    examFee: 1000,
    otherFee: 800,

    totalFees: 22000,
    paidFees: 11000,
    paymentMethod: 'Cash' as FeeTransaction['paymentMethod'],
    paymentNotes: 'Admission, Book Set & Uniform fee received at counter',
    
    attendancePercent: 96.0,
    status: 'active' as Student['status']
  });

  const classList = ['all', ...SCHOOL_CLASSES, 'Class 9', 'Class 10'];

  const filteredStudents = students.filter((st) => {
    const matchesSearch = 
      st.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      st.admissionNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (st.fatherName && st.fatherName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (st.motherName && st.motherName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      st.parentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      st.parentPhone.includes(searchQuery);
    
    const matchesClass = 
      classFilter === 'all' || 
      st.grade === classFilter ||
      (classFilter === 'Class IX' && st.grade === 'Class 9') ||
      (classFilter === 'Class 9' && st.grade === 'Class IX') ||
      (classFilter === 'Class X' && st.grade === 'Class 10') ||
      (classFilter === 'Class 10' && st.grade === 'Class X');

    const matchesFee = feeStatusFilter === 'all' || st.feeStatus === feeStatusFilter;
    return matchesSearch && matchesClass && matchesFee;
  });

  // Calculate live total fees based on itemized breakdown
  const computedTotalFees = 
    Number(formData.admissionFee || 0) +
    Number(formData.tuitionFee || 0) +
    Number(formData.festiveFee || 0) +
    Number(formData.bookFee || 0) +
    Number(formData.uniformFee || 0) +
    Number(formData.examFee || 0) +
    Number(formData.otherFee || 0);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const effectiveTotal = computedTotalFees > 0 ? computedTotalFees : Number(formData.totalFees);
    const pending = Math.max(0, effectiveTotal - Number(formData.paidFees));
    let feeStatus: Student['feeStatus'] = 'paid';
    if (pending === 0) feeStatus = 'paid';
    else if (formData.paidFees > 0) feeStatus = 'partial';
    else feeStatus = 'due';

    const finalParentName = formData.fatherName || formData.motherName 
      ? [formData.fatherName, formData.motherName].filter(Boolean).join(' & ') 
      : formData.parentName || 'Parent / Guardian';

    const newStudent = addStudent({
      admissionNo: formData.admissionNo || `ADM-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      rollNo: Number(formData.rollNo),
      name: formData.name,
      avatar: formData.photo || `https://images.unsplash.com/photo-${1510000000000 + Math.floor(Math.random() * 900000000)}?w=150&auto=format&fit=crop&q=80`,
      photo: formData.photo || undefined,
      grade: formData.grade,
      section: formData.section,
      gender: formData.gender,
      dob: formData.dob,
      bloodGroup: formData.bloodGroup,
      parentName: finalParentName,
      fatherName: formData.fatherName || undefined,
      motherName: formData.motherName || undefined,
      parentPhone: formData.parentPhone,
      parentEmail: formData.parentEmail,
      address: formData.address,
      attendancePercent: Number(formData.attendancePercent),
      feeStatus,
      totalFees: effectiveTotal,
      paidFees: Number(formData.paidFees),
      pendingFees: pending,
      feeBreakdown: {
        admissionFee: Number(formData.admissionFee || 0),
        tuitionFee: Number(formData.tuitionFee || 0),
        festiveFee: Number(formData.festiveFee || 0),
        bookFee: Number(formData.bookFee || 0),
        uniformFee: Number(formData.uniformFee || 0),
        examFee: Number(formData.examFee || 0),
        otherFee: Number(formData.otherFee || 0)
      },
      status: formData.status,
      enrollmentDate: new Date().toISOString().slice(0, 10)
    });

    // If initial payment was made during enrollment, issue official fee transaction & receipt
    if (Number(formData.paidFees) > 0) {
      const tx = collectFee({
        studentId: newStudent.id,
        studentName: newStudent.name,
        grade: newStudent.grade,
        section: newStudent.section,
        amount: Number(formData.paidFees),
        feeType: 'Admission Fee',
        paymentDate: new Date().toISOString().slice(0, 10),
        paymentMethod: formData.paymentMethod,
        status: 'paid',
        dueDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
        discount: 0,
        lateFine: 0,
        collectedBy: `${currentUser.name} (${currentUser.title})`,
        notes: formData.paymentNotes || 'Admission, Book Set, Uniform & Festive fee initial collection',
        feeBreakdown: {
          admissionFee: Number(formData.admissionFee || 0),
          tuitionFee: Number(formData.tuitionFee || 0),
          festiveFee: Number(formData.festiveFee || 0),
          bookFee: Number(formData.bookFee || 0),
          uniformFee: Number(formData.uniformFee || 0),
          examFee: Number(formData.examFee || 0),
          otherFee: Number(formData.otherFee || 0)
        }
      });

      // Prompt to print official receipt
      openPrintDoc('fee_receipt', tx);
    }

    setIsAddModalOpen(false);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;

    const effectiveTotal = computedTotalFees > 0 ? computedTotalFees : Number(formData.totalFees);
    const pending = Math.max(0, effectiveTotal - Number(formData.paidFees));
    let feeStatus: Student['feeStatus'] = 'paid';
    if (pending === 0) feeStatus = 'paid';
    else if (formData.paidFees > 0) feeStatus = 'partial';
    else feeStatus = 'due';

    const finalParentName = formData.fatherName || formData.motherName 
      ? [formData.fatherName, formData.motherName].filter(Boolean).join(' & ') 
      : formData.parentName || 'Parent / Guardian';

    updateStudent(selectedStudent.id, {
      name: formData.name,
      avatar: formData.photo || selectedStudent.avatar,
      photo: formData.photo || selectedStudent.photo,
      grade: formData.grade,
      section: formData.section,
      gender: formData.gender,
      dob: formData.dob,
      rollNo: Number(formData.rollNo),
      parentName: finalParentName,
      fatherName: formData.fatherName || undefined,
      motherName: formData.motherName || undefined,
      parentPhone: formData.parentPhone,
      parentEmail: formData.parentEmail,
      address: formData.address,
      bloodGroup: formData.bloodGroup,
      totalFees: effectiveTotal,
      paidFees: Number(formData.paidFees),
      pendingFees: pending,
      feeBreakdown: {
        admissionFee: Number(formData.admissionFee || 0),
        tuitionFee: Number(formData.tuitionFee || 0),
        festiveFee: Number(formData.festiveFee || 0),
        bookFee: Number(formData.bookFee || 0),
        uniformFee: Number(formData.uniformFee || 0),
        examFee: Number(formData.examFee || 0),
        otherFee: Number(formData.otherFee || 0)
      },
      feeStatus
    });

    setIsEditModalOpen(false);
    setSelectedStudent(null);
  };

  const openEdit = (st: Student) => {
    setSelectedStudent(st);
    setFormData({
      admissionNo: st.admissionNo,
      rollNo: st.rollNo,
      name: st.name,
      grade: st.grade,
      section: st.section,
      gender: st.gender,
      dob: st.dob,
      bloodGroup: st.bloodGroup,
      parentName: st.parentName,
      fatherName: st.fatherName || (st.parentName && !st.parentName.includes('&') ? st.parentName : ''),
      motherName: st.motherName || '',
      photo: st.photo || st.avatar || '',
      parentPhone: st.parentPhone,
      parentEmail: st.parentEmail,
      address: st.address,
      admissionFee: st.feeBreakdown?.admissionFee || 4000,
      tuitionFee: st.feeBreakdown?.tuitionFee || (st.totalFees > 15000 ? st.totalFees - 12000 : 14000),
      festiveFee: st.feeBreakdown?.festiveFee || 1200,
      bookFee: st.feeBreakdown?.bookFee || 3200,
      uniformFee: st.feeBreakdown?.uniformFee || 2600,
      examFee: st.feeBreakdown?.examFee || 1500,
      otherFee: st.feeBreakdown?.otherFee || 1000,
      totalFees: st.totalFees,
      paidFees: st.paidFees,
      paymentMethod: 'Cash',
      paymentNotes: 'Fee update / editing',
      attendancePercent: st.attendancePercent,
      status: st.status
    });
    setIsEditModalOpen(true);
  };

  const openReportCardPrint = (st: Student) => {
    const report = st.academicReports[0] || {
      term: 'Mid-Term Exam (2026)',
      examDate: '2026-09-15',
      subjects: [
        { subject: 'Mathematics', marksObtained: 88, maxMarks: 100, grade: 'A' },
        { subject: 'Science', marksObtained: 92, maxMarks: 100, grade: 'A+' },
        { subject: 'English', marksObtained: 85, maxMarks: 100, grade: 'A' },
        { subject: 'Social Studies', marksObtained: 80, maxMarks: 100, grade: 'A' },
        { subject: 'Hindi', marksObtained: 84, maxMarks: 100, grade: 'A' }
      ],
      totalObtained: 429,
      totalMax: 500,
      percentage: 85.8,
      overallGrade: 'A',
      classRank: 4,
      totalStudentsInClass: 35,
      attendanceInTerm: 95,
      generalConduct: 'Good'
    };

    openPrintDoc('report_card', { student: st, report });
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-violet-600" />
            {t('Student Roster & Academic Records', 'विद्यार्थी एवं शैक्षणिक रिकॉर्ड')}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {t('Manage student enrollments, fee payment balances, parent contacts, and progress report cards.', 'छात्रों के दाखिले, फीस बकाया, अभिभावक संपर्क एवं परीक्षा परिणाम का प्रबंधन करें।')}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* ID Card Generator */}
          {onNavigateToIdCards && (
            <button
              onClick={() => onNavigateToIdCards()}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-violet-50 dark:bg-violet-950/60 border border-violet-200 dark:border-violet-800 hover:bg-violet-100 dark:hover:bg-violet-900 text-violet-800 dark:text-violet-300 font-bold text-xs transition-colors cursor-pointer"
              title={t('Open Student ID Card Generator & Physical Card Printer', 'छात्र पहचान पत्र जनरेटर खोलें')}
            >
              <CreditCard className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
              <span>{t('ID Card Generator', 'पहचान पत्र जनरेटर')}</span>
            </button>
          )}

          {/* Export to CSV */}
          <button
            onClick={exportFilteredStudentsCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors cursor-pointer"
            title={t(`Download ${filteredStudents.length} filtered records as Excel CSV`, `${filteredStudents.length} फ़िल्टर किए गए रिकॉर्ड्स एक्सेल CSV में डाउनलोड करें`)}
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>{t('Export CSV', 'डाउनलोड CSV')}</span>
            <span className="text-[10px] text-slate-400 font-mono">({filteredStudents.length})</span>
          </button>

          {/* Export to PDF */}
          <button
            onClick={() => setIsPdfExportModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors cursor-pointer"
            title={t(`Print or Save PDF report for ${filteredStudents.length} filtered records`, `${filteredStudents.length} फ़िल्टर किए गए छात्रों की PDF रिपोर्ट बनाएं`)}
          >
            <Printer className="w-3.5 h-3.5 text-indigo-600" />
            <span>{t('Export PDF / Print', 'प्रिंट / PDF')}</span>
          </button>

          <button
            onClick={() => {
              setFormData({
                admissionNo: `ADM-2026-${Math.floor(1050 + students.length + 1)}`,
                rollNo: students.length + 1,
                name: '',
                grade: 'Class Nursery',
                section: 'A',
                gender: 'Male',
                dob: '2022-04-10',
                bloodGroup: 'B+',
                parentName: '',
                fatherName: '',
                motherName: '',
                photo: '',
                parentPhone: '+91 ',
                parentEmail: '',
                address: 'Khagrabari, Chirang, Assam',
                admissionFee: 3500,
                tuitionFee: 11000,
                festiveFee: 1000,
                bookFee: 2500,
                uniformFee: 2200,
                examFee: 1000,
                otherFee: 800,
                totalFees: 22000,
                paidFees: 11000,
                paymentMethod: 'Cash',
                paymentNotes: 'Admission, Book Set & Uniform fee received at counter',
                attendancePercent: 96.0,
                status: 'active'
              });
              setIsAddModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-violet-600/20 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t('Enroll New Student', 'नया विद्यार्थी दाखिला')}</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={t('Search student name, adm no, parent...', 'विद्यार्थी, दाखिला नंबर या अभिभावक खोजें...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-violet-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700"
          >
            {classList.map(cls => (
              <option key={cls} value={cls}>{cls === 'all' ? t('All Classes', 'सभी कक्षाएं') : cls}</option>
            ))}
          </select>

          <select
            value={feeStatusFilter}
            onChange={(e) => setFeeStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700"
          >
            <option value="all">{t('All Fee Status', 'सभी फीस स्थिति')}</option>
            <option value="paid">{t('Fees Fully Paid', 'पूर्ण भुगतान')}</option>
            <option value="partial">{t('Partially Paid', 'आंशिक भुगतान')}</option>
            <option value="overdue">{t('Overdue Dues', 'बकाया डिफ़ॉल्टर')}</option>
          </select>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase font-bold text-[10px] tracking-wider">
              <tr>
                <th className="p-4">{t('Student', 'विद्यार्थी')}</th>
                <th className="p-4">{t('Class & Roll', 'कक्षा एवं रोल')}</th>
                <th className="p-4">{t('Parent Contact', 'अभिभावक संपर्क')}</th>
                <th className="p-4">{t('Attendance', 'हाज़िरी %')}</th>
                <th className="p-4">{t('Fee Balance', 'फीस बकाया')}</th>
                <th className="p-4">{t('Academic Score', 'अंक / ग्रेड')}</th>
                <th className="p-4 text-right">{t('Action', 'कार्रवाई')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredStudents.map((st) => (
                <tr key={st.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                  
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img src={st.avatar} alt={st.name} className="w-9 h-9 rounded-xl object-cover" />
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white leading-tight">{st.name}</p>
                        <p className="text-[10px] font-mono text-slate-400">{st.admissionNo}</p>
                      </div>
                    </div>
                  </td>

                  <td className="p-4">
                    <span className="font-bold text-slate-800 dark:text-slate-200">{st.grade} - {st.section}</span>
                    <p className="text-[10px] text-slate-400">Roll #{st.rollNo}</p>
                  </td>

                  <td className="p-4">
                    <p className="font-semibold text-slate-800 dark:text-slate-200">{st.parentName}</p>
                    <p className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-slate-400" />
                      {st.parentPhone}
                    </p>
                  </td>

                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800 dark:text-slate-200">{st.attendancePercent}%</span>
                      <div className="w-12 bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            st.attendancePercent >= 90 ? 'bg-emerald-500' :
                            st.attendancePercent >= 75 ? 'bg-amber-500' : 'bg-rose-500'
                          }`}
                          style={{ width: `${st.attendancePercent}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  <td className="p-4">
                    <div>
                      {st.pendingFees === 0 ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {t('Cleared', 'चुकता')}
                        </span>
                      ) : (
                        <div>
                          <span className="font-extrabold text-rose-600 dark:text-rose-400">
                            ₹{st.pendingFees.toLocaleString('en-IN')}
                          </span>
                          <span className="text-[10px] text-slate-400 block">
                            paid ₹{st.paidFees.toLocaleString('en-IN')}
                          </span>
                        </div>
                      )}
                    </div>
                  </td>

                  <td className="p-4">
                    {st.academicReports[0] ? (
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {st.academicReports[0].percentage}%
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                          {st.academicReports[0].overallGrade}
                        </span>
                      </div>
                    ) : (
                      <span className="text-slate-400 text-[11px]">—</span>
                    )}
                  </td>

                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setSelectedStudent(st)}
                        className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold"
                      >
                        {t('Profile', 'प्रोफ़ाइल')}
                      </button>
                      
                      <button
                        onClick={() => openReportCardPrint(st)}
                        title="Print Progress Report Card"
                        className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40"
                      >
                        <Award className="w-4 h-4" />
                      </button>

                      {st.pendingFees > 0 && onCollectFeeForStudent && (
                        <button
                          onClick={() => onCollectFeeForStudent(st)}
                          title="Collect Pending Fee"
                          className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                        >
                          <CreditCard className="w-4 h-4" />
                        </button>
                      )}

                      <button
                        onClick={() => openEdit(st)}
                        title="Edit Student Profile"
                        className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student Profile Detail Modal */}
      {selectedStudent && !isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <img
                  src={selectedStudent.avatar}
                  alt={selectedStudent.name}
                  className="w-16 h-16 rounded-2xl object-cover ring-2 ring-violet-500/20"
                />
                <div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white leading-tight">
                    {selectedStudent.name}
                  </h3>
                  <p className="text-xs font-semibold text-violet-600 dark:text-violet-400">
                    {selectedStudent.grade} - Section {selectedStudent.section} (Roll #{selectedStudent.rollNo})
                  </p>
                  <p className="text-[11px] font-mono text-slate-400">
                    Admission No: {selectedStudent.admissionNo} • Blood: {selectedStudent.bloodGroup}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedStudent(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Parent contact & address */}
            <div className="mt-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">{t('Father / Guardian:', 'अभिभावक:')}</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{selectedStudent.parentName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">{t('Phone Number:', 'फ़ोन:')}</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedStudent.parentPhone}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">{t('Email:', 'ईमेल:')}</span>
                <span className="text-slate-700 dark:text-slate-300">{selectedStudent.parentEmail || '—'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">{t('Address:', 'पता:')}</span>
                <span className="text-slate-700 dark:text-slate-300 truncate max-w-[280px]">{selectedStudent.address}</span>
              </div>
            </div>

            {/* Fee summary banner */}
            <div className="mt-4 p-4 rounded-2xl bg-violet-50/50 dark:bg-violet-950/20 border border-violet-100 dark:border-violet-900/40">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-violet-900 dark:text-violet-300 uppercase tracking-wider">
                  {t('Fee Account Ledger', 'फीस लेज़र')}
                </span>
                {selectedStudent.pendingFees > 0 && (
                  <button
                    onClick={() => sendFeeReminder(selectedStudent.id)}
                    className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] flex items-center gap-1"
                  >
                    <span>{t('Send Alert SMS', 'SMS नोटिस भेजें')}</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="p-2 rounded-lg bg-white dark:bg-slate-800">
                  <span className="text-[10px] text-slate-400 block">{t('Total Dues', 'कुल फीस')}</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">₹{selectedStudent.totalFees.toLocaleString('en-IN')}</span>
                </div>
                <div className="p-2 rounded-lg bg-white dark:bg-slate-800">
                  <span className="text-[10px] text-slate-400 block">{t('Paid So Far', 'जमा की गई')}</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">₹{selectedStudent.paidFees.toLocaleString('en-IN')}</span>
                </div>
                <div className="p-2 rounded-lg bg-white dark:bg-slate-800">
                  <span className="text-[10px] text-slate-400 block">{t('Balance Due', 'बकाया शेष')}</span>
                  <span className="font-bold text-rose-600 dark:text-rose-400">₹{selectedStudent.pendingFees.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Itemized Fee Breakdown Tags if present */}
              {selectedStudent.feeBreakdown && (
                <div className="mt-3 pt-3 border-t border-violet-100 dark:border-violet-900/30">
                  <span className="text-[10px] font-bold text-violet-800 dark:text-violet-300 block mb-1.5 uppercase tracking-wider">
                    {t('Itemized Fee Heads', 'मदवार शुल्क संरचना')}:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-[11px]">
                    <div className="p-1.5 rounded-lg bg-white/80 dark:bg-slate-800/80 flex justify-between">
                      <span className="text-slate-500">Admission:</span>
                      <strong className="font-mono">₹{selectedStudent.feeBreakdown.admissionFee}</strong>
                    </div>
                    <div className="p-1.5 rounded-lg bg-white/80 dark:bg-slate-800/80 flex justify-between">
                      <span className="text-slate-500">Tuition:</span>
                      <strong className="font-mono">₹{selectedStudent.feeBreakdown.tuitionFee}</strong>
                    </div>
                    <div className="p-1.5 rounded-lg bg-white/80 dark:bg-slate-800/80 flex justify-between">
                      <span className="text-slate-500">Festive:</span>
                      <strong className="font-mono">₹{selectedStudent.feeBreakdown.festiveFee}</strong>
                    </div>
                    <div className="p-1.5 rounded-lg bg-white/80 dark:bg-slate-800/80 flex justify-between">
                      <span className="text-slate-500">Book Fee:</span>
                      <strong className="font-mono">₹{selectedStudent.feeBreakdown.bookFee}</strong>
                    </div>
                    <div className="p-1.5 rounded-lg bg-white/80 dark:bg-slate-800/80 flex justify-between">
                      <span className="text-slate-500">Uniform:</span>
                      <strong className="font-mono">₹{selectedStudent.feeBreakdown.uniformFee}</strong>
                    </div>
                    <div className="p-1.5 rounded-lg bg-white/80 dark:bg-slate-800/80 flex justify-between">
                      <span className="text-slate-500">Exam:</span>
                      <strong className="font-mono">₹{selectedStudent.feeBreakdown.examFee}</strong>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Academic marks table */}
            {selectedStudent.academicReports[0] && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {selectedStudent.academicReports[0].term}
                  </span>
                  <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400">
                    {selectedStudent.academicReports[0].percentage}% (Rank #{selectedStudent.academicReports[0].classRank})
                  </span>
                </div>

                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 dark:bg-slate-800 text-[10px] text-slate-500 font-bold uppercase">
                      <tr>
                        <th className="p-2.5">Subject</th>
                        <th className="p-2.5">Marks</th>
                        <th className="p-2.5">Max</th>
                        <th className="p-2.5">Grade</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {selectedStudent.academicReports[0].subjects.map((sub, i) => (
                        <tr key={i}>
                          <td className="p-2.5 font-medium">{sub.subject}</td>
                          <td className="p-2.5 font-bold text-slate-900 dark:text-white">{sub.marksObtained}</td>
                          <td className="p-2.5 text-slate-400">{sub.maxMarks}</td>
                          <td className="p-2.5 font-bold text-indigo-600 dark:text-indigo-400">{sub.grade}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <button
                onClick={() => {
                  deleteStudent(selectedStudent.id);
                  setSelectedStudent(null);
                }}
                className="px-3 py-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl text-xs font-bold flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>{t('Archive Profile', 'हटाएं')}</span>
              </button>

              <div className="flex gap-2">
                <button
                  onClick={() => openReportCardPrint(selectedStudent)}
                  className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
                >
                  <Award className="w-4 h-4" />
                  <span>{t('Print Report Card', 'रिपोर्ट कार्ड')}</span>
                </button>
                <button
                  onClick={() => openEdit(selectedStudent)}
                  className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold"
                >
                  {t('Edit', 'संपादित')}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Add / Edit Student Modal */}
      {(isAddModalOpen || isEditModalOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[92vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div className="flex items-center gap-3">
                <SchoolLogo className="w-10 h-10 rounded-full border-2 border-black bg-yellow-400 p-0.5 shadow-sm" />
                <div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white leading-tight">
                    {isEditModalOpen ? t('Edit Student Details', 'विद्यार्थी विवरण संपादित करें') : t('Enroll New Student', 'नया विद्यार्थी दाखिला')}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    {settings.schoolName} • {settings.academicYear}
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setIsEditModalOpen(false);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={isEditModalOpen ? handleEditSubmit : handleCreateSubmit} className="space-y-4 text-xs">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">{t('Student Full Name', 'विद्यार्थी का नाम')}</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Bwmwikhung Boro"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-violet-500 font-semibold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">{t('Admission Number', 'दाखिला संख्या')}</label>
                  <input
                    type="text"
                    required
                    value={formData.admissionNo}
                    onChange={(e) => setFormData({ ...formData, admissionNo: e.target.value })}
                    placeholder="ADM-2026-1055"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-violet-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {t('Class (KG to X)', 'कक्षा (KG से X तक)')}
                  </label>
                  <select
                    value={formData.grade}
                    onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-violet-700 dark:text-violet-300"
                  >
                    {SCHOOL_CLASSES.map((cls) => (
                      <option key={cls} value={cls}>{cls}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">{t('Section', 'सेक्शन')}</label>
                  <select
                    value={formData.section}
                    onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold"
                  >
                    <option value="A">Section A</option>
                    <option value="B">Section B</option>
                    <option value="C">Section C</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">{t('Roll No', 'रोल नंबर')}</label>
                  <input
                    type="number"
                    required
                    value={formData.rollNo}
                    onChange={(e) => setFormData({ ...formData, rollNo: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">{t('Parent / Guardian Name', 'अभिभावक का नाम')}</label>
                  <input
                    type="text"
                    required
                    value={formData.parentName}
                    onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                    placeholder="e.g. Rameshwar Boro"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">{t('Parent Mobile Phone', 'अभिभावक मोबाइल')}</label>
                  <input
                    type="text"
                    required
                    value={formData.parentPhone}
                    onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                    placeholder="+91 98640 12345"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">{t('Residential Address', 'घर का पता')}</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Khagrabari, P.O. Khagrabari, Chirang, Assam"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">{t('Blood Group', 'ब्लड ग्रुप')}</label>
                  <select
                    value={formData.bloodGroup}
                    onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
                  >
                    <option value="A+">A+</option>
                    <option value="B+">B+</option>
                    <option value="O+">O+</option>
                    <option value="AB+">AB+</option>
                    <option value="A-">A-</option>
                    <option value="B-">B-</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
              </div>

              {/* Itemized Fee Breakdown Structure */}
              <div className="p-4 bg-gradient-to-br from-slate-50 to-violet-50/40 dark:from-slate-800/60 dark:to-slate-900 rounded-2xl border border-violet-100 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Receipt className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                    <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                      {t('Fee Structure & Breakdown (शुल्क विवरण)', 'शुल्क संरचना व मदवार विवरण')}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono font-extrabold text-violet-700 dark:text-violet-300 px-2.5 py-0.5 rounded-full bg-violet-100 dark:bg-violet-950/70 border border-violet-200 dark:border-violet-800">
                    Total: ₹{computedTotalFees.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 block mb-0.5">
                      {t('Admission Fee', 'एडमिशन शुल्क')}
                    </label>
                    <div className="relative">
                      <span className="absolute left-2 top-2 text-slate-400 font-bold text-[10px]">₹</span>
                      <input
                        type="number"
                        value={formData.admissionFee}
                        onChange={(e) => setFormData({ ...formData, admissionFee: Number(e.target.value) })}
                        className="w-full pl-5 pr-2 py-1.5 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 font-bold text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 block mb-0.5">
                      {t('Tuition Fee', 'ट्यूशन शुल्क')}
                    </label>
                    <div className="relative">
                      <span className="absolute left-2 top-2 text-slate-400 font-bold text-[10px]">₹</span>
                      <input
                        type="number"
                        value={formData.tuitionFee}
                        onChange={(e) => setFormData({ ...formData, tuitionFee: Number(e.target.value) })}
                        className="w-full pl-5 pr-2 py-1.5 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 font-bold text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 block mb-0.5">
                      {t('Festive Fee', 'फेस्टिव / उत्सव शुल्क')}
                    </label>
                    <div className="relative">
                      <span className="absolute left-2 top-2 text-slate-400 font-bold text-[10px]">₹</span>
                      <input
                        type="number"
                        value={formData.festiveFee}
                        onChange={(e) => setFormData({ ...formData, festiveFee: Number(e.target.value) })}
                        className="w-full pl-5 pr-2 py-1.5 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 font-bold text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 block mb-0.5">
                      {t('Book Fee', 'किताब व सामग्री शुल्क')}
                    </label>
                    <div className="relative">
                      <span className="absolute left-2 top-2 text-slate-400 font-bold text-[10px]">₹</span>
                      <input
                        type="number"
                        value={formData.bookFee}
                        onChange={(e) => setFormData({ ...formData, bookFee: Number(e.target.value) })}
                        className="w-full pl-5 pr-2 py-1.5 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 font-bold text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 block mb-0.5">
                      {t('Uniform Fee', 'यूनिफॉर्म शुल्क')}
                    </label>
                    <div className="relative">
                      <span className="absolute left-2 top-2 text-slate-400 font-bold text-[10px]">₹</span>
                      <input
                        type="number"
                        value={formData.uniformFee}
                        onChange={(e) => setFormData({ ...formData, uniformFee: Number(e.target.value) })}
                        className="w-full pl-5 pr-2 py-1.5 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 font-bold text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 block mb-0.5">
                      {t('Exam Fee', 'परीक्षा शुल्क')}
                    </label>
                    <div className="relative">
                      <span className="absolute left-2 top-2 text-slate-400 font-bold text-[10px]">₹</span>
                      <input
                        type="number"
                        value={formData.examFee}
                        onChange={(e) => setFormData({ ...formData, examFee: Number(e.target.value) })}
                        className="w-full pl-5 pr-2 py-1.5 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 font-bold text-xs"
                      />
                    </div>
                  </div>

                  <div className="col-span-2">
                    <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 block mb-0.5">
                      {t('Development & Other Fee', 'विकास व अन्य गतिविधि शुल्क')}
                    </label>
                    <div className="relative">
                      <span className="absolute left-2 top-2 text-slate-400 font-bold text-[10px]">₹</span>
                      <input
                        type="number"
                        value={formData.otherFee}
                        onChange={(e) => setFormData({ ...formData, otherFee: Number(e.target.value) })}
                        className="w-full pl-5 pr-2 py-1.5 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 font-bold text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Initial Payment at counter */}
                <div className="pt-3 border-t border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                      {t('Initial Payment at Admission (दाखिले के समय जमा)', 'दाखिले के समय प्रारंभिक भुगतान')}
                    </span>
                    <div className="flex flex-wrap gap-1 text-[10px]">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, paidFees: computedTotalFees })}
                        className="px-2 py-0.5 rounded-md bg-emerald-100 hover:bg-emerald-200 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold"
                      >
                        100% Full (₹{computedTotalFees})
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, paidFees: formData.admissionFee + formData.bookFee + formData.uniformFee })}
                        className="px-2 py-0.5 rounded-md bg-violet-100 hover:bg-violet-200 text-violet-800 dark:bg-violet-950 dark:text-violet-300 font-bold"
                      >
                        Adm + Books + Uniform (₹{formData.admissionFee + formData.bookFee + formData.uniformFee})
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, paidFees: formData.admissionFee })}
                        className="px-2 py-0.5 rounded-md bg-sky-100 hover:bg-sky-200 text-sky-800 dark:bg-sky-950 dark:text-sky-300 font-bold"
                      >
                        Admission Only (₹{formData.admissionFee})
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, paidFees: 0 })}
                        className="px-2 py-0.5 rounded-md bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-slate-700 dark:text-slate-300 font-bold"
                      >
                        Pay Later (₹0)
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-slate-500 block mb-1 font-semibold">{t('Amount Paid (₹)', 'जमा राशि (₹)')}</label>
                      <input
                        type="number"
                        value={formData.paidFees}
                        onChange={(e) => setFormData({ ...formData, paidFees: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-black text-emerald-600 text-sm"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-500 block mb-1 font-semibold">{t('Payment Method', 'भुगतान माध्यम')}</label>
                      <select
                        value={formData.paymentMethod}
                        onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as any })}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-xs"
                      >
                        <option value="Cash">Cash at School Counter (नकद)</option>
                        <option value="UPI">UPI (Google Pay, PhonePe, Paytm)</option>
                        <option value="Net Banking">Net Banking / Bank Transfer</option>
                        <option value="Cheque">Bank Cheque / DD</option>
                        <option value="Debit/Credit Card">POS Debit / Credit Card</option>
                      </select>
                    </div>
                  </div>

                  {/* Summary Strip */}
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 grid grid-cols-3 gap-2 text-center text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Total Billed</span>
                      <strong className="text-slate-900 dark:text-white font-extrabold">₹{computedTotalFees.toLocaleString('en-IN')}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Paid Today</span>
                      <strong className="text-emerald-600 dark:text-emerald-400 font-extrabold">₹{formData.paidFees.toLocaleString('en-IN')}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Remaining Due</span>
                      <strong className="text-rose-600 dark:text-rose-400 font-extrabold">
                        ₹{Math.max(0, computedTotalFees - formData.paidFees).toLocaleString('en-IN')}
                      </strong>
                    </div>
                  </div>

                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setIsEditModalOpen(false);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 font-semibold"
                >
                  {t('Cancel', 'रद्द करें')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold shadow-md shadow-violet-600/20 flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isEditModalOpen ? t('Save Changes', 'बदलाव सहेजें') : t('Complete Admission & Print Receipt', 'दाखिला दर्ज करें व रसीद बनाएं')}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* 3. Export Filtered Students PDF / Print Preview Modal */}
      {isPdfExportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
          <div className="print-modal-container bg-white text-slate-900 rounded-3xl max-w-5xl w-full p-4 sm:p-8 shadow-2xl relative my-6 print:m-0 print:p-0 print:max-w-none print:shadow-none print:rounded-none">
            
            {/* Modal Toolbar (Hidden in print) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 mb-6 no-print">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <div>
                  <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                    <span>{t('Filtered Student Roster (Print / PDF Export)', 'फ़िल्टर किए गए छात्रों की सूची (प्रिंट / PDF)')}</span>
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {t(
                      `Showing ${filteredStudents.length} of ${students.length} students matching current filters`,
                      `कुल ${students.length} में से वर्तमान फ़िल्टर के ${filteredStudents.length} छात्र`
                    )}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={exportFilteredStudentsCSV}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                  title="Download matching rows as CSV spreadsheet"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{t('Download CSV', 'डाउनलोड CSV')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>{t('Print / Save PDF', 'प्रिंट / पीडीएफ सेव करें')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsPdfExportModalOpen(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Document Body */}
            <div className="printable-document space-y-4">
              
              {/* Official School Header */}
              <div className="text-center border-b pb-4">
                <SchoolLogo className="w-14 h-14 mx-auto mb-2 rounded-full border-2 border-black bg-yellow-400 p-0.5 shadow-md" />
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight uppercase">
                  {settings.schoolName}
                </h1>
                <p className="text-xs text-slate-600 mt-0.5">{settings.address}</p>
                <p className="text-[11px] text-slate-500 font-medium">
                  Affiliation No: <strong>{settings.affiliationNo}</strong> • School Code: <strong>{settings.schoolCode}</strong> • Academic Session: <strong>{settings.academicYear}</strong>
                </p>
                <div className="mt-2 inline-block px-3 py-0.5 bg-slate-100 border border-slate-300 rounded-full text-[11px] font-extrabold text-slate-800 uppercase tracking-wider">
                  Official Student Roster & Offline Audit Ledger
                </div>
              </div>

              {/* Filter Parameters & Summary Strip */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-700">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Class / Grade</span>
                  <span className="font-extrabold text-slate-900">{classFilter === 'all' ? 'All Classes' : classFilter}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Fee Status</span>
                  <span className="font-extrabold text-slate-900">{feeStatusFilter === 'all' ? 'All Statuses' : feeStatusFilter.toUpperCase()}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Search Query</span>
                  <span className="font-extrabold text-slate-900">{searchQuery ? `"${searchQuery}"` : 'None (All)'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Matched Records</span>
                  <span className="font-extrabold text-indigo-700">{filteredStudents.length} Students</span>
                </div>
              </div>

              {/* Financial Snapshot of Filtered Records */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs p-2 rounded-xl bg-slate-100/70 border border-slate-200">
                <div>
                  <span className="text-[10px] text-slate-500 block">Total Annual Billed</span>
                  <strong className="text-slate-900 font-bold">
                    ₹{filteredStudents.reduce((acc, s) => acc + s.totalFees, 0).toLocaleString('en-IN')}
                  </strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Total Collected</span>
                  <strong className="text-emerald-700 font-bold">
                    ₹{filteredStudents.reduce((acc, s) => acc + s.paidFees, 0).toLocaleString('en-IN')}
                  </strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Outstanding Dues</span>
                  <strong className="text-rose-700 font-bold">
                    ₹{filteredStudents.reduce((acc, s) => acc + s.pendingFees, 0).toLocaleString('en-IN')}
                  </strong>
                </div>
              </div>

              {/* Table of Records */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-slate-200 rounded-lg">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-200 text-[10px] uppercase font-extrabold text-slate-700">
                      <th className="p-2 text-center w-8">#</th>
                      <th className="p-2">Roll / Adm</th>
                      <th className="p-2">Student Name</th>
                      <th className="p-2">Class-Sec</th>
                      <th className="p-2">Parent / Contact</th>
                      <th className="p-2 text-center">Attd %</th>
                      <th className="p-2 text-right">Billed (₹)</th>
                      <th className="p-2 text-right">Paid (₹)</th>
                      <th className="p-2 text-right">Due (₹)</th>
                      <th className="p-2 text-center">Status</th>
                      <th className="p-2 text-center">Academics</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-[11px]">
                    {filteredStudents.length === 0 ? (
                      <tr>
                        <td colSpan={11} className="p-6 text-center text-slate-500 italic">
                          No student records match the selected filter criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredStudents.map((st, idx) => {
                        const rep = st.academicReports?.[0];
                        return (
                          <tr key={st.id} className="hover:bg-slate-50/80">
                            <td className="p-2 text-center font-mono text-slate-400">{idx + 1}</td>
                            <td className="p-2">
                              <span className="font-bold text-slate-900 block font-mono">#{st.rollNo}</span>
                              <span className="text-[9px] text-slate-500 font-mono">{st.admissionNo}</span>
                            </td>
                            <td className="p-2">
                              <span className="font-bold text-slate-900 block">{st.name}</span>
                              <span className="text-[9px] text-slate-500">{st.gender} • {st.bloodGroup}</span>
                            </td>
                            <td className="p-2 font-bold text-slate-700">
                              {st.grade} ({st.section})
                            </td>
                            <td className="p-2">
                              <span className="font-medium text-slate-900 block">{st.parentName}</span>
                              <span className="text-[10px] text-slate-500 font-mono">{st.parentPhone}</span>
                            </td>
                            <td className="p-2 text-center font-mono">
                              <span className={st.attendancePercent >= 75 ? 'text-emerald-700 font-bold' : 'text-rose-600 font-bold'}>
                                {st.attendancePercent}%
                              </span>
                            </td>
                            <td className="p-2 text-right font-mono text-slate-700">
                              ₹{st.totalFees.toLocaleString('en-IN')}
                            </td>
                            <td className="p-2 text-right font-mono text-emerald-700 font-bold">
                              ₹{st.paidFees.toLocaleString('en-IN')}
                            </td>
                            <td className="p-2 text-right font-mono font-bold">
                              <span className={st.pendingFees > 0 ? 'text-rose-600' : 'text-slate-400'}>
                                ₹{st.pendingFees.toLocaleString('en-IN')}
                              </span>
                            </td>
                            <td className="p-2 text-center">
                              <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                                st.feeStatus === 'paid' ? 'bg-emerald-100 text-emerald-800' :
                                st.feeStatus === 'partial' ? 'bg-amber-100 text-amber-800' :
                                'bg-rose-100 text-rose-800'
                              }`}>
                                {st.feeStatus}
                              </span>
                            </td>
                            <td className="p-2 text-center">
                              {rep ? (
                                <div>
                                  <span className="font-bold text-indigo-700">{rep.percentage}%</span>
                                  <span className="text-[9px] text-slate-500 block">Grade {rep.overallGrade}</span>
                                </div>
                              ) : (
                                <span className="text-slate-400 text-[10px]">—</span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Official Signatures & Seal */}
              <div className="pt-6 border-t border-slate-200 grid grid-cols-2 gap-8 text-xs">
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-semibold">Verification & Audit Note:</p>
                  <p className="text-[10px] text-slate-500 italic mt-0.5">
                    Official computer-generated record prepared for offline administrative documentation, regulatory audit, and student verification.
                  </p>
                  <div className="mt-8 border-t border-dashed border-slate-400 pt-1 text-slate-600">
                    <p className="font-bold">Prepared By / Class Teacher</p>
                    <p className="text-[10px] text-slate-400">Date: {new Date().toLocaleDateString('en-IN')}</p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="inline-block text-center mt-6">
                    <div className="w-24 h-24 border-2 border-dashed border-slate-300 rounded-full flex items-center justify-center mx-auto mb-1 text-[9px] text-slate-400 font-bold uppercase">
                      Official Seal
                    </div>
                    <div className="border-t border-slate-900 pt-1">
                      <p className="font-black text-slate-900">Mr. Rubungsa Boro</p>
                      <p className="text-[10px] text-slate-600 font-bold">Principal & Administrator</p>
                      <p className="text-[9px] text-slate-500">{settings.schoolName}</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};
