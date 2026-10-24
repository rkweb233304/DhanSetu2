import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { HeaderBar } from './components/HeaderBar';
import { BottomNav } from './components/BottomNav';
import { HomeScreen } from './components/home/HomeScreen';
import { LoansScreen } from './components/loans/LoansScreen';
import { PaymentsScreen } from './components/payments/PaymentsScreen';
import { ProfileScreen } from './components/profile/ProfileScreen';
import { KYCScreen } from './components/kyc/KYCScreen';
import { RetailerScreen } from './components/retailer/RetailerScreen';
import { AuthPage } from './components/auth/AuthPage';
import { ApplicationTrackerModal } from './components/loans/ApplicationTrackerModal';
import { SupabaseModal } from './components/common/SupabaseModal';
import { CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';

function DhanSetuApp() {
  const { activeTab, setActiveTab, toastMessage, user } = useApp();

  const [trackerModalOpen, setTrackerModalOpen] = useState(false);
  const [supabaseModalOpen, setSupabaseModalOpen] = useState(false);

  // If user is not logged in, render the dedicated full-page Login & Register directly (NO POPUP)
  if (!user) {
    return (
      <div className="min-h-screen w-full bg-slate-50 flex flex-col justify-center items-center">
        {toastMessage && (
          <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 max-w-sm w-[92%] px-4 animate-in fade-in">
            <div className={`p-3 rounded-2xl shadow-xl border flex items-center gap-2.5 text-xs font-semibold ${
              toastMessage.type === 'success'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                : toastMessage.type === 'error'
                ? 'bg-rose-50 border-rose-300 text-rose-900'
                : 'bg-white border-slate-200 text-slate-900'
            }`}>
              <Info className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{toastMessage.text}</span>
            </div>
          </div>
        )}
        <AuthPage />
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

      {/* Centered Mobile-First Responsive Shell */}
      <div className="w-full max-w-md mx-auto flex-1 flex flex-col bg-white shadow-xl border-x border-slate-200 relative min-h-screen">
        {/* Top Header Bar */}
        <HeaderBar />

        {/* Main Content Area */}
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
          {(activeTab === 'payments' || (activeTab as any) === 'wallet') && (
            <PaymentsScreen />
          )}
          {activeTab === 'profile' && (
            <ProfileScreen onOpenSupabaseModal={() => setSupabaseModalOpen(true)} />
          )}
          {activeTab === 'retailer' && <RetailerScreen />}
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
