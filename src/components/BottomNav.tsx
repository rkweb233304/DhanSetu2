import React from 'react';
import { 
  Home, 
  Coins, 
  CreditCard, 
  User,
  ShieldCheck,
  Users,
  FileText
} from 'lucide-react';
import { useApp, TabType } from '../context/AppContext';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, user } = useApp();

  const isAdmin = user?.role === 'admin';

  const normalNavItems: { tab: TabType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { tab: 'home', label: 'Home', icon: Home },
    { tab: 'active-loan', label: 'Active Loan', icon: Coins },
    { tab: 'payments', label: 'Payments', icon: CreditCard },
    { tab: 'profile', label: 'Profile', icon: User }
  ];

  const adminNavItems: { tab: TabType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { tab: 'admin-home', label: 'Home', icon: Home },
    { tab: 'admin-users', label: 'Users', icon: Users },
    { tab: 'admin-applications', label: 'Applications', icon: FileText },
    { tab: 'admin-payments', label: 'Payments', icon: CreditCard }
  ];

  const navItems = isAdmin ? adminNavItems : normalNavItems;

  return (
    <nav className="h-16 bg-white/95 border-t border-slate-200 flex items-center justify-around px-2 z-50 backdrop-blur-md shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.tab || (item.tab === 'home' && activeTab === 'kyc');

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
