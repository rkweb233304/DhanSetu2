import React from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ChevronRight, 
  FileText,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { LoanApplication, ActiveLoan } from '../../types';

interface LoanHistoryProps {
  activeLoans: ActiveLoan[];
  applications: LoanApplication[];
}

export const LoanHistory: React.FC<LoanHistoryProps> = ({ activeLoans, applications }) => {
  const activeList = activeLoans.filter(l => l.status === 'active');
  const closedList = activeLoans.filter(l => l.status === 'closed');
  const rejectedList = applications.filter(a => a.currentStage === 'rejected');
  const pendingList = applications.filter(a => a.retailerStatus === 'pending' && a.currentStage !== 'rejected');

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'closed': return 'bg-slate-50 text-slate-600 border-slate-100';
      case 'rejected': return 'bg-rose-50 text-rose-700 border-rose-100';
      case 'pending': return 'bg-amber-50 text-amber-700 border-amber-100';
      default: return 'bg-slate-50 text-slate-500 border-slate-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle2 className="w-3.5 h-3.5" />;
      case 'closed': return <CheckCircle2 className="w-3.5 h-3.5 opacity-50" />;
      case 'rejected': return <XCircle className="w-3.5 h-3.5" />;
      case 'pending': return <Clock className="w-3.5 h-3.5" />;
      default: return <Clock className="w-3.5 h-3.5" />;
    }
  };

  const renderHistoryItem = (title: string, amount: number, status: string, date: string, subtitle?: string) => (
    <div className="p-4 bg-white border border-slate-100 rounded-3xl flex items-center justify-between shadow-sm hover:border-slate-200 transition-all group">
      <div className="flex items-center gap-3">
        <div className={`p-2.5 rounded-2xl ${getStatusStyle(status)}`}>
          {getStatusIcon(status)}
        </div>
        <div>
          <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">{title}</h4>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[10px] text-slate-500 font-medium font-mono">₹{amount.toLocaleString('en-IN')}</span>
            <span className="text-[10px] text-slate-300">•</span>
            <span className="text-[10px] text-slate-500 font-medium">{date}</span>
          </div>
          {subtitle && <p className="text-[9px] text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      <div className="flex flex-col items-end gap-1.5">
        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${getStatusStyle(status)}`}>
          {status}
        </span>
        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-all" />
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
          <FileText className="w-4 h-4 text-slate-400" />
          Application History
        </h3>
        <span className="text-[10px] text-slate-400 font-medium">
          {activeList.length + closedList.length + rejectedList.length + pendingList.length} Entries
        </span>
      </div>

      <div className="space-y-2.5">
        {activeList.length === 0 && closedList.length === 0 && rejectedList.length === 0 && pendingList.length === 0 ? (
          <div className="p-10 text-center space-y-3 bg-white border border-dashed border-slate-200 rounded-[2rem]">
            <div className="w-12 h-12 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">No applications found</p>
              <p className="text-[10px] text-slate-400 mt-1">Your loan requests and active loans will appear here.</p>
            </div>
          </div>
        ) : (
          <>
            {/* Active Loans */}
            {activeList.map(l => renderHistoryItem(
              l.title, 
              l.originalAmount, 
              'active', 
              l.startDate,
              `Loan No: ${l.loanNumber}`
            ))}

            {/* Pending Applications */}
            {pendingList.map(a => renderHistoryItem(
              a.loanTitle, 
              a.requestedAmount, 
              'pending', 
              new Date(a.appliedAt).toLocaleDateString('en-GB'),
              'Awaiting Retailer Review'
            ))}

            {/* Closed Loans */}
            {closedList.map(l => renderHistoryItem(
              l.title, 
              l.originalAmount, 
              'closed', 
              l.startDate,
              'Fully Repaid'
            ))}

            {/* Rejected Applications */}
            {rejectedList.map(a => renderHistoryItem(
              a.loanTitle, 
              a.requestedAmount, 
              'rejected', 
              new Date(a.appliedAt).toLocaleDateString('en-GB'),
              a.rejectionReason || 'Policy Criteria Not Met'
            ))}
          </>
        )}
      </div>
    </div>
  );
};
