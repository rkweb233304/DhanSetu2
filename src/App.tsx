import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { HeaderBar } from './components/HeaderBar';
import { BottomNav } from './components/BottomNav';
import { HomeScreen } from './components/home/HomeScreen';
import { LoansScreen } from './components/loans/LoansScreen';
import { WalletScreen } from './components/wallet/WalletScreen';
import { ProfileScreen } from './components/profile/ProfileScreen';
import { KYCScreen } from './components/kyc/KYCScreen';
import { AuthModal } from './components/auth/AuthModal';
import { ApplicationTrackerModal } from './components/loans/ApplicationTrackerModal';
import { SupabaseModal } from './components/common/SupabaseModal';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, ShieldCheck, LogIn } from 'lucide-react';

function DhanSetuApp() {
  const { activeTab, setActiveTab, toastMessage, user, setAuthModalOpen, setAuthMode } = useApp();

  const [trackerModalOpen, setTrackerModalOpen] = useState(false);
  const [supabaseModalOpen, setSupabaseModalOpen] = useState(false);

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-4">
        {toastMessage && (
          <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 max-w-sm w-full px-4 animate-in fade-in">
            <div className="p-3 bg-slate-800 border border-slate-700 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-semibold text-white">
              <Info className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{toastMessage.text}</span>
            </div>
          </div>
        )}

        <div className="w-full max-w-sm bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl text-slate-900 text-center space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-emerald-600/20">
            ₹
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">DhanSetu</h1>
            <p className="text-xs text-slate-500 mt-1">Instant Personal Loans & Digital KYC</p>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 text-left space-y-1.5">
            <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>Secure Authentication Required</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Please sign in or register with your mobile number and 6-digit PIN to access your loan dashboard and wallet.
            </p>
          </div>

          <div className="space-y-2 pt-2">
            <button
              onClick={() => {
                setAuthMode('login');
                setAuthModalOpen(true);
              }}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In with Mobile & PIN</span>
            </button>

            <button
              onClick={() => {
                setAuthMode('register');
                setAuthModalOpen(true);
              }}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-xl border border-slate-300 transition-colors"
            >
              Register New Account
            </button>
          </div>
        </div>

        <AuthModal />
        <SupabaseModal
          isOpen={supabaseModalOpen}
          onClose={() => setSupabaseModalOpen(false)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-slate-100 text-slate-900 flex flex-col font-sans select-none relative overflow-x-hidden">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 max-w-md w-[92%] px-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className={`p-3.5 rounded-2xl shadow-xl border flex items-center gap-3 text-xs font-semibold ${
            toastMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
              : toastMessage.type === 'warning'
              ? 'bg-amber-50 border-amber-300 text-amber-900'
              : toastMessage.type === 'error'
              ? 'bg-rose-50 border-rose-300 text-rose-900'
              : 'bg-white border-slate-200 text-slate-900'
          }`}>
            {toastMessage.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
            {toastMessage.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />}
            {toastMessage.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />}
            {toastMessage.type === 'info' && <Info className="w-4 h-4 text-sky-600 shrink-0" />}
            <span className="flex-1 leading-tight">{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Centered Mobile-First Responsive Shell with absolute fixed bottom navigation */}
      <div className="w-full max-w-md mx-auto flex-1 flex flex-col bg-white shadow-xl border-x border-slate-200 relative min-h-screen">
        {/* Top Header Bar */}
        <HeaderBar />

        {/* Main Content Area with generous bottom padding for navigation */}
        <div className="flex-1 flex flex-col overflow-y-auto no-scrollbar pb-24">
          {activeTab === 'home' && (
            <HomeScreen
              onOpenTracker={() => setTrackerModalOpen(true)}
              onOpenLoanApply={() => setActiveTab('loans')}
            />
          )}
          {activeTab === 'loans' && (
            <LoansScreen onOpenTracker={() => setTrackerModalOpen(true)} />
          )}
          {activeTab === 'wallet' && <WalletScreen />}
          {activeTab === 'profile' && (
            <ProfileScreen onOpenSupabaseModal={() => setSupabaseModalOpen(true)} />
          )}
          {activeTab === 'kyc' && <KYCScreen />}
        </div>

        {/* Fixed Bottom Navigation Bar */}
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 border-t border-slate-200 backdrop-blur-md">
          <div className="max-w-md mx-auto w-full">
            <BottomNav />
          </div>
        </div>
      </div>

      {/* Overlays and Modals */}
      <AuthModal />
      <ApplicationTrackerModal
        isOpen={trackerModalOpen}
        onClose={() => setTrackerModalOpen(false)}
      />
      <SupabaseModal
        isOpen={supabaseModalOpen}
        onClose={() => setSupabaseModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <DhanSetuApp />
    </AppProvider>
  );
}
