import React, { useState, useEffect } from 'react';
import { Calculator, IndianRupee, Calendar, TrendingUp } from 'lucide-react';

export const EMICalculator: React.FC = () => {
  const [amount, setAmount] = useState<number>(50000);
  const [tenure, setTenure] = useState<number>(12);
  const [rate, setRate] = useState<number>(12);
  const [emi, setEmi] = useState<number>(0);
  const [totalInterest, setTotalInterest] = useState<number>(0);
  const [totalPayment, setTotalPayment] = useState<number>(0);

  useEffect(() => {
    const r = rate / (12 * 100);
    const n = tenure;
    const emiValue = (amount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    
    if (isNaN(emiValue) || !isFinite(emiValue)) {
      setEmi(0);
      setTotalInterest(0);
      setTotalPayment(0);
    } else {
      const total = emiValue * n;
      setEmi(Math.round(emiValue));
      setTotalPayment(Math.round(total));
      setTotalInterest(Math.round(total - amount));
    }
  }, [amount, tenure, rate]);

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
          <Calculator className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900 leading-tight">EMI Calculator</h3>
          <p className="text-[10px] text-slate-500">Plan your loan repayment easily</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Loan Amount */}
        <div className="space-y-3">
          <div className="flex justify-between items-center text-xs font-semibold">
            <span className="text-slate-600">Loan Amount</span>
            <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">₹{amount.toLocaleString()}</span>
          </div>
          <input
            type="range"
            min="1000"
            max="200000"
            step="1000"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />
          <div className="flex justify-between text-[10px] text-slate-400">
            <span>₹1k</span>
            <span>₹200k</span>
          </div>
        </div>

        {/* Tenure */}
        <div className="space-y-3">
          <div className="flex justify-between items-center text-xs font-semibold">
            <span className="text-slate-600">Tenure (Months)</span>
            <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">{tenure} Months</span>
          </div>
          <input
            type="range"
            min="3"
            max="36"
            step="3"
            value={tenure}
            onChange={(e) => setTenure(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />
          <div className="flex justify-between text-[10px] text-slate-400">
            <span>3m</span>
            <span>36m</span>
          </div>
        </div>

        {/* Interest Rate */}
        <div className="space-y-3">
          <div className="flex justify-between items-center text-xs font-semibold">
            <span className="text-slate-600">Interest Rate (% p.a.)</span>
            <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">{rate}%</span>
          </div>
          <input
            type="range"
            min="8"
            max="36"
            step="0.5"
            value={rate}
            onChange={(e) => setRate(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />
          <div className="flex justify-between text-[10px] text-slate-400">
            <span>8%</span>
            <span>36%</span>
          </div>
        </div>

        {/* Results */}
        <div className="pt-6 border-t border-slate-50 space-y-4">
          <div className="bg-slate-50 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-indigo-600 shadow-sm">
                <IndianRupee className="w-4 h-4" />
              </div>
              <span className="text-xs font-medium text-slate-600">Monthly EMI</span>
            </div>
            <span className="text-lg font-bold text-slate-900">₹{emi.toLocaleString()}</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 rounded-2xl p-4 space-y-1">
              <div className="flex items-center gap-2 text-slate-500 mb-1">
                <TrendingUp className="w-3 h-3" />
                <span className="text-[10px] font-medium uppercase tracking-wider">Interest</span>
              </div>
              <p className="text-sm font-bold text-slate-900">₹{totalInterest.toLocaleString()}</p>
            </div>
            <div className="bg-slate-50 rounded-2xl p-4 space-y-1">
              <div className="flex items-center gap-2 text-slate-500 mb-1">
                <Calendar className="w-3 h-3" />
                <span className="text-[10px] font-medium uppercase tracking-wider">Total</span>
              </div>
              <p className="text-sm font-bold text-slate-900">₹{totalPayment.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
