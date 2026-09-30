import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Mail, 
  Phone, 
  Star, 
  BookOpen, 
  Calendar, 
  IndianRupee, 
  GraduationCap, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  MoreVertical, 
  Edit3, 
  Trash2, 
  Eye, 
  X,
  FileText,
  UserCheck
} from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';
import { Teacher } from '../../types';

interface TeacherManagementProps {
  onAddTeacherClick?: () => void;
}

export const TeacherManagement: React.FC<TeacherManagementProps> = () => {
  const { 
    teachers, 
    addTeacher, 
    updateTeacher, 
    deleteTeacher, 
    t, 
    markTeacherAttendance,
    openPrintDoc,
    teacherSalaries
  } = useSchool();

  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // New Teacher Form State
  const [formData, setFormData] = useState({
    empId: '',
    name: '',
    email: '',
    phone: '',
    subject: '',
    department: 'Science & Math',
    qualification: '',
    joiningDate: new Date().toISOString().slice(0, 10),
    experienceYears: 5,
    classesAssigned: 'Class 10-A, Class 10-B',
    status: 'active' as Teacher['status'],
    basic: 50000,
    hra: 12500,
    allowances: 8000,
    pfDeduction: 6000,
    taxDeduction: 4000,
    performanceScore: 90,
    studentRating: 4.8,
    syllabusProgress: 80,
    recentNotes: ''
  });

  const departments = ['all', 'Science & Math', 'Humanities & Languages', 'Technology', 'Sports & Wellness'];

  const filteredTeachers = teachers.filter((tch) => {
    const matchesSearch = 
      tch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tch.empId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tch.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = departmentFilter === 'all' || tch.department === departmentFilter;
    const matchesStatus = statusFilter === 'all' || tch.status === statusFilter;
    return matchesSearch && matchesDept && matchesStatus;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const net = Number(formData.basic) + Number(formData.hra) + Number(formData.allowances) - Number(formData.pfDeduction) - Number(formData.taxDeduction);
    
    addTeacher({
      empId: formData.empId || `DPG-T-${Math.floor(110 + Math.random() * 800)}`,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      avatar: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 900000000)}?w=150&auto=format&fit=crop&q=80`,
      subject: formData.subject,
      department: formData.department,
      qualification: formData.qualification,
      joiningDate: formData.joiningDate,
      experienceYears: Number(formData.experienceYears),
      classesAssigned: formData.classesAssigned.split(',').map(s => s.trim()),
      status: formData.status,
      salary: {
        basic: Number(formData.basic),
        hra: Number(formData.hra),
        allowances: Number(formData.allowances),
        pfDeduction: Number(formData.pfDeduction),
        taxDeduction: Number(formData.taxDeduction),
        netPay: net
      },
      performanceScore: Number(formData.performanceScore),
      studentRating: Number(formData.studentRating),
      syllabusProgress: Number(formData.syllabusProgress),
      recentNotes: formData.recentNotes
    });

    setIsAddModalOpen(false);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeacher) return;

    const net = Number(formData.basic) + Number(formData.hra) + Number(formData.allowances) - Number(formData.pfDeduction) - Number(formData.taxDeduction);

    updateTeacher(selectedTeacher.id, {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      subject: formData.subject,
      department: formData.department,
      qualification: formData.qualification,
      experienceYears: Number(formData.experienceYears),
      classesAssigned: formData.classesAssigned.split(',').map(s => s.trim()),
      status: formData.status,
      salary: {
        basic: Number(formData.basic),
        hra: Number(formData.hra),
        allowances: Number(formData.allowances),
        pfDeduction: Number(formData.pfDeduction),
        taxDeduction: Number(formData.taxDeduction),
        netPay: net
      },
      syllabusProgress: Number(formData.syllabusProgress),
      recentNotes: formData.recentNotes
    });

    setIsEditModalOpen(false);
    setSelectedTeacher(null);
  };

  const openEdit = (tch: Teacher) => {
    setSelectedTeacher(tch);
    setFormData({
      empId: tch.empId,
      name: tch.name,
      email: tch.email,
      phone: tch.phone,
      subject: tch.subject,
      department: tch.department,
      qualification: tch.qualification,
      joiningDate: tch.joiningDate,
      experienceYears: tch.experienceYears,
      classesAssigned: tch.classesAssigned.join(', '),
      status: tch.status,
      basic: tch.salary.basic,
      hra: tch.salary.hra,
      allowances: tch.salary.allowances,
      pfDeduction: tch.salary.pfDeduction,
      taxDeduction: tch.salary.taxDeduction,
      performanceScore: tch.performanceScore,
      studentRating: tch.studentRating,
      syllabusProgress: tch.syllabusProgress,
      recentNotes: tch.recentNotes || ''
    });
    setIsEditModalOpen(true);
  };

  const openPrintSalarySlip = (tch: Teacher) => {
    // Find latest slip or create mock slip
    const existing = teacherSalaries.find(s => s.teacherId === tch.id);
    if (existing) {
      openPrintDoc('salary_slip', existing);
    } else {
      const mockSlip = {
        id: `sal-temp-${tch.id}`,
        slipNo: `PAY-2026-09-${Math.floor(1000 + Math.random() * 9000)}`,
        teacherId: tch.id,
        teacherName: tch.name,
        empId: tch.empId,
        department: tch.department,
        month: 'September',
        year: 2026,
        workingDays: 26,
        presentDays: 26,
        basicPay: tch.salary.basic,
        hra: tch.salary.hra,
        specialAllowance: tch.salary.allowances,
        grossEarnings: tch.salary.basic + tch.salary.hra + tch.salary.allowances,
        providentFund: tch.salary.pfDeduction,
        professionalTax: tch.salary.taxDeduction,
        totalDeductions: tch.salary.pfDeduction + tch.salary.taxDeduction,
        netPayable: tch.salary.netPay,
        status: 'paid' as const,
        paymentDate: '2026-09-28',
        paymentMode: 'Bank Transfer' as const,
        transactionRef: `HDFC-NEFT-${Math.floor(10000000 + Math.random() * 90000000)}`
      };
      openPrintDoc('salary_slip', mockSlip);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header with Title and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-indigo-600" />
            {t('Faculty & Teacher Management', 'शिक्षक एवं संकाय प्रबंधन')}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {t('Manage staff profiles, qualifications, assigned subjects, and track attendance/payroll.', 'शिक्षकों के प्रोफाइल, योग्यता, वेतन एवं प्रदर्शन की निगरानी करें।')}
          </p>
        </div>

        <button
          onClick={() => {
            setFormData({
              empId: `DPG-T-${Math.floor(109 + teachers.length + 1)}`,
              name: '',
              email: '',
              phone: '+91 ',
              subject: '',
              department: 'Science & Math',
              qualification: 'M.Sc., B.Ed',
              joiningDate: new Date().toISOString().slice(0, 10),
              experienceYears: 5,
              classesAssigned: 'Class 9-A, Class 10-A',
              status: 'active',
              basic: 54000,
              hra: 13500,
              allowances: 8500,
              pfDeduction: 6480,
              taxDeduction: 4000,
              performanceScore: 92,
              studentRating: 4.8,
              syllabusProgress: 85,
              recentNotes: ''
            });
            setIsAddModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-600/20 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>{t('Appoint New Faculty', 'नया शिक्षक नियुक्त करें')}</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={t('Search by teacher name, emp ID or subject...', 'नाम, आईडी या विषय से खोजें...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800/80 rounded-xl text-xs border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <Filter className="w-3.5 h-3.5" />
            <span>{t('Dept:', 'विभाग:')}</span>
          </div>

          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept === 'all' ? t('All Departments', 'सभी विभाग') : dept}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">{t('All Status', 'सभी स्थिति')}</option>
            <option value="active">{t('Active', 'सक्रिय')}</option>
            <option value="on_leave">{t('On Leave', 'छुट्टी पर')}</option>
          </select>
        </div>

      </div>

      {/* Teachers Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredTeachers.map((tch) => (
          <div
            key={tch.id}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs hover:border-indigo-400 dark:hover:border-indigo-600 transition-all flex flex-col justify-between group"
          >
            <div>
              {/* Top row: Avatar & Status */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="relative">
                  <img
                    src={tch.avatar}
                    alt={tch.name}
                    className="w-14 h-14 rounded-2xl object-cover ring-2 ring-indigo-500/20"
                  />
                  <span
                    className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 ${
                      tch.status === 'active' ? 'bg-emerald-500' : 'bg-amber-500'
                    }`}
                  />
                </div>

                <div className="text-right">
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      tch.status === 'active'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300'
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300'
                    }`}
                  >
                    {tch.status === 'active' ? t('Active', 'सक्रिय') : t('On Leave', 'अवकाश')}
                  </span>
                  <p className="text-[10px] font-mono text-slate-400 mt-1">{tch.empId}</p>
                </div>
              </div>

              {/* Name & Subject */}
              <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-tight">
                {tch.name}
              </h3>
              <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mt-0.5">
                {tch.subject}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                {tch.qualification}
              </p>

              {/* Badges / Metrics */}
              <div className="mt-4 grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px]">
                <div className="bg-slate-50 dark:bg-slate-800/60 p-2 rounded-xl">
                  <span className="text-slate-400 block text-[9px] font-bold uppercase">{t('Attendance', 'उपस्थिति')}</span>
                  <span className="font-extrabold text-emerald-600 dark:text-emerald-400">{tch.attendanceRate}%</span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/60 p-2 rounded-xl">
                  <span className="text-slate-400 block text-[9px] font-bold uppercase">{t('Syllabus', 'पाठ्यक्रम')}</span>
                  <span className="font-extrabold text-indigo-600 dark:text-indigo-400">{tch.syllabusProgress}%</span>
                </div>
              </div>

              {/* Rating & Salary pill */}
              <div className="mt-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1 text-amber-500 font-bold">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span>{tch.studentRating}</span>
                  <span className="text-[10px] text-slate-400 font-normal">/ 5.0</span>
                </div>
                <div className="font-extrabold text-slate-800 dark:text-slate-200">
                  ₹{tch.salary.netPay.toLocaleString('en-IN')}<span className="text-[9px] text-slate-400 font-normal">/mo</span>
                </div>
              </div>

            </div>

            {/* Card Action Buttons */}
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
              <button
                onClick={() => setSelectedTeacher(tch)}
                className="flex-1 py-1.5 px-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors text-center"
              >
                {t('View Details', 'विवरण')}
              </button>
              <button
                onClick={() => openPrintSalarySlip(tch)}
                title="Print Official Salary Pay Slip"
                className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
              >
                <FileText className="w-4 h-4" />
              </button>
              <button
                onClick={() => openEdit(tch)}
                title="Edit Faculty Record"
                className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            </div>

          </div>
        ))}
      </div>

      {/* Teacher Detail Drawer / Modal */}
      {selectedTeacher && !isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <img
                  src={selectedTeacher.avatar}
                  alt={selectedTeacher.name}
                  className="w-16 h-16 rounded-2xl object-cover ring-2 ring-indigo-500/20"
                />
                <div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white leading-tight">
                    {selectedTeacher.name}
                  </h3>
                  <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                    {selectedTeacher.subject} • {selectedTeacher.department}
                  </p>
                  <p className="text-[11px] font-mono text-slate-400">
                    Emp ID: {selectedTeacher.empId} • Joined: {selectedTeacher.joiningDate}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedTeacher(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Contact & Info */}
            <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-indigo-500 shrink-0" />
                <span className="truncate text-slate-700 dark:text-slate-300">{selectedTeacher.email}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className="truncate text-slate-700 dark:text-slate-300">{selectedTeacher.phone}</span>
              </div>
            </div>

            {/* Salary Breakdown Box */}
            <div className="mt-5 p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-indigo-900 dark:text-indigo-300 uppercase tracking-wider">
                  {t('Salary & Compensation Structure', 'वेतन संरचना')}
                </span>
                <button
                  onClick={() => openPrintSalarySlip(selectedTeacher)}
                  className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold flex items-center gap-1.5 transition-colors"
                >
                  <FileText className="w-3 h-3" />
                  <span>{t('Print Pay Slip', 'वेतन पर्ची प्रिंट करें')}</span>
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="p-2 rounded-lg bg-white dark:bg-slate-800">
                  <span className="text-[10px] text-slate-400 block">{t('Basic Pay', 'मूल वेतन')}</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">₹{selectedTeacher.salary.basic.toLocaleString('en-IN')}</span>
                </div>
                <div className="p-2 rounded-lg bg-white dark:bg-slate-800">
                  <span className="text-[10px] text-slate-400 block">{t('HRA & Allowances', 'भत्ते')}</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">₹{(selectedTeacher.salary.hra + selectedTeacher.salary.allowances).toLocaleString('en-IN')}</span>
                </div>
                <div className="p-2 rounded-lg bg-emerald-100/70 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200">
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block font-semibold">{t('Net Disbursed', 'शुद्ध वेतन')}</span>
                  <span className="font-extrabold text-sm">₹{selectedTeacher.salary.netPay.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Classes Assigned & Progress */}
            <div className="mt-4 space-y-3">
              <div>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  {t('Classes Assigned:', 'आवंटित कक्षाएं:')}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedTeacher.classesAssigned.map((cls, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs">
                      {cls}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-500">{t('Term Syllabus Completion:', 'पाठ्यक्रम पूर्णता:')}</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">{selectedTeacher.syllabusProgress}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${selectedTeacher.syllabusProgress}%` }} />
                </div>
              </div>

              {selectedTeacher.recentNotes && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-xs text-slate-600 dark:text-slate-400 italic">
                  "{selectedTeacher.recentNotes}"
                </div>
              )}
            </div>

            {/* Quick Actions in Detail */}
            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
              <button
                onClick={() => {
                  deleteTeacher(selectedTeacher.id);
                  setSelectedTeacher(null);
                }}
                className="px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>{t('Deactivate Profile', 'प्रोफ़ाइल हटाएं')}</span>
              </button>
              <button
                onClick={() => openEdit(selectedTeacher)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors"
              >
                {t('Edit Teacher Info', 'संपादित करें')}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Add / Edit Faculty Modal */}
      {(isAddModalOpen || isEditModalOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[92vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                {isEditModalOpen ? t('Edit Faculty Information', 'शिक्षक जानकारी संपादित करें') : t('Appoint New Faculty Member', 'नया शिक्षक नियुक्त करें')}
              </h3>
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
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">{t('Full Name', 'पूरा नाम')}</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Dr. Rajesh Kumar"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">{t('Employee ID', 'कर्मचारी आईडी')}</label>
                  <input
                    type="text"
                    required
                    value={formData.empId}
                    onChange={(e) => setFormData({ ...formData, empId: e.target.value })}
                    placeholder="DPG-T-109"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">{t('Email Address', 'ईमेल')}</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="teacher@dpga-academy.edu.in"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">{t('Phone Number', 'मोबाइल फोन')}</label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">{t('Primary Subject', 'मुख्य विषय')}</label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="e.g. Mathematics, Physics, Hindi"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">{t('Department', 'विभाग')}</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Science & Math">Science & Math</option>
                    <option value="Humanities & Languages">Humanities & Languages</option>
                    <option value="Technology">Technology</option>
                    <option value="Sports & Wellness">Sports & Wellness</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">{t('Qualification', 'योग्यता / डिग्री')}</label>
                  <input
                    type="text"
                    required
                    value={formData.qualification}
                    onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                    placeholder="e.g. M.Sc., B.Ed, Ph.D"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">{t('Assigned Classes (Comma separated)', 'आवंटित कक्षाएं')}</label>
                  <input
                    type="text"
                    value={formData.classesAssigned}
                    onChange={(e) => setFormData({ ...formData, classesAssigned: e.target.value })}
                    placeholder="Class 10-A, Class 10-B"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Salary Breakdown Fields */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
                <span className="font-bold text-slate-700 dark:text-slate-300 block mb-2">{t('Monthly Salary Structure (₹)', 'मासिक वेतन संरचना (₹)')}</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-1">{t('Basic Pay', 'मूल वेतन')}</label>
                    <input
                      type="number"
                      value={formData.basic}
                      onChange={(e) => setFormData({ ...formData, basic: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 font-semibold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-1">{t('HRA', 'मकान किराया')}</label>
                    <input
                      type="number"
                      value={formData.hra}
                      onChange={(e) => setFormData({ ...formData, hra: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 font-semibold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-1">{t('Allowances', 'अन्य भत्ते')}</label>
                    <input
                      type="number"
                      value={formData.allowances}
                      onChange={(e) => setFormData({ ...formData, allowances: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 font-semibold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-1">{t('PF & Tax Deductions', 'कटौती (PF + कर)')}</label>
                    <input
                      type="number"
                      value={formData.pfDeduction + formData.taxDeduction}
                      onChange={(e) => {
                        const half = Math.round(Number(e.target.value) / 2);
                        setFormData({ ...formData, pfDeduction: half, taxDeduction: half });
                      }}
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 font-semibold"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">{t('Performance Notes & Remarks', 'प्रदर्शन नोट्स')}</label>
                <textarea
                  rows={2}
                  value={formData.recentNotes}
                  onChange={(e) => setFormData({ ...formData, recentNotes: e.target.value })}
                  placeholder="e.g. Conducts extra remedial classes on weekends..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setIsEditModalOpen(false);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 font-semibold text-slate-700 dark:text-slate-300"
                >
                  {t('Cancel', 'रद्द करें')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md shadow-indigo-600/20"
                >
                  {isEditModalOpen ? t('Save Changes', 'बदलाव सहेजें') : t('Appoint Faculty', 'नियुक्ति पक्की करें')}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
