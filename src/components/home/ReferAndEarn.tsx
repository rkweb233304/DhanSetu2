import React from 'react';
import { Gift, Share2, Copy } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ReferAndEarn: React.FC = () => {
  const { user, showToast } = useApp();
  const referralCode = user?.customerId || '2026102401';

  const handleCopy = () => {
    navigator.clipboard.writeText(referralCode);
    showToast('Referral code copied to clipboard!', 'success');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Join DhanSetu',
        text: `Hey! Join DhanSetu for quick and easy digital loans. Use my referral code: ${referralCode}`,
        url: window.location.origin,
      }).catch(console.error);
    } else {
      handleCopy();
    }
  };

  return (
    <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-6 text-white relative overflow-hidden shadow-lg shadow-indigo-200">
      {/* Decorative Circles */}
      <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
      <div className="absolute -left-4 -bottom-4 w-32 h-32 bg-white/10 rounded-full blur-3xl" />

      <div className="relative z-10 flex flex-col items-center text-center">
        <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-4">
          <Gift className="w-6 h-6 text-white" />
        </div>
        
        <h3 className="text-lg font-bold mb-1">Refer & Earn Rewards</h3>
        <p className="text-xs text-white/80 mb-6 max-w-[200px]">Invite your friends and earn ₹500 on every successful loan disbursement.</p>

        <div className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-3 flex items-center justify-between gap-4">
          <div className="flex-1 text-left px-1">
            <p className="text-[10px] text-white/60 uppercase font-bold tracking-widest mb-0.5">Your Code</p>
            <p className="text-sm font-mono font-bold tracking-wider">{referralCode}</p>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleCopy}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
            >
              <Copy className="w-4 h-4" />
            </button>
            <button 
              onClick={handleShare}
              className="px-4 py-2.5 rounded-xl bg-white text-indigo-600 text-xs font-bold hover:bg-slate-50 transition-colors flex items-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              Share
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
