import React from 'react';
import { 
  X, 
  Bell, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  Coins, 
  ShieldCheck 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({ isOpen, onClose }) => {
  const { user, setActiveTab, resetNotifications } = useApp();

  if (!isOpen) return null;

  const isKYCCompleted = user?.kycCompleted;

  const notifications = [
    {
      id: 'notif-1',
      title: isKYCCompleted ? 'Pre-Approved Credit Limit Ready' : 'Action Required: Complete KYC',
      desc: isKYCCompleted 
        ? 'Congratulations! You are eligible for an instant ₹5,00,000 personal loan with 10.75% p.a.'
        : 'Please upload Selfie, Aadhaar Front/Back and PAN to activate your loan approval engine.',
      time: '10m ago',
      type: isKYCCompleted ? 'success' : 'warning',
      actionTab: isKYCCompleted ? 'loans' : 'kyc',
      actionLabel: isKYCCompleted ? 'View Loan Offers' : 'Upload Documents'
    },
    {
      id: 'notif-2',
      title: 'UPI Auto-Pay Reminder',
      desc: 'Your monthly EMI auto-debit will be processed on the 5th of next month. Maintain wallet balance.',
      time: '2h ago',
      type: 'info',
      actionTab: 'wallet',
      actionLabel: 'Check Wallet'
    },
    {
      id: 'notif-3',
      title: 'DhanSetu Security Protocol',
      desc: '2-factor authentication & UIDAI OTP encryption active for com.app.dhansetu.',
      time: '1d ago',
      type: 'info'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl text-slate-100 max-h-[85vh] overflow-y-auto no-scrollbar">
        <div className="flex justify-between items-center pb-3 border-b border-slate-800 mb-3">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">Notifications</h3>
          </div>
          <button 
            onClick={() => {
              resetNotifications();
              onClose();
            }} 
            className="text-slate-400 hover:text-white text-xs p-1"
          >
            ✕
          </button>
        </div>

        <div className="space-y-2.5">
          {notifications.map((n) => (
            <div 
              key={n.id}
              className={`p-3 rounded-2xl border text-xs space-y-1.5 ${
                n.type === 'warning'
                  ? 'bg-amber-950/30 border-amber-900/50'
                  : n.type === 'success'
                  ? 'bg-emerald-950/30 border-emerald-900/50'
                  : 'bg-slate-950 border-slate-800'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-1.5 font-bold text-white">
                  {n.type === 'warning' ? (
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  ) : n.type === 'success' ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Bell className="w-3.5 h-3.5 text-sky-400" />
                  )}
                  <span>{n.title}</span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">{n.time}</span>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed">
                {n.desc}
              </p>

              {n.actionTab && (
                <button
                  onClick={() => {
                    setActiveTab(n.actionTab as any);
                    onClose();
                  }}
                  className="mt-1 text-[11px] font-bold text-emerald-400 hover:underline inline-block"
                >
                  {n.actionLabel} →
                </button>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={() => {
            resetNotifications();
            onClose();
          }}
          className="mt-4 w-full py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold"
        >
          Mark All as Read
        </button>
      </div>
    </div>
  );
};
