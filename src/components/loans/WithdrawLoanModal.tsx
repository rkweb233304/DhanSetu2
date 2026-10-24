import React, { useState } from 'react';
import { 
  ArrowRight, 
  Check, 
  X, 
  ShieldCheck, 
  Smartphone, 
  Building2, 
  FileText, 
  Download,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const WithdrawLoanModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { activeApplication, addMoneyToWallet, setActiveApplication, showToast, user } = useApp();
  const [step, setStep] = useState(1);
  const [channel, setChannel] = useState<'UPI' | 'Bank'>('UPI');
  const [agreed, setAgreed] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleWithdraw = async () => {
    if (!agreed || !activeApplication) return;
    
    setIsProcessing(true);
    // Simulate processing
    setTimeout(async () => {
      try {
        await addMoneyToWallet(activeApplication.netDisbursalAmount, `Loan Disbursal (${activeApplication.loanTitle})`);
        
        // Update application state
        setActiveApplication({
          ...activeApplication,
          currentStage: 'disbursed',
          stageProgress: 100,
          history: [
            ...activeApplication.history,
            {
              stage: 'disbursed',
              title: 'Loan Amount Disbursed',
              description: `₹${activeApplication.netDisbursalAmount.toLocaleString('en-IN')} credited to your wallet via ${channel}.`,
              timestamp: new Date().toLocaleString(),
              completed: true
            }
          ]
        });

        showToast('Loan amount disbursed successfully to your wallet!', 'success');
        onClose();
      } catch (e) {
        showToast('Disbursal failed. Please try again.', 'error');
      } finally {
        setIsProcessing(false);
      }
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-[2.5rem] w-full max-w-sm overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              {step === 1 ? <Smartphone className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
            </div>
            <h2 className="text-sm font-extrabold text-slate-900">
              {step === 1 ? 'Withdrawal Method' : 'Loan Agreement'}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {step === 1 ? (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl">
                <p className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider mb-1">Approved Amount</p>
                <p className="text-2xl font-black text-emerald-900 font-mono">
                  ₹{activeApplication?.netDisbursalAmount.toLocaleString('en-IN')}
                </p>
              </div>

              <p className="text-xs text-slate-500 px-1 font-medium">Select where you want to receive the funds:</p>
              
              <div className="space-y-2">
                <button 
                  onClick={() => setChannel('UPI')} 
                  className={`w-full p-4 border-2 rounded-2xl flex items-center gap-4 transition-all ${
                    channel === 'UPI' 
                      ? 'border-emerald-500 bg-emerald-50/50 ring-4 ring-emerald-500/10' 
                      : 'border-slate-100 bg-white hover:border-slate-200'
                  }`}
                >
                  <div className={`p-2 rounded-xl ${channel === 'UPI' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-slate-900">UPI Transfer</p>
                    <p className="text-[10px] text-slate-500">Instant credit to linked UPI ID</p>
                  </div>
                  {channel === 'UPI' && <Check className="ml-auto w-5 h-5 text-emerald-600" />}
                </button>

                <button 
                  onClick={() => setChannel('Bank')} 
                  className={`w-full p-4 border-2 rounded-2xl flex items-center gap-4 transition-all ${
                    channel === 'Bank' 
                      ? 'border-emerald-500 bg-emerald-50/50 ring-4 ring-emerald-500/10' 
                      : 'border-slate-100 bg-white hover:border-slate-200'
                  }`}
                >
                  <div className={`p-2 rounded-xl ${channel === 'Bank' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-slate-900">Bank Transfer</p>
                    <p className="text-[10px] text-slate-500">IMPS / NEFT to verified account</p>
                  </div>
                  {channel === 'Bank' && <Check className="ml-auto w-5 h-5 text-emerald-600" />}
                </button>
              </div>

              <button 
                onClick={() => setStep(2)} 
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 mt-4 transition-all"
              >
                Continue to Agreement
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="max-h-60 overflow-y-auto no-scrollbar p-4 bg-slate-50 border border-slate-200 rounded-2xl text-[10px] text-slate-600 leading-relaxed space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="font-bold text-slate-900 text-[11px]">LOAN DISBURSAL AGREEMENT</span>
                  <button className="text-emerald-600 flex items-center gap-1 font-bold">
                    <Download className="w-3 h-3" /> PDF
                  </button>
                </div>
                <p>This Loan Disbursal Agreement is made between DhanSetu Financial Services and the Borrower (<b>{user?.fullName}</b>) for the principal amount of <b>₹{activeApplication?.requestedAmount.toLocaleString('en-IN')}</b>.</p>
                <p>1. The Borrower acknowledges receipt of the net amount <b>₹{activeApplication?.netDisbursalAmount.toLocaleString('en-IN')}</b> after deduction of processing fees.</p>
                <p>2. The loan shall be repaid in <b>{activeApplication?.tenureMonths}</b> monthly installments (EMIs) of <b>₹{activeApplication?.monthlyEmi.toLocaleString('en-IN')}</b>.</p>
                <p>3. Borrower authorizes DhanSetu to initiate e-mandate for automatic EMI deductions.</p>
                <p>4. In case of default, late payment charges of 2% per month will be applicable on the overdue amount.</p>
                <div className="p-2 bg-amber-50 text-amber-800 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>By signing, you agree to the repayment schedule visible in your Loans tab.</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="relative mt-0.5">
                    <input 
                      type="checkbox" 
                      className="peer hidden" 
                      checked={agreed} 
                      onChange={e => setAgreed(e.target.checked)} 
                    />
                    <div className="w-5 h-5 border-2 border-slate-300 rounded-md bg-white peer-checked:bg-emerald-600 peer-checked:border-emerald-600 transition-all flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100" />
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-600 group-hover:text-slate-900 transition-colors">
                    I have read and I accept the terms of the digital loan agreement.
                  </span>
                </label>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setStep(1)} 
                  className="px-4 py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-bold text-xs transition-all"
                >
                  Back
                </button>
                <button 
                  disabled={!agreed || isProcessing} 
                  onClick={handleWithdraw} 
                  className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold shadow-lg shadow-emerald-600/20 disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Withdraw Now
                      <ShieldCheck className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
