import React, { useState } from 'react';
import { 
  User, 
  ShieldCheck, 
  LogOut, 
  ChevronRight, 
  Check, 
  Phone,
  Mail,
  FileText,
  Headphones,
  AlertTriangle,
  Copy,
  ExternalLink,
  Send,
  MessageSquare,
  Building2,
  Clock,
  Shield,
  Upload,
  CheckCircle2,
  X
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface ProfileScreenProps {
  onOpenSupabaseModal?: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = () => {
  const { 
    user, 
    logout, 
    setActiveTab, 
    showToast 
  } = useApp();

  // Modals state
  const [activeModal, setActiveModal] = useState<'agreement' | 'contact' | 'report' | 'logout' | null>(null);
  const [previewDocUrl, setPreviewDocUrl] = useState<{ title: string; url: string } | null>(null);

  // Agreement state
  const [agreementAccepted, setAgreementAccepted] = useState(true);

  // Contact Us state
  const [contactSubject, setContactSubject] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [messageSent, setMessageSent] = useState(false);

  // Report Us state
  const [reportCategory, setReportCategory] = useState('Payment / EMI Discrepancy');
  const [reportDescription, setReportDescription] = useState('');
  const [reportAttachmentName, setReportAttachmentName] = useState<string | null>(null);
  const [generatedTicketId, setGeneratedTicketId] = useState<string | null>(null);

  const isKYCCompleted = user?.kycCompleted && user?.kyc?.overallStatus === 'verified';

  const handleCopyCustomerId = () => {
    if (user?.customerId) {
      navigator.clipboard.writeText(user.customerId);
      showToast(`Customer ID ${user.customerId} copied!`, 'success');
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactMessage.trim()) {
      showToast('Please type your inquiry message', 'warning');
      return;
    }
    setMessageSent(true);
    setTimeout(() => {
      setMessageSent(false);
      setContactSubject('');
      setContactMessage('');
      setActiveModal(null);
      showToast('Support message dispatched. Ticket acknowledgement sent to email.', 'success');
    }, 1500);
  };

  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportDescription.trim()) {
      showToast('Please describe your grievance or issue', 'warning');
      return;
    }
    const tktId = `DS-TKT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    setGeneratedTicketId(tktId);
  };

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar bg-slate-50 text-slate-900 p-4 pb-28 space-y-3.5">
      
      {/* 1. SIMPLE & CLEAN PROFILE HEADER (NO BOXES, PURE CARDS) */}
      <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="relative shrink-0">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 border-2 border-emerald-500/30 overflow-hidden flex items-center justify-center">
              {user?.kyc?.selfieUrl ? (
                <img 
                  src={user.kyc.selfieUrl} 
                  alt={user.fullName || 'User'} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-7 h-7 text-emerald-600" />
              )}
            </div>
            {isKYCCompleted && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center text-white" title="KYC Verified">
                <Check className="w-3 h-3 stroke-[3]" />
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h2 className="text-sm font-bold text-slate-900 truncate">
                {user?.fullName || 'DhanSetu Customer'}
              </h2>
              {isKYCCompleted ? (
                <span className="text-[10px] bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.2 rounded">
                  Verified
                </span>
              ) : (
                <span className="text-[10px] bg-amber-100 text-amber-700 font-medium px-1.5 py-0.2 rounded">
                  KYC Pending
                </span>
              )}
            </div>
            
            <div className="text-[11px] text-slate-500 truncate flex items-center gap-1.5 mt-0.5">
              <Mail className="w-3 h-3 text-slate-400 shrink-0" />
              <span className="truncate">{user?.email || 'user@dhansetu.in'}</span>
            </div>
            
            <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1.5 mt-0.5">
              <Phone className="w-3 h-3 text-slate-400 shrink-0" />
              <span>{user?.phoneNumber || '+91 9876543210'}</span>
            </div>
          </div>
        </div>

        {/* CUSTOMER ID STRIP */}
        <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
              Customer ID:
            </span>
            <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              {user?.customerId || 'DS2026102401'}
            </span>
          </div>

          <button
            onClick={handleCopyCustomerId}
            className="flex items-center gap-1 text-[11px] font-semibold text-slate-600 hover:text-emerald-600 cursor-pointer transition-colors"
          >
            <Copy className="w-3 h-3" />
            <span>Copy</span>
          </button>
        </div>
      </div>

      {/* 2. KYC DOCUMENTS VAULT (COMPACT & SIMPLE) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xs">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <h3 className="text-xs font-bold text-slate-900">KYC Document Vault</h3>
          </div>
          <button
            onClick={() => setActiveTab('kyc')}
            className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-0.5"
          >
            <span>{isKYCCompleted ? 'Manage' : 'Complete KYC'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {/* Selfie */}
          <button 
            onClick={() => user?.kyc?.selfieUrl ? setPreviewDocUrl({ title: 'Live Selfie', url: user.kyc.selfieUrl }) : setActiveTab('kyc')}
            className="p-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-center transition-all cursor-pointer"
          >
            <div className="h-10 rounded-lg overflow-hidden bg-white mb-1 flex items-center justify-center">
              {user?.kyc?.selfieUrl ? (
                <img src={user.kyc.selfieUrl} alt="Selfie" className="w-full h-full object-cover" />
              ) : (
                <User className="w-4 h-4 text-slate-400" />
              )}
            </div>
            <span className="text-[10px] font-medium text-slate-700 block truncate">Selfie</span>
          </button>

          {/* Aadhaar Front */}
          <button 
            onClick={() => user?.kyc?.aadharFrontUrl ? setPreviewDocUrl({ title: 'Aadhaar Card Front', url: user.kyc.aadharFrontUrl }) : setActiveTab('kyc')}
            className="p-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-center transition-all cursor-pointer"
          >
            <div className="h-10 rounded-lg overflow-hidden bg-white mb-1 flex items-center justify-center">
              {user?.kyc?.aadharFrontUrl ? (
                <img src={user.kyc.aadharFrontUrl} alt="Aadhaar Front" className="w-full h-full object-cover" />
              ) : (
                <Shield className="w-4 h-4 text-slate-400" />
              )}
            </div>
            <span className="text-[10px] font-medium text-slate-700 block truncate">Aadhaar F</span>
          </button>

          {/* Aadhaar Back */}
          <button 
            onClick={() => user?.kyc?.aadharBackUrl ? setPreviewDocUrl({ title: 'Aadhaar Card Back', url: user.kyc.aadharBackUrl }) : setActiveTab('kyc')}
            className="p-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-center transition-all cursor-pointer"
          >
            <div className="h-10 rounded-lg overflow-hidden bg-white mb-1 flex items-center justify-center">
              {user?.kyc?.aadharBackUrl ? (
                <img src={user.kyc.aadharBackUrl} alt="Aadhaar Back" className="w-full h-full object-cover" />
              ) : (
                <Shield className="w-4 h-4 text-slate-400" />
              )}
            </div>
            <span className="text-[10px] font-medium text-slate-700 block truncate">Aadhaar B</span>
          </button>

          {/* PAN Card */}
          <button 
            onClick={() => user?.kyc?.panUrl ? setPreviewDocUrl({ title: 'PAN Card', url: user.kyc.panUrl }) : setActiveTab('kyc')}
            className="p-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-center transition-all cursor-pointer"
          >
            <div className="h-10 rounded-lg overflow-hidden bg-white mb-1 flex items-center justify-center">
              {user?.kyc?.panUrl ? (
                <img src={user.kyc.panUrl} alt="PAN Card" className="w-full h-full object-cover" />
              ) : (
                <FileText className="w-4 h-4 text-slate-400" />
              )}
            </div>
            <span className="text-[10px] font-medium text-slate-700 block truncate">PAN Card</span>
          </button>
        </div>
      </div>

      {/* 3. REQUESTED CORE PROFILE FEATURES (SIMPLE, SHORT, CLEAN MENU) */}
      <div className="bg-white border border-slate-200 rounded-2xl divide-y divide-slate-100 overflow-hidden shadow-xs">
        
        {/* A. AGREEMENT */}
        <button
          onClick={() => setActiveModal('agreement')}
          className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors text-left group cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition-colors block">
                Agreement
              </span>
              <span className="text-[11px] text-slate-500 block">
                Loan Rules, RBI Fair Practices & Conditions
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded-full border border-emerald-200">
              Active
            </span>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
          </div>
        </button>

        {/* B. CONTACT US */}
        <button
          onClick={() => setActiveModal('contact')}
          className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors text-left group cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
              <Headphones className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 group-hover:text-sky-700 transition-colors block">
                Contact Us
              </span>
              <span className="text-[11px] text-slate-500 block">
                Helpline 1800-889-7388 & WhatsApp Desk
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] bg-sky-50 text-sky-700 font-semibold px-2 py-0.5 rounded-full border border-sky-200">
              24/7 Desk
            </span>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
          </div>
        </button>

        {/* C. REPORT US */}
        <button
          onClick={() => setActiveModal('report')}
          className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors text-left group cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 group-hover:text-amber-700 transition-colors block">
                Report Us
              </span>
              <span className="text-[11px] text-slate-500 block">
                Report grievance, EMI dispute or issue
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] bg-amber-50 text-amber-700 font-semibold px-2 py-0.5 rounded-full border border-amber-200">
              SLA 24h
            </span>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
          </div>
        </button>

        {/* D. LOG OUT */}
        <button
          onClick={() => setActiveModal('logout')}
          className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-rose-50/50 transition-colors text-left group cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <LogOut className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-rose-700 group-hover:text-rose-800 transition-colors block">
                Log Out
              </span>
              <span className="text-[11px] text-slate-500 block">
                Sign out of DhanSetu securely
              </span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-rose-400" />
        </button>
      </div>

      {/* APP VERSION & SECURITY BADGE */}
      <div className="text-center pt-2 text-[11px] text-slate-400">
        <span>DhanSetu v2.4 • RBI Digital Lending Guidelines 2026</span>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: AGREEMENT (RULES, CONDITIONS & FAIR PRACTICES)                  */}
      {/* ========================================================================= */}
      {activeModal === 'agreement' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-5 text-slate-900 space-y-4 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">Borrower Agreement & Rules</h3>
              </div>
              <button 
                onClick={() => setActiveModal(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs text-slate-600 leading-relaxed">
              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl">
                <span className="font-bold text-emerald-950 block text-[11px] uppercase tracking-wider mb-1">
                  Master Digital Loan Agreement
                </span>
                <p className="text-[11px] text-emerald-900">
                  This Agreement governs borrowing through the DhanSetu platform in partnership with RBI-regulated Non-Banking Financial Companies (NBFCs).
                </p>
              </div>

              <div className="space-y-2.5">
                <div className="border-l-2 border-emerald-500 pl-2.5">
                  <h4 className="font-bold text-slate-900 text-[11px]">1. Regulatory Compliance (RBI Fair Practices)</h4>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    All personal loans strictly comply with Reserve Bank of India (RBI) Digital Lending Directives. Key Fact Statement (KFS) is generated prior to loan acceptance.
                  </p>
                </div>

                <div className="border-l-2 border-emerald-500 pl-2.5">
                  <h4 className="font-bold text-slate-900 text-[11px]">2. Interest Rates & Annual Percentage Rate (APR)</h4>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Interest rates range from 9.9% to 14.5% per annum based on CIBIL appraisal. No hidden processing charges or unapproved deductions.
                  </p>
                </div>

                <div className="border-l-2 border-emerald-500 pl-2.5">
                  <h4 className="font-bold text-slate-900 text-[11px]">3. Disbursement & Repayment Conditions</h4>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Disbursals are processed directly to the borrower's verified bank account or DhanSetu Wallet. EMIs are payable via official verified UPI (<span className="font-mono font-bold text-emerald-800">ranjeetk85761@axl</span>), Net Banking, or e-NACH mandate.
                  </p>
                </div>

                <div className="border-l-2 border-emerald-500 pl-2.5">
                  <h4 className="font-bold text-slate-900 text-[11px]">4. Zero Foreclosure Penalties</h4>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Borrowers retain the right to prepay or foreclose their active loans at any time after the first EMI without any prepayment penalty fees.
                  </p>
                </div>

                <div className="border-l-2 border-emerald-500 pl-2.5">
                  <h4 className="font-bold text-slate-900 text-[11px]">5. Data Privacy & Customer Rights</h4>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    All KYC records (Aadhaar, PAN, and selfie) are encrypted under 256-bit AES standards. No contact list or personal device data is ever accessed.
                  </p>
                </div>
              </div>

              <div className="p-2.5 bg-slate-100 rounded-xl flex items-center justify-between text-[11px]">
                <span className="text-slate-600">Agreement Acceptance Status:</span>
                <span className="font-bold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Accepted by {user?.customerId || 'DS2026102401'}</span>
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex gap-2 shrink-0">
              <button
                onClick={() => {
                  navigator.clipboard.writeText("DhanSetu Digital Lending Terms & Conditions - RBI Fair Practices Compliant");
                  showToast('Agreement summary copied to clipboard', 'success');
                }}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
              >
                Copy Summary
              </button>
              <button
                onClick={() => {
                  showToast('Agreement verified & accepted for this account', 'success');
                  setActiveModal(null);
                }}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors"
              >
                Acknowledged
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: CONTACT US (HELPLINE, WHATSAPP, EMAIL & DESK)                   */}
      {/* ========================================================================= */}
      {activeModal === 'contact' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-5 text-slate-900 space-y-4 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-2">
                <Headphones className="w-4 h-4 text-sky-600" />
                <h3 className="text-sm font-bold text-slate-900">Contact DhanSetu Support</h3>
              </div>
              <button 
                onClick={() => setActiveModal(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs text-slate-600">
              {/* HELPLINE & WHATSAPP QUICK CARDS */}
              <div className="grid grid-cols-2 gap-2.5">
                <a
                  href="tel:18008897388"
                  className="p-3 rounded-2xl bg-sky-50/70 border border-sky-200 text-left hover:bg-sky-100/70 transition-all group block"
                >
                  <Phone className="w-4 h-4 text-sky-600 mb-1" />
                  <span className="text-[10px] uppercase font-bold text-sky-800 tracking-wider block">Toll-Free Helpline</span>
                  <span className="text-xs font-mono font-bold text-sky-950 block mt-0.5">1800-889-7388</span>
                  <span className="text-[9px] text-sky-700 mt-1 block">Mon-Sat (9 AM - 7 PM)</span>
                </a>

                <a
                  href="https://wa.me/919876543210"
                  target="_blank"
                  rel="noreferrer"
                  className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-left hover:bg-emerald-100/70 transition-all group block"
                >
                  <MessageSquare className="w-4 h-4 text-emerald-600 mb-1" />
                  <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider block">WhatsApp Desk</span>
                  <span className="text-xs font-mono font-bold text-emerald-950 block mt-0.5">+91 98765 43210</span>
                  <span className="text-[9px] text-emerald-700 mt-1 block">Instant 24/7 Bot & Agent</span>
                </a>
              </div>

              {/* EMAIL & GRIEVANCE */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-500" />
                    <span className="font-semibold text-slate-800 text-[11px]">Official Support Email:</span>
                  </div>
                  <a href="mailto:support@dhansetu.in" className="text-emerald-600 font-mono font-bold text-[11px] hover:underline">
                    support@dhansetu.in
                  </a>
                </div>

                <div className="pt-2 border-t border-slate-200/80">
                  <div className="flex items-center gap-1.5 text-slate-800 font-semibold text-[11px] mb-1">
                    <Building2 className="w-3.5 h-3.5 text-slate-500" />
                    <span>Grievance Redressal Officer</span>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-normal">
                    Mr. Arvind K. Sharma (Principal Officer) • grievance@dhansetu.in<br/>
                    DhanSetu FinTech Tower, G-Block, BKC, Bandra East, Mumbai 400051
                  </p>
                </div>
              </div>

              {/* QUICK INQUIRY FORM */}
              <form onSubmit={handleSendMessage} className="space-y-2.5 pt-1">
                <span className="text-[11px] font-bold text-slate-900 block">
                  Send a Direct Message
                </span>
                
                <input
                  type="text"
                  placeholder="Subject (e.g. Loan Disbursal Query)"
                  value={contactSubject}
                  onChange={(e) => setContactSubject(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white"
                />

                <textarea
                  rows={3}
                  placeholder="Describe your inquiry..."
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white resize-none"
                />

                <button
                  type="submit"
                  disabled={messageSent}
                  className="w-full py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  {messageSent ? (
                    <span>Message Dispatched!</span>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit Support Ticket</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: REPORT US (DISPUTE, COMPLAINTS & FRAUD REPORTING)              */}
      {/* ========================================================================= */}
      {activeModal === 'report' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-5 text-slate-900 space-y-4 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm font-bold text-slate-900">Report an Issue / Dispute</h3>
              </div>
              <button 
                onClick={() => {
                  setActiveModal(null);
                  setGeneratedTicketId(null);
                }}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {generatedTicketId ? (
              <div className="text-center py-6 space-y-3 animate-in zoom-in-95">
                <div className="w-14 h-14 mx-auto bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Grievance Ticket Registered</h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Your report has been received by the DhanSetu Compliance & Fraud Control Team.
                  </p>
                </div>
                <div className="p-3 bg-slate-100 rounded-xl font-mono text-xs font-bold text-slate-800">
                  Ticket ID: {generatedTicketId}
                </div>
                <p className="text-[11px] text-emerald-700 font-semibold">
                  Resolution SLA: Within 24-48 business hours
                </p>
                <button
                  onClick={() => {
                    setActiveModal(null);
                    setGeneratedTicketId(null);
                    setReportDescription('');
                  }}
                  className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitReport} className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Customer ID
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={user?.customerId || 'DS2026102401'}
                    className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-700 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Category of Issue
                  </label>
                  <select
                    value={reportCategory}
                    onChange={(e) => setReportCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
                  >
                    <option value="Payment / EMI Discrepancy">Payment / EMI Discrepancy</option>
                    <option value="Loan Disbursement Delay">Loan Disbursement Delay</option>
                    <option value="KYC Verification / Rejection">KYC Verification / Rejection</option>
                    <option value="Unauthorized Transaction">Unauthorized Account Activity</option>
                    <option value="Harassment / Unfair Recovery">Harassment / Unfair Recovery Grievance</option>
                    <option value="Technical App Bug">Technical App Bug</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Detailed Grievance Description
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Provide loan number, transaction reference ID, and specifics..."
                    value={reportDescription}
                    onChange={(e) => setReportDescription(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white resize-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Upload Screenshot / Proof (Optional)
                  </label>
                  <label className="w-full border border-dashed border-slate-300 rounded-xl p-3 flex items-center justify-center gap-2 text-slate-500 hover:bg-slate-50 cursor-pointer transition-colors">
                    <Upload className="w-4 h-4 text-slate-400" />
                    <span className="text-[11px]">
                      {reportAttachmentName || 'Choose file or screenshot'}
                    </span>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) setReportAttachmentName(file.name);
                      }}
                    />
                  </label>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-sm"
                  >
                    Submit Grievance Ticket
                  </button>
                  <p className="text-[10px] text-slate-400 text-center mt-2">
                    Protected by RBI Integrated Ombudsman Scheme (2021)
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: LOG OUT CONFIRMATION (CLEAN & SHORT)                             */}
      {/* ========================================================================= */}
      {activeModal === 'logout' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-xs bg-white border border-slate-200 rounded-3xl p-5 text-slate-900 space-y-4 shadow-2xl text-center">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <LogOut className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-900">Sign Out of DhanSetu?</h3>
              <p className="text-xs text-slate-500 mt-1 leading-normal">
                You will be signed out from this device. You can easily sign back in using your Customer ID or registered Mobile number with your 6-digit PIN.
              </p>
            </div>

            <div className="p-2 bg-slate-50 rounded-xl border border-slate-200/80 font-mono text-[11px] font-bold text-slate-700">
              {user?.customerId || 'DS2026102401'}
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveModal(null);
                  logout();
                }}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-sm"
              >
                Yes, Log Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DOCUMENT PREVIEW MODAL */}
      {previewDocUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-sm bg-white border border-slate-200 rounded-3xl p-4 text-slate-900 space-y-3 shadow-2xl">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-bold text-slate-900">{previewDocUrl.title}</h4>
              <button onClick={() => setPreviewDocUrl(null)} className="p-1 text-slate-400 hover:text-slate-700 text-xs">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="max-h-80 rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center border border-slate-200">
              <img src={previewDocUrl.url} alt={previewDocUrl.title} className="w-full h-auto object-contain" />
            </div>
            <button
              onClick={() => setPreviewDocUrl(null)}
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
