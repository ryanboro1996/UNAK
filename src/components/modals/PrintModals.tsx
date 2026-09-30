import React from 'react';
import { Printer, X, Download, School, CheckCircle2 } from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';
import { FeeTransaction, TeacherSalarySlip, Student, StudentAcademicReport } from '../../types';
import { SchoolLogo } from '../common/SchoolLogo';

export const PrintModals: React.FC = () => {
  const { activePrintDoc, closePrintDoc, settings, t } = useSchool();

  if (!activePrintDoc) return null;

  const handlePrint = () => {
    window.print();
  };

  const numberToWords = (num: number): string => {
    // Basic INR representation for pay slips
    const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    
    if ((num = num.toString().length > 9 ? parseFloat(num.toString().slice(0, 9)) : num) === 0) return 'Zero Rupees Only';
    let n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!n) return 'Rupees Only';
    let str = '';
    str += (Number(n[1]) !== 0) ? (a[Number(n[1])] || b[Number(n[1][0])] + ' ' + a[Number(n[1][1])]) + 'Crore ' : '';
    str += (Number(n[2]) !== 0) ? (a[Number(n[2])] || b[Number(n[2][0])] + ' ' + a[Number(n[2][1])]) + 'Lakh ' : '';
    str += (Number(n[3]) !== 0) ? (a[Number(n[3])] || b[Number(n[3][0])] + ' ' + a[Number(n[3][1])]) + 'Thousand ' : '';
    str += (Number(n[4]) !== 0) ? (a[Number(n[4])] || b[Number(n[4][0])] + ' ' + a[Number(n[4][1])]) + 'Hundred ' : '';
    str += (Number(n[5]) !== 0) ? ((str !== '') ? 'and ' : '') + (a[Number(n[5])] || b[Number(n[5][0])] + ' ' + a[Number(n[5][1])]) + 'Rupees Only' : 'Rupees Only';
    return str;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white text-slate-900 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative my-8 print:m-0 print:p-0 print:max-w-none print:shadow-none print:rounded-none">
        
        {/* Modal Controls (Hidden in print) */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-6 no-print">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <h3 className="font-bold text-sm text-slate-700 uppercase tracking-wider">
              {activePrintDoc.type === 'fee_receipt' && t('Official Fee Payment Receipt', 'आधिकारिक शुल्क रसीद')}
              {activePrintDoc.type === 'salary_slip' && t('Official Faculty Salary Pay Slip', 'आधिकारिक शिक्षक वेतन पर्ची')}
              {activePrintDoc.type === 'report_card' && t('Official Academic Progress Card', 'आधिकारिक प्रगति पत्र / रिपोर्ट कार्ड')}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>{t('Print / Save PDF', 'प्रिंट / पीडीएफ')}</span>
            </button>

            <button
              onClick={closePrintDoc}
              className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 1. FEE RECEIPT TEMPLATE */}
        {activePrintDoc.type === 'fee_receipt' && (() => {
          const tx: FeeTransaction = activePrintDoc.data;
          return (
            <div className="printable-document border border-slate-300 rounded-2xl p-6 sm:p-8 space-y-6">
              
              {/* Header */}
              <div className="text-center border-b pb-4">
                <SchoolLogo className="w-16 h-16 mx-auto mb-2 rounded-full border-2 border-black bg-yellow-400 p-0.5 shadow-md" />
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight uppercase">
                  {settings.schoolName}
                </h1>
                <p className="text-xs text-slate-600 mt-0.5">{settings.address}</p>
                <p className="text-[11px] text-slate-500 font-medium">
                  Affiliation No: <strong>{settings.affiliationNo}</strong> • School Code: <strong>{settings.schoolCode}</strong>
                </p>
                <div className="mt-2 inline-block px-3 py-1 bg-amber-50 border border-amber-200 rounded-full text-xs font-bold text-amber-800 uppercase tracking-widest">
                  Official Fee Receipt
                </div>
              </div>

              {/* Receipt & Student Details */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <p><span className="text-slate-500 font-medium">Receipt No:</span> <strong className="font-mono">{tx.receiptNo}</strong></p>
                  <p className="mt-1"><span className="text-slate-500 font-medium">Student Name:</span> <strong>{tx.studentName}</strong></p>
                  <p className="mt-1"><span className="text-slate-500 font-medium">Class & Section:</span> <strong>{tx.grade} ({tx.section})</strong></p>
                </div>
                <div className="text-right">
                  <p><span className="text-slate-500 font-medium">Date of Issue:</span> <strong>{tx.paymentDate}</strong></p>
                  <p className="mt-1"><span className="text-slate-500 font-medium">Payment Mode:</span> <strong className="uppercase">{tx.paymentMethod}</strong></p>
                  <p className="mt-1"><span className="text-slate-500 font-medium">Academic Year:</span> <strong>{settings.academicYear}</strong></p>
                </div>
              </div>

              {/* Fee Breakdown Table */}
              <table className="w-full text-left text-xs border border-slate-200">
                <thead className="bg-slate-100 font-bold uppercase text-[10px] text-slate-700 border-b border-slate-200">
                  <tr>
                    <th className="p-3">#</th>
                    <th className="p-3">Fee Particulars</th>
                    <th className="p-3 text-right">Amount (INR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {tx.feeBreakdown ? (
                    <>
                      {tx.feeBreakdown.admissionFee > 0 && (
                        <tr>
                          <td className="p-2.5 font-mono">1</td>
                          <td className="p-2.5 font-semibold">Admission Fee (नामांकन शुल्क)</td>
                          <td className="p-2.5 text-right font-bold">₹{tx.feeBreakdown.admissionFee.toLocaleString('en-IN')}</td>
                        </tr>
                      )}
                      {tx.feeBreakdown.tuitionFee > 0 && (
                        <tr>
                          <td className="p-2.5 font-mono">2</td>
                          <td className="p-2.5 font-semibold">Tuition Fee (ट्यूशन शुल्क)</td>
                          <td className="p-2.5 text-right font-bold">₹{tx.feeBreakdown.tuitionFee.toLocaleString('en-IN')}</td>
                        </tr>
                      )}
                      {tx.feeBreakdown.festiveFee > 0 && (
                        <tr>
                          <td className="p-2.5 font-mono">3</td>
                          <td className="p-2.5 font-semibold">Festive Fee (सरस्वती पूजा व उत्सव शुल्क)</td>
                          <td className="p-2.5 text-right font-bold">₹{tx.feeBreakdown.festiveFee.toLocaleString('en-IN')}</td>
                        </tr>
                      )}
                      {tx.feeBreakdown.bookFee > 0 && (
                        <tr>
                          <td className="p-2.5 font-mono">4</td>
                          <td className="p-2.5 font-semibold">Book & Study Materials Fee (किताब शुल्क)</td>
                          <td className="p-2.5 text-right font-bold">₹{tx.feeBreakdown.bookFee.toLocaleString('en-IN')}</td>
                        </tr>
                      )}
                      {tx.feeBreakdown.uniformFee > 0 && (
                        <tr>
                          <td className="p-2.5 font-mono">5</td>
                          <td className="p-2.5 font-semibold">School Uniform Fee (यूनिफॉर्म शुल्क)</td>
                          <td className="p-2.5 text-right font-bold">₹{tx.feeBreakdown.uniformFee.toLocaleString('en-IN')}</td>
                        </tr>
                      )}
                      {tx.feeBreakdown.examFee > 0 && (
                        <tr>
                          <td className="p-2.5 font-mono">6</td>
                          <td className="p-2.5 font-semibold">Examination & Evaluation Fee (परीक्षा शुल्क)</td>
                          <td className="p-2.5 text-right font-bold">₹{tx.feeBreakdown.examFee.toLocaleString('en-IN')}</td>
                        </tr>
                      )}
                      {tx.feeBreakdown.otherFee > 0 && (
                        <tr>
                          <td className="p-2.5 font-mono">7</td>
                          <td className="p-2.5 font-semibold">Development & Activity Fee (विकास व अन्य शुल्क)</td>
                          <td className="p-2.5 text-right font-bold">₹{tx.feeBreakdown.otherFee.toLocaleString('en-IN')}</td>
                        </tr>
                      )}
                    </>
                  ) : (
                    <tr>
                      <td className="p-3 font-mono">1</td>
                      <td className="p-3 font-semibold">{tx.feeType}</td>
                      <td className="p-3 text-right font-bold">₹{tx.amount.toLocaleString('en-IN')}</td>
                    </tr>
                  )}

                  {tx.lateFine > 0 && (
                    <tr>
                      <td className="p-3 font-mono">•</td>
                      <td className="p-3">Late Fine / Delayed Charge</td>
                      <td className="p-3 text-right font-bold">₹{tx.lateFine.toLocaleString('en-IN')}</td>
                    </tr>
                  )}
                  {tx.discount > 0 && (
                    <tr>
                      <td className="p-3 font-mono">•</td>
                      <td className="p-3 text-emerald-600">Scholarship / Fee Concession</td>
                      <td className="p-3 text-right font-bold text-emerald-600">-₹{tx.discount.toLocaleString('en-IN')}</td>
                    </tr>
                  )}
                </tbody>
                <tfoot className="bg-slate-50 border-t-2 border-slate-300 font-bold text-sm">
                  <tr>
                    <td colSpan={2} className="p-3 text-right">Total Net Amount Paid:</td>
                    <td className="p-3 text-right text-emerald-700 font-extrabold">₹{tx.amount.toLocaleString('en-IN')}</td>
                  </tr>
                </tfoot>
              </table>

              <div className="text-xs text-slate-600">
                <p><strong>Amount in Words:</strong> {numberToWords(tx.amount)}</p>
                {tx.notes && <p className="mt-1 text-[11px] text-slate-500 italic">Notes: {tx.notes}</p>}
              </div>

              {/* Signatures */}
              <div className="pt-8 grid grid-cols-2 gap-8 text-xs text-center">
                <div>
                  <div className="border-b border-slate-300 w-36 mx-auto mb-1"></div>
                  <p className="font-semibold text-slate-700">Cashier / Accountant</p>
                  <p className="text-[10px] text-slate-400">{tx.collectedBy}</p>
                </div>
                <div>
                  <div className="border-b border-slate-300 w-36 mx-auto mb-1"></div>
                  <p className="font-bold text-slate-900">{settings.principalName}</p>
                  <p className="text-[10px] text-slate-500 font-semibold">Principal & Director</p>
                </div>
              </div>

            </div>
          );
        })()}

        {/* 2. SALARY SLIP TEMPLATE */}
        {activePrintDoc.type === 'salary_slip' && (() => {
          const slip: TeacherSalarySlip = activePrintDoc.data;
          return (
            <div className="printable-document border border-slate-300 rounded-2xl p-6 sm:p-8 space-y-6">
              
              {/* Header */}
              <div className="text-center border-b pb-4">
                <SchoolLogo className="w-14 h-14 mx-auto mb-2 rounded-full border border-black bg-yellow-400 p-0.5 shadow-sm" />
                <h1 className="text-xl font-black text-slate-900 uppercase">{settings.schoolName}</h1>
                <p className="text-xs text-slate-500">{settings.address}</p>
                <div className="mt-2 inline-block px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-full text-xs font-bold text-emerald-800 uppercase tracking-widest">
                  Faculty Salary Slip: {slip.month} {slip.year}
                </div>
              </div>

              {/* Staff Details */}
              <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <p><span className="text-slate-500 font-medium">Employee Name:</span> <strong>{slip.teacherName}</strong></p>
                  <p className="mt-1"><span className="text-slate-500 font-medium">Employee ID:</span> <strong className="font-mono">{slip.empId}</strong></p>
                  <p className="mt-1"><span className="text-slate-500 font-medium">Department:</span> <strong>{slip.department}</strong></p>
                </div>
                <div className="text-right">
                  <p><span className="text-slate-500 font-medium">Pay Slip No:</span> <strong className="font-mono">{slip.slipNo}</strong></p>
                  <p className="mt-1"><span className="text-slate-500 font-medium">Disbursement Date:</span> <strong>{slip.paymentDate || '2026-09-28'}</strong></p>
                  <p className="mt-1"><span className="text-slate-500 font-medium">Payment Mode:</span> <strong className="uppercase">{slip.paymentMode || 'NEFT'}</strong></p>
                </div>
              </div>

              {/* Earnings vs Deductions Table */}
              <div className="grid grid-cols-2 gap-4">
                {/* Earnings */}
                <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                  <div className="bg-slate-100 p-2 font-bold uppercase text-[10px] text-slate-700">Earnings</div>
                  <div className="p-3 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Basic Pay:</span>
                      <strong className="font-bold">₹{slip.basicPay.toLocaleString('en-IN')}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">House Rent Allowance (HRA):</span>
                      <strong className="font-bold">₹{slip.hra.toLocaleString('en-IN')}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Special Allowances:</span>
                      <strong className="font-bold">₹{slip.specialAllowance.toLocaleString('en-IN')}</strong>
                    </div>
                    <div className="pt-2 border-t flex justify-between font-extrabold text-slate-900">
                      <span>Gross Earnings:</span>
                      <span>₹{slip.grossEarnings.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>

                {/* Deductions */}
                <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                  <div className="bg-slate-100 p-2 font-bold uppercase text-[10px] text-slate-700">Deductions</div>
                  <div className="p-3 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Provident Fund (PF):</span>
                      <strong className="font-bold text-rose-600">₹{slip.providentFund.toLocaleString('en-IN')}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Professional Tax & TDS:</span>
                      <strong className="font-bold text-rose-600">₹{slip.professionalTax.toLocaleString('en-IN')}</strong>
                    </div>
                    <div className="pt-5 border-t flex justify-between font-extrabold text-rose-700">
                      <span>Total Deductions:</span>
                      <span>-₹{slip.totalDeductions.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Net Payable Banner */}
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <span className="text-emerald-900 font-bold block uppercase tracking-wider text-[10px]">Net Salary Credited:</span>
                  <span className="text-emerald-800 font-medium">{numberToWords(slip.netPayable)}</span>
                </div>
                <div className="text-xl sm:text-2xl font-black text-emerald-700 font-mono">
                  ₹{slip.netPayable.toLocaleString('en-IN')}
                </div>
              </div>

              {/* Signatures */}
              <div className="pt-6 grid grid-cols-2 gap-8 text-xs text-center">
                <div>
                  <div className="border-b border-slate-300 w-36 mx-auto mb-1"></div>
                  <p className="font-semibold text-slate-700">Accountant / Bursar</p>
                </div>
                <div>
                  <div className="border-b border-slate-300 w-36 mx-auto mb-1"></div>
                  <p className="font-bold text-slate-900">{settings.principalName}</p>
                  <p className="text-[10px] text-slate-500 font-semibold">Principal & Director</p>
                </div>
              </div>

            </div>
          );
        })()}

        {/* 3. STUDENT REPORT CARD TEMPLATE */}
        {activePrintDoc.type === 'report_card' && (() => {
          const { student, report }: { student: Student; report: StudentAcademicReport } = activePrintDoc.data;
          return (
            <div className="printable-document border-2 border-indigo-900/40 rounded-2xl p-6 sm:p-8 space-y-6">
              
              {/* Header */}
              <div className="text-center border-b-2 border-indigo-900/20 pb-4">
                <SchoolLogo className="w-16 h-16 mx-auto mb-2 rounded-full border-2 border-black bg-yellow-400 p-0.5 shadow-md" />
                <h1 className="text-2xl font-black text-slate-900 uppercase">{settings.schoolName}</h1>
                <p className="text-xs text-slate-500">{settings.address} • Affiliation: {settings.affiliationNo}</p>
                <div className="mt-2 inline-block px-4 py-1 bg-indigo-50 border border-indigo-200 rounded-full text-xs font-bold text-indigo-900 uppercase tracking-widest">
                  Academic Progress Report Card • {report.term}
                </div>
              </div>

              {/* Student Details Strip */}
              <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <p><span className="text-slate-500">Student Name:</span> <strong className="text-sm">{student.name}</strong></p>
                  <p className="mt-1"><span className="text-slate-500">Admission No:</span> <strong className="font-mono">{student.admissionNo}</strong></p>
                  <p className="mt-1"><span className="text-slate-500">Father / Mother:</span> <strong>{student.parentName}</strong></p>
                </div>
                <div className="text-right">
                  <p><span className="text-slate-500">Class & Section:</span> <strong>{student.grade} ({student.section})</strong></p>
                  <p className="mt-1"><span className="text-slate-500">Roll No:</span> <strong>#{student.rollNo}</strong></p>
                  <p className="mt-1"><span className="text-slate-500">Term Attendance:</span> <strong>{report.attendanceInTerm}%</strong></p>
                </div>
              </div>

              {/* Marks Table */}
              <table className="w-full text-left text-xs border border-slate-200">
                <thead className="bg-slate-100 font-bold uppercase text-[10px] text-slate-700 border-b border-slate-200">
                  <tr>
                    <th className="p-3">Subject</th>
                    <th className="p-3 text-center">Max Marks</th>
                    <th className="p-3 text-center">Marks Obtained</th>
                    <th className="p-3 text-center">Grade</th>
                    <th className="p-3">Faculty Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {report.subjects.map((sub, i) => (
                    <tr key={i}>
                      <td className="p-3 font-bold text-slate-800">{sub.subject}</td>
                      <td className="p-3 text-center text-slate-500">{sub.maxMarks}</td>
                      <td className="p-3 text-center font-extrabold text-slate-900">{sub.marksObtained}</td>
                      <td className="p-3 text-center font-bold text-indigo-600">{sub.grade}</td>
                      <td className="p-3 text-slate-500 italic text-[11px]">{sub.teacherRemarks || 'Satisfactory progress'}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-50 border-t-2 border-slate-300 font-bold">
                  <tr>
                    <td className="p-3 font-extrabold">Grand Total:</td>
                    <td className="p-3 text-center text-slate-500">{report.totalMax}</td>
                    <td className="p-3 text-center font-black text-indigo-700 text-sm">{report.totalObtained}</td>
                    <td className="p-3 text-center font-black text-emerald-600 text-sm">{report.overallGrade}</td>
                    <td className="p-3 font-bold text-indigo-900">Score: {report.percentage}% (Rank #{report.classRank})</td>
                  </tr>
                </tfoot>
              </table>

              {/* Conduct & Remarks */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs flex justify-between items-center">
                <span>General Conduct & Behavior: <strong>{report.generalConduct}</strong></span>
                <span>Promoted / Result: <strong className="text-emerald-700">PASSED WITH DISTINCTION</strong></span>
              </div>

              {/* Signatures */}
              <div className="pt-10 grid grid-cols-3 gap-4 text-xs text-center">
                <div>
                  <div className="border-b border-slate-300 w-28 mx-auto mb-1"></div>
                  <p className="font-semibold text-slate-700">Class Teacher</p>
                </div>
                <div>
                  <div className="border-b border-slate-300 w-28 mx-auto mb-1"></div>
                  <p className="font-semibold text-slate-700">Parent / Guardian</p>
                </div>
                <div>
                  <div className="border-b border-slate-300 w-28 mx-auto mb-1"></div>
                  <p className="font-bold text-slate-900">{settings.principalName}</p>
                  <p className="text-[10px] text-slate-500 font-semibold">Principal</p>
                </div>
              </div>

            </div>
          );
        })()}

      </div>
    </div>
  );
};
