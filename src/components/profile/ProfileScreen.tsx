import React, { useState } from 'react';
import { 
  User, 
  ShieldCheck, 
  LogOut, 
  ChevronRight, 
  Check, 
  Phone,
  Mail
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface ProfileScreenProps {
  onOpenSupabaseModal: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = () => {
  const { 
    user, 
    setUser, 
    setActiveTab, 
    setAuthModalOpen, 
    setAuthMode,
    showToast 
  } = useApp();

  const [previewDocUrl, setPreviewDocUrl] = useState<{ title: string; url: string } | null>(null);

  const isKYCCompleted = user?.kycCompleted && user?.kyc?.overallStatus === 'verified';

  const handleLogout = () => {
    setUser(null);
    showToast('Logged out of DhanSetu', 'info');
    setAuthMode('login');
    setAuthModalOpen(true);
  };

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar bg-slate-50 text-slate-900 p-4 pb-28 space-y-4">
      {/* Profile Header */}
      <div className="p-4 bg-white border border-slate-200 rounded-3xl shadow-sm flex items-center justify-between gap-3.5">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="relative shrink-0">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 border-2 border-emerald-500/40 overflow-hidden flex items-center justify-center">
              {user?.kyc?.selfieUrl ? (
                <img 
                  src={user.kyc.selfieUrl} 
                  alt="Selfie" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-8 h-8 text-slate-400" />
              )}
            </div>
            {isKYCCompleted && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center text-white">
                <Check className="w-3 h-3 stroke-[3]" />
              </div>
            )}
          </div>

          <div className="min-w-0">
            <h2 className="text-sm font-bold text-slate-900 truncate">
              {user?.fullName || 'Valued Customer'}
            </h2>
            <span className="text-[11px] text-slate-500 block truncate flex items-center gap-1 mt-0.5">
              <Mail className="w-3 h-3 text-slate-400 shrink-0" />
              {user?.email || 'email@example.com'}
            </span>
            <span className="text-[10px] text-slate-500 font-mono block mt-0.5 flex items-center gap-1">
              <Phone className="w-3 h-3 text-slate-400 shrink-0" />
              {user?.phoneNumber || '+91 9876543210'}
            </span>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors shrink-0"
          title="Sign out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>

      {/* UNIQUE CUSTOMER ID BANNER */}
      <div className="p-3.5 bg-gradient-to-r from-emerald-50 via-teal-50 to-white border border-emerald-200/80 rounded-2xl flex items-center justify-between shadow-xs">
        <div>
          <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider block">
            Unique Customer ID
          </span>
          <span className="text-xs font-mono font-extrabold text-emerald-950 tracking-wider">
            {user?.customerId || 'DS2026102401'}
          </span>
        </div>
        <button
          onClick={() => {
            if (user?.customerId) {
              navigator.clipboard.writeText(user.customerId);
              showToast(`Customer ID ${user.customerId} copied!`, 'success');
            }
          }}
          className="px-2.5 py-1 bg-white hover:bg-emerald-100 border border-emerald-300 rounded-lg text-[10px] font-bold text-emerald-800 shadow-2xs transition-all cursor-pointer"
        >
          Copy ID
        </button>
      </div>

      {/* KYC DOCUMENTS VAULT */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <h3 className="text-xs font-bold text-slate-900 tracking-tight">KYC Document Vault</h3>
          </div>
          <button
            onClick={() => setActiveTab('kyc')}
            className="text-[11px] font-semibold text-emerald-600 hover:underline flex items-center gap-1"
          >
            <span>{isKYCCompleted ? 'Update Docs' : 'Complete KYC'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {/* Selfie */}
          <div 
            onClick={() => user?.kyc?.selfieUrl && setPreviewDocUrl({ title: 'Live Selfie', url: user.kyc.selfieUrl })}
            className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
              user?.kyc?.selfieUrl 
                ? 'bg-slate-50 border-slate-200 hover:border-emerald-500/50' 
                : 'bg-amber-50 border-amber-200'
            }`}
          >
            <div className="flex justify-between items-start mb-1.5">
              <span className="text-[10px] font-medium text-slate-700">1. Live Selfie</span>
              {user?.kyc?.selfieUrl ? (
                <span className="text-[9px] text-emerald-600 font-bold">Verified</span>
              ) : (
                <span className="text-[9px] text-amber-600">Missing</span>
              )}
            </div>
            {user?.kyc?.selfieUrl ? (
              <div className="h-14 rounded-lg overflow-hidden bg-slate-100">
                <img src={user.kyc.selfieUrl} alt="Selfie" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="h-14 rounded-lg border border-dashed border-slate-300 flex items-center justify-center text-[10px] text-slate-400">
                Upload Required
              </div>
            )}
          </div>

          {/* Aadhaar Front */}
          <div 
            onClick={() => user?.kyc?.aadharFrontUrl && setPreviewDocUrl({ title: 'Aadhaar Card Front', url: user.kyc.aadharFrontUrl })}
            className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
              user?.kyc?.aadharFrontUrl 
                ? 'bg-slate-50 border-slate-200 hover:border-emerald-500/50' 
                : 'bg-amber-50 border-amber-200'
            }`}
          >
            <div className="flex justify-between items-start mb-1.5">
              <span className="text-[10px] font-medium text-slate-700">2. Aadhaar Front</span>
              {user?.kyc?.aadharFrontUrl ? (
                <span className="text-[9px] text-emerald-600 font-bold">Verified</span>
              ) : (
                <span className="text-[9px] text-amber-600">Missing</span>
              )}
            </div>
            {user?.kyc?.aadharFrontUrl ? (
              <div className="h-14 rounded-lg overflow-hidden bg-slate-100">
                <img src={user.kyc.aadharFrontUrl} alt="Aadhaar Front" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="h-14 rounded-lg border border-dashed border-slate-300 flex items-center justify-center text-[10px] text-slate-400">
                Upload Required
              </div>
            )}
          </div>

          {/* Aadhaar Back */}
          <div 
            onClick={() => user?.kyc?.aadharBackUrl && setPreviewDocUrl({ title: 'Aadhaar Card Back', url: user.kyc.aadharBackUrl })}
            className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
              user?.kyc?.aadharBackUrl 
                ? 'bg-slate-50 border-slate-200 hover:border-emerald-500/50' 
                : 'bg-amber-50 border-amber-200'
            }`}
          >
            <div className="flex justify-between items-start mb-1.5">
              <span className="text-[10px] font-medium text-slate-700">3. Aadhaar Back</span>
              {user?.kyc?.aadharBackUrl ? (
                <span className="text-[9px] text-emerald-600 font-bold">Verified</span>
              ) : (
                <span className="text-[9px] text-amber-600">Missing</span>
              )}
            </div>
            {user?.kyc?.aadharBackUrl ? (
              <div className="h-14 rounded-lg overflow-hidden bg-slate-100">
                <img src={user.kyc.aadharBackUrl} alt="Aadhaar Back" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="h-14 rounded-lg border border-dashed border-slate-300 flex items-center justify-center text-[10px] text-slate-400">
                Upload Required
              </div>
            )}
          </div>

          {/* PAN Card */}
          <div 
            onClick={() => user?.kyc?.panUrl && setPreviewDocUrl({ title: 'PAN Card', url: user.kyc.panUrl })}
            className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
              user?.kyc?.panUrl 
                ? 'bg-slate-50 border-slate-200 hover:border-emerald-500/50' 
                : 'bg-amber-50 border-amber-200'
            }`}
          >
            <div className="flex justify-between items-start mb-1.5">
              <span className="text-[10px] font-medium text-slate-700">4. PAN Card</span>
              {user?.kyc?.panUrl ? (
                <span className="text-[9px] text-emerald-600 font-bold">Verified</span>
              ) : (
                <span className="text-[9px] text-amber-600">Missing</span>
              )}
            </div>
            {user?.kyc?.panUrl ? (
              <div className="h-14 rounded-lg overflow-hidden bg-slate-100">
                <img src={user.kyc.panUrl} alt="PAN Card" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="h-14 rounded-lg border border-dashed border-slate-300 flex items-center justify-center text-[10px] text-slate-400">
                Upload Required
              </div>
            )}
          </div>
        </div>
      </div>

      {/* DOCUMENT PREVIEW MODAL */}
      {previewDocUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm bg-white border border-slate-200 rounded-3xl p-4 text-slate-900 space-y-3 shadow-2xl">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-bold text-slate-900">{previewDocUrl.title}</h4>
              <button onClick={() => setPreviewDocUrl(null)} className="text-slate-400 hover:text-slate-700 text-xs">✕</button>
            </div>
            <div className="max-h-80 rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center border border-slate-200">
              <img src={previewDocUrl.url} alt={previewDocUrl.title} className="w-full h-auto object-contain" />
            </div>
            <button
              onClick={() => setPreviewDocUrl(null)}
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold"
            >
              Close Preview
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
