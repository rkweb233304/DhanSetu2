import React, { useEffect, useState } from 'react';
import { FileText, ShieldCheck, CheckCircle2, XCircle, Clock, ArrowRight, Building2, Wallet } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { supabaseService, generateLoanId } from '../../services/supabaseService';
import { ActiveLoan, LoanApplication } from '../../types';

export const AdminApplicationsScreen: React.FC = () => {
  const { kycRequests, fetchKycRequests, applications, showToast } = useApp();
  const [subTab, setSubTab] = useState<'kyc' | 'withdrawals'>('kyc');

  // KYC Allotment Modal State
  const [selectedKyc, setSelectedKyc] = useState<any | null>(null);
  const [allotmentAmount, setAllotmentAmount] = useState<number>(3000);

  // Withdrawal Application Approval Modal State
  const [selectedWithdrawalApp, setSelectedWithdrawalApp] = useState<LoanApplication | null>(null);

  useEffect(() => {
    fetchKycRequests();
  }, []);

  const pendingWithdrawalApps = applications.filter(a => a.currentStage === 'submitted' || a.retailerStatus === 'pending');

  const handleApproveKYC = async () => {
    if (!selectedKyc) return;
    try {
      // 1. Update KYC status in Supabase and allocate loan limit
      await supabaseService.request(`kyc_documents?customer_id=eq.${selectedKyc.customer_id}`, 'PATCH', {
        overall_status: 'verified',
        verified_at: new Date().toISOString()
      });

      await supabaseService.request(`auth_users?customer_id=eq.${selectedKyc.customer_id}`, 'PATCH', {
        approved_loan_limit: allotmentAmount
      });

      showToast(`KYC Approved & Loan Limit of ₹${allotmentAmount} allocated!`, 'success');
      setSelectedKyc(null);
      fetchKycRequests();
    } catch (e) {
      showToast('Failed to approve KYC', 'error');
    }
  };

  const handleApproveWithdrawal = async (app: LoanApplication) => {
    try {
      const loanId = generateLoanId(app.customerId || '2026102401');
      const newActiveLoan: ActiveLoan = {
        id: loanId,
        customerId: app.customerId,
        loanNumber: loanId,
        title: app.loanTitle,
        originalAmount: app.requestedAmount,
        outstandingBalance: app.requestedAmount + Math.round(app.requestedAmount * 0.07), // 7% monthly interest added
        monthlyEmi: Math.round((app.requestedAmount + Math.round(app.requestedAmount * 0.07)) / app.tenureMonths),
        interestRate: 84, // 7% monthly * 12
        totalEmis: app.tenureMonths,
        paidEmis: 0,
        nextEmiDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB'),
        startDate: new Date().toLocaleDateString('en-GB'),
        status: 'active'
      };

      await supabaseService.saveActiveLoanToTable(newActiveLoan);

      // Update application stage to approved/disbursed
      const updatedApp: LoanApplication = {
        ...app,
        currentStage: 'disbursed',
        retailerStatus: 'approved',
        stageProgress: 100
      };
      await supabaseService.saveApplicationToTable(updatedApp);

      showToast(`Withdrawal approved! Active Loan ${loanId} created.`, 'success');
      setSelectedWithdrawalApp(null);
    } catch (e) {
      showToast('Failed to approve withdrawal', 'error');
    }
  };

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar bg-slate-50 text-slate-900 p-4 pb-28 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Loan & KYC Applications</h1>
          <p className="text-xs text-slate-500">Approve KYC documents and customer withdrawal requests</p>
        </div>
        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
          <FileText className="w-5 h-5" />
        </div>
      </div>

      <div className="flex bg-slate-200 p-1 rounded-2xl text-xs font-semibold">
        <button
          onClick={() => setSubTab('kyc')}
          className={`flex-1 py-2 rounded-xl transition-all ${subTab === 'kyc' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'}`}
        >
          <span>Pending KYC ({kycRequests.length})</span>
        </button>
        <button
          onClick={() => setSubTab('withdrawals')}
          className={`flex-1 py-2 rounded-xl transition-all ${subTab === 'withdrawals' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'}`}
        >
          <span>Withdrawal Requests ({pendingWithdrawalApps.length})</span>
        </button>
      </div>

      {subTab === 'kyc' && (
        <div className="space-y-3">
          {kycRequests.length === 0 ? (
            <div className="p-8 bg-white border border-slate-200 rounded-3xl text-center text-xs text-slate-500">
              No pending KYC requests.
            </div>
          ) : (
            kycRequests.map((req) => (
              <div key={req.id} className="p-4 bg-white border border-slate-200 rounded-3xl shadow-xs space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{req.full_name || 'Customer'}</h3>
                    <span className="text-[10px] text-slate-500 font-mono">ID: {req.customer_id}</span>
                  </div>
                  <span className="text-[10px] bg-amber-50 text-amber-800 border border-amber-200 font-bold px-2 py-0.5 rounded-full">
                    Awaiting KYC Review
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {['selfie_url', 'aadhar_front_url', 'aadhar_back_url', 'pan_url'].map(key => (
                    <div key={key} className="aspect-square bg-slate-100 rounded-xl overflow-hidden border border-slate-200">
                      {req[key] ? (
                        <img src={req[key]} alt={key} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[8px] text-slate-400">No Image</div>
                      )}
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setSelectedKyc(req)}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Approve KYC & Allot Loan Limit</span>
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {subTab === 'withdrawals' && (
        <div className="space-y-3">
          {pendingWithdrawalApps.length === 0 ? (
            <div className="p-8 bg-white border border-slate-200 rounded-3xl text-center text-xs text-slate-500">
              No pending withdrawal applications.
            </div>
          ) : (
            pendingWithdrawalApps.map((app) => (
              <div key={app.id} className="p-4 bg-white border border-slate-200 rounded-3xl shadow-xs space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-mono text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                      Customer ID: {app.customerId}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 mt-1">{app.customerName}</h3>
                    <span className="text-[10px] text-slate-500 font-mono">{app.customerMobile}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-black font-mono text-slate-900 block">₹{app.requestedAmount.toLocaleString('en-IN')}</span>
                    <span className="text-[10px] text-amber-600 font-bold">Pending Withdrawal</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1">
                  <div className="flex justify-between"><span className="text-slate-500">Loan Product:</span><span className="font-bold text-slate-800">{app.loanTitle}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Tenure & Interest:</span><span className="font-bold text-slate-800">{app.tenureMonths} Months @ 7% monthly</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Disbursal Mode:</span><span className="font-bold text-emerald-700 uppercase">{app.disbursalChannel || 'UPI'}</span></div>
                  {app.disbursalChannel === 'upi' ? (
                    <div className="flex justify-between"><span className="text-slate-500">UPI ID:</span><span className="font-mono font-bold text-slate-800">{app.upiId || 'user@paytm'}</span></div>
                  ) : (
                    <div className="flex justify-between"><span className="text-slate-500">Bank Details:</span><span className="font-mono text-slate-800">{app.targetBankAccount || 'A/C ••••4892'}</span></div>
                  )}
                </div>

                <button
                  onClick={() => handleApproveWithdrawal(app)}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Approve Withdrawal & Create Loan ID</span>
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* KYC ALLOTMENT MODAL */}
      {selectedKyc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-sm bg-white border border-slate-200 rounded-3xl p-5 shadow-2xl text-slate-900 space-y-4">
            <h3 className="text-sm font-bold">Approve KYC & Allot Loan Amount</h3>
            <p className="text-xs text-slate-500">Allot approved loan limit for {selectedKyc.full_name}:</p>
            
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700">Approved Loan Limit (₹):</label>
              <input 
                type="number" 
                min={500}
                max={5000}
                value={allotmentAmount} 
                onChange={e => setAllotmentAmount(Number(e.target.value))} 
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-sm"
              />
              <span className="text-[10px] text-slate-400 block">Tier 1: Up to ₹2,000 (1 Mo) · Tier 2: ₹2,100 to ₹5,000 (3 Mo) @ 7% monthly</span>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={handleApproveKYC}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs cursor-pointer shadow-md"
              >
                Confirm KYC & Allot
              </button>
              <button
                onClick={() => setSelectedKyc(null)}
                className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
