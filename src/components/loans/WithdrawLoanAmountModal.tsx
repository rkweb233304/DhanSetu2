import React, { useState } from 'react';
import { Building2, QrCode, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface WithdrawLoanAmountModalProps {
  onClose: () => void;
}

export const WithdrawLoanAmountModal: React.FC<WithdrawLoanAmountModalProps> = ({ onClose }) => {
  const { showToast, activeApplication } = useApp();
  const [method, setMethod] = useState<'upi' | 'bank' | null>(null);

  const handleWithdraw = () => {
    if (!method) return;
    showToast(`Withdrawal initiated via ${method.toUpperCase()}.`, 'success');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-white border border-slate-200 rounded-3xl p-5 shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-bold text-slate-900">Withdraw Loan Amount</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-500 mb-4">
          Select withdrawal method for your approved loan amount of ₹{activeApplication?.netDisbursalAmount || 0}.
        </p>

        <div className="space-y-3 mb-6">
          <button
            onClick={() => setMethod('upi')}
            className={`w-full p-4 rounded-2xl border-2 flex items-center gap-3 transition-all ${method === 'upi' ? 'border-emerald-600 bg-emerald-50' : 'border-slate-200 hover:border-emerald-200'}`}
          >
            <QrCode className="w-6 h-6 text-emerald-600" />
            <span className="text-sm font-bold text-slate-900">UPI</span>
          </button>
          
          <button
            onClick={() => setMethod('bank')}
            className={`w-full p-4 rounded-2xl border-2 flex items-center gap-3 transition-all ${method === 'bank' ? 'border-emerald-600 bg-emerald-50' : 'border-slate-200 hover:border-emerald-200'}`}
          >
            <Building2 className="w-6 h-6 text-sky-600" />
            <span className="text-sm font-bold text-slate-900">Bank Transfer</span>
          </button>
        </div>

        <button
          onClick={handleWithdraw}
          disabled={!method}
          className="w-full py-3 bg-emerald-600 text-white font-bold text-sm rounded-xl disabled:opacity-50"
        >
          Confirm Withdrawal
        </button>
      </div>
    </div>
  );
};
