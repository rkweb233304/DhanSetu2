import React, { useState } from 'react';
import { 
  AlertTriangle, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles, 
  CreditCard, 
  Wallet, 
  Calendar, 
  Clock, 
  TrendingUp, 
  CheckCircle2, 
  ChevronRight,
  FileText
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ActiveLoan } from '../../types';

interface HomeScreenProps {
  onOpenTracker: () => void;
  onOpenLoanApply: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onOpenTracker, onOpenLoanApply }) => {
  const { 
    user, 
    setActiveTab, 
    activeLoans, 
    walletBalance,
    activeApplication
  } = useApp();

  const isKYCCompleted = user?.kycCompleted && user?.kyc?.overallStatus === 'verified';
  const totalOutstanding = activeLoans.reduce((acc, curr) => acc + curr.outstandingBalance, 0);

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar bg-slate-50 text-slate-900 p-4 pb-20 space-y-4">
      {/* User Greeting */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <span className="text-[11px] text-slate-500 font-medium">Namaste,</span>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">
            {user ? user.fullName : 'Guest Borrower'}
          </h1>
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
                RBI compliance requires verifying your identity before personal loan approval & instant wallet disbursement.
              </p>
              
              <div className="mt-2.5 flex flex-wrap gap-1.5 text-[10px] text-slate-600">
                <span className="px-1.5 py-0.5 rounded bg-white border border-slate-200">1. Selfie</span>
                <span className="px-1.5 py-0.5 rounded bg-white border border-slate-200">2. Aadhaar Front</span>
                <span className="px-1.5 py-0.5 rounded bg-white border border-slate-200">3. Aadhaar Back</span>
                <span className="px-1.5 py-0.5 rounded bg-white border border-slate-200">4. PAN Card</span>
              </div>

              <button
                onClick={() => setActiveTab('kyc')}
                className="mt-3.5 w-full py-2 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <span>Upload KYC Documents Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Real-time Loan Application Tracking Card */}
      {activeApplication && activeApplication.currentStage !== 'disbursed' && (
        <div className="p-3.5 bg-gradient-to-r from-sky-50 to-white border border-sky-200 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="flex items-center gap-1.5 font-bold text-sky-800">
              <Clock className="w-3.5 h-3.5 animate-spin text-sky-600" />
              Real-Time Approval Tracking
            </span>
            <span className="font-mono text-[11px] text-slate-500">#{activeApplication.id}</span>
          </div>

          <div className="flex justify-between items-end mb-2">
            <div>
              <span className="text-[10px] text-slate-500 block">{activeApplication.loanTitle}</span>
              <span className="text-base font-extrabold text-slate-900">
                ₹{activeApplication.requestedAmount.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-sky-700 font-semibold block capitalize">
                {activeApplication.currentStage.replace('_', ' ')}
              </span>
              <span className="text-[11px] font-mono text-slate-600">
                {activeApplication.stageProgress}% Completed
              </span>
            </div>
          </div>

          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden mb-2.5">
            <div 
              className="h-full bg-gradient-to-r from-sky-500 to-emerald-500 transition-all duration-500 rounded-full"
              style={{ width: `${activeApplication.stageProgress}%` }}
            />
          </div>

          <button
            onClick={onOpenTracker}
            className="w-full py-1.5 bg-sky-100 hover:bg-sky-200 border border-sky-300 rounded-xl text-sky-900 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <span>View Live Pipeline & Take Action</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* TOTAL ACTIVE LOANS (LIVE SYNCED WITH SUPABASE ACTIVE LOANS) */}
      <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
            <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
            Total Active Loan Balance
          </span>
          <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
            {activeLoans.filter(l => l.status === 'active').length} Active
          </span>
        </div>

        {activeLoans.length > 0 && activeLoans[0].status === 'active' ? (
          <div>
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-2xl font-extrabold text-slate-900 tracking-tight font-mono">
                ₹{totalOutstanding.toLocaleString('en-IN')}
              </span>
              <span className="text-[11px] text-slate-500">live balance</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 mb-3 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-sky-600" />
                  Next EMI Due:
                </span>
                <span className="font-semibold text-slate-900">{activeLoans[0].nextEmiDate}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600">Monthly EMI Amount:</span>
                <span className="font-bold text-emerald-700 text-sm font-mono">
                  ₹{activeLoans[0].monthlyEmi.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setActiveTab('loans')}
                className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <span>View Loans</span>
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setActiveTab('wallet')}
                className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-xl border border-slate-300 flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>Wallet (₹{walletBalance.toLocaleString('en-IN')})</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="py-4 text-center">
            <p className="text-xs text-slate-700 font-medium">No active loans outstanding.</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Apply for a personal loan to see active balances here in real-time.</p>
            <button
              onClick={() => setActiveTab('loans')}
              className="mt-3 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md inline-flex items-center gap-1.5"
            >
              <span>Explore Loan Offers</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* QUICK ACTIONS ROW */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <button
          onClick={() => setActiveTab('loans')}
          className="p-3 bg-white border border-slate-200 hover:border-slate-300 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-colors group shadow-sm"
        >
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-semibold text-slate-800">Loans & EMI</span>
          <span className="text-[9px] text-slate-500">Calculator</span>
        </button>

        <button
          onClick={() => setActiveTab('wallet')}
          className="p-3 bg-white border border-slate-200 hover:border-slate-300 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-colors group shadow-sm"
        >
          <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Wallet className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-semibold text-slate-800">Wallet</span>
          <span className="text-[9px] text-emerald-600 font-mono font-medium">₹{walletBalance.toLocaleString('en-IN')}</span>
        </button>

        <button
          onClick={() => setActiveTab('kyc')}
          className="p-3 bg-white border border-slate-200 hover:border-slate-300 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-colors group shadow-sm"
        >
          <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-semibold text-slate-800">Digital KYC</span>
          <span className={`text-[9px] ${isKYCCompleted ? 'text-emerald-600' : 'text-amber-600'}`}>
            {isKYCCompleted ? 'Verified' : 'Pending (4 Docs)'}
          </span>
        </button>
      </div>
    </div>
  );
};
