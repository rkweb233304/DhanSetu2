import React, { useState } from 'react';
import { 
  Building2, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ArrowRight, 
  ShieldCheck, 
  TrendingUp, 
  Users, 
  Percent, 
  DollarSign, 
  AlertTriangle,
  Copy,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Smartphone,
  Wallet,
  ArrowUpRight,
  Info
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { LoanApplication } from '../../types';

export const RetailerScreen: React.FC = () => {
  const { 
    applications, 
    activeLoans, 
    approveLoanByRetailer, 
    rejectLoanByRetailer, 
    toggleUserRole,
    setUserRole,
    setActiveTab,
    showToast,
    user
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'pending' | 'approved' | 'guidelines'>('pending');
  const [selectedAppForApproval, setSelectedAppForApproval] = useState<LoanApplication | null>(null);
  const [selectedAppForRejection, setSelectedAppForRejection] = useState<LoanApplication | null>(null);
  const [disbursalChannel, setDisbursalChannel] = useState<'wallet' | 'bank'>('wallet');
  const [rejectionReason, setRejectionReason] = useState<string>('CIBIL Score / Repayment capability insufficient');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Filter applications
  const pendingRequests = applications.filter(
    a => a.retailerStatus === 'pending' || a.currentStage === 'submitted' || a.currentStage === 'retailer_review'
  );
  const approvedRequests = applications.filter(
    a => a.retailerStatus === 'approved' || a.currentStage === 'disbursed'
  );
  const rejectedRequests = applications.filter(
    a => a.retailerStatus === 'rejected' || a.currentStage === 'rejected'
  );

  const totalApprovedAmount = approvedRequests.reduce((sum, a) => sum + (a.requestedAmount || 0), 0);
  const totalCommission = Math.round(totalApprovedAmount * 0.015); // 1.5% retailer commission

  const handleConfirmApproval = async () => {
    if (!selectedAppForApproval) return;
    setIsProcessing(true);
    try {
      await approveLoanByRetailer(selectedAppForApproval.id, disbursalChannel);
      setSelectedAppForApproval(null);
    } catch {
      showToast('Error approving loan request', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmRejection = async () => {
    if (!selectedAppForRejection) return;
    setIsProcessing(true);
    try {
      await rejectLoanByRetailer(selectedAppForRejection.id, rejectionReason);
      setSelectedAppForRejection(null);
    } catch {
      showToast('Error rejecting loan request', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showToast(`${label} copied: ${text}`, 'success');
  };

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar bg-slate-50 text-slate-900 p-4 pb-28 space-y-4 select-none">
      
      {/* RETAILER HEADER BANNER */}
      <div className="p-4 bg-slate-900 text-white rounded-3xl shadow-lg relative overflow-hidden">
        <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-bold">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-sm font-bold tracking-tight">Retailer Partner Portal</h1>
                <span className="text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold px-1.5 py-0.2 rounded-full">
                  Authorized
                </span>
              </div>
              <p className="text-[10px] text-slate-400">
                Loan Underwriting, Review & Disbursal Hub
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setUserRole('customer');
              setActiveTab('home');
            }}
            className="text-[10px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-2.5 py-1.5 rounded-xl flex items-center gap-1 transition-all cursor-pointer"
          >
            <span>Customer View</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Retailer Info Strip */}
        <div className="flex items-center justify-between text-xs text-slate-300 pt-0.5">
          <div>
            <span className="text-[10px] text-slate-400 block">Retailer Partner ID:</span>
            <span className="font-mono font-bold text-emerald-400 text-xs">
              {user?.retailerId || 'RT-DHAN-9021'}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block">Assigned Region:</span>
            <span className="font-semibold text-slate-200 text-xs">Patna Main Branch</span>
          </div>
        </div>
      </div>

      {/* METRICS ROW */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Pending Requests */}
        <div 
          onClick={() => setActiveSubTab('pending')}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
            activeSubTab === 'pending'
              ? 'bg-amber-50/80 border-amber-300 ring-2 ring-amber-400/20 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">
              Pending Requests
            </span>
            <div className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-mono text-[10px] font-bold">
              <Clock className="w-3 h-3" />
            </div>
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-slate-900 font-mono">
              {pendingRequests.length}
            </span>
            <span className="text-[10px] text-slate-500">awaiting approval</span>
          </div>
        </div>

        {/* Total Approved Volume */}
        <div 
          onClick={() => setActiveSubTab('approved')}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
            activeSubTab === 'approved'
              ? 'bg-emerald-50/80 border-emerald-300 ring-2 ring-emerald-400/20 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
              Approved Capital
            </span>
            <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-3 h-3" />
            </div>
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-lg font-black text-slate-900 font-mono">
              ₹{totalApprovedAmount.toLocaleString('en-IN')}
            </span>
          </div>
          <span className="text-[9px] text-emerald-700 font-medium block">
            {approvedRequests.length} loans sanctioned
          </span>
        </div>
      </div>

      {/* RETAILER COMMISSION BANNER */}
      <div className="p-3 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
            ₹
          </div>
          <div>
            <span className="text-[10px] text-slate-500 block">Retailer Partner Commission (1.5%)</span>
            <span className="font-extrabold text-slate-900 font-mono">
              ₹{totalCommission.toLocaleString('en-IN')} Earned
            </span>
          </div>
        </div>
        <span className="text-[10px] text-emerald-800 font-bold bg-white px-2 py-0.5 rounded-full border border-emerald-200">
          Auto-Credited
        </span>
      </div>

      {/* SUB-TABS */}
      <div className="flex bg-slate-200/80 p-1 rounded-2xl text-xs font-semibold">
        <button
          onClick={() => setActiveSubTab('pending')}
          className={`flex-1 py-1.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            activeSubTab === 'pending'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>Pending Customer Requests</span>
          {pendingRequests.length > 0 && (
            <span className="px-1.5 py-0.2 bg-amber-500 text-white font-mono text-[9px] font-bold rounded-full">
              {pendingRequests.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSubTab('approved')}
          className={`flex-1 py-1.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            activeSubTab === 'approved'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>Approved Disbursals</span>
          <span className="text-[9px] text-slate-400 font-mono">({approvedRequests.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('guidelines')}
          className={`px-3 py-1.5 rounded-xl transition-all ${
            activeSubTab === 'guidelines'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Rules
        </button>
      </div>

      {/* TAB CONTENT: 1. PENDING REQUESTS */}
      {activeSubTab === 'pending' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs px-1">
            <span className="font-bold text-slate-700">Customer Loan Queue</span>
            <span className="text-[10px] text-slate-500">
              {pendingRequests.length} borrower request(s) awaiting your decision
            </span>
          </div>

          {pendingRequests.length === 0 ? (
            <div className="p-8 bg-white border border-slate-200 rounded-3xl text-center space-y-2">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">All Loan Requests Cleared!</h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                There are no pending requests right now. When a normal customer submits a loan application, it will appear here for your approval.
              </p>
              <button
                onClick={() => {
                  setUserRole('customer');
                  setActiveTab('loans');
                }}
                className="mt-2 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
              >
                <span>Switch to Customer App & Apply for Loan</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            pendingRequests.map((app) => (
              <div 
                key={app.id}
                className="p-4 bg-white border border-slate-200 rounded-3xl shadow-xs space-y-3 hover:border-slate-300 transition-all"
              >
                {/* Header: Customer ID + Request Date */}
                <div className="flex items-start justify-between border-b border-slate-100 pb-2.5">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-slate-400 font-medium">Customer ID:</span>
                      <span 
                        onClick={() => handleCopy(app.customerId || 'DS2026102401', 'Customer ID')}
                        className="px-2 py-0.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-[11px] font-mono font-bold rounded cursor-pointer flex items-center gap-1"
                        title="Click to copy"
                      >
                        <span>{app.customerId || 'DS2026102401'}</span>
                        <Copy className="w-2.5 h-2.5 opacity-60" />
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 mt-1">
                      {app.customerName || 'Rahul Sharma'}
                    </h3>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {app.customerMobile || '+91 9876543210'} · {app.customerEmployment || 'Salaried'}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] bg-amber-50 text-amber-800 border border-amber-200 font-bold px-2 py-0.5 rounded-full inline-block">
                      Pending Approval
                    </span>
                    <span className="text-[9px] text-slate-400 block mt-1 font-mono">
                      {app.appliedAt}
                    </span>
                  </div>
                </div>

                {/* Loan Specs Card */}
                <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Requested Loan</span>
                    <span className="text-base font-extrabold text-slate-900 font-mono">
                      ₹{app.requestedAmount.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      {app.tenureMonths} Months @ {app.interestRate}%
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 block">Monthly EMI</span>
                    <span className="text-base font-extrabold text-emerald-600 font-mono">
                      ₹{app.monthlyEmi.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      Net Disbursal: ₹{app.netDisbursalAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Purpose & KYC Tags */}
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-600 text-[11px]">
                    <span className="font-semibold text-slate-500">Purpose:</span>
                    <span>{app.purpose}</span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-semibold rounded-md">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      <span>KYC Verified</span>
                    </span>

                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-sky-50 border border-sky-200 text-sky-800 text-[10px] font-semibold rounded-md">
                      <TrendingUp className="w-3 h-3 text-sky-600" />
                      <span>CIBIL: {app.customerCibil || 750}</span>
                    </span>

                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-50 border border-purple-200 text-purple-800 text-[10px] font-semibold rounded-md">
                      <Sparkles className="w-3 h-3 text-purple-600" />
                      <span>Partner Comm: ₹{Math.round(app.requestedAmount * 0.015).toLocaleString('en-IN')}</span>
                    </span>
                  </div>
                </div>

                {/* Retailer Action Buttons */}
                <div className="pt-2 flex items-center gap-2 border-t border-slate-100">
                  <button
                    onClick={() => setSelectedAppForApproval(app)}
                    className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Approve Loan</span>
                  </button>

                  <button
                    onClick={() => setSelectedAppForRejection(app)}
                    className="py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB CONTENT: 2. APPROVED LOANS */}
      {activeSubTab === 'approved' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs px-1">
            <span className="font-bold text-slate-700">Retailer Disbursal Register</span>
            <span className="text-[10px] text-slate-500">
              {approvedRequests.length} loan(s) successfully sanctioned
            </span>
          </div>

          {approvedRequests.length === 0 ? (
            <div className="p-8 bg-white border border-slate-200 rounded-3xl text-center space-y-2">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">No Approved Loans Yet</h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                When you approve a customer's loan application, the active loan record and wallet credit will be listed here.
              </p>
            </div>
          ) : (
            approvedRequests.map((app) => (
              <div 
                key={app.id}
                className="p-4 bg-white border border-slate-200 rounded-3xl shadow-xs space-y-2.5"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Customer ID: {app.customerId}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 mt-1">
                      {app.loanTitle}
                    </h3>
                    <span className="text-[10px] text-slate-500">
                      Borrower: {app.customerName || 'Rahul Sharma'} ({app.customerMobile || '+91 9876543210'})
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-base font-black text-slate-900 font-mono block">
                      ₹{app.requestedAmount.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-emerald-600 font-bold flex items-center justify-end gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Disbursed & Active</span>
                    </span>
                  </div>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-[11px] grid grid-cols-3 gap-2 text-center">
                  <div>
                    <span className="text-slate-400 block text-[9px]">Tenure</span>
                    <span className="font-bold text-slate-800">{app.tenureMonths} Mo</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9px]">Monthly EMI</span>
                    <span className="font-bold text-slate-800 font-mono">₹{app.monthlyEmi.toLocaleString('en-IN')}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9px]">Disbursed To</span>
                    <span className="font-bold text-emerald-700 capitalize">{app.disbursalChannel || 'Wallet'}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB CONTENT: 3. GUIDELINES */}
      {activeSubTab === 'guidelines' && (
        <div className="p-4 bg-white border border-slate-200 rounded-3xl space-y-3 text-xs text-slate-700">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <Info className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-slate-900">Retailer Loan Approval Regulations</h3>
          </div>

          <div className="space-y-2 leading-relaxed">
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
              <span className="font-bold text-slate-900 block">1. Normal User Restriction</span>
              <p className="text-[11px] text-slate-600">
                Normal users / borrowers cannot self-approve loans. They only submit applications with requested amount, tenure, and purpose.
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
              <span className="font-bold text-slate-900 block">2. Retailer Authority</span>
              <p className="text-[11px] text-slate-600">
                Only the registered DhanSetu Retailer has the authority to review the KYC documents, inspect CIBIL score, and click "Approve Loan".
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
              <span className="font-bold text-slate-900 block">3. Instant Disbursal & Commission</span>
              <p className="text-[11px] text-slate-600">
                Upon Retailer approval, the net loan amount is credited immediately to the customer's wallet/bank account, and an Active Loan repayment schedule is created. Retailer earns 1.5% commission per approved loan.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: APPROVE LOAN CONFIRMATION */}
      {selectedAppForApproval && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-sm bg-white border border-slate-200 rounded-3xl p-5 shadow-2xl text-slate-900 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">Authorize Loan Disbursal</h3>
              </div>
              <button 
                onClick={() => setSelectedAppForApproval(null)}
                className="text-slate-400 hover:text-slate-600 text-xs p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Borrower details card */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Customer ID:</span>
                <span className="font-mono font-bold text-emerald-800">
                  {selectedAppForApproval.customerId || 'DS2026102401'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Borrower Name:</span>
                <span className="font-bold text-slate-900">{selectedAppForApproval.customerName || 'Rahul Sharma'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Sanction Amount:</span>
                <span className="font-extrabold text-slate-900 font-mono text-sm">
                  ₹{selectedAppForApproval.requestedAmount.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tenure & EMI:</span>
                <span className="text-slate-700">
                  {selectedAppForApproval.tenureMonths} Mo @ ₹{selectedAppForApproval.monthlyEmi.toLocaleString('en-IN')} / mo
                </span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-200">
                <span className="text-slate-500">Net Disbursal:</span>
                <span className="font-bold text-emerald-700 font-mono">
                  ₹{selectedAppForApproval.netDisbursalAmount.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Disbursal Channel */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                Disburse Funds Destination:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setDisbursalChannel('wallet')}
                  className={`p-2.5 rounded-xl border text-left flex items-center gap-2 cursor-pointer transition-all ${
                    disbursalChannel === 'wallet'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold'
                      : 'bg-white border-slate-200 text-slate-600'
                  }`}
                >
                  <Wallet className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div className="text-[11px] leading-tight">
                    <span>Customer Wallet</span>
                    <span className="text-[9px] text-slate-400 block font-normal">Instant credit</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setDisbursalChannel('bank')}
                  className={`p-2.5 rounded-xl border text-left flex items-center gap-2 cursor-pointer transition-all ${
                    disbursalChannel === 'bank'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold'
                      : 'bg-white border-slate-200 text-slate-600'
                  }`}
                >
                  <Building2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div className="text-[11px] leading-tight">
                    <span>Direct Bank</span>
                    <span className="text-[9px] text-slate-400 block font-normal">NEFT / IMPS</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Retailer sign-off acknowledgment */}
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-[10px] text-emerald-800 flex items-start gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                By clicking Confirm, Retailer certifies identity verification and authorizes immediate capital release.
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={handleConfirmApproval}
                disabled={isProcessing}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? 'Processing Disbursal...' : 'Confirm Approval & Disburse'}
              </button>
              <button
                type="button"
                onClick={() => setSelectedAppForApproval(null)}
                className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: REJECT LOAN CONFIRMATION */}
      {selectedAppForRejection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-sm bg-white border border-slate-200 rounded-3xl p-5 shadow-2xl text-slate-900 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-1.5">
                <XCircle className="w-5 h-5 text-rose-600" />
                <h3 className="text-sm font-bold text-slate-900">Reject Loan Request</h3>
              </div>
              <button 
                onClick={() => setSelectedAppForRejection(null)}
                className="text-slate-400 hover:text-slate-600 text-xs p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Please specify the reason for declining loan request for customer <strong className="font-mono">{selectedAppForRejection.customerId}</strong>:
            </p>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Reason for Rejection:
              </label>
              <select
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-rose-600"
              >
                <option value="CIBIL Score / Repayment capability insufficient">
                  CIBIL Score / Repayment capability insufficient
                </option>
                <option value="Incomplete or unverified KYC documents">
                  Incomplete or unverified KYC documents
                </option>
                <option value="Monthly income below loan eligibility threshold">
                  Monthly income below loan eligibility threshold
                </option>
                <option value="High existing debt obligation / debt-to-income ratio">
                  High existing debt obligation / debt-to-income ratio
                </option>
                <option value="Bank account mismatch / details discrepancy">
                  Bank account mismatch / details discrepancy
                </option>
              </select>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={handleConfirmRejection}
                disabled={isProcessing}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
              <button
                type="button"
                onClick={() => setSelectedAppForRejection(null)}
                className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl cursor-pointer"
              >
                Back
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
