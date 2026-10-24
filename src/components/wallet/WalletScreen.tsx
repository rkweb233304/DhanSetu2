import React, { useState } from 'react';
import { 
  Wallet, 
  Building2, 
  QrCode, 
  ToggleLeft, 
  ToggleRight, 
  Plus,
  Copy,
  Check,
  ExternalLink
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const OFFICIAL_WALLET_UPI_ID = 'ranjeetk85761@axl';

export const WalletScreen: React.FC = () => {
  const { 
    walletBalance, 
    addMoneyToWallet, 
    withdrawToBank, 
    user,
    showToast 
  } = useApp();

  const [showAddMoneyModal, setShowAddMoneyModal] = useState<boolean>(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState<boolean>(false);
  const [addAmount, setAddAmount] = useState<number>(5000);
  const [addSource, setAddSource] = useState<string>('Google Pay UPI');
  const [withdrawAmount, setWithdrawAmount] = useState<number>(10000);
  const [autoPayActive, setAutoPayActive] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [copiedUPI, setCopiedUPI] = useState<boolean>(false);

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(OFFICIAL_WALLET_UPI_ID);
    setCopiedUPI(true);
    showToast(`UPI ID ${OFFICIAL_WALLET_UPI_ID} copied!`, 'success');
    setTimeout(() => setCopiedUPI(false), 2500);
  };

  const handleAddMoney = async (e: React.FormEvent) => {
    e.preventDefault();
    if (addAmount <= 0) return;

    setIsProcessing(true);
    await addMoneyToWallet(addAmount, addSource);
    setIsProcessing(false);
    setShowAddMoneyModal(false);
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (withdrawAmount <= 0) return;

    setIsProcessing(true);
    const success = await withdrawToBank(withdrawAmount);
    setIsProcessing(false);
    if (success) {
      setShowWithdrawModal(false);
    }
  };

  const toggleAutoPay = () => {
    setAutoPayActive(!autoPayActive);
    showToast(
      !autoPayActive ? 'UPI Auto-Pay enabled for on-time EMI repayments' : 'UPI Auto-Pay paused',
      'info'
    );
  };

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar bg-slate-50 text-slate-900 p-4 pb-20 space-y-4">
      {/* Screen Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <span>DhanSetu Wallet</span>
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Fast loan payouts, instant UPI withdrawals & automatic EMI payments
        </p>
      </div>

      {/* WALLET BALANCE CARD */}
      <div className="p-4 bg-gradient-to-br from-emerald-50 via-white to-teal-50/50 border border-emerald-200 rounded-3xl shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold">
            <Wallet className="w-4 h-4" />
            <span>Available Balance</span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">
            {user?.bankName || 'HDFC Bank'} Linked
          </span>
        </div>

        <div className="flex items-baseline gap-1 my-2">
          <span className="text-3xl font-extrabold text-slate-900 tracking-tight font-mono">
            ₹{walletBalance.toLocaleString('en-IN')}
          </span>
          <span className="text-xs text-emerald-600 font-semibold">.00</span>
        </div>

        <p className="text-[11px] text-slate-600 mb-4">
          All approved personal loan amounts are instantly credited to this wallet and live-synced with Supabase.
        </p>

        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={() => setShowAddMoneyModal(true)}
            className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Money</span>
          </button>

          <button
            onClick={() => setShowWithdrawModal(true)}
            className="py-2.5 px-3 bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs rounded-xl border border-slate-300 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <Building2 className="w-4 h-4 text-sky-600" />
            <span>Withdraw to Bank</span>
          </button>
        </div>
      </div>

      {/* UPI AUTO-DEBIT STATUS BOX */}
      <div className="p-3.5 bg-white border border-slate-200 rounded-2xl flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
            <QrCode className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">UPI Auto-Debit (e-NACH)</h4>
            <span className="text-[10px] text-slate-500 block">
              Auto-repays monthly EMI on due date to protect credit score
            </span>
          </div>
        </div>
        <button
          onClick={toggleAutoPay}
          className="text-emerald-600 hover:text-emerald-700 transition-colors p-1"
        >
          {autoPayActive ? (
            <ToggleRight className="w-8 h-8 text-emerald-600" />
          ) : (
            <ToggleLeft className="w-8 h-8 text-slate-400" />
          )}
        </button>
      </div>

      {/* Add Money Modal */}
      {showAddMoneyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm bg-white border border-slate-200 rounded-3xl p-5 shadow-2xl text-slate-900">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-bold text-slate-900">Add Money to Wallet</h3>
              <button onClick={() => setShowAddMoneyModal(false)} className="text-slate-400 hover:text-slate-700 text-xs">✕</button>
            </div>

            <form onSubmit={handleAddMoney} className="space-y-3.5">
              <div>
                <label className="block text-[11px] text-slate-600 mb-1">Enter Amount (₹)</label>
                <input
                  type="number"
                  min={100}
                  max={200000}
                  value={addAmount}
                  onChange={(e) => setAddAmount(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-base font-bold text-slate-900 font-mono focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-600 mb-1">Payment Method</label>
                <select
                  value={addSource}
                  onChange={(e) => setAddSource(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                >
                  <option value="Google Pay UPI">Google Pay (UPI)</option>
                  <option value="PhonePe UPI">PhonePe (UPI)</option>
                  <option value="Paytm UPI">Paytm (UPI)</option>
                  <option value="HDFC Net Banking">HDFC Net Banking</option>
                  <option value="Debit Card">Debit Card</option>
                </select>
              </div>

              {/* UPI Payee Info Box */}
              {addSource.includes('UPI') && (
                <div className="p-3 bg-emerald-50/70 border border-emerald-300 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                      Pay to DhanSetu UPI ID
                    </span>
                    <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded">
                      Verified
                    </span>
                  </div>
                  <div className="flex items-center justify-between bg-white border border-emerald-200 rounded-xl px-2.5 py-1.5 shadow-xs">
                    <span className="text-xs font-mono font-black text-slate-900 select-all">
                      {OFFICIAL_WALLET_UPI_ID}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyUpi}
                      className="px-2 py-0.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded text-[10px] font-bold text-emerald-800 flex items-center gap-1 cursor-pointer"
                    >
                      {copiedUPI ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedUPI ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <div className="text-center pt-1">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(`upi://pay?pa=${OFFICIAL_WALLET_UPI_ID}&pn=DhanSetu&am=${addAmount}&cu=INR&tn=Wallet_Topup`)}`}
                      alt="UPI QR Code"
                      className="w-24 h-24 mx-auto rounded-lg border border-emerald-200 bg-white p-1"
                    />
                    <span className="text-[9px] text-slate-500 mt-1 block">Scan or pay directly using any UPI App</span>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? 'Processing Payment...' : `Add ₹{addAmount.toLocaleString('en-IN')} Instantly`}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm bg-white border border-slate-200 rounded-3xl p-5 shadow-2xl text-slate-900">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-bold text-slate-900">Withdraw to Bank Account</h3>
              <button onClick={() => setShowWithdrawModal(false)} className="text-slate-400 hover:text-slate-700 text-xs">✕</button>
            </div>

            <form onSubmit={handleWithdraw} className="space-y-3.5">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <span className="text-[10px] text-slate-500 block">Destination Account</span>
                <span className="font-semibold text-slate-900 block mt-0.5">
                  {user?.bankName || 'State Bank of India'}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  A/C: {user?.accountNumber || '••••••••4892'} · IFSC: {user?.ifscCode || 'SBIN0004521'}
                </span>
              </div>

              <div>
                <label className="block text-[11px] text-slate-600 mb-1">
                  Withdrawal Amount (Available: ₹{walletBalance.toLocaleString('en-IN')})
                </label>
                <input
                  type="number"
                  min={500}
                  max={walletBalance}
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-base font-bold text-slate-900 font-mono focus:outline-none focus:border-emerald-600"
                />
              </div>

              <button
                type="submit"
                disabled={isProcessing || withdrawAmount > walletBalance}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? 'Initiating IMPS Transfer...' : `Transfer ₹{withdrawAmount.toLocaleString('en-IN')} to Bank`}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
