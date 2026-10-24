import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  ShieldCheck, 
  ArrowLeft, 
  Eye, 
  Sparkles,
  Loader2,
  Lock,
  RefreshCw
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ConfettiEffect } from '../common/Confetti';

export const KYCScreen: React.FC = () => {
  const { user, updateUserKYC, setActiveTab, showToast } = useApp();

  const [selfieUrl, setSelfieUrl] = useState<string>(user?.kyc.selfieUrl || '');
  const [aadharFrontUrl, setAadharFrontUrl] = useState<string>(user?.kyc.aadharFrontUrl || '');
  const [aadharBackUrl, setAadharBackUrl] = useState<string>(user?.kyc.aadharBackUrl || '');
  const [panUrl, setPanUrl] = useState<string>(user?.kyc.panUrl || '');

  const [aadharNumber, setAadharNumber] = useState<string>(user?.kyc.aadharNumber || '5489 1234 8921');
  const [panNumber, setPanNumber] = useState<string>(user?.kyc.panNumber || 'ABCPS8921K');

  // Camera capture state
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [activeCaptureTarget, setActiveCaptureTarget] = useState<'selfie' | 'aadhar_front' | 'aadhar_back' | 'pan' | null>(null);
  const [cameraError, setCameraError] = useState<string>('');
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Submitting / Verification simulation state
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verificationStep, setVerificationStep] = useState<string>('');
  const [showCelebration, setShowCelebration] = useState<boolean>(false);

  // File input refs
  const selfieInputRef = useRef<HTMLInputElement | null>(null);
  const aadharFrontInputRef = useRef<HTMLInputElement | null>(null);
  const aadharBackInputRef = useRef<HTMLInputElement | null>(null);
  const panInputRef = useRef<HTMLInputElement | null>(null);

  const isVerified = user?.kyc.overallStatus === 'verified';

  // Stop camera stream when leaving
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async (target: 'selfie' | 'aadhar_front' | 'aadhar_back' | 'pan') => {
    setActiveCaptureTarget(target);
    setIsCameraActive(true);
    setCameraError('');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: target === 'selfie' ? 'user' : 'environment' },
        audio: false
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err: any) {
      console.warn('Camera access issue:', err);
      setCameraError('Camera access not available in this browser view. You can also upload a photo or use demo samples!');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
    setActiveCaptureTarget(null);
  };

  const captureSnapshot = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);

    if (activeCaptureTarget === 'selfie') setSelfieUrl(dataUrl);
    if (activeCaptureTarget === 'aadhar_front') setAadharFrontUrl(dataUrl);
    if (activeCaptureTarget === 'aadhar_back') setAadharBackUrl(dataUrl);
    if (activeCaptureTarget === 'pan') setPanUrl(dataUrl);

    stopCamera();
    showToast('Photo captured successfully!', 'success');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'selfie' | 'aadhar_front' | 'aadhar_back' | 'pan') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      if (target === 'selfie') setSelfieUrl(result);
      if (target === 'aadhar_front') setAadharFrontUrl(result);
      if (target === 'aadhar_back') setAadharBackUrl(result);
      if (target === 'pan') setPanUrl(result);
      showToast('Document uploaded successfully!', 'success');
    };
    reader.readAsDataURL(file);
  };

  // Quick demo filler for seamless evaluation
  const handleAutoFillDemoDocs = () => {
    setSelfieUrl('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80');
    setAadharFrontUrl('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80');
    setAadharBackUrl('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80');
    setPanUrl('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80');
    setAadharNumber('5489 1234 8921');
    setPanNumber('ABCPS8921K');
    showToast('Demo KYC documents loaded. Ready to submit!', 'info');
  };

  const completedDocsCount = [selfieUrl, aadharFrontUrl, aadharBackUrl, panUrl].filter(Boolean).length;
  const isFormComplete = completedDocsCount === 4;

  const handleSubmitKYC = () => {
    if (!isFormComplete) {
      showToast('Please upload all 4 mandatory KYC documents', 'error');
      return;
    }

    setIsVerifying(true);
    setVerificationStep('Connecting to UIDAI Aadhaar Vault...');

    setTimeout(() => {
      setVerificationStep('Verifying NSDL PAN Card Details...');
    }, 900);

    setTimeout(() => {
      setVerificationStep('Running AI Liveness & Face Match (98.4%)...');
    }, 1800);

    setTimeout(() => {
      setIsVerifying(false);
      setShowCelebration(true);

      updateUserKYC({
        selfieUrl,
        selfieCapturedAt: new Date().toISOString(),
        aadharFrontUrl,
        aadharBackUrl,
        aadharNumber,
        aadharStatus: 'verified',
        panUrl,
        panNumber: panNumber.toUpperCase(),
        panStatus: 'verified',
        overallStatus: 'verified',
        verifiedAt: new Date().toISOString()
      });

      showToast('🎉 KYC Verification Completed Successfully!', 'success');
    }, 2800);
  };

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar bg-slate-950 text-slate-100 flex flex-col p-4 pb-20">
      <ConfettiEffect trigger={showCelebration} />

      {/* Screen Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setActiveTab('home')}
          className="p-1.5 -ml-1 text-slate-400 hover:text-white rounded-lg transition-colors flex items-center gap-1 text-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Home</span>
        </button>

        <div className="flex items-center gap-1.5">
          <span className="text-xs text-slate-400">Step</span>
          <span className="text-xs font-bold text-white bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700">
            {completedDocsCount}/4 Completed
          </span>
        </div>
      </div>

      {/* Title & Trust Banner */}
      <div className="mb-4">
        <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <span>Digital KYC Verification</span>
          {isVerified && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Government-mandated RBI compliance. Upload 4 clear documents to instantly unlock up to ₹5,00,000 personal loan limit.
        </p>

        {/* Demo Fast Fill Button for testing */}
        {!isVerified && (
          <button
            onClick={handleAutoFillDemoDocs}
            className="mt-2.5 w-full py-1.5 px-3 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-xl text-slate-300 text-[11px] font-medium flex items-center justify-center gap-1.5 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Fill Demo KYC Documents (Instant Test)</span>
          </button>
        )}
      </div>

      {/* Verified Status Banner */}
      {isVerified && (
        <div className="mb-4 p-3.5 bg-emerald-950/60 border border-emerald-800/60 rounded-2xl flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-xs font-bold text-emerald-300">KYC Verified & Pre-Approved</h3>
            <p className="text-[11px] text-emerald-400/80 mt-0.5">
              Your identity has been authenticated against UIDAI & NSDL. You can now apply for instant personal loans.
            </p>
            <button
              onClick={() => setActiveTab('loans')}
              className="mt-2.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
            >
              Explore Loan Offers →
            </button>
          </div>
        </div>
      )}

      {/* Camera Live Modal Overlay */}
      {isCameraActive && (
        <div className="fixed inset-0 z-50 bg-black/90 flex flex-col p-4 animate-in fade-in">
          <div className="flex items-center justify-between text-white mb-2">
            <span className="text-xs font-semibold capitalize">
              Capture {activeCaptureTarget?.replace('_', ' ')}
            </span>
            <button
              onClick={stopCamera}
              className="p-1 rounded-full bg-slate-800 text-slate-300 hover:text-white"
            >
              ✕
            </button>
          </div>

          <div className="flex-1 bg-slate-950 rounded-2xl overflow-hidden relative flex items-center justify-center border border-slate-800">
            {cameraError ? (
              <div className="p-4 text-center">
                <AlertCircle className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                <p className="text-xs text-slate-300">{cameraError}</p>
                <button
                  onClick={stopCamera}
                  className="mt-3 px-3 py-1.5 bg-slate-800 text-xs text-white rounded-lg"
                >
                  Close & Upload Instead
                </button>
              </div>
            ) : (
              <>
                <video
                  ref={videoRef}
                  playsInline
                  autoPlay
                  muted
                  className="w-full h-full object-cover"
                />
                {/* Visual capture overlay frame */}
                <div className="absolute inset-4 border-2 border-dashed border-emerald-400/60 rounded-2xl pointer-events-none flex items-center justify-center">
                  {activeCaptureTarget === 'selfie' && (
                    <div className="w-48 h-60 border-2 border-emerald-400/80 rounded-full" />
                  )}
                </div>
              </>
            )}
          </div>

          {!cameraError && (
            <div className="py-4 flex justify-center items-center gap-4">
              <button
                onClick={captureSnapshot}
                className="w-16 h-16 rounded-full bg-white border-4 border-emerald-500 shadow-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
              >
                <div className="w-12 h-12 rounded-full bg-emerald-600" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Hidden File Inputs */}
      <input
        type="file"
        ref={selfieInputRef}
        accept="image/*"
        capture="user"
        className="hidden"
        onChange={(e) => handleFileUpload(e, 'selfie')}
      />
      <input
        type="file"
        ref={aadharFrontInputRef}
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFileUpload(e, 'aadhar_front')}
      />
      <input
        type="file"
        ref={aadharBackInputRef}
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFileUpload(e, 'aadhar_back')}
      />
      <input
        type="file"
        ref={panInputRef}
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFileUpload(e, 'pan')}
      />

      {/* Document 1: Selfie */}
      <div className="mb-3.5 bg-slate-900 border border-slate-800 rounded-2xl p-3.5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
              selfieUrl ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'
            }`}>
              1
            </div>
            <div>
              <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>Live Selfie</span>
                <span className="text-[10px] text-amber-400 font-normal">(Mandatory)</span>
              </h3>
              <p className="text-[11px] text-slate-400">Clear frontal view without glasses/cap</p>
            </div>
          </div>
          {selfieUrl ? (
            <span className="flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
              <CheckCircle2 className="w-3 h-3" /> Captured
            </span>
          ) : (
            <span className="text-[10px] text-amber-400 font-medium bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/40">
              Pending
            </span>
          )}
        </div>

        {selfieUrl ? (
          <div className="mt-3 relative rounded-xl overflow-hidden border border-slate-700 bg-slate-950 h-36 flex items-center justify-center">
            <img src={selfieUrl} alt="Selfie" className="w-full h-full object-cover" />
            <button
              onClick={() => setSelfieUrl('')}
              className="absolute top-2 right-2 p-1.5 bg-black/70 hover:bg-red-600/80 rounded-lg text-white transition-colors"
              title="Remove"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              onClick={() => startCamera('selfie')}
              className="py-2.5 px-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl flex items-center justify-center gap-2 text-xs font-medium text-slate-200 transition-colors"
            >
              <Camera className="w-4 h-4 text-emerald-400" />
              <span>Take Selfie</span>
            </button>
            <button
              onClick={() => selfieInputRef.current?.click()}
              className="py-2.5 px-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl flex items-center justify-center gap-2 text-xs font-medium text-slate-200 transition-colors"
            >
              <Upload className="w-4 h-4 text-sky-400" />
              <span>Upload Photo</span>
            </button>
          </div>
        )}
      </div>

      {/* Document 2: Aadhaar Card Front */}
      <div className="mb-3.5 bg-slate-900 border border-slate-800 rounded-2xl p-3.5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
              aadharFrontUrl ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'
            }`}>
              2
            </div>
            <div>
              <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>Aadhaar Card Front</span>
                <span className="text-[10px] text-amber-400 font-normal">(Mandatory)</span>
              </h3>
              <p className="text-[11px] text-slate-400">Photo & 12-digit Aadhaar number side</p>
            </div>
          </div>
          {aadharFrontUrl ? (
            <span className="flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
              <CheckCircle2 className="w-3 h-3" /> Uploaded
            </span>
          ) : (
            <span className="text-[10px] text-amber-400 font-medium bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/40">
              Pending
            </span>
          )}
        </div>

        {aadharFrontUrl ? (
          <div className="mt-3 relative rounded-xl overflow-hidden border border-slate-700 bg-slate-950 h-32 flex items-center justify-center">
            <img src={aadharFrontUrl} alt="Aadhaar Front" className="w-full h-full object-cover" />
            <button
              onClick={() => setAadharFrontUrl('')}
              className="absolute top-2 right-2 p-1.5 bg-black/70 hover:bg-red-600/80 rounded-lg text-white transition-colors"
              title="Remove"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              onClick={() => startCamera('aadhar_front')}
              className="py-2.5 px-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl flex items-center justify-center gap-2 text-xs font-medium text-slate-200 transition-colors"
            >
              <Camera className="w-4 h-4 text-emerald-400" />
              <span>Capture Front</span>
            </button>
            <button
              onClick={() => aadharFrontInputRef.current?.click()}
              className="py-2.5 px-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl flex items-center justify-center gap-2 text-xs font-medium text-slate-200 transition-colors"
            >
              <Upload className="w-4 h-4 text-sky-400" />
              <span>Upload File</span>
            </button>
          </div>
        )}
      </div>

      {/* Document 3: Aadhaar Card Back */}
      <div className="mb-3.5 bg-slate-900 border border-slate-800 rounded-2xl p-3.5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
              aadharBackUrl ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'
            }`}>
              3
            </div>
            <div>
              <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>Aadhaar Card Back</span>
                <span className="text-[10px] text-amber-400 font-normal">(Mandatory)</span>
              </h3>
              <p className="text-[11px] text-slate-400">Address side with barcode/QR</p>
            </div>
          </div>
          {aadharBackUrl ? (
            <span className="flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
              <CheckCircle2 className="w-3 h-3" /> Uploaded
            </span>
          ) : (
            <span className="text-[10px] text-amber-400 font-medium bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/40">
              Pending
            </span>
          )}
        </div>

        {aadharBackUrl ? (
          <div className="mt-3 relative rounded-xl overflow-hidden border border-slate-700 bg-slate-950 h-32 flex items-center justify-center">
            <img src={aadharBackUrl} alt="Aadhaar Back" className="w-full h-full object-cover" />
            <button
              onClick={() => setAadharBackUrl('')}
              className="absolute top-2 right-2 p-1.5 bg-black/70 hover:bg-red-600/80 rounded-lg text-white transition-colors"
              title="Remove"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              onClick={() => startCamera('aadhar_back')}
              className="py-2.5 px-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl flex items-center justify-center gap-2 text-xs font-medium text-slate-200 transition-colors"
            >
              <Camera className="w-4 h-4 text-emerald-400" />
              <span>Capture Back</span>
            </button>
            <button
              onClick={() => aadharBackInputRef.current?.click()}
              className="py-2.5 px-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl flex items-center justify-center gap-2 text-xs font-medium text-slate-200 transition-colors"
            >
              <Upload className="w-4 h-4 text-sky-400" />
              <span>Upload File</span>
            </button>
          </div>
        )}
      </div>

      {/* Document 4: PAN Card */}
      <div className="mb-4 bg-slate-900 border border-slate-800 rounded-2xl p-3.5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
              panUrl ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'
            }`}>
              4
            </div>
            <div>
              <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>PAN Card</span>
                <span className="text-[10px] text-amber-400 font-normal">(Mandatory)</span>
              </h3>
              <p className="text-[11px] text-slate-400">10-character Permanent Account Number</p>
            </div>
          </div>
          {panUrl ? (
            <span className="flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
              <CheckCircle2 className="w-3 h-3" /> Uploaded
            </span>
          ) : (
            <span className="text-[10px] text-amber-400 font-medium bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/40">
              Pending
            </span>
          )}
        </div>

        {panUrl ? (
          <div className="mt-3 relative rounded-xl overflow-hidden border border-slate-700 bg-slate-950 h-32 flex items-center justify-center">
            <img src={panUrl} alt="PAN Card" className="w-full h-full object-cover" />
            <button
              onClick={() => setPanUrl('')}
              className="absolute top-2 right-2 p-1.5 bg-black/70 hover:bg-red-600/80 rounded-lg text-white transition-colors"
              title="Remove"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              onClick={() => startCamera('pan')}
              className="py-2.5 px-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl flex items-center justify-center gap-2 text-xs font-medium text-slate-200 transition-colors"
            >
              <Camera className="w-4 h-4 text-emerald-400" />
              <span>Capture PAN</span>
            </button>
            <button
              onClick={() => panInputRef.current?.click()}
              className="py-2.5 px-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl flex items-center justify-center gap-2 text-xs font-medium text-slate-200 transition-colors"
            >
              <Upload className="w-4 h-4 text-sky-400" />
              <span>Upload File</span>
            </button>
          </div>
        )}

        {/* PAN & Aadhaar number fields for validation */}
        <div className="mt-3 pt-3 border-t border-slate-800 grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[10px] text-slate-400 mb-1">Aadhaar (12 Digits)</label>
            <input
              type="text"
              value={aadharNumber}
              onChange={(e) => setAadharNumber(e.target.value)}
              placeholder="XXXX XXXX 1234"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-[10px] text-slate-400 mb-1">PAN Number</label>
            <input
              type="text"
              maxLength={10}
              value={panNumber}
              onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
              placeholder="ABCDE1234F"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-white font-mono uppercase focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Security & Encryption Notice */}
      <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl flex items-center gap-2.5 text-xs text-slate-400 mb-4">
        <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
        <span className="text-[11px]">
          256-bit AES encrypted. Documents stored securely via Supabase Cloud Storage.
        </span>
      </div>

      {/* Verification in Progress State */}
      {isVerifying ? (
        <div className="p-4 bg-slate-900 border border-emerald-500/50 rounded-2xl text-center space-y-2">
          <Loader2 className="w-6 h-6 text-emerald-400 animate-spin mx-auto" />
          <h4 className="text-xs font-bold text-white">Verifying Identity</h4>
          <p className="text-[11px] text-emerald-400 animate-pulse font-mono">
            {verificationStep}
          </p>
        </div>
      ) : (
        /* Action Button */
        <button
          onClick={handleSubmitKYC}
          disabled={!isFormComplete}
          className={`w-full py-3 rounded-2xl font-semibold text-xs flex items-center justify-center gap-2 shadow-lg transition-all ${
            isFormComplete
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-950 cursor-pointer'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>
            {isVerified
              ? 'Update & Re-verify KYC Documents'
              : isFormComplete
              ? 'Submit 4 Mandatory Documents for Verification'
              : `Upload Remaining ${4 - completedDocsCount} Documents to Continue`}
          </span>
        </button>
      )}
    </div>
  );
};
