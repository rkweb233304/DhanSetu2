import React from 'react';
import { 
  AlertTriangle, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles, 
  CreditCard, 
  Calendar, 
  Clock, 
  TrendingUp, 
  CheckCircle2, 
  ChevronRight, 
  Percent,
  Check
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface HomeScreenProps {
  onOpenTracker: () => void;
  onOpenLoanApply: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onOpenTracker, onOpenLoanApply }) => {
  const { 
    user, 
    setActiveTab, 
    activeLoans, 
    activeApplication
  } = useApp();

  const isKYCCompleted = user?.kycCompleted && user?.kyc?.overallStatus === 'verified';
  
  // Total Active Loan Balance defaults to ₹0 unless active loan exists
  const totalActiveBalance = activeLoans.reduce((acc, curr) => acc + (curr.originalAmount || 0), 0);
  const totalOutstanding = activeLoans.reduce((acc, curr) => acc + (curr.outstandingBalance || 0), 0);
  const activeLoan = activeLoans.length > 0 ? activeLoans[0] : null;

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar bg-slate-50 text-slate-900 p-4 pb-28 space-y-4">
      {/* User Greeting */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <span className="text-[11px] text-slate-500 font-medium">Namaste,</span>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight leading-tight">
            {user?.fullName || 'Valued Customer'}
          </h1>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-[10px] text-slate-500 font-medium">Customer ID:</span>
            <span className="px-1.5 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-mono font-bold rounded">
              {user?.customerId || 'DS2026102401'}
            </span>
          </div>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-slate-500 block">CIBIL Score</span>
          <div className="flex items-center justify-end gap-1 text-emerald-600 font-bold text-xs">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{user?.cibilScore || 750}</span>
            <span className="text-[9px] text-slate-500 font-normal">/ 900</span>
          </div>
        </div>
      </div>

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
                RBI compliance requires verifying your identity before personal loan approval & instant disbursal.
              </p>
              
              <div className="mt-2.5 flex flex-wrap gap-1.5 text-[10px] text-slate-600">
                <span className="px-1.5 py-0.5 rounded bg-white border border-slate-200">1. Selfie</span>
                <span className="px-1.5 py-0.5 rounded bg-white border border-slate-200">2. Aadhaar Front</span>
                <span className="px-1.5 py-0.5 rounded bg-white border border-slate-200">3. Aadhaar Back</span>
                <span className="px-1.5 py-0.5 rounded bg-white border border-slate-200">4. PAN Card</span>
              </div>

              <button
                onClick={() => setActiveTab('kyc')}
                className="mt-3.5 w-full py-2.5 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <span>Upload KYC Documents Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REAL-TIME APPROVAL TRACKING WITH EXPLICIT PERCENTILE */}
      {activeApplication && (
        <div className="p-4 bg-gradient-to-r from-sky-50 via-white to-emerald-50 border border-sky-200 rounded-3xl shadow-sm">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="flex items-center gap-1.5 font-bold text-sky-800">
              <Clock className="w-3.5 h-3.5 animate-spin text-sky-600" />
              Real-Time Approval Tracking
            </span>
            <span className="font-mono text-[11px] text-slate-500">#{activeApplication.id}</span>
          </div>

          <div className="flex justify-between items-center mb-2.5">
            <div>
              <span className="text-[10px] text-slate-500 block">{activeApplication.loanTitle}</span>
              <span className="text-lg font-extrabold text-slate-900 font-mono">
                ₹{activeApplication.requestedAmount.toLocaleString('en-IN')}
              </span>
            </div>

            {/* PERCENTILE BADGE */}
            <div className="text-right flex flex-col items-end">
              <div className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 border border-emerald-300 rounded-xl text-emerald-800 font-extrabold text-xs shadow-xs">
                <Percent className="w-3 h-3" />
                <span>{activeApplication.stageProgress}% Completed</span>
              </div>
              <span className="text-[10px] text-sky-700 font-semibold block capitalize mt-1">
                Phase: {activeApplication.currentStage.replace(/_/g, ' ')}
              </span>
            </div>
          </div>

          {/* Animated Percentile Progress Bar */}
          <div className="space-y-1 mb-3">
            <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden p-0.5">
              <div 
                className="h-full bg-gradient-to-r from-sky-500 via-teal-500 to-emerald-500 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${activeApplication.stageProgress}%` }}
              />
            </div>
            <div className="flex justify-between text-[9px] text-slate-400 font-mono">
              <span>0% Applied</span>
              <span>50% Verified</span>
              <span>100% Disbursed</span>
            </div>
          </div>

          <button
            onClick={onOpenTracker}
            className="w-full py-2 bg-sky-100 hover:bg-sky-200 border border-sky-300 rounded-xl text-sky-900 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>Live Approval Timeline ({activeApplication.stageProgress}% Percentile)</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* TOTAL ACTIVE LOAN BALANCE & OUTSTANDING BALANCE CARD */}
      <div className="p-5 bg-white border border-slate-200 rounded-3xl shadow-sm relative overflow-hidden space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-slate-900">Loan Overview</h2>
              <span className="text-[10px] text-slate-500">Live Balance & Settlement</span>
            </div>
          </div>
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
            {activeLoans.filter(l => l.status === 'active').length} Active
          </span>
        </div>

        {/* 2-Column Balance Overview: Total Active Loan Balance & Outstanding Balance */}
        <div className="grid grid-cols-2 gap-3">
          {/* Total Active Loan Balance (0 by default or sum of active loans) */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
            <span className="text-[10px] text-slate-500 font-semibold block uppercase tracking-wider">
              Total Active Loan
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl font-extrabold text-slate-900 font-mono tracking-tight">
                ₹{totalActiveBalance.toLocaleString('en-IN')}
              </span>
            </div>
            <span className="text-[9px] text-slate-500 block mt-1">
              {totalActiveBalance > 0 ? 'Sanctioned amount' : 'No active loans (₹0)'}
            </span>
          </div>

          {/* Outstanding Balance */}
          <div className="p-3.5 bg-emerald-50/60 border border-emerald-200 rounded-2xl">
            <span className="text-[10px] text-emerald-800 font-semibold block uppercase tracking-wider">
              Outstanding Balance
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl font-extrabold text-emerald-700 font-mono tracking-tight">
                ₹{totalOutstanding.toLocaleString('en-IN')}
              </span>
            </div>
            <span className="text-[9px] text-emerald-700/80 block mt-1">
              {totalOutstanding > 0 ? 'Pending repayment' : 'Zero dues pending'}
            </span>
          </div>
        </div>

        {/* Next EMI details if loan is active */}
        {activeLoan ? (
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-sky-600" />
                Next Monthly EMI Due:
              </span>
              <span className="font-bold text-slate-900">{activeLoan.nextEmiDate}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">EMI Amount:</span>
              <span className="font-extrabold text-emerald-700 font-mono">
                ₹{activeLoan.monthlyEmi.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="pt-2 flex gap-2">
              <button
                onClick={() => setActiveTab('payments')}
                className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-sm flex items-center justify-center gap-1 cursor-pointer"
              >
                <span>Pay EMI Now</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setActiveTab('loans')}
                className="py-2 px-3 bg-white border border-slate-300 text-slate-700 font-semibold text-xs rounded-xl hover:bg-slate-50"
              >
                More Loans
              </button>
            </div>
          </div>
        ) : (
          <div className="pt-1 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Ready for instant approval up to ₹5,00,000
            </span>
            <button
              onClick={() => setActiveTab('loans')}
              className="py-2 px-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1 cursor-pointer"
            >
              <span>Apply Loan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* QUICK ACTIONS ROW */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <button
          onClick={() => setActiveTab('loans')}
          className="p-3 bg-white border border-slate-200 hover:border-slate-300 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-colors group shadow-sm cursor-pointer"
        >
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-bold text-slate-800">Loans & EMI</span>
          <span className="text-[9px] text-slate-500">Calculator</span>
        </button>

        <button
          onClick={() => setActiveTab('payments')}
          className="p-3 bg-white border border-slate-200 hover:border-slate-300 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-colors group shadow-sm cursor-pointer"
        >
          <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center group-hover:scale-105 transition-transform">
            <CreditCard className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-bold text-slate-800">Payments</span>
          <span className="text-[9px] text-emerald-700 font-mono font-medium">Pay Now</span>
        </button>

        <button
          onClick={() => setActiveTab('kyc')}
          className="p-3 bg-white border border-slate-200 hover:border-slate-300 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-colors group shadow-sm cursor-pointer"
        >
          <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-bold text-slate-800">Digital KYC</span>
          <span className={`text-[9px] ${isKYCCompleted ? 'text-emerald-600' : 'text-amber-600'}`}>
            {isKYCCompleted ? 'Verified' : 'Pending (4 Docs)'}
          </span>
        </button>
      </div>
    </div>
  );
};
