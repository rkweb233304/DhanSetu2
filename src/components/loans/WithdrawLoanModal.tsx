import React, { useState } from 'react';
import { ArrowRight, Check } from 'lucide-react';

export const WithdrawLoanModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [step, setStep] = useState(1);
  const [channel, setChannel] = useState<'UPI' | 'Bank'>('UPI');
  const [agreed, setAgreed] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl p-6 w-full max-w-sm">
        {step === 1 ? (
          <>
            <h2 className="text-lg font-bold mb-4">Select Withdrawal Channel</h2>
            <div className="space-y-3 mb-6">
              {['UPI', 'Bank'].map(opt => (
                <button key={opt} onClick={() => setChannel(opt as any)} className={`w-full p-4 border rounded-xl ${channel === opt ? 'border-emerald-500 bg-emerald-50' : ''}`}>
                  {opt}
                </button>
              ))}
            </div>
            <button onClick={() => setStep(2)} className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold">Next</button>
          </>
        ) : (
          <>
            <h2 className="text-lg font-bold mb-4">Loan Agreement</h2>
            <p className="text-xs mb-4">I agree to the terms and conditions for the loan withdrawal via {channel}.</p>
            <label className="flex items-center gap-2 mb-6">
              <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} />
              <span className="text-xs">I accept the agreement</span>
            </label>
            <button disabled={!agreed} onClick={onClose} className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold disabled:opacity-50">Withdraw</button>
          </>
        )}
      </div>
    </div>
  );
};
