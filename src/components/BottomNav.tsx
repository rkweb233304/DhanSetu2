import React from 'react';
import { 
  Home, 
  Coins, 
  Wallet, 
  User
} from 'lucide-react';
import { useApp, TabType } from '../context/AppContext';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, user } = useApp();

  const isKYCPending = !user?.kycCompleted;

  const navItems: { tab: TabType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { tab: 'home', label: 'Home', icon: Home },
    { tab: 'loans', label: 'Loans', icon: Coins },
    { tab: 'wallet', label: 'Wallet', icon: Wallet },
    { tab: 'profile', label: 'Profile', icon: User }
  ];

  return (
    <nav className="h-16 bg-white/95 border-t border-slate-200 flex items-center justify-around px-2 z-50 backdrop-blur-md shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.tab || (item.tab === 'profile' && activeTab === 'kyc');
        const showWarningDot = item.tab === 'profile' && isKYCPending;

        return (
          <button
            key={item.tab}
            onClick={() => setActiveTab(item.tab)}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-all relative ${
              isActive 
                ? 'text-emerald-600 font-semibold' 
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <div className="relative">
              <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'scale-110' : ''}`} />
              {showWarningDot && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full ring-2 ring-white animate-pulse" />
              )}
            </div>
            <span className="text-[11px] mt-1 tracking-tight">{item.label}</span>
            {isActive && (
              <span className="w-1.5 h-1 bg-emerald-600 rounded-full mt-0.5" />
            )}
          </button>
        );
      })}
    </nav>
  );
};
