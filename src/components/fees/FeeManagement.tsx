import React, { useState } from 'react';
import { 
  Receipt, 
  Plus, 
  Search, 
  Filter, 
  Printer, 
  Download, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  CreditCard, 
  DollarSign, 
  X,
  FileSpreadsheet,
  IndianRupee,
  Layers
} from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';
import { FeeTransaction, Student } from '../../types';
import { SchoolLogo } from '../common/SchoolLogo';

interface FeeManagementProps {
  initialStudentForFee?: Student | null;
  onClearInitialStudent?: () => void;
}

export const FeeManagement: React.FC<FeeManagementProps> = ({
  initialStudentForFee,
  onClearInitialStudent
}) => {
  const { 
    feeTransactions, 
    students, 
    collectFee, 
    updateFeeStatus, 
    sendFeeReminder, 
    openPrintDoc, 
    t, 
    settings,
    currentUser 
  } = useSchool();

  const [searchQuery, setSearchQuery] = useState('');
  const [feeTypeFilter, setFeeTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isCollectModalOpen, setIsCollectModalOpen] = useState(!!initialStudentForFee);
  const [isPdfExportModalOpen, setIsPdfExportModalOpen] = useState(false);

  // Form State
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    initialStudentForFee?.id || students[0]?.id || ''
  );
  const [feeType, setFeeType] = useState<FeeTransaction['feeType']>('Tuition Fee');
  const [amount, setAmount] = useState<number>(34000);
  const [paymentMethod, setPaymentMethod] = useState<FeeTransaction['paymentMethod']>('UPI');
  const [discount, setDiscount] = useState<number>(0);
  const [lateFine, setLateFine] = useState<number>(0);
  const [notes, setNotes] = useState<string>('Term 2 fee clearance');

  // Metrics
  const totalBilled = students.reduce((acc, s) => acc + s.totalFees, 0);
  const totalCollected = students.reduce((acc, s) => acc + s.paidFees, 0);
  const totalPending = students.reduce((acc, s) => acc + s.pendingFees, 0);
  const overdueCount = students.filter(s => s.feeStatus === 'overdue' || s.feeStatus === 'due').length;

  const filteredTransactions = feeTransactions.filter((tx) => {
    const matchesSearch = 
      tx.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.receiptNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.grade.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = feeTypeFilter === 'all' || tx.feeType === feeTypeFilter;
    const matchesStatus = statusFilter === 'all' || tx.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleStudentSelect = (id: string) => {
    setSelectedStudentId(id);
    const st = students.find(s => s.id === id);
    if (st && st.pendingFees > 0) {
      setAmount(st.pendingFees);
    }
  };

  const handleCollectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const st = students.find(s => s.id === selectedStudentId);
    if (!st) return;

    const newTx = collectFee({
      studentId: st.id,
      studentName: st.name,
      grade: st.grade,
      section: st.section,
      amount: Number(amount),
      feeType,
      paymentDate: new Date().toISOString().slice(0, 10),
      paymentMethod,
      status: 'paid',
      dueDate: new Date(Date.now() + 15 * 86400000).toISOString().slice(0, 10),
      discount: Number(discount),
      lateFine: Number(lateFine),
      collectedBy: `${currentUser.name} (${currentUser.title})`,
      notes
    });

    setIsCollectModalOpen(false);
    if (onClearInitialStudent) onClearInitialStudent();

    // Prompt to print receipt
    openPrintDoc('fee_receipt', newTx);
  };

  const exportFilteredFeesCSV = () => {
    const headers = [
      'Receipt No',
      'Payment Date',
      'Student Name',
      'Student ID',
      'Grade & Section',
      'Fee Head / Category',
      'Amount (INR)',
      'Payment Mode',
      'Payment Status',
      'Collected By',
      'Due Date',
      'Discount (INR)',
      'Late Fine (INR)',
      'Transaction Notes / Ref'
    ];

    const rows = filteredTransactions.map(tx => [
      `"${tx.receiptNo}"`,
      `"${tx.paymentDate}"`,
      `"${tx.studentName.replace(/"/g, '""')}"`,
      `"${tx.studentId}"`,
      `"${tx.grade} (${tx.section})"`,
      `"${tx.feeType}"`,
      tx.amount,
      `"${tx.paymentMethod}"`,
      `"${tx.status.toUpperCase()}"`,
      `"${tx.collectedBy ? tx.collectedBy.replace(/"/g, '""') : ''}"`,
      `"${tx.dueDate || ''}"`,
      tx.discount || 0,
      tx.lateFine || 0,
      `"${(tx.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const typeTag = feeTypeFilter !== 'all' ? feeTypeFilter.replace(/\s+/g, '_') : 'All_Heads';
    const statusTag = statusFilter !== 'all' ? statusFilter : 'All_Status';
    link.setAttribute('download', `Fee_Ledger_${typeTag}_${statusTag}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Receipt className="w-6 h-6 text-amber-600" />
            {t('Fee Collection & Accounting Ledger', 'शुल्क प्रबंधन एवं लेखा खाता')}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {t('Accept offline/online payments, dispatch digital receipts, and track student defaulters.', 'ऑनलाइन व ऑफलाइन फीस जमा करें, रसीद प्रिंट करें एवं बकाया राशि का विवरण देखें।')}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Export to CSV */}
          <button
            onClick={exportFilteredFeesCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors cursor-pointer"
            title={t(`Download ${filteredTransactions.length} filtered transactions as Excel CSV`, `${filteredTransactions.length} फ़िल्टर किए गए लेनदेन एक्सेल CSV में डाउनलोड करें`)}
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>{t('Export CSV', 'डाउनलोड CSV')}</span>
            <span className="text-[10px] text-slate-400 font-mono">({filteredTransactions.length})</span>
          </button>

          {/* Export to PDF */}
          <button
            onClick={() => setIsPdfExportModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors cursor-pointer"
            title={t(`Print or Save PDF report for ${filteredTransactions.length} transactions`, `${filteredTransactions.length} लेनदेनों की PDF रिपोर्ट बनाएं`)}
          >
            <Printer className="w-3.5 h-3.5 text-indigo-600" />
            <span>{t('Export PDF / Print', 'प्रिंट / PDF')}</span>
          </button>
          
          <button
            onClick={() => setIsCollectModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-amber-600/20 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t('Collect Fee Now', 'फीस जमा करें')}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('Total Tuition Dues', 'कुल वार्षिक देय')}</span>
          <p className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white">
            ₹{totalBilled.toLocaleString('en-IN')}
          </p>
          <span className="text-[11px] text-slate-500 mt-1 block">Full session 2026-27</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('Total Fees Received', 'कुल प्राप्त राशि')}</span>
          <p className="mt-2 text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
            ₹{totalCollected.toLocaleString('en-IN')}
          </p>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">
            {Math.round((totalCollected / Math.max(1, totalBilled)) * 100)}% collected
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('Pending Outstanding', 'बकाया शेष राशि')}</span>
          <p className="mt-2 text-2xl font-extrabold text-rose-600 dark:text-rose-400">
            ₹{totalPending.toLocaleString('en-IN')}
          </p>
          <span className="text-[11px] text-rose-500 font-semibold mt-1 block">
            {overdueCount} students with dues
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40 shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wider">{t('Send Batch Alerts', 'सामूहिक नोटिस')}</span>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              {t('Broadcast automated SMS & WhatsApp fee notices to defaulters.', 'बकाया अभिभावकों को संदेश भेजें।')}
            </p>
          </div>
          <button
            onClick={() => {
              students.filter(s => s.pendingFees > 0).forEach(s => sendFeeReminder(s.id));
            }}
            className="mt-3 w-fit px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs"
          >
            {t('Send Alert to All Defaulters', 'सभी को नोटिस भेजें')}
          </button>
        </div>

      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={t('Search by receipt no, student or grade...', 'रसीद संख्या, छात्र या कक्षा से खोजें...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={feeTypeFilter}
            onChange={(e) => setFeeTypeFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700"
          >
            <option value="all">{t('All Fee Heads', 'सभी शुल्क प्रकार')}</option>
            <option value="Admission Fee">Admission Fee (एडमिशन शुल्क)</option>
            <option value="Tuition Fee">Tuition Fee (ट्यूशन शुल्क)</option>
            <option value="Festive Fee">Festive Fee (उत्सव व पर्व शुल्क)</option>
            <option value="Book Fee">Book Fee (किताब व सामग्री शुल्क)</option>
            <option value="Uniform Fee">Uniform Fee (यूनिफॉर्म शुल्क)</option>
            <option value="Exam Fee">Exam Fee (परीक्षा शुल्क)</option>
            <option value="Transport Fee">Transport Fee (वाहन शुल्क)</option>
            <option value="Computer Lab Fee">Computer Lab Fee (कंप्यूटर लैब)</option>
            <option value="Annual Development Fee">Annual Development Fee (विकास शुल्क)</option>
            <option value="Sports & Cultural Fee">Sports & Cultural Fee (खेलकूद शुल्क)</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700"
          >
            <option value="all">{t('All Status', 'सभी स्थिति')}</option>
            <option value="paid">{t('Paid (Cleared)', 'जमा')}</option>
            <option value="overdue">{t('Overdue Alert', 'अतिदेय')}</option>
          </select>

          <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200 dark:border-slate-700">
            <span className="text-[11px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
              {filteredTransactions.length} {t('records', 'रिकॉर्ड')}
            </span>
            <button
              type="button"
              onClick={exportFilteredFeesCSV}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-emerald-600 transition-colors cursor-pointer"
              title={t(`Download ${filteredTransactions.length} records as Excel CSV`, `फ़िल्टर किए गए ${filteredTransactions.length} रिकॉर्ड्स CSV में डाउनलोड करें`)}
            >
              <Download className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setIsPdfExportModalOpen(true)}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-indigo-600 transition-colors cursor-pointer"
              title={t(`Export ${filteredTransactions.length} records as PDF or Print`, `फ़िल्टर किए गए ${filteredTransactions.length} रिकॉर्ड्स PDF / प्रिंट करें`)}
            >
              <Printer className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

      {/* Transactions Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase font-bold text-[10px] tracking-wider">
              <tr>
                <th className="p-4">{t('Receipt No', 'रसीद संख्या')}</th>
                <th className="p-4">{t('Student & Class', 'विद्यार्थी विवरण')}</th>
                <th className="p-4">{t('Fee Category', 'शुल्क श्रेणी')}</th>
                <th className="p-4">{t('Amount Paid', 'जमा राशि')}</th>
                <th className="p-4">{t('Payment Date & Mode', 'दिनांक व माध्यम')}</th>
                <th className="p-4">{t('Status', 'स्थिति')}</th>
                <th className="p-4 text-right">{t('Action', 'कार्रवाई')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                  
                  <td className="p-4 font-mono font-bold text-slate-800 dark:text-slate-200">
                    {tx.receiptNo}
                  </td>

                  <td className="p-4">
                    <p className="font-bold text-slate-900 dark:text-white leading-tight">{tx.studentName}</p>
                    <p className="text-[10px] text-slate-400">{tx.grade} - Section {tx.section}</p>
                  </td>

                  <td className="p-4 font-semibold text-slate-700 dark:text-slate-300">
                    {tx.feeType}
                  </td>

                  <td className="p-4">
                    <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                      ₹{tx.amount.toLocaleString('en-IN')}
                    </span>
                  </td>

                  <td className="p-4">
                    <p className="font-medium text-slate-700 dark:text-slate-300">{tx.paymentDate}</p>
                    <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 mt-0.5">
                      {tx.paymentMethod}
                    </span>
                  </td>

                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                      tx.status === 'paid' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' :
                      'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                    }`}>
                      {tx.status === 'paid' ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                      {tx.status}
                    </span>
                  </td>

                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => openPrintDoc('fee_receipt', tx)}
                        title="Print Official Fee Receipt"
                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs flex items-center gap-1.5"
                      >
                        <Printer className="w-3.5 h-3.5 text-amber-600" />
                        <span>{t('Receipt', 'रसीद')}</span>
                      </button>

                      {tx.status !== 'paid' && (
                        <button
                          onClick={() => sendFeeReminder(tx.studentId)}
                          title="Send SMS Reminder"
                          className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Collect Fee Modal */}
      {isCollectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div className="flex items-center gap-3">
                <SchoolLogo className="w-9 h-9 rounded-full border border-black bg-yellow-400 p-0.5 shadow-sm" />
                <div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                    {t('Collect Student Fee & Issue Receipt', 'शुल्क जमा करें एवं रसीद जारी करें')}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">{settings.schoolName}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsCollectModalOpen(false);
                  if (onClearInitialStudent) onClearInitialStudent();
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCollectSubmit} className="space-y-4 text-xs">
              
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">{t('Select Student', 'विद्यार्थी चुनें')}</label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => handleStudentSelect(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold"
                >
                  {students.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.name} ({st.grade} - {st.section}) • Pending: ₹{st.pendingFees.toLocaleString('en-IN')}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">{t('Fee Head / Type', 'शुल्क प्रकार')}</label>
                  <select
                    value={feeType}
                    onChange={(e) => setFeeType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold"
                  >
                    <option value="Admission Fee">Admission Fee (एडमिशन शुल्क)</option>
                    <option value="Tuition Fee">Tuition Fee (ट्यूशन शुल्क)</option>
                    <option value="Festive Fee">Festive Fee (उत्सव व पर्व शुल्क)</option>
                    <option value="Book Fee">Book Fee (किताब व सामग्री शुल्क)</option>
                    <option value="Uniform Fee">Uniform Fee (यूनिफॉर्म शुल्क)</option>
                    <option value="Exam Fee">Exam Fee (परीक्षा शुल्क)</option>
                    <option value="Transport Fee">Transport Fee (वाहन शुल्क)</option>
                    <option value="Computer Lab Fee">Computer Lab Fee (कंप्यूटर लैब)</option>
                    <option value="Annual Development Fee">Annual Development Fee (विकास शुल्क)</option>
                    <option value="Sports & Cultural Fee">Sports & Cultural Fee (खेलकूद शुल्क)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">{t('Amount to Collect (₹)', 'जमा राशि (₹)')}</label>
                  <input
                    type="number"
                    required
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-extrabold text-amber-600 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">{t('Payment Method', 'भुगतान माध्यम')}</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold"
                  >
                    <option value="UPI">UPI (Google Pay, PhonePe, Paytm)</option>
                    <option value="Cash">Cash at School Counter</option>
                    <option value="Net Banking">Net Banking Transfer</option>
                    <option value="Debit/Credit Card">POS Debit / Credit Card</option>
                    <option value="Cheque">Bank Cheque / DD</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">{t('Concession / Discount (₹)', 'छूट (₹)')}</label>
                  <input
                    type="number"
                    value={discount}
                    onChange={(e) => setDiscount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">{t('Remarks / Transaction Ref', 'विवरण / ट्रांजेक्शन संदर्भ')}</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Paid via UPI Ref #904281728"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCollectModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 font-semibold"
                >
                  {t('Cancel', 'रद्द करें')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-md shadow-amber-600/20"
                >
                  {t('Confirm Payment & Generate Receipt', 'भुगतान दर्ज कर रसीद बनाएं')}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* 2. Export Filtered Fee Transactions PDF / Print Preview Modal */}
      {isPdfExportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
          <div className="print-modal-container bg-white text-slate-900 rounded-3xl max-w-5xl w-full p-4 sm:p-8 shadow-2xl relative my-6 print:m-0 print:p-0 print:max-w-none print:shadow-none print:rounded-none">
            
            {/* Modal Controls (Hidden in print) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 mb-6 no-print">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                <div>
                  <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                    <Receipt className="w-4 h-4 text-amber-600" />
                    <span>{t('Fee Collection & Transactions Ledger (Print / PDF Export)', 'शुल्क संग्रह एवं लेखा लेज़र (प्रिंट / PDF)')}</span>
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {t(
                      `Showing ${filteredTransactions.length} of ${feeTransactions.length} transactions matching filters`,
                      `कुल ${feeTransactions.length} में से वर्तमान फ़िल्टर के ${filteredTransactions.length} लेनदेन`
                    )}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={exportFilteredFeesCSV}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                  title="Download matching transactions as Excel CSV"
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
                <div className="mt-2 inline-block px-3 py-0.5 bg-amber-50 border border-amber-300 rounded-full text-[11px] font-extrabold text-amber-900 uppercase tracking-wider">
                  Official Fee Collection & Accounting Ledger
                </div>
              </div>

              {/* Filter Parameters & Summary Strip */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-700">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Fee Head</span>
                  <span className="font-extrabold text-slate-900">{feeTypeFilter === 'all' ? 'All Fee Heads' : feeTypeFilter}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Payment Status</span>
                  <span className="font-extrabold text-slate-900">{statusFilter === 'all' ? 'All Status' : statusFilter.toUpperCase()}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Search Query</span>
                  <span className="font-extrabold text-slate-900">{searchQuery ? `"${searchQuery}"` : 'None (All)'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Matched Transactions</span>
                  <span className="font-extrabold text-amber-700">{filteredTransactions.length} Records</span>
                </div>
              </div>

              {/* Financial Totals for Filtered Set */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs p-2.5 rounded-xl bg-slate-100/70 border border-slate-200">
                <div>
                  <span className="text-[10px] text-slate-500 block">Total Net Collection</span>
                  <strong className="text-emerald-700 text-sm font-extrabold">
                    ₹{filteredTransactions.filter(t => t.status === 'paid').reduce((acc, t) => acc + t.amount, 0).toLocaleString('en-IN')}
                  </strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">UPI / Digital Mode</span>
                  <strong className="text-indigo-700 text-sm font-extrabold">
                    ₹{filteredTransactions.filter(t => t.status === 'paid' && t.paymentMethod === 'UPI').reduce((acc, t) => acc + t.amount, 0).toLocaleString('en-IN')}
                  </strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Cash Counter Mode</span>
                  <strong className="text-amber-800 text-sm font-extrabold">
                    ₹{filteredTransactions.filter(t => t.status === 'paid' && t.paymentMethod === 'Cash').reduce((acc, t) => acc + t.amount, 0).toLocaleString('en-IN')}
                  </strong>
                </div>
              </div>

              {/* Ledger Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-slate-200 rounded-lg">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-200 text-[10px] uppercase font-extrabold text-slate-700">
                      <th className="p-2 text-center w-8">#</th>
                      <th className="p-2">Receipt No</th>
                      <th className="p-2">Date</th>
                      <th className="p-2">Student Name</th>
                      <th className="p-2">Class-Sec</th>
                      <th className="p-2">Fee Head</th>
                      <th className="p-2">Mode</th>
                      <th className="p-2">Collected By</th>
                      <th className="p-2 text-center">Status</th>
                      <th className="p-2 text-right">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-[11px]">
                    {filteredTransactions.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="p-6 text-center text-slate-500 italic">
                          No fee transactions match the selected filter criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredTransactions.map((tx, idx) => (
                        <tr key={tx.id} className="hover:bg-slate-50/80">
                          <td className="p-2 text-center font-mono text-slate-400">{idx + 1}</td>
                          <td className="p-2 font-mono font-bold text-indigo-700">{tx.receiptNo}</td>
                          <td className="p-2 text-slate-600 font-mono text-[10px]">{tx.paymentDate}</td>
                          <td className="p-2 font-bold text-slate-900">{tx.studentName}</td>
                          <td className="p-2 font-semibold text-slate-700">{tx.grade} ({tx.section})</td>
                          <td className="p-2 font-medium text-slate-800">{tx.feeType}</td>
                          <td className="p-2">
                            <span className="font-mono text-[10px] uppercase px-1.5 py-0.5 rounded bg-slate-100 font-semibold text-slate-700">
                              {tx.paymentMethod}
                            </span>
                          </td>
                          <td className="p-2 text-[10px] text-slate-600 max-w-[130px] truncate" title={tx.collectedBy}>
                            {tx.collectedBy}
                          </td>
                          <td className="p-2 text-center">
                            <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                              tx.status === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                            }`}>
                              {tx.status}
                            </span>
                          </td>
                          <td className="p-2 text-right font-mono font-extrabold text-slate-900">
                            ₹{tx.amount.toLocaleString('en-IN')}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Official Signatures & Seal */}
              <div className="pt-6 border-t border-slate-200 grid grid-cols-2 gap-8 text-xs">
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-semibold">Treasury & Audit Certification:</p>
                  <p className="text-[10px] text-slate-500 italic mt-0.5">
                    Certified that the transaction records above represent verified fee collections deposited in the institutional account.
                  </p>
                  <div className="mt-8 border-t border-dashed border-slate-400 pt-1 text-slate-600">
                    <p className="font-bold">Chief Cashier / Bursar</p>
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
                      <p className="text-[10px] text-slate-600 font-bold">Principal & School Head</p>
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
