import React from 'react';
import { 
  Home, 
  Coins, 
  CreditCard, 
  User,
  Building2
} from 'lucide-react';
import { useApp, TabType } from '../context/AppContext';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, user, pendingApplicationsCount } = useApp();

  const isKYCPending = !user?.kycCompleted;

  const isRetailer = user?.role === 'retailer';

  const baseNavItems: { tab: TabType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { tab: 'home', label: 'Home', icon: Home },
    { tab: 'loans', label: 'Apply', icon: Coins },
    ...(isRetailer ? [{ tab: 'retailer' as TabType, label: 'Retailer', icon: Building2 }] : []),
    { tab: 'payments', label: 'Payments', icon: CreditCard },
    { tab: 'profile', label: 'Profile', icon: User }
  ];

  const navItems = baseNavItems;

  return (
    <nav className="h-16 bg-white/95 border-t border-slate-200 flex items-center justify-around px-2 z-50 backdrop-blur-md shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = 
          activeTab === item.tab || 
          (item.tab === 'profile' && activeTab === 'kyc') ||
          (item.tab === 'payments' && (activeTab as any) === 'wallet');
        const showWarningDot = item.tab === 'profile' && isKYCPending;
        const showRetailerBadge = item.tab === 'retailer' && pendingApplicationsCount > 0;

        return (
          <button
            key={item.tab}
            onClick={() => setActiveTab(item.tab)}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-all relative cursor-pointer ${
              isActive 
                ? 'text-emerald-600 font-bold' 
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <div className="relative">
              <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'scale-110' : ''}`} />
              {showWarningDot && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full ring-2 ring-white animate-pulse" />
              )}
              {showRetailerBadge && (
                <span className="absolute -top-1.5 -right-2 px-1 min-w-[15px] h-[15px] bg-amber-600 text-white rounded-full text-[9px] font-mono font-bold flex items-center justify-center border border-white animate-pulse">
                  {pendingApplicationsCount}
                </span>
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
