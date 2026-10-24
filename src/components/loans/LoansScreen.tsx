import React, { useState } from 'react';
import { 
  Calculator, 
  Sparkles, 
  Check, 
  ArrowRight, 
  TrendingDown, 
  Percent, 
  Clock, 
  ShieldCheck, 
  HelpCircle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { LoanOffer } from '../../types';

interface LoansScreenProps {
  onOpenTracker: () => void;
}

export const LoansScreen: React.FC<LoansScreenProps> = ({ onOpenTracker }) => {
  const { 
    loanOffers, 
    user, 
    setActiveTab, 
    applyForLoan, 
    showToast 
  } = useApp();

  const [calcAmount, setCalcAmount] = useState<number>(150000);
  const [calcTenure, setCalcTenure] = useState<number>(18);
  const [calcInterestRate, setCalcInterestRate] = useState<number>(10.75);

  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const [selectedOfferForApply, setSelectedOfferForApply] = useState<LoanOffer | null>(null);
  const [applyPurpose, setApplyPurpose] = useState<string>('Personal & Household Expenses');
  const [isApplying, setIsApplying] = useState<boolean>(false);

  const monthlyRate = (calcInterestRate / 12) / 100;
  const calculatedEmi = Math.round(
    (calcAmount * monthlyRate * Math.pow(1 + monthlyRate, calcTenure)) /
    (Math.pow(1 + monthlyRate, calcTenure) - 1)
  );
  const totalRepayment = calculatedEmi * calcTenure;
  const totalInterest = Math.max(0, totalRepayment - calcAmount);
  const principalPercent = Math.round((calcAmount / totalRepayment) * 100);
  const interestPercent = 100 - principalPercent;

  const filteredOffers = selectedCategory === 'all' 
    ? loanOffers 
    : loanOffers.filter(o => o.category === selectedCategory);

  const isKYCCompleted = user?.kycCompleted && user?.kyc?.overallStatus === 'verified';

  const handleStartApply = (offer: LoanOffer, initialAmount?: number, initialTenure?: number) => {
    if (!isKYCCompleted) {
      showToast('⚠️ KYC completion is mandatory before applying for a loan', 'warning');
      setActiveTab('kyc');
      return;
    }

    if (initialAmount) setCalcAmount(initialAmount);
    if (initialTenure) setCalcTenure(initialTenure);
    setCalcInterestRate(offer.interestRatePerAnnum);
    setSelectedOfferForApply(offer);
  };

  const handleConfirmApplication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOfferForApply) return;

    setIsApplying(true);
    setTimeout(() => {
      setIsApplying(false);
      applyForLoan(selectedOfferForApply, calcAmount, calcTenure, applyPurpose);
      setSelectedOfferForApply(null);
      onOpenTracker();
    }, 700);
  };

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar bg-slate-50 text-slate-900 p-4 pb-20 space-y-4">
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <span>Loans & EMI Calculator</span>
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Calculate monthly interest rates & get real-time approvals
        </p>
      </div>

      {/* INTERACTIVE EMI CALCULATOR */}
      <div className="p-4 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Calculator className="w-4 h-4" />
            </div>
            <h2 className="text-xs font-bold text-slate-900 tracking-tight">EMI & Interest Calculator</h2>
          </div>
          <span className="text-[10px] text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            Real-time Math
          </span>
        </div>

        {/* 1. Loan Amount */}
        <div>
          <div className="flex justify-between items-center mb-1.5 text-xs">
            <span className="text-slate-600">Loan Amount:</span>
            <span className="font-bold text-slate-900 font-mono text-base">
              ₹{calcAmount.toLocaleString('en-IN')}
            </span>
          </div>
          <input
            type="range"
            min={10000}
            max={1000000}
            step={5000}
            value={calcAmount}
            onChange={(e) => setCalcAmount(Number(e.target.value))}
            className="w-full accent-emerald-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
          />
          <div className="flex gap-1.5 mt-2">
            {[50000, 100000, 200000, 500000].map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => setCalcAmount(amt)}
                className={`flex-1 py-1 text-[10px] rounded-lg border transition-colors ${
                  calcAmount === amt
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:text-slate-900'
                }`}
              >
                ₹{amt >= 100000 ? `${amt / 100000} Lakh` : `${amt / 1000}k`}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Tenure Slider */}
        <div>
          <div className="flex justify-between items-center mb-1.5 text-xs">
            <span className="text-slate-600">Tenure (Duration):</span>
            <span className="font-bold text-slate-900 font-mono">
              {calcTenure} Months ({Math.round((calcTenure / 12) * 10) / 10} Yrs)
            </span>
          </div>
          <input
            type="range"
            min={3}
            max={36}
            step={3}
            value={calcTenure}
            onChange={(e) => setCalcTenure(Number(e.target.value))}
            className="w-full accent-emerald-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
          />
          <div className="flex gap-1.5 mt-2">
            {[6, 12, 18, 24, 36].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setCalcTenure(m)}
                className={`flex-1 py-1 text-[10px] rounded-lg border transition-colors ${
                  calcTenure === m
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:text-slate-900'
                }`}
              >
                {m}M
              </button>
            ))}
          </div>
        </div>

        {/* 3. Interest Rate */}
        <div>
          <div className="flex justify-between items-center mb-1.5 text-xs">
            <span className="text-slate-600">Interest Rate:</span>
            <div className="flex items-center gap-1">
              <span className="font-bold text-emerald-600 font-mono">{calcInterestRate}% p.a.</span>
              <span className="text-[10px] text-slate-500">
                ({(calcInterestRate / 12).toFixed(2)}% / mo)
              </span>
            </div>
          </div>
          <input
            type="range"
            min={9.5}
            max={18.0}
            step={0.25}
            value={calcInterestRate}
            onChange={(e) => setCalcInterestRate(Number(e.target.value))}
            className="w-full accent-emerald-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
          />
        </div>

        {/* Calculated Results Summary Box */}
        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
          <div className="flex justify-between items-baseline">
            <span className="text-xs text-slate-600">Monthly EMI:</span>
            <span className="text-xl font-extrabold text-emerald-600 font-mono">
              ₹{calculatedEmi.toLocaleString('en-IN')}
            </span>
          </div>

          <div>
            <div className="w-full h-2 bg-slate-200 rounded-full flex overflow-hidden">
              <div 
                className="bg-emerald-500 h-full" 
                style={{ width: `${principalPercent}%` }} 
              />
              <div 
                className="bg-amber-500 h-full" 
                style={{ width: `${interestPercent}%` }} 
              />
            </div>
            <div className="flex justify-between text-[10px] mt-1 text-slate-600">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                Principal: ₹{calcAmount.toLocaleString('en-IN')} ({principalPercent}%)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                Interest: ₹{totalInterest.toLocaleString('en-IN')} ({interestPercent}%)
              </span>
            </div>
          </div>

          <div className="pt-1 border-t border-slate-200 flex justify-between text-xs">
            <span className="text-slate-600">Total Repayment:</span>
            <span className="font-semibold text-slate-900 font-mono">
              ₹{totalRepayment.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        <button
          onClick={() => handleStartApply(loanOffers[0], calcAmount, calcTenure)}
          className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <span>Apply for ₹{calcAmount.toLocaleString('en-IN')} at {calcInterestRate}%</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* AVAILABLE LOAN OFFERS */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-900 tracking-tight">Available Loan Offers</h2>
          <span className="text-[10px] text-slate-500">{filteredOffers.length} Plans</span>
        </div>

        {/* Filter categories */}
        <div className="flex items-center gap-1 p-1 bg-white border border-slate-200 rounded-xl overflow-x-auto no-scrollbar shadow-sm">
          {[
            { id: 'all', label: 'All Offers' },
            { id: 'personal', label: 'Personal' },
            { id: 'instant', label: 'Instant' },
            { id: 'flexi', label: 'Flexi Line' },
            { id: 'education', label: 'Education' }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-2.5 py-1 text-xs rounded-lg whitespace-nowrap transition-colors font-medium ${
                selectedCategory === cat.id
                  ? 'bg-slate-100 text-slate-900 shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Offers Cards List */}
        <div className="space-y-3">
          {filteredOffers.map((offer) => (
            <div
              key={offer.id}
              className={`p-4 bg-white border rounded-2xl relative transition-all shadow-sm ${
                offer.recommended 
                  ? 'border-emerald-500/80 shadow-emerald-600/10' 
                  : 'border-slate-200'
              }`}
            >
              {offer.recommended && (
                <div className="absolute -top-2.5 right-4 px-2 py-0.5 bg-emerald-600 text-white font-extrabold text-[9px] rounded-full uppercase tracking-wider shadow">
                  Recommended
                </div>
              )}

              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-900">{offer.title}</h3>
                  <span className="text-[10px] text-emerald-600 font-medium">{offer.tag}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-extrabold text-emerald-600 font-mono">
                    {offer.interestRatePerAnnum}% p.a.
                  </span>
                  <span className="text-[9px] text-slate-500 block">Interest Rate</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-600 mt-2 leading-relaxed">
                {offer.description}
              </p>

              <div className="mt-2.5 grid grid-cols-2 gap-2 text-[10px] text-slate-700 bg-slate-50 p-2 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-500 block">Loan Limit:</span>
                  <span className="font-mono font-medium">₹{offer.minAmount.toLocaleString('en-IN')} - ₹{offer.maxAmount.toLocaleString('en-IN')}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Tenure:</span>
                  <span className="font-mono font-medium">{offer.minTenureMonths} to {offer.maxTenureMonths} Months</span>
                </div>
              </div>

              <div className="mt-2.5 space-y-1">
                {offer.features.map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 text-[10px] text-slate-700">
                    <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>

              <div className="mt-3.5 flex gap-2">
                <button
                  onClick={() => {
                    setCalcAmount(offer.minAmount * 2);
                    setCalcTenure(offer.minTenureMonths * 2);
                    setCalcInterestRate(offer.interestRatePerAnnum);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="flex-1 py-1.5 px-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl text-slate-700 text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                >
                  <Calculator className="w-3.5 h-3.5 text-slate-500" />
                  <span>Calculate EMI</span>
                </button>

                <button
                  onClick={() => handleStartApply(offer, offer.minAmount * 2, offer.minTenureMonths * 2)}
                  className="flex-1 py-1.5 px-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-sm flex items-center justify-center gap-1 transition-colors"
                >
                  <span>Apply Now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* APPLICATION CONFIRMATION MODAL */}
      {selectedOfferForApply && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm bg-white border border-slate-200 rounded-3xl p-5 shadow-2xl text-slate-900 max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="flex justify-between items-center mb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Confirm Loan Application</h3>
                <span className="text-[10px] text-slate-500">{selectedOfferForApply.title}</span>
              </div>
              <button 
                onClick={() => setSelectedOfferForApply(null)}
                className="text-slate-400 hover:text-slate-700 text-xs p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmApplication} className="space-y-3">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Principal Amount:</span>
                  <span className="font-bold text-slate-900 font-mono">₹{calcAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Tenure:</span>
                  <span className="text-slate-900 font-mono">{calcTenure} Months</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Monthly EMI:</span>
                  <span className="font-bold text-emerald-600 font-mono text-sm">
                    ₹{calculatedEmi.toLocaleString('en-IN')} / mo
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Processing Fee (1.5%):</span>
                  <span className="text-slate-700 font-mono">₹{Math.round(calcAmount * 0.015).toLocaleString('en-IN')}</span>
                </div>
                <div className="pt-1.5 border-t border-slate-200 flex justify-between">
                  <span className="text-slate-500">Net Wallet Disbursal:</span>
                  <span className="font-bold text-emerald-700 font-mono">
                    ₹{(calcAmount - Math.round(calcAmount * 0.015)).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">
                  Purpose of Loan
                </label>
                <select
                  value={applyPurpose}
                  onChange={(e) => setApplyPurpose(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                >
                  <option value="Personal & Household Expenses">Personal & Household Expenses</option>
                  <option value="Medical Emergency">Medical Emergency</option>
                  <option value="Home Renovation / Improvement">Home Renovation / Improvement</option>
                  <option value="Education & Course Fees">Education & Course Fees</option>
                  <option value="Debt Consolidation">Debt Consolidation</option>
                  <option value="Business Working Capital">Business Working Capital</option>
                </select>
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-700 font-semibold text-[11px]">
                  <ShieldCheck className="w-4 h-4" />
                  <span>KYC Verified Borrower</span>
                </div>
                <p className="text-[10px] text-slate-600">
                  Beneficiary: {user?.fullName} · {user?.bankName} ({user?.accountNumber})
                </p>
                <p className="text-[10px] text-emerald-700">
                  ✓ Instant real-time tracking begins immediately upon submission.
                </p>
              </div>

              <button
                type="submit"
                disabled={isApplying}
                className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isApplying ? 'Submitting Application...' : 'Confirm & Track Approval in Real-Time'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
