import React, { useState } from 'react';
import { 
  CreditCard, 
  Building2, 
  CheckCircle2, 
  ArrowRight, 
  Calendar, 
  ShieldCheck, 
  QrCode, 
  ChevronRight, 
  DollarSign, 
  AlertCircle,
  Clock,
  Sparkles,
  Check,
  Copy,
  ExternalLink
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const OFFICIAL_REPAYMENT_UPI_ID = 'ranjeetk85761@axl';

export const PaymentsScreen: React.FC = () => {
  const { 
    activeLoans, 
    payEmi, 
    payments,
    user, 
    showToast,
    setActiveTab 
  } = useApp();

  const [showPayModal, setShowPayModal] = useState(false);
  const [payType, setPayType] = useState<'emi' | 'custom' | 'full'>('emi');
  const [customAmount, setCustomAmount] = useState<number>(5000);
  const [selectedMethod, setSelectedMethod] = useState<'UPI' | 'Net Banking' | 'Debit Card'>('UPI');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [copiedUPI, setCopiedUPI] = useState(false);
  const [upiUtr, setUpiUtr] = useState('');

  const activeLoan = activeLoans.length > 0 ? activeLoans[0] : null;
  const totalOutstanding = activeLoans.reduce((sum, l) => sum + l.outstandingBalance, 0);
  const monthlyEmi = activeLoan ? activeLoan.monthlyEmi : 0;

  const currentPayAmount = 
    payType === 'emi' 
      ? monthlyEmi 
      : payType === 'full' 
      ? totalOutstanding 
      : customAmount;

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(OFFICIAL_REPAYMENT_UPI_ID);
    setCopiedUPI(true);
    showToast(`UPI ID ${OFFICIAL_REPAYMENT_UPI_ID} copied!`, 'success');
    setTimeout(() => setCopiedUPI(false), 2500);
  };

  const handlePayNowSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeLoan) {
      showToast('No active loan found to pay for', 'info');
      return;
    }

    if (currentPayAmount <= 0) {
      showToast('Please enter a valid amount', 'error');
      return;
    }

    setIsProcessing(true);
    setTimeout(async () => {
      setIsProcessing(false);
      await payEmi(activeLoan.id, currentPayAmount, selectedMethod, payType, upiUtr);
      setPaymentSuccess(true);
      setTimeout(() => {
        setPaymentSuccess(false);
        setShowPayModal(false);
        setUpiUtr('');
      }, 1600);
    }, 1000);
  };

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar bg-slate-50 text-slate-900 p-4 pb-28 space-y-4">
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <span>Loan Payments</span>
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Fast loan repayment, instant UPI settlement & outstanding balance
        </p>
      </div>

      {/* OUTSTANDING BALANCE SUMMARY CARD */}
      <div className="p-5 bg-gradient-to-br from-emerald-50 via-white to-teal-50 border border-emerald-200 rounded-3xl shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-semibold">
            <CreditCard className="w-4 h-4 text-emerald-600" />
            <span>Total Outstanding Balance</span>
          </div>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
            totalOutstanding > 0 
              ? 'bg-amber-50 text-amber-800 border-amber-200' 
              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
          }`}>
            {totalOutstanding > 0 ? 'Payment Due' : 'All Clear (₹0 Due)'}
          </span>
        </div>

        <div className="flex items-baseline gap-1 my-2">
          <span className="text-3xl font-extrabold text-slate-900 tracking-tight font-mono">
            ₹{totalOutstanding.toLocaleString('en-IN')}
          </span>
          <span className="text-xs text-slate-500">outstanding</span>
        </div>

        {activeLoan ? (
          <div className="mt-3 p-3 bg-white/80 rounded-2xl border border-emerald-100 space-y-1.5 text-xs text-slate-700">
            <div className="flex justify-between">
              <span className="text-slate-500">Loan Product:</span>
              <span className="font-semibold text-slate-900">{activeLoan.title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Next Monthly EMI:</span>
              <span className="font-bold text-emerald-700 font-mono">
                ₹{activeLoan.monthlyEmi.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Due Date:</span>
              <span className="font-semibold text-slate-900 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                {activeLoan.nextEmiDate}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">EMI Progress:</span>
              <span className="font-mono text-slate-700">
                {activeLoan.paidEmis} of {activeLoan.totalEmis} paid
              </span>
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-500 mt-2">
            You currently have no active loan dues. Apply for an instant personal loan to see repayment schedules.
          </p>
        )}

        {/* PROMINENT PAY NOW BUTTON */}
        <div className="mt-4">
          <button
            onClick={() => {
              if (!activeLoan) {
                showToast('No active loan to pay right now. Apply for a loan first!', 'info');
                setActiveTab('loans');
              } else {
                setShowPayModal(true);
              }
            }}
            className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>Pay Now</span>
            {activeLoan && (
              <span className="text-xs font-mono font-medium opacity-90">
                (₹{activeLoan.monthlyEmi.toLocaleString('en-IN')})
              </span>
            )}
          </button>
        </div>
      </div>

      {/* QUICK PAYMENT OPTIONS */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => {
            if (!activeLoan) {
              setActiveTab('loans');
            } else {
              setPayType('emi');
              setShowPayModal(true);
            }
          }}
          className="p-3.5 bg-white border border-slate-200 hover:border-emerald-300 rounded-2xl text-left shadow-sm transition-all group"
        >
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
            <Calendar className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-bold text-slate-900">Pay Monthly EMI</h3>
          <span className="text-[10px] text-slate-500 block mt-0.5">
            {activeLoan ? `₹${activeLoan.monthlyEmi.toLocaleString('en-IN')}` : 'No active EMI'}
          </span>
        </button>

        <button
          onClick={() => {
            if (!activeLoan) {
              setActiveTab('loans');
            } else {
              setPayType('full');
              setShowPayModal(true);
            }
          }}
          className="p-3.5 bg-white border border-slate-200 hover:border-emerald-300 rounded-2xl text-left shadow-sm transition-all group"
        >
          <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
            <DollarSign className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-bold text-slate-900">Close Full Loan</h3>
          <span className="text-[10px] text-slate-500 block mt-0.5">
            Zero foreclosure fee
          </span>
        </button>
      </div>

      {/* UPI AUTO-DEBIT ENROLLMENT STATUS */}
      <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
            <QrCode className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">UPI Auto-Debit Autopay</h4>
            <span className="text-[10px] text-slate-500 block">
              Auto-repays monthly installment on the 5th of each month
            </span>
          </div>
        </div>
        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
          Active
        </span>
      </div>

      {/* BENEFICIARY BANK & OFFICIAL UPI INFO */}
      <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-3">
        {/* Official Repayment UPI ID Highlight */}
        <div className="p-3 bg-emerald-50/80 border border-emerald-300 rounded-xl">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1">
              <QrCode className="w-3.5 h-3.5 text-emerald-600" />
              Official Repayment UPI ID
            </span>
            <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-semibold">
              Verified Payee
            </span>
          </div>
          <div className="flex items-center justify-between mt-1.5">
            <span className="text-xs font-mono font-black text-slate-900 tracking-wide select-all">
              {OFFICIAL_REPAYMENT_UPI_ID}
            </span>
            <button
              type="button"
              onClick={handleCopyUpi}
              className="px-2.5 py-1 bg-white hover:bg-emerald-100 border border-emerald-300 rounded-lg text-[10px] font-bold text-emerald-800 flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
            >
              {copiedUPI ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              <span>{copiedUPI ? 'Copied!' : 'Copy UPI'}</span>
            </button>
          </div>
          <p className="text-[9px] text-slate-500 mt-1">
            Pay anytime from Google Pay, PhonePe, Paytm, or BHIM.
          </p>
        </div>

        {/* User Linked Bank */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
            <Building2 className="w-4 h-4 text-slate-500" />
            <span>Your Disbursal & Repayment Bank</span>
          </div>
          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500">Bank:</span>
              <span className="font-semibold text-slate-900">{user?.bankName || 'State Bank of India'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">A/C Number:</span>
              <span className="font-mono text-slate-700">{user?.accountNumber || '••••••••4892'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">IFSC Code:</span>
              <span className="font-mono text-slate-700">{user?.ifscCode || 'SBIN0004521'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* RECENT REPAYMENTS HISTORY */}
      <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-600" />
            <h3 className="text-xs font-bold text-slate-900">Recent Repayment History</h3>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">
            {payments.length} {payments.length === 1 ? 'record' : 'records'}
          </span>
        </div>

        {payments.length === 0 ? (
          <div className="py-6 text-center text-slate-400 text-xs">
            No payments recorded yet. Click &apos;Pay Now&apos; to make your first payment.
          </div>
        ) : (
          <div className="space-y-2">
            {payments.map((p) => (
              <div 
                key={p.id}
                className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-900">{p.loanTitle}</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded">
                      {p.paymentMethod}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 flex items-center gap-2">
                    <span>{p.paymentDate}</span>
                    <span>•</span>
                    <span className="font-mono">{p.referenceId}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-extrabold text-emerald-700 font-mono block">
                    -₹{p.amount.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-0.5 justify-end">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Paid
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* PAY NOW INTERACTIVE MODAL */}
      {showPayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm bg-white border border-slate-200 rounded-3xl p-5 shadow-2xl text-slate-900">
            {paymentSuccess ? (
              <div className="text-center py-6 space-y-2">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <Check className="w-8 h-8 stroke-[3]" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Payment Successful!</h3>
                <p className="text-xs text-slate-500">
                  ₹{currentPayAmount.toLocaleString('en-IN')} credited towards your loan balance.
                </p>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Instant Loan Repayment</h3>
                    <span className="text-[10px] text-slate-500">Powered by UPI & Net Banking</span>
                  </div>
                  <button 
                    onClick={() => setShowPayModal(false)}
                    className="p-1 text-slate-400 hover:text-slate-700 text-xs cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handlePayNowSubmit} className="space-y-3.5">
                  {/* Select Pay Type */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Select Repayment Option
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      <button
                        type="button"
                        onClick={() => setPayType('emi')}
                        className={`py-2 text-[11px] font-bold rounded-xl border transition-all cursor-pointer ${
                          payType === 'emi'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-400 shadow-sm'
                            : 'bg-slate-50 text-slate-600 border-slate-200'
                        }`}
                      >
                        Monthly EMI
                      </button>
                      <button
                        type="button"
                        onClick={() => setPayType('custom')}
                        className={`py-2 text-[11px] font-bold rounded-xl border transition-all cursor-pointer ${
                          payType === 'custom'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-400 shadow-sm'
                            : 'bg-slate-50 text-slate-600 border-slate-200'
                        }`}
                      >
                        Custom
                      </button>
                      <button
                        type="button"
                        onClick={() => setPayType('full')}
                        className={`py-2 text-[11px] font-bold rounded-xl border transition-all cursor-pointer ${
                          payType === 'full'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-400 shadow-sm'
                            : 'bg-slate-50 text-slate-600 border-slate-200'
                        }`}
                      >
                        Full Dues
                      </button>
                    </div>
                  </div>

                  {/* Amount Field */}
                  {payType === 'custom' && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Enter Custom Amount (₹)
                      </label>
                      <input
                        type="number"
                        min={100}
                        max={totalOutstanding || 100000}
                        value={customAmount}
                        onChange={(e) => setCustomAmount(Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm font-bold text-slate-900 font-mono focus:outline-none focus:border-emerald-600"
                      />
                    </div>
                  )}

                  {/* Amount Summary */}
                  <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex justify-between items-center">
                    <span className="text-xs font-semibold text-emerald-900">Total Payable:</span>
                    <span className="text-lg font-extrabold text-emerald-700 font-mono">
                      ₹{currentPayAmount.toLocaleString('en-IN')}
                    </span>
                  </div>

                  {/* Payment Methods */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Select Payment Mode
                    </label>
                    <div className="space-y-2">
                      {[
                        { id: 'UPI', label: 'UPI Instant', desc: 'Google Pay, PhonePe, Paytm, BHIM' },
                        { id: 'Net Banking', label: 'Net Banking', desc: 'All Indian Banks Supported' },
                        { id: 'Debit Card', label: 'Debit Card', desc: 'Visa, RuPay, MasterCard' }
                      ].map((m) => (
                        <label
                          key={m.id}
                          className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all ${
                            selectedMethod === m.id
                              ? 'bg-emerald-50 border-emerald-400'
                              : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="radio"
                              name="payMethod"
                              checked={selectedMethod === m.id}
                              onChange={() => setSelectedMethod(m.id as any)}
                              className="accent-emerald-600"
                            />
                            <div>
                              <span className="text-xs font-bold text-slate-900 block">{m.label}</span>
                              <span className="text-[10px] text-slate-500">{m.desc}</span>
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* UPI DIRECT PAYMENT BOX (ranjeetk85761@axl) */}
                  {selectedMethod === 'UPI' && (
                    <div className="p-3 bg-emerald-50/70 border border-emerald-300 rounded-2xl space-y-2.5 animate-in fade-in duration-200">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1">
                          <QrCode className="w-3.5 h-3.5 text-emerald-600" />
                          Pay To UPI ID
                        </span>
                        <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                          Official Recipient
                        </span>
                      </div>

                      {/* UPI ID Display & Copy */}
                      <div className="flex items-center justify-between bg-white border border-emerald-200 rounded-xl px-3 py-2 shadow-xs">
                        <div>
                          <span className="text-[9px] text-slate-400 block font-medium">Beneficiary UPI ID</span>
                          <span className="text-xs font-mono font-black text-slate-900 select-all">
                            {OFFICIAL_REPAYMENT_UPI_ID}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={handleCopyUpi}
                          className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg text-[10px] font-bold text-emerald-800 flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          {copiedUPI ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedUPI ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>

                      {/* Scannable Dynamic QR Code */}
                      <div className="p-2.5 bg-white rounded-xl border border-emerald-200 text-center">
                        <img 
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`upi://pay?pa=${OFFICIAL_REPAYMENT_UPI_ID}&pn=DhanSetu&am=${currentPayAmount}&cu=INR&tn=DhanSetu_EMI_Repayment`)}`}
                          alt="UPI QR Code"
                          className="w-28 h-28 mx-auto rounded-lg"
                        />
                        <span className="text-[10px] text-slate-500 font-medium block mt-1.5">
                          Scan with PhonePe, Google Pay, Paytm, or BHIM
                        </span>
                      </div>

                      {/* Deep-link to open UPI app directly */}
                      <a
                        href={`upi://pay?pa=${OFFICIAL_REPAYMENT_UPI_ID}&pn=DhanSetu&am=${currentPayAmount}&cu=INR&tn=DhanSetu_EMI_Repayment`}
                        className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-all text-center cursor-pointer"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Pay via UPI App (GPay / PhonePe / Paytm)</span>
                      </a>

                      {/* UPI Transaction UTR Reference Input */}
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-600 mb-1">
                          UPI Ref No. / UTR (Optional)
                        </label>
                        <input
                          type="text"
                          maxLength={16}
                          value={upiUtr}
                          onChange={(e) => setUpiUtr(e.target.value)}
                          placeholder="e.g. 428901234567"
                          className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-mono text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600"
                        />
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isProcessing ? 'Processing Payment...' : `I Have Paid / Confirm ₹${currentPayAmount.toLocaleString('en-IN')}`}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
