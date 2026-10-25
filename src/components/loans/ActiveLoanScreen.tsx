import React from 'react';
import { Coins, Calendar, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ActiveLoanScreen: React.FC = () => {
  const { activeLoans, setActiveTab } = useApp();
  const activeLoan = activeLoans.length > 0 ? activeLoans[0] : null;

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar bg-slate-50 text-slate-900 p-4 pb-28 space-y-4">
      <div>
        <h1 className="text-xl font-bold tracking-tight">Active Loan Status</h1>
        <p className="text-xs text-slate-500 mt-0.5">Your currently running loan and repayment schedule</p>
      </div>

      {activeLoan ? (
        <div className="p-5 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-4">
          <div className="flex justify-between items-start border-b border-slate-100 pb-3">
            <div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Active Loan
              </span>
              <h2 className="text-base font-bold text-slate-900 mt-1">{activeLoan.title}</h2>
              <span className="text-xs text-slate-500 font-mono">Loan No: {activeLoan.loanNumber}</span>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 block">Original Amount</span>
              <span className="text-lg font-black font-mono text-slate-900">₹{activeLoan.originalAmount.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
              <span className="text-slate-500 text-[10px] block">Monthly EMI</span>
              <span className="text-lg font-extrabold text-emerald-600 font-mono">₹{activeLoan.monthlyEmi.toLocaleString('en-IN')}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
              <span className="text-slate-500 text-[10px] block">Due Date</span>
              <span className="text-sm font-bold text-slate-900 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                {activeLoan.nextEmiDate}
              </span>
            </div>
          </div>

          <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-600">Remaining Balance:</span>
              <span className="font-extrabold text-emerald-900 font-mono text-sm">₹{activeLoan.outstandingBalance.toLocaleString('en-IN')}</span>
            </div>
            <div className="w-full bg-emerald-200 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-emerald-600 h-full" 
                style={{ width: `${((activeLoan.totalEmis - activeLoan.paidEmis) / activeLoan.totalEmis) * 100}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-emerald-800 font-medium">
              <span>Paid: {activeLoan.paidEmis} EMIs</span>
              <span>Total: {activeLoan.totalEmis} EMIs</span>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('payments')}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            <span>Pay Monthly EMI Now</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="p-8 bg-white border border-slate-200 rounded-3xl text-center space-y-3">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Coins className="w-7 h-7" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">No Active Loan Found</h3>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            You currently have no running loans. Go to Home to apply for a Micro Advance or Short Term loan (7% monthly interest).
          </p>
          <button
            onClick={() => setActiveTab('home')}
            className="px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
          >
            <span>Apply for Loan</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
