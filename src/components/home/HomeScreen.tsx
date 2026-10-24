import React, { useState } from 'react';
import { 
  AlertTriangle, 
  ShieldCheck, 
  CreditCard, 
  Calendar, 
  TrendingUp, 
  ChevronRight, 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { WithdrawLoanAmountModal } from '../loans/WithdrawLoanAmountModal';

interface HomeScreenProps {
}

export const HomeScreen: React.FC<HomeScreenProps> = () => {
  const { 
    user, 
    setActiveTab, 
    activeLoans,
    activeApplication
  } = useApp();

  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

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
                RBI compliance requires verifying your identity.
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

      {/* LOAN APPLICATION STATUS TRACKER */}
      {activeApplication && (
        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <h3 className="text-xs font-bold text-slate-900 mb-3">Application Status: {activeApplication.currentStage}</h3>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-emerald-500 h-full transition-all" 
              style={{ width: `${activeApplication.stageProgress}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-500 mt-1.5">{activeApplication.stageProgress}% Complete</p>
        </div>
      )}
      
      {/* OUTSTANDING BALANCE */}
      <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm flex items-center justify-between">
         <div>
           <span className="text-[10px] text-slate-500 font-medium">Outstanding Balance</span>
           <h3 className="text-lg font-bold text-slate-900">₹0</h3>
         </div>
         <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
           <TrendingUp className="w-5 h-5" />
         </div>
      </div>

      {/* LOAN WITHDRAW BUTTON (SHOW ONLY IF KYC COMPLETED) */}
      {isKYCCompleted && activeApplication && activeApplication.currentStage === 'approved' && (
        <button
          onClick={() => setShowWithdrawModal(true)}
          className="w-full py-3 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-md"
        >
          Withdraw Approved Amount
        </button>
      )}

      {/* QUICK ACTIONS ROW */}
      <div className="grid grid-cols-2 gap-2 text-center">
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
            {isKYCCompleted ? 'Completed' : 'Pending'}
          </span>
        </button>
      </div>

      {showWithdrawModal && <WithdrawLoanAmountModal onClose={() => setShowWithdrawModal(false)} />}
    </div>
  );
};
