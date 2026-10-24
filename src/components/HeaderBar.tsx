import React from 'react';
import { 
  Bell, 
  ShieldCheck, 
  AlertCircle, 
  UserCircle2, 
  LogIn
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const HeaderBar: React.FC = () => {
  const { 
    user, 
    activeTab, 
    setActiveTab, 
    setAuthModalOpen, 
    setAuthMode
  } = useApp();

  const isKYCVerified = user?.kycCompleted && user.kyc.overallStatus === 'verified';

  return (
    <header className="h-14 px-4 bg-white border-b border-slate-200 flex items-center justify-between z-30 shrink-0 sticky top-0 shadow-sm">
      {/* Brand logo */}
      <button 
        onClick={() => setActiveTab('home')}
        className="flex items-center gap-2 text-left group"
      >
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 p-0.5 shadow-md flex items-center justify-center">
          <span className="text-white font-extrabold text-base tracking-tighter">₹</span>
        </div>
        <div>
          <div className="flex items-center gap-1">
            <span className="font-bold text-slate-900 text-[15px] tracking-tight group-hover:text-emerald-600 transition-colors">
              DhanSetu
            </span>
          </div>
          <span className="text-[10px] text-slate-500 block -mt-0.5 tracking-wide">
            Instant Credit Bridge
          </span>
        </div>
      </button>

      {/* KYC Status Badge & Actions */}
      <div className="flex items-center gap-1.5">
        {user ? (
          <>
            <span 
              onClick={() => setActiveTab('profile')} 
              className="text-[10px] font-mono font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded border border-slate-200 cursor-pointer"
              title="Your Unique Customer ID"
            >
              {user.customerId}
            </span>

            {isKYCVerified ? (
              <button
                onClick={() => setActiveTab('profile')}
                className="flex items-center gap-1 px-2 py-1 bg-emerald-50 border border-emerald-200 rounded-full text-[11px] text-emerald-700 font-medium hover:bg-emerald-100 transition-colors"
                title="KYC Verified"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-[10px]">KYC Verified</span>
              </button>
            ) : (
              <button
                onClick={() => setActiveTab('kyc')}
                className="flex items-center gap-1 px-2.5 py-1 bg-amber-50 border border-amber-200 rounded-full text-[11px] text-amber-700 font-medium hover:bg-amber-100 transition-all animate-pulse"
                title="Complete mandatory KYC"
              >
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                <span className="text-[10px] font-semibold">Verify KYC</span>
              </button>
            )}

            {/* User profile mini button */}
            <button
              onClick={() => setActiveTab('profile')}
              className="w-7 h-7 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center text-slate-700 hover:border-emerald-600 transition-colors overflow-hidden"
              title={user.fullName}
            >
              {user.kyc.selfieUrl ? (
                <img 
                  src={user.kyc.selfieUrl} 
                  alt={user.fullName} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <UserCircle2 className="w-5 h-5" />
              )}
            </button>
          </>
        ) : (
          <button
            onClick={() => {
              setAuthMode('login');
              setAuthModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs shadow-sm transition-all"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Login</span>
          </button>
        )}
      </div>
    </header>
  );
};
