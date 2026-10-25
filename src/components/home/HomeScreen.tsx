import React, { useState } from 'react';
import { 
  AlertTriangle, 
  ShieldCheck, 
  CreditCard, 
  Calendar, 
  ChevronRight, 
  Wallet,
  Zap,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
  Building2,
  QrCode
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { LoanApplication } from '../../types';

export const HomeScreen: React.FC = () => {
  const { 
    user, 
    setActiveTab, 
    activeLoans,
    showToast,
    applyForLoan
  } = useApp();

  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [disbursalMode, setDisbursalMode] = useState<'upi' | 'bank'>('upi');
  const [upiId, setUpiId] = useState('');
  const [bankDetails, setBankDetails] = useState('');
  const [isSubmittingWithdrawal, setIsSubmittingWithdrawal] = useState(false);

  const isKYCCompleted = user?.kycCompleted && user?.kyc?.overallStatus === 'verified';
  const approvedLimit = user?.approvedLoanLimit || 0;
  const activeLoan = activeLoans.length > 0 ? activeLoans.find(l => l.status === 'active') : null;
  const allLoansClosed = activeLoans.length > 0 && activeLoans.every(l => l.status === 'closed');

  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (disbursalMode === 'upi' && !upiId.trim()) {
      showToast('Please enter your UPI ID', 'error');
      return;
    }
    if (disbursalMode === 'bank' && !bankDetails.trim()) {
      showToast('Please enter your Bank Account details', 'error');
      return;
    }

    setIsSubmittingWithdrawal(true);
    try {
      // Determine loan tier based on approved limit
      const tenure = approvedLimit <= 2000 ? 1 : 3;
      const interestRate = 84; // 7% monthly * 12

      const newApp: LoanApplication = {
        id: `APP-${Date.now()}`,
        customerId: user?.customerId,
        customerName: user?.fullName,
        customerMobile: user?.phoneNumber,
        loanId: 'approved-allotment',
        loanTitle: `Approved Advance (₹${approvedLimit.toLocaleString('en-IN')})`,
        requestedAmount: approvedLimit,
        tenureMonths: tenure,
        interestRate: interestRate,
        monthlyEmi: Math.round((approvedLimit + Math.round(approvedLimit * 0.07)) / tenure),
        totalInterest: Math.round(approvedLimit * 0.07),
        processingFee: Math.round(approvedLimit * 0.01),
        netDisbursalAmount: approvedLimit - Math.round(approvedLimit * 0.01),
        purpose: 'Approved Limit Withdrawal',
        appliedAt: new Date().toLocaleDateString('en-GB'),
        currentStage: 'submitted',
        stageProgress: 50,
        retailerStatus: 'pending',
        disbursalChannel: disbursalMode,
        upiId: disbursalMode === 'upi' ? upiId : undefined,
        targetBankAccount: disbursalMode === 'bank' ? bankDetails : undefined,
        history: []
      };

      await applyForLoan({
        id: 'tier-offer',
        title: newApp.loanTitle,
        category: 'instant',
        minAmount: approvedLimit,
        maxAmount: approvedLimit,
        minTenureMonths: tenure,
        maxTenureMonths: tenure,
        interestRatePerAnnum: interestRate,
        processingFeePercent: 1.0,
        tag: '7% Monthly Interest',
        description: 'Approved loan limit withdrawal request',
        features: []
      }, approvedLimit, tenure, 'Approved Limit Withdrawal');

      setIsSubmittingWithdrawal(false);
      setShowWithdrawModal(false);
      showToast('Withdrawal request submitted to Admin for approval!', 'success');
    } catch (e) {
      setIsSubmittingWithdrawal(false);
      showToast('Failed to submit withdrawal request', 'error');
    }
  };

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar bg-slate-50 text-slate-900 p-4 pb-28 space-y-5">
      {/* User Greeting */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-100">
            <span className="text-lg font-bold">{user?.fullName?.charAt(0) || 'U'}</span>
          </div>
          <div>
            <span className="text-[11px] text-slate-500 font-medium">Namaste,</span>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight leading-tight">
              {user?.fullName || 'Valued Customer'}
            </h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[10px] text-slate-500 font-medium">Customer ID:</span>
              <span className="px-1.5 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-mono font-bold rounded">
                {user?.customerId || '2026102401'}
              </span>
            </div>
          </div>
        </div>
        <button 
          onClick={() => setActiveTab('profile')}
          className="p-2 rounded-xl bg-white border border-slate-200 text-slate-500 cursor-pointer"
        >
          <HelpCircle className="w-5 h-5" />
        </button>
      </div>

      {/* INACTIVE ACCOUNT BANNER */}
      {user?.isActive === false && (
        <div className="p-4 bg-rose-50 border-2 border-rose-300 rounded-2xl space-y-1.5 text-rose-900">
          <div className="flex items-center gap-2 font-bold text-xs">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <span>Account Inactive</span>
          </div>
          <p className="text-[11px] text-rose-700 leading-normal">
            Your account has been marked inactive by Admin. <strong>Reason:</strong> {user?.inactiveReason || 'Contact support'}
          </p>
        </div>
      )}

      {/* MANDATORY KYC BANNER */}
      {!isKYCCompleted && (
        <div className="p-4 bg-gradient-to-br from-amber-50 via-white to-amber-50/50 border-2 border-amber-300 rounded-2xl shadow-sm relative overflow-hidden">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center shrink-0 text-amber-700">
              <AlertTriangle className="w-5 h-5 animate-bounce" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-amber-900 tracking-tight">
                  Please Complete Your KYC
                </h3>
                <span className="text-[10px] font-semibold text-amber-800 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                  Mandatory
                </span>
              </div>
              <p className="text-[11px] text-slate-700 mt-1 leading-relaxed">
                Submit Aadhaar, PAN and Selfie to unlock loan limits.
              </p>
              
              <button
                onClick={() => setActiveTab('kyc')}
                className="mt-3.5 w-full py-2.5 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <span>Upload KYC Documents Now</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* APPROVED LOAN LIMIT & WITHDRAWAL */}
      {isKYCCompleted && approvedLimit > 0 && !activeLoan && (
        <div className="p-5 bg-gradient-to-br from-emerald-600 to-teal-700 rounded-3xl shadow-lg text-white space-y-3 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-15">
            <Zap className="w-24 h-24" />
          </div>
          <div className="relative z-10 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full inline-block">
              Approved Loan Limit
            </span>
            <h2 className="text-3xl font-black font-mono">₹{approvedLimit.toLocaleString('en-IN')}</h2>
            <p className="text-xs text-white/90">
              Interest: 7% Monthly · Tenure: {approvedLimit <= 2000 ? '1 Month' : '3 Months'}
            </p>
          </div>

          <button
            onClick={() => setShowWithdrawModal(true)}
            className="w-full py-3 bg-white text-emerald-700 hover:bg-slate-100 font-extrabold text-xs rounded-2xl shadow-xl flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
          >
            <span>Withdraw Amount</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* APPLY NEW LOAN BUTTON (IF ALL PREVIOUS LOANS CLOSED) */}
      {isKYCCompleted && approvedLimit === 0 && (allLoansClosed || activeLoans.length === 0) && (
        <div className="p-5 bg-white border border-slate-200 rounded-3xl shadow-sm text-center space-y-3">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Apply for a New Loan</h3>
            <p className="text-xs text-slate-500 mt-0.5">Tier 1: Up to ₹2,000 (1 Mo) · Tier 2: ₹2,100 to ₹5,000 (3 Mo) @ 7% monthly</p>
          </div>
          <button
            onClick={() => setActiveTab('kyc')}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
          >
            Apply New Loan
          </button>
        </div>
      )}

      {/* ACTIVE LOAN SUMMARY CARD */}
      {activeLoan && (
        <div 
          onClick={() => setActiveTab('active-loan')}
          className="p-4 bg-white border-2 border-emerald-500/50 rounded-3xl shadow-sm space-y-2 cursor-pointer hover:border-emerald-600 transition-all"
        >
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              Running Loan
            </span>
            <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
              View Details <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>
          <h3 className="text-sm font-bold text-slate-900">{activeLoan.title}</h3>
          <div className="flex justify-between items-baseline pt-1">
            <span className="text-lg font-black font-mono text-slate-900">₹{activeLoan.outstandingBalance.toLocaleString('en-IN')}</span>
            <span className="text-xs font-mono text-emerald-600 font-bold">EMI: ₹{activeLoan.monthlyEmi.toLocaleString('en-IN')}</span>
          </div>
        </div>
      )}

      {/* WITHDRAWAL MODAL (UPI & BANK) */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-sm bg-white border border-slate-200 rounded-3xl p-5 shadow-2xl text-slate-900 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <h3 className="text-sm font-bold text-slate-900">Withdraw Approved Amount</h3>
              <button onClick={() => setShowWithdrawModal(false)} className="text-slate-400 hover:text-slate-700 text-xs cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleWithdrawSubmit} className="space-y-3.5">
              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs space-y-1">
                <span className="text-slate-500 block text-[10px]">Approved Limit:</span>
                <span className="text-lg font-black text-emerald-900 font-mono">₹{approvedLimit.toLocaleString('en-IN')}</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Select Disbursal Destination</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDisbursalMode('upi')}
                    className={`p-2.5 rounded-xl border text-left flex items-center gap-2 cursor-pointer transition-all ${
                      disbursalMode === 'upi' ? 'bg-emerald-50 border-emerald-500 font-bold text-emerald-900' : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    <QrCode className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="text-xs">UPI ID</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDisbursalMode('bank')}
                    className={`p-2.5 rounded-xl border text-left flex items-center gap-2 cursor-pointer transition-all ${
                      disbursalMode === 'bank' ? 'bg-emerald-50 border-emerald-500 font-bold text-emerald-900' : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    <Building2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="text-xs">Bank A/C</span>
                  </button>
                </div>
              </div>

              {disbursalMode === 'upi' ? (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Enter UPI ID (e.g. user@paytm)</label>
                  <input
                    type="text"
                    required
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="e.g. 9876543210@ybl"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-600"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Enter Bank Account & IFSC</label>
                  <input
                    type="text"
                    required
                    value={bankDetails}
                    onChange={(e) => setBankDetails(e.target.value)}
                    placeholder="A/C No & IFSC Code"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-600"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmittingWithdrawal}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs shadow-md cursor-pointer disabled:opacity-50"
              >
                {isSubmittingWithdrawal ? 'Submitting Request...' : 'Submit Withdrawal to Admin'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
