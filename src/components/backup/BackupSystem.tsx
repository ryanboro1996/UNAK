import React, { useState } from 'react';
import { 
  Database, 
  Download, 
  Upload, 
  RefreshCw, 
  Wifi, 
  WifiOff, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  HardDrive, 
  Server, 
  FileJson,
  RotateCcw
} from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';

export const BackupSystem: React.FC = () => {
  const { 
    isOnline, 
    toggleOnlineMode, 
    isSyncing, 
    syncWithCloud, 
    exportDatabaseJSON, 
    restoreDatabaseJSON, 
    resetDatabaseToDefaults, 
    settings, 
    teachers, 
    students, 
    feeTransactions, 
    auditLogs, 
    t 
  } = useSchool();

  const [restoreMessage, setRestoreMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleDownloadBackup = () => {
    const jsonStr = exportDatabaseJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `VidyaERP_Backup_${settings.schoolCode}_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = restoreDatabaseJSON(content);
      if (res.success) {
        setRestoreMessage({ text: res.message, isError: false });
      } else {
        setRestoreMessage({ text: res.message, isError: true });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Estimate storage usage
  const estimatedStorageKB = Math.round(
    (JSON.stringify({ teachers, students, feeTransactions, auditLogs }).length * 2) / 1024
  );

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Database className="w-6 h-6 text-sky-600" />
            {t('Cloud Database & Local Backup System', 'क्लाउड डेटाबेस एवं बैकअप सिस्टम')}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {t('Persistent cloud synchronization, 1-click JSON database backups, offline local caching, and disaster recovery.', 'डेटाबेस का सुरक्षित बैकअप लें, क्लाउड सिंक करें एवं ऑफ़लाइन कार्यक्षमता प्रबंधित करें।')}
          </p>
        </div>

        <button
          onClick={syncWithCloud}
          disabled={isSyncing}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm shadow-md shadow-sky-600/20 active:scale-95 transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>{isSyncing ? t('Synchronizing Cloud Node...', 'सिंक हो रहा है...') : t('Sync Database Now', 'डेटाबेस अभी सिंक करें')}</span>
        </button>
      </div>

      {/* Cloud & Network Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Network & Offline Mode Card */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {t('Network Connectivity', 'नेटवर्क स्थिति')}
              </span>
              {isOnline ? (
                <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Online
                </span>
              ) : (
                <span className="flex items-center gap-1 text-xs font-bold text-amber-500">
                  <WifiOff className="w-3.5 h-3.5" />
                  Offline Local
                </span>
              )}
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {isOnline 
                ? t('Connected to High-Availability Cloud replica. Real-time updates active.', 'क्लाउड रेप्लिका से जुड़ा हुआ है। सभी बदलाव तुरंत सिंक हो रहे हैं।')
                : t('Offline mode active. Changes are safely saved to local storage and will sync automatically.', 'ऑफ़लाइन मोड सक्रिय है। डेटा स्थानीय स्टोरेज में सुरक्षित है।')}
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {t('Toggle Network State:', 'नेटवर्क टॉगल करें:')}
            </span>
            <button
              onClick={toggleOnlineMode}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors ${
                isOnline 
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200' 
                  : 'bg-emerald-600 text-white'
              }`}
            >
              {isOnline ? t('Simulate Offline', 'ऑफ़लाइन बनाएं') : t('Go Online', 'ऑनलाइन करें')}
            </button>
          </div>
        </div>

        {/* Cloud Snapshot Info */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
              {t('Last Cloud Synchronization', 'अंतिम क्लाउड सिंक')}
            </span>
            <p className="text-lg font-extrabold text-slate-900 dark:text-white font-mono">
              {settings.lastBackupDate || '2026-09-29 14:30:00'}
            </p>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-1 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              AES-256 Encrypted Cloud Snapshot
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 flex justify-between">
            <span>Server Region: <strong>asia-east1</strong></span>
            <span>Latency: <strong>24ms</strong></span>
          </div>
        </div>

        {/* Local Storage & Cache Size */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
              {t('Local Database Volume', 'स्थानीय डेटाबेस आकार')}
            </span>
            <p className="text-lg font-extrabold text-slate-900 dark:text-white">
              ~{estimatedStorageKB} KB
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {teachers.length} faculty, {students.length} students, {feeTransactions.length} fee receipts
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between text-xs text-slate-500">
            <span>Storage Engine: <strong>IndexedDB / Local</strong></span>
            <span>Version: <strong>2.0.0</strong></span>
          </div>
        </div>

      </div>

      {/* Backup and Restore Action Blocks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Export Card */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950 text-sky-600 flex items-center justify-center">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                {t('Export Full School Database Archive', 'पूर्ण डेटाबेस डाउनलोड करें')}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t('Generates a standalone JSON backup containing teachers, students, fees, attendance and audit logs.', 'सभी स्कूल रिकॉर्ड्स का JSON बैकअप बनाएं।')}
              </p>
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl text-xs space-y-1.5 text-slate-600 dark:text-slate-300">
            <div className="flex justify-between">
              <span>Faculty Directory:</span>
              <strong className="text-slate-800 dark:text-slate-200">{teachers.length} profiles</strong>
            </div>
            <div className="flex justify-between">
              <span>Student Enrolled Roster:</span>
              <strong className="text-slate-800 dark:text-slate-200">{students.length} records</strong>
            </div>
            <div className="flex justify-between">
              <span>Accounting Receipts:</span>
              <strong className="text-slate-800 dark:text-slate-200">{feeTransactions.length} receipts</strong>
            </div>
            <div className="flex justify-between">
              <span>Audit Security Logs:</span>
              <strong className="text-slate-800 dark:text-slate-200">{auditLogs.length} entries</strong>
            </div>
          </div>

          <button
            onClick={handleDownloadBackup}
            className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-md shadow-sky-600/20 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>{t('Download JSON Backup File', 'JSON बैकअप फ़ाइल डाउनलोड करें')}</span>
          </button>
        </div>

        {/* Restore Card */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                {t('Restore School Database from Backup', 'बैकअप से डेटाबेस पुनर्स्थापित करें')}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t('Upload an earlier exported JSON archive. Verifies schema integrity before restoring.', 'पूर्व में लिए गए JSON बैकअप को अपलोड करके डेटा बहाल करें।')}
              </p>
            </div>
          </div>

          {restoreMessage && (
            <div className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
              restoreMessage.isError 
                ? 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300' 
                : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
            }`}>
              {restoreMessage.isError ? <AlertTriangle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
              <span>{restoreMessage.text}</span>
            </div>
          )}

          <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-6 text-center hover:border-emerald-500 transition-colors">
            <FileJson className="w-8 h-8 mx-auto mb-2 text-slate-400" />
            <label className="cursor-pointer">
              <span className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs inline-block shadow-xs transition-colors">
                {t('Choose Backup JSON File', 'बैकअप JSON फ़ाइल चुनें')}
              </span>
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
            <p className="text-[11px] text-slate-400 mt-2">Supports official VidyaERP v2.x schema files</p>
          </div>
        </div>

      </div>

      {/* Danger Zone: Factory Reset */}
      <div className="p-5 rounded-2xl border border-rose-200 dark:border-rose-900/40 bg-rose-50/30 dark:bg-rose-950/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="font-bold text-sm text-rose-900 dark:text-rose-300 flex items-center gap-2">
            <RotateCcw className="w-4 h-4" />
            <span>{t('Reset Database to Factory Defaults', 'डेटाबेस को डिफ़ॉल्ट पर रीसेट करें')}</span>
          </h4>
          <p className="text-xs text-rose-700/80 dark:text-rose-400 mt-0.5">
            {t('Reverts all teacher profiles, student records, fee transactions, and chats back to initial seed data.', 'सभी रिकॉर्ड्स को प्रारंभिक डेमो डेटा पर रीसेट करें।')}
          </p>
        </div>

        <button
          onClick={() => setShowResetConfirm(true)}
          className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs active:scale-95 transition-all shrink-0"
        >
          {t('Reset Database Defaults', 'रीसेट करें')}
        </button>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-600 mx-auto flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {t('Confirm Factory Reset?', 'क्या आप रीसेट करना चाहते हैं?')}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {t('This will replace any changes made during this session with the default Delhi Public Global Academy dataset.', 'यह आपके द्वारा किए गए सभी परिवर्तनों को प्रारंभिक डेटा से बदल देगा।')}
              </p>
            </div>

            <div className="flex gap-2 justify-center pt-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 font-semibold text-xs text-slate-700 dark:text-slate-300"
              >
                {t('Cancel', 'रद्द करें')}
              </button>
              <button
                onClick={() => {
                  resetDatabaseToDefaults();
                  setShowResetConfirm(false);
                }}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs"
              >
                {t('Yes, Reset Now', 'हाँ, रीसेट करें')}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
