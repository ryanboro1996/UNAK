import React, { useState, useRef } from 'react';
import { 
  CreditCard, 
  Printer, 
  Search, 
  Filter, 
  Download, 
  CheckSquare, 
  Square, 
  Sparkles, 
  School, 
  Phone, 
  MapPin, 
  Calendar, 
  User, 
  QrCode, 
  Upload, 
  CheckCircle2, 
  Palette, 
  Maximize2, 
  Layers, 
  Eye, 
  Scissors,
  ArrowRight
} from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';
import { Student, SCHOOL_CLASSES } from '../../types';
import { SchoolLogo } from '../common/SchoolLogo';

export type CardTheme = 'navy_gold' | 'emerald_modern' | 'crimson_heritage' | 'playful_nursery';
export type CardOrientation = 'portrait' | 'landscape';
export type CardSide = 'front' | 'back' | 'both';

interface StudentIDCardGeneratorProps {
  initialSelectedStudentId?: string;
  onNavigateBack?: () => void;
}

export const StudentIDCardGenerator: React.FC<StudentIDCardGeneratorProps> = ({
  initialSelectedStudentId,
  onNavigateBack
}) => {
  const { students, updateStudent, settings, t } = useSchool();

  // Filter & Search states
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Selection state (student IDs)
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>(
    initialSelectedStudentId ? [initialSelectedStudentId] : students.slice(0, 4).map(s => s.id)
  );

  // Card Customization Options
  const [cardTheme, setCardTheme] = useState<CardTheme>('navy_gold');
  const [orientation, setOrientation] = useState<CardOrientation>('portrait');
  const [cardSide, setCardSide] = useState<CardSide>('front');
  const [showBloodGroup, setShowBloodGroup] = useState<boolean>(true);
  const [showDOB, setShowDOB] = useState<boolean>(true);
  const [showParents, setShowParents] = useState<boolean>(true);
  const [showBarcode, setShowBarcode] = useState<boolean>(true);
  const [activePreviewStudentId, setActivePreviewStudentId] = useState<string>(
    initialSelectedStudentId || students[0]?.id || ''
  );

  // File input ref for quick photo upload
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoUploadTargetStudentId, setPhotoUploadTargetStudentId] = useState<string | null>(null);

  // Filtered Students
  const filteredStudents = students.filter(st => {
    const matchesClass = selectedClass === 'all' || st.grade === selectedClass;
    const matchesSearch = 
      st.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      st.admissionNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (st.fatherName && st.fatherName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (st.motherName && st.motherName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      st.parentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      st.rollNo.toString().includes(searchQuery);
    return matchesClass && matchesSearch;
  });

  const activeStudent = students.find(s => s.id === activePreviewStudentId) || filteredStudents[0] || students[0];

  // Selection handlers
  const handleToggleSelect = (id: string) => {
    setSelectedStudentIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllFiltered = () => {
    const filteredIds = filteredStudents.map(s => s.id);
    const allSelected = filteredIds.every(id => selectedStudentIds.includes(id));
    if (allSelected) {
      setSelectedStudentIds(prev => prev.filter(id => !filteredIds.includes(id)));
    } else {
      setSelectedStudentIds(prev => Array.from(new Set([...prev, ...filteredIds])));
    }
  };

  // Quick photo upload handler
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, studentId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Url = event.target?.result as string;
      if (base64Url) {
        updateStudent(studentId, {
          photo: base64Url,
          avatar: base64Url
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const triggerUploadFor = (studentId: string) => {
    setPhotoUploadTargetStudentId(studentId);
    fileInputRef.current?.click();
  };

  const handlePrint = () => {
    window.print();
  };

  // Helper to format parent names cleanly
  const getFather = (st: Student) => st.fatherName || (st.parentName && !st.parentName.includes('&') ? st.parentName : 'Mr. Father');
  const getMother = (st: Student) => st.motherName || 'Mrs. Mother';

  // Theme styling configurations
  const themeStyles = {
    navy_gold: {
      headerBg: 'bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white',
      accentColor: 'text-amber-400',
      headerBorder: 'border-b-2 border-amber-400',
      cardBorder: 'border-2 border-slate-800',
      badgeBg: 'bg-amber-400 text-slate-950 font-black',
      highlightText: 'text-indigo-900',
      watermarkColor: 'text-slate-200'
    },
    emerald_modern: {
      headerBg: 'bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white',
      accentColor: 'text-emerald-400',
      headerBorder: 'border-b-2 border-emerald-400',
      cardBorder: 'border-2 border-emerald-900/60',
      badgeBg: 'bg-emerald-600 text-white font-bold',
      highlightText: 'text-emerald-800',
      watermarkColor: 'text-emerald-100'
    },
    crimson_heritage: {
      headerBg: 'bg-gradient-to-r from-rose-950 via-red-900 to-amber-950 text-white',
      accentColor: 'text-amber-300',
      headerBorder: 'border-b-2 border-amber-300',
      cardBorder: 'border-2 border-rose-900/60',
      badgeBg: 'bg-amber-500 text-slate-950 font-bold',
      highlightText: 'text-rose-900',
      watermarkColor: 'text-rose-100'
    },
    playful_nursery: {
      headerBg: 'bg-gradient-to-r from-violet-600 via-pink-500 to-amber-400 text-white',
      accentColor: 'text-yellow-200',
      headerBorder: 'border-b-2 border-yellow-300',
      cardBorder: 'border-2 border-violet-400',
      badgeBg: 'bg-yellow-400 text-violet-950 font-black',
      highlightText: 'text-violet-900',
      watermarkColor: 'text-pink-100'
    }
  };

  const currentTheme = themeStyles[cardTheme];

  // Selected students for print
  const printStudents = students.filter(s => selectedStudentIds.includes(s.id));

  // Render a Single Physical ID Card (Front)
  const renderCardFront = (st: Student) => {
    const isPortrait = orientation === 'portrait';
    const photoSrc = st.photo || st.avatar || 'https://images.unsplash.com/photo-1543332164-6e82f355badc?w=150&auto=format&fit=crop&q=80';

    return (
      <div 
        key={`front-${st.id}`}
        className={`id-card-unit bg-white text-slate-900 rounded-2xl shadow-lg overflow-hidden flex flex-col justify-between relative print:shadow-none print:rounded-xl ${currentTheme.cardBorder} ${
          isPortrait ? 'w-[280px] h-[430px]' : 'w-[430px] h-[270px]'
        }`}
        style={{
          boxSizing: 'border-box',
          pageBreakInside: 'avoid'
        }}
      >
        {/* Lanyard punch guide mark */}
        <div className="no-print absolute top-1.5 left-1/2 -translate-x-1/2 w-4 h-1.5 rounded-full border border-dashed border-slate-300 bg-white/60 z-30" title="Lanyard slot" />

        {/* 1. Card Header */}
        <div className={`p-2.5 sm:p-3 text-center relative ${currentTheme.headerBg} ${currentTheme.headerBorder}`}>
          <div className="flex items-center justify-center gap-2">
            <SchoolLogo className="w-8 h-8 rounded-full border border-white/50 bg-white p-0.5 shrink-0 shadow-xs" />
            <div className="text-left leading-tight overflow-hidden">
              <h4 className="font-black text-[11px] sm:text-xs tracking-tight uppercase line-clamp-1">
                {settings.schoolName}
              </h4>
              <p className="text-[8px] text-slate-200 line-clamp-1 opacity-90">
                {settings.address}
              </p>
            </div>
          </div>
          <div className="mt-1 flex items-center justify-between text-[8px] font-bold border-t border-white/20 pt-1 px-1 opacity-95">
            <span className={currentTheme.accentColor}>AFF: {settings.affiliationNo.slice(0, 16)}</span>
            <span className="uppercase tracking-widest text-[7px] bg-white/20 px-1 rounded">STUDENT IDENTITY CARD</span>
            <span className="text-white">{settings.academicYear}</span>
          </div>
        </div>

        {/* 2. Card Body */}
        {isPortrait ? (
          // PORTRAIT BODY
          <div className="p-3 flex-1 flex flex-col items-center justify-between text-center relative z-10">
            {/* Background Watermark Crest */}
            <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
              <SchoolLogo className="w-40 h-40" />
            </div>

            {/* Photo & Class Badge */}
            <div className="relative mt-1 group">
              <img 
                src={photoSrc} 
                alt={st.name} 
                className="w-20 h-24 object-cover rounded-xl border-2 border-slate-800 shadow-md bg-slate-100"
              />
              <button 
                type="button"
                onClick={() => triggerUploadFor(st.id)}
                className="no-print absolute bottom-1 right-1 p-1 rounded-full bg-slate-900/80 text-white text-[9px] hover:bg-slate-900 transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                title="Change Photo"
              >
                <Upload className="w-2.5 h-2.5" />
              </button>
            </div>

            {/* Student Name & Class Banner */}
            <div className="mt-2 w-full">
              <h3 className="font-black text-sm text-slate-900 uppercase tracking-tight line-clamp-1">
                {st.name}
              </h3>
              <div className="mt-0.5 inline-block px-3 py-0.5 rounded-full text-[10px] uppercase font-black tracking-wider shadow-xs bg-slate-900 text-white">
                {st.grade} • Sec {st.section}
              </div>
            </div>

            {/* Details Grid */}
            <div className="w-full mt-2 grid grid-cols-2 gap-x-2 gap-y-1 text-left text-[9px] border-t border-b border-slate-200 py-1.5">
              <div>
                <span className="text-slate-400 font-bold block text-[8px] uppercase">Roll No</span>
                <strong className="text-slate-900 font-mono">#{st.rollNo}</strong>
              </div>
              <div>
                <span className="text-slate-400 font-bold block text-[8px] uppercase">Admission No</span>
                <strong className="text-slate-900 font-mono text-[8px]">{st.admissionNo}</strong>
              </div>

              {showParents && (
                <>
                  <div className="col-span-2">
                    <span className="text-slate-400 font-bold block text-[8px] uppercase">Father's Name</span>
                    <strong className="text-slate-900 line-clamp-1">{getFather(st)}</strong>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-400 font-bold block text-[8px] uppercase">Mother's Name</span>
                    <strong className="text-slate-900 line-clamp-1">{getMother(st)}</strong>
                  </div>
                </>
              )}

              {showDOB && (
                <div>
                  <span className="text-slate-400 font-bold block text-[8px] uppercase">DOB</span>
                  <strong className="text-slate-900 font-mono">{st.dob}</strong>
                </div>
              )}

              {showBloodGroup && (
                <div>
                  <span className="text-slate-400 font-bold block text-[8px] uppercase">Blood Group</span>
                  <strong className="text-rose-600 font-extrabold">{st.bloodGroup}</strong>
                </div>
              )}

              <div className="col-span-2">
                <span className="text-slate-400 font-bold block text-[8px] uppercase">Emergency Phone</span>
                <strong className="text-slate-900 font-mono">{st.parentPhone}</strong>
              </div>
            </div>

            {/* Signature & Seal Strip */}
            <div className="w-full pt-1.5 flex items-end justify-between text-[8px]">
              <div className="text-left">
                <span className="text-[7px] text-slate-400 block uppercase font-bold">Issued by School</span>
                <span className="font-mono text-[8px] text-slate-500">{new Date().toISOString().slice(0, 7)}</span>
              </div>
              
              <div className="text-center">
                <div className="h-5 flex items-center justify-center font-serif italic text-indigo-900 font-bold text-[10px]">
                  R. Boro
                </div>
                <div className="border-t border-slate-800 pt-0.5 px-2">
                  <span className="text-[8px] font-extrabold text-slate-900 block leading-tight">Principal</span>
                  <span className="text-[6.5px] text-slate-500 uppercase">Mr. Rubungsa Boro</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // LANDSCAPE BODY
          <div className="p-3 flex-1 flex flex-col justify-between relative z-10">
            <div className="flex gap-3 items-center">
              {/* Photo */}
              <div className="relative shrink-0 group">
                <img 
                  src={photoSrc} 
                  alt={st.name} 
                  className="w-20 h-24 object-cover rounded-xl border-2 border-slate-800 shadow-sm bg-slate-100"
                />
                <button 
                  type="button"
                  onClick={() => triggerUploadFor(st.id)}
                  className="no-print absolute bottom-1 right-1 p-1 rounded-full bg-slate-900/80 text-white text-[9px] hover:bg-slate-900 transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                  title="Change Photo"
                >
                  <Upload className="w-2.5 h-2.5" />
                </button>
              </div>

              {/* Identity details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-sm text-slate-900 uppercase truncate">
                    {st.name}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[9px] uppercase font-black bg-slate-900 text-white shrink-0">
                    {st.grade} ({st.section})
                  </span>
                </div>

                <div className="mt-1.5 grid grid-cols-2 gap-x-2 gap-y-1 text-[9px]">
                  <div>
                    <span className="text-slate-400 block text-[7.5px] uppercase font-bold">Roll / Adm No</span>
                    <strong className="font-mono text-slate-900 font-bold">#{st.rollNo} • {st.admissionNo}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[7.5px] uppercase font-bold">DOB & Blood</span>
                    <strong className="text-slate-900 font-mono text-[8px]">{st.dob} | <span className="text-rose-600 font-black">{st.bloodGroup}</span></strong>
                  </div>
                  {showParents && (
                    <>
                      <div>
                        <span className="text-slate-400 block text-[7.5px] uppercase font-bold">Father's Name</span>
                        <strong className="text-slate-900 truncate block">{getFather(st)}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[7.5px] uppercase font-bold">Mother's Name</span>
                        <strong className="text-slate-900 truncate block">{getMother(st)}</strong>
                      </div>
                    </>
                  )}
                  <div className="col-span-2">
                    <span className="text-slate-400 block text-[7.5px] uppercase font-bold">Emergency Phone</span>
                    <strong className="text-slate-900 font-mono">{st.parentPhone}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Strip */}
            <div className="border-t border-slate-200 pt-1 flex items-center justify-between text-[8px]">
              <span className="text-slate-500 font-mono text-[7.5px]">Valid: {settings.academicYear}</span>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <span className="font-serif italic text-indigo-950 font-bold text-[9px] block leading-none">R. Boro</span>
                  <span className="text-[7.5px] font-black text-slate-900 block border-t border-slate-600 mt-0.5">Principal Signature</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. Card Bottom Color Strip */}
        <div className={`h-1.5 w-full ${currentTheme.badgeBg}`} />
      </div>
    );
  };

  // Render a Single Physical ID Card (Back)
  const renderCardBack = (st: Student) => {
    const isPortrait = orientation === 'portrait';

    return (
      <div 
        key={`back-${st.id}`}
        className={`id-card-unit bg-white text-slate-900 rounded-2xl shadow-lg overflow-hidden flex flex-col justify-between relative print:shadow-none print:rounded-xl ${currentTheme.cardBorder} ${
          isPortrait ? 'w-[280px] h-[430px]' : 'w-[430px] h-[270px]'
        }`}
        style={{
          boxSizing: 'border-box',
          pageBreakInside: 'avoid'
        }}
      >
        {/* Top Header Strip */}
        <div className={`p-2 text-center text-white ${currentTheme.headerBg}`}>
          <h5 className="font-extrabold text-[9px] uppercase tracking-wider">
            Important Information & Regulations
          </h5>
        </div>

        {/* Body */}
        <div className="p-3 flex-1 flex flex-col justify-between text-[9px] space-y-2">
          {/* Residential Address */}
          <div>
            <span className="text-slate-400 font-bold block text-[8px] uppercase">Residential Address:</span>
            <p className="text-slate-800 font-medium leading-tight text-[9px] mt-0.5">
              {st.address || 'Khagrabari, P.O. Khagrabari, Dist. Chirang, BTR, Assam - 783380'}
            </p>
          </div>

          {/* Institutional Contact */}
          <div className="bg-slate-50 p-2 rounded-xl border border-slate-200">
            <span className="text-slate-400 font-bold block text-[8px] uppercase">Campus Helpline & Admin Office:</span>
            <p className="text-slate-900 font-bold mt-0.5 text-[8.5px]">{settings.phone}</p>
            <p className="text-slate-600 text-[8px]">{settings.email}</p>
          </div>

          {/* Terms & Instructions */}
          <div className="space-y-1 text-[8px] text-slate-600 leading-tight">
            <p>1. This card must be worn by the student at all times on the school campus and during school transport.</p>
            <p>2. Loss of card must be reported to the school administration office immediately.</p>
            <p>3. If found, please return to: <strong>{settings.schoolName}, {settings.address}</strong>.</p>
          </div>

          {/* QR Code / Barcode simulation */}
          {showBarcode && (
            <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded bg-slate-100 border border-slate-300">
                  <QrCode className="w-8 h-8 text-slate-900" />
                </div>
                <div className="text-[7.5px] text-slate-500 font-mono">
                  <span>ID: {st.admissionNo}</span>
                  <br />
                  <span>EMERGENCY: {st.parentPhone}</span>
                </div>
              </div>

              <div className="text-right">
                <div className="font-mono text-[7px] text-slate-400 tracking-widest uppercase">OFFICIAL SEAL</div>
                <div className="w-8 h-8 rounded-full border border-dashed border-slate-400 mx-auto flex items-center justify-center text-[6px] text-slate-400 font-bold">
                  SEAL
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Strip */}
        <div className={`h-1.5 w-full ${currentTheme.badgeBg}`} />
      </div>
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Hidden file input for photo upload */}
      <input 
        type="file" 
        ref={fileInputRef} 
        accept="image/*" 
        className="hidden" 
        onChange={(e) => {
          if (photoUploadTargetStudentId) {
            handlePhotoUpload(e, photoUploadTargetStudentId);
          }
        }} 
      />

      {/* Top Header (Hidden on print) */}
      <div className="no-print flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-indigo-600" />
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              {t('Student ID Card Generator', 'छात्र पहचान पत्र जनरेटर')}
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
              CR80 Physical Badge
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t(
              'Generate & batch print standard physical student ID cards with photos, father/mother names, class & QR codes.',
              'छात्रों के फोटो, माता-पिता के नाम, कक्षा एवं क्यूआर कोड के साथ प्रिंट-रेडी पहचान पत्र बनाएं।'
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onNavigateBack && (
            <button
              onClick={onNavigateBack}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {t('Back to Students', 'छात्र सूची पर जाएं')}
            </button>
          )}

          <button
            onClick={handlePrint}
            disabled={selectedStudentIds.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-600/20 active:scale-95 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>{t(`Print ID Cards (${selectedStudentIds.length})`, `पहचान पत्र प्रिंट करें (${selectedStudentIds.length})`)}</span>
          </button>
        </div>
      </div>

      {/* Control Panel: Filters, Customizations & Theme Selectors (Hidden on print) */}
      <div className="no-print bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        
        {/* Row 1: Search & Class Filter */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={t('Search student name, roll or parent...', 'छात्र, रोल या अभिभावक से खोजें...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 font-medium"
            />
          </div>

          <div>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 text-indigo-700 dark:text-indigo-400"
            >
              <option value="all">{t('All Classes (Nursery to Class X)', 'सभी कक्षाएं (नर्सरी से X तक)')}</option>
              {SCHOOL_CLASSES.map(cls => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
          </div>

          {/* Theme Selector */}
          <div>
            <select
              value={cardTheme}
              onChange={(e) => setCardTheme(e.target.value as CardTheme)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 text-amber-700 dark:text-amber-400"
            >
              <option value="navy_gold">Navy & Gold (Royal Academic)</option>
              <option value="emerald_modern">Emerald & Teal (Modern Academy)</option>
              <option value="crimson_heritage">Crimson & Amber (Heritage Boarding)</option>
              <option value="playful_nursery">Playful Rainbow (Nursery & KG Special)</option>
            </select>
          </div>

          {/* Orientation & Sides */}
          <div className="flex items-center gap-2">
            <select
              value={orientation}
              onChange={(e) => setOrientation(e.target.value as CardOrientation)}
              className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700"
            >
              <option value="portrait">Vertical (Portrait Lanyard)</option>
              <option value="landscape">Horizontal (Landscape Clip)</option>
            </select>

            <select
              value={cardSide}
              onChange={(e) => setCardSide(e.target.value as CardSide)}
              className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700"
            >
              <option value="front">Front Only</option>
              <option value="back">Back Only</option>
              <option value="both">Both (Front & Back)</option>
            </select>
          </div>
        </div>

        {/* Row 2: Field Toggles & Bulk Selection strip */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
          
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Include Fields:</span>
            
            <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-700 dark:text-slate-300">
              <input 
                type="checkbox" 
                checked={showParents} 
                onChange={(e) => setShowParents(e.target.checked)}
                className="rounded text-indigo-600 focus:ring-indigo-500" 
              />
              <span>Father & Mother Names</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-700 dark:text-slate-300">
              <input 
                type="checkbox" 
                checked={showBloodGroup} 
                onChange={(e) => setShowBloodGroup(e.target.checked)}
                className="rounded text-indigo-600 focus:ring-indigo-500" 
              />
              <span>Blood Group</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-700 dark:text-slate-300">
              <input 
                type="checkbox" 
                checked={showDOB} 
                onChange={(e) => setShowDOB(e.target.checked)}
                className="rounded text-indigo-600 focus:ring-indigo-500" 
              />
              <span>Date of Birth</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-700 dark:text-slate-300">
              <input 
                type="checkbox" 
                checked={showBarcode} 
                onChange={(e) => setShowBarcode(e.target.checked)}
                className="rounded text-indigo-600 focus:ring-indigo-500" 
              />
              <span>QR Code Verification</span>
            </label>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSelectAllFiltered}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {filteredStudents.length > 0 && filteredStudents.every(s => selectedStudentIds.includes(s.id)) ? (
                <>
                  <CheckSquare className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Deselect All in Class</span>
                </>
              ) : (
                <>
                  <Square className="w-3.5 h-3.5 text-slate-400" />
                  <span>Select All ({filteredStudents.length})</span>
                </>
              )}
            </button>

            <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
              {selectedStudentIds.length} cards chosen
            </span>
          </div>

        </div>

      </div>

      {/* Main Grid: Student Selection Sidebar (1 col) + Live Interactive Preview & Print Sheet (3 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Student Selector Drawer (No-print) */}
        <div className="no-print lg:col-span-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs space-y-3 max-h-[700px] overflow-y-auto">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              {t('Select Students to Print', 'छात्र चुनें')} ({filteredStudents.length})
            </span>
            <span className="text-[10px] text-slate-400 font-semibold">
              Click photo to replace
            </span>
          </div>

          <div className="space-y-2">
            {filteredStudents.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs italic">
                No students match your filter.
              </div>
            ) : (
              filteredStudents.map(st => {
                const isSelected = selectedStudentIds.includes(st.id);
                const isPreview = activePreviewStudentId === st.id;
                const photoSrc = st.photo || st.avatar;

                return (
                  <div
                    key={st.id}
                    onClick={() => setActivePreviewStudentId(st.id)}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isPreview 
                        ? 'border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/40 shadow-xs' 
                        : isSelected 
                          ? 'border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40' 
                          : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleSelect(st.id);
                        }}
                        className="text-slate-400 hover:text-indigo-600 transition-colors"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-indigo-600" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>

                      <div className="relative group shrink-0">
                        <img 
                          src={photoSrc} 
                          alt={st.name} 
                          className="w-10 h-10 object-cover rounded-lg border border-slate-300 bg-slate-100" 
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            triggerUploadFor(st.id);
                          }}
                          className="absolute inset-0 rounded-lg bg-slate-900/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all text-[8px] font-bold"
                          title="Upload / Change Photo"
                        >
                          <Upload className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <strong className="text-xs font-bold text-slate-900 dark:text-white truncate block">
                            {st.name}
                          </strong>
                        </div>
                        <span className="text-[10px] text-slate-500 block truncate">
                          {st.grade} ({st.section}) • Roll #{st.rollNo} • Adm: {st.admissionNo}
                        </span>
                        {(st.fatherName || st.motherName) && (
                          <span className="text-[9px] text-slate-400 block truncate">
                            F: {st.fatherName || '—'} • M: {st.motherName || '—'}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          triggerUploadFor(st.id);
                        }}
                        className="p-1 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-white dark:hover:bg-slate-700 transition-colors"
                        title={t('Upload / Replace Student Photo', 'फोटो अपलोड करें')}
                      >
                        <Upload className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Live Preview & Physical Print Layout Section */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Live Single Preview Card Box (No-print) */}
          <div className="no-print bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-950 p-6 rounded-3xl border border-slate-300 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center relative overflow-hidden">
            <div className="w-full flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Interactive Live Preview: <span className="text-indigo-600 dark:text-indigo-400">{activeStudent.name}</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => triggerUploadFor(activeStudent.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 shadow-xs cursor-pointer"
                >
                  <Upload className="w-3 h-3 text-indigo-600" />
                  <span>{t('Upload Photo for this Student', 'इस छात्र की फोटो बदलें')}</span>
                </button>
              </div>
            </div>

            {/* Preview Card Render */}
            <div className="flex flex-wrap items-center justify-center gap-6 p-4">
              {(cardSide === 'front' || cardSide === 'both') && renderCardFront(activeStudent)}
              {(cardSide === 'back' || cardSide === 'both') && renderCardBack(activeStudent)}
            </div>

            <div className="mt-4 text-center">
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                CR80 Standard Physical Size (85.6mm × 53.98mm) • Fits all standard school lanyards & badge clips
              </p>
            </div>
          </div>

          {/* PRINTABLE SHEET CONTAINER */}
          {/* This container prints all selected students arranged in an A4 grid */}
          <div className="print-modal-container bg-white text-slate-900 p-4 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="no-print flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <div className="flex items-center gap-2">
                <Scissors className="w-4 h-4 text-slate-500" />
                <span className="font-bold text-xs text-slate-700">
                  {t('Batch Print Grid Preview', 'बैच प्रिंट ग्रिड प्रीव्यू')} ({selectedStudentIds.length} {t('cards ready to print on A4', 'कार्ड A4 पर प्रिंट के लिए तैयार')})
                </span>
              </div>
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>{t('Print All Now', 'अभी प्रिंट करें')}</span>
              </button>
            </div>

            {/* Print Grid */}
            <div 
              className="id-card-print-grid flex flex-wrap gap-4 justify-center items-start print:m-0 print:p-0"
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '16px',
                justifyContent: 'center',
                alignItems: 'flex-start'
              }}
            >
              {printStudents.length === 0 ? (
                <div className="no-print p-8 text-center text-slate-400 text-xs italic">
                  No students selected. Check boxes on the left to add students to this print batch.
                </div>
              ) : (
                printStudents.map(st => (
                  <React.Fragment key={st.id}>
                    {(cardSide === 'front' || cardSide === 'both') && renderCardFront(st)}
                    {(cardSide === 'back' || cardSide === 'both') && renderCardBack(st)}
                  </React.Fragment>
                ))
              )}
            </div>

            {/* Print Instruction notice (No-print) */}
            <div className="no-print mt-6 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400 space-y-1">
              <p className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Printing Instructions for Principal & Office Staff:</span>
              </p>
              <p>• In the print dialog, select <strong>Destination: Save as PDF</strong> or your <strong>Color Card/Laser Printer</strong>.</p>
              <p>• Choose <strong>Paper Size: A4</strong>, <strong>Scale: 100% (Default)</strong>, and ensure <strong>Background graphics: Checked</strong>.</p>
              <p>• Cut along the card borders and insert into standard CR80 transparent lamination pouches or badges.</p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
