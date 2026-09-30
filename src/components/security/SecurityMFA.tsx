import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  KeyRound, 
  Smartphone, 
  CheckCircle2, 
  AlertTriangle, 
  Lock, 
  Unlock, 
  Eye, 
  History, 
  RefreshCw,
  QrCode,
  Fingerprint
} from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';

export const SecurityMFA: React.FC = () => {
  const { 
    mfaEnabled, 
    toggleMFA, 
    verifyMFA, 
    currentUser, 
    auditLogs, 
    t 
  } = useSchool();

  const [testCode, setTestCode] = useState('');
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [simulatedTotp, setSimulatedTotp] = useState('894201');
  const [secondsLeft, setSecondsLeft] = useState(24);

  // Generate dynamic 6-digit TOTP simulation
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          // Generate new simulated TOTP
          const newCode = String(Math.floor(100000 + Math.random() * 900000));
          setSimulatedTotp(newCode);
          return 30;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleTestVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (testCode.trim() === simulatedTotp || testCode.trim() === '123456' || verifyMFA(testCode.trim())) {
      setTestResult({ success: true, message: 'Authentication Successful! TOTP token validated.' });
    } else {
      setTestResult({ success: false, message: 'Invalid 6-digit code. Please enter the current code.' });
    }
  };

  const rolesMatrix = [
    { module: 'View Financial Balance & Fee Ledgers', principal: true, teacher: false, accountant: true, parent: false },
    { module: 'Disburse Teacher Salaries & Print Slips', principal: true, teacher: false, accountant: true, parent: false },
    { module: 'Edit Student Academic Grades & Reports', principal: true, teacher: true, accountant: false, parent: false },
    { module: 'Mark Daily Student & Faculty Attendance', principal: true, teacher: true, accountant: false, parent: false },
    { module: 'Download Full Database Backup & Reset', principal: true, teacher: false, accountant: false, parent: false },
    { module: 'Post School-Wide Emergency Broadcasts', principal: true, teacher: false, accountant: false, parent: false },
  ];

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-600" />
            {t('Multi-Factor Authentication (MFA) & Security Audit', 'द्वि-चरणीय प्रमाणीकरण (2FA) एवं सुरक्षा ऑडिट')}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {t('Manage institutional security standards, TOTP two-step verification, RBAC permissions, and review audit logs.', 'संस्थागत सुरक्षा नीतियां, 2FA प्रमाणीकरण एवं ऑडिट लॉग की निगरानी करें।')}
          </p>
        </div>

        <div className="flex items-center gap-3 bg-white dark:bg-slate-900 px-4 py-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
            {t('MFA Policy Status:', '2FA सुरक्षा स्थिति:')}
          </span>
          <button
            onClick={() => toggleMFA(!mfaEnabled)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              mfaEnabled ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                mfaEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
          <span className={`text-xs font-bold uppercase ${mfaEnabled ? 'text-emerald-600' : 'text-slate-400'}`}>
            {mfaEnabled ? 'Enforced' : 'Optional'}
          </span>
        </div>
      </div>

      {/* MFA Setup and Simulator Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Card 1: Virtual Authenticator App Simulation */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                {t('Google Authenticator / TOTP Simulation', 'प्रमाणीकरण ऐप सिम्युलेटर (Google Authenticator)')}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t('Time-based One-Time Password token for', 'समय-आधारित वन-टाइम पासवर्ड:')} {currentUser.email}
              </p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-center space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
              VidyaERP : {currentUser.name}
            </span>
            <div className="text-3xl sm:text-4xl font-mono font-extrabold tracking-widest text-indigo-600 dark:text-indigo-400">
              {simulatedTotp.slice(0, 3)} {simulatedTotp.slice(3)}
            </div>
            
            {/* Progress countdown */}
            <div className="max-w-xs mx-auto space-y-1 pt-1">
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>Refreshes in {secondsLeft}s</span>
                <span>SHA-256</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-indigo-600 h-full rounded-full transition-all duration-1000 ease-linear"
                  style={{ width: `${(secondsLeft / 30) * 100}%` }}
                />
              </div>
            </div>
          </div>

          <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-xl border border-indigo-100 dark:border-indigo-900/40 text-xs text-slate-600 dark:text-slate-400 flex items-center gap-2">
            <Fingerprint className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>{t('MFA prompt will require this code when executing sensitive actions like salary disbursement and database restores.', 'वेतन भुगतान या बैकअप जैसी संवेदनशील क्रियाओं पर यह 2FA कोड मांगा जाता है।')}</span>
          </div>
        </div>

        {/* Card 2: 2FA Test Verification Form */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                {t('Test Two-Factor Authentication Verification', '2FA कोड सत्यापन परीक्षण')}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t('Verify that your virtual authenticator code works correctly.', 'परीक्षण के लिए 6 अंकों का कोड दर्ज करें।')}
              </p>
            </div>
          </div>

          {testResult && (
            <div className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
              testResult.success 
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' 
                : 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
            }`}>
              {testResult.success ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
              <span>{testResult.message}</span>
            </div>
          )}

          <form onSubmit={handleTestVerify} className="space-y-3">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                {t('Enter 6-Digit Authenticator Code:', '6 अंकों का कोड दर्ज करें:')}
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  maxLength={6}
                  placeholder={simulatedTotp}
                  value={testCode}
                  onChange={(e) => setTestCode(e.target.value)}
                  className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-center font-mono font-extrabold text-lg tracking-widest text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => setTestCode(simulatedTotp)}
                  className="px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-xl hover:bg-slate-200 transition-colors"
                >
                  {t('Auto-fill', 'स्वतः भरें')}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
            >
              {t('Validate Authentication Token', 'प्रमाणीकरण टोकन जांचें')}
            </button>
          </form>

          <p className="text-[11px] text-slate-400">
            Default test tokens accepted: current animated TOTP, or universal test key <code className="font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">123456</code>.
          </p>
        </div>

      </div>

      {/* Role-Based Access Control (RBAC) Permission Matrix */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">
            {t('Role-Based Access Control (RBAC) Permissions Matrix', 'भूमिका-आधारित पहुंच नियंत्रण (RBAC)')}
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {t('Configured privileges across Principal, Teacher, Accountant and Parent roles', 'विभिन्न उपयोगकर्ता भूमिकाओं के लिए अनुमतियां')}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase font-bold text-[10px] tracking-wider">
              <tr>
                <th className="p-4">Module Privilege</th>
                <th className="p-4 text-center">Principal & Director</th>
                <th className="p-4 text-center">Faculty / Teacher</th>
                <th className="p-4 text-center">Accountant / Cashier</th>
                <th className="p-4 text-center">Student / Parent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {rolesMatrix.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                  <td className="p-4 font-semibold text-slate-800 dark:text-slate-200">{row.module}</td>
                  <td className="p-4 text-center">
                    <span className="inline-block p-1 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                      <CheckCircle2 className="w-4 h-4" />
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    {row.teacher ? (
                      <span className="inline-block p-1 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                        <CheckCircle2 className="w-4 h-4" />
                      </span>
                    ) : (
                      <span className="inline-block text-slate-300 dark:text-slate-700 font-bold">—</span>
                    )}
                  </td>
                  <td className="p-4 text-center">
                    {row.accountant ? (
                      <span className="inline-block p-1 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                        <CheckCircle2 className="w-4 h-4" />
                      </span>
                    ) : (
                      <span className="inline-block text-slate-300 dark:text-slate-700 font-bold">—</span>
                    )}
                  </td>
                  <td className="p-4 text-center">
                    {row.parent ? (
                      <span className="inline-block p-1 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                        <CheckCircle2 className="w-4 h-4" />
                      </span>
                    ) : (
                      <span className="inline-block text-slate-300 dark:text-slate-700 font-bold">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Security Audit Log Stream */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-slate-400" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              {t('Institutional Security & Operational Audit Log', 'सुरक्षा एवं संचालन ऑडिट लॉग')}
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {auditLogs.length} events logged
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase font-bold text-[10px] tracking-wider">
              <tr>
                <th className="p-4">{t('Timestamp', 'समय')}</th>
                <th className="p-4">{t('Actor & Role', 'उपयोगकर्ता')}</th>
                <th className="p-4">{t('Action Recorded', 'कार्रवाई')}</th>
                <th className="p-4">{t('Category', 'श्रेणी')}</th>
                <th className="p-4">{t('Details', 'विवरण')}</th>
                <th className="p-4">{t('IP Address', 'आईपी पता')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {auditLogs.slice(0, 10).map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                  <td className="p-4 font-mono text-[11px] text-slate-400">
                    {log.timestamp}
                  </td>
                  <td className="p-4">
                    <p className="font-bold text-slate-800 dark:text-slate-200">{log.user}</p>
                    <span className="text-[10px] font-semibold uppercase text-slate-400">{log.role}</span>
                  </td>
                  <td className="p-4 font-semibold text-slate-900 dark:text-white">
                    {log.action}
                  </td>
                  <td className="p-4">
                    <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                      log.category === 'security' ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300' :
                      log.category === 'fee' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' :
                      log.category === 'backup' ? 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300' :
                      'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}>
                      {log.category}
                    </span>
                  </td>
                  <td className="p-4 text-slate-600 dark:text-slate-400">
                    {log.details}
                  </td>
                  <td className="p-4 font-mono text-[11px] text-slate-400">
                    {log.ipAddress}
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
