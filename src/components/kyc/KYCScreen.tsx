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
  RefreshCw,
  Check
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const KYCScreen: React.FC = () => {
  const { user, updateUserKYC, setActiveTab, showToast } = useApp();

  const [selfieUrl, setSelfieUrl] = useState<string>(user?.kyc?.selfieUrl || '');
  const [aadharFrontUrl, setAadharFrontUrl] = useState<string>(user?.kyc?.aadharFrontUrl || '');
  const [aadharBackUrl, setAadharBackUrl] = useState<string>(user?.kyc?.aadharBackUrl || '');
  const [panUrl, setPanUrl] = useState<string>(user?.kyc?.panUrl || '');

  const [aadharNumber, setAadharNumber] = useState<string>(user?.kyc?.aadharNumber || '');
  const [panNumber, setPanNumber] = useState<string>(user?.kyc?.panNumber || '');

  // Camera capture state
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [activeCaptureTarget, setActiveCaptureTarget] = useState<'selfie' | 'aadhar_front' | 'aadhar_back' | 'pan' | null>(null);
  const [cameraError, setCameraError] = useState<string>('');
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Submitting / Verification simulation state
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verificationStep, setVerificationStep] = useState<string>('');

  // File input refs
  const selfieInputRef = useRef<HTMLInputElement | null>(null);
  const aadharFrontInputRef = useRef<HTMLInputElement | null>(null);
  const aadharBackInputRef = useRef<HTMLInputElement | null>(null);
  const panInputRef = useRef<HTMLInputElement | null>(null);

  const isVerified = user?.kyc?.overallStatus === 'verified';

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
      setCameraError('Camera access not supported or allowed in this view. Please upload image directly!');
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
    showToast('Document photo captured successfully!', 'success');
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

  const completedDocsCount = [selfieUrl, aadharFrontUrl, aadharBackUrl, panUrl].filter(Boolean).length;
  const isFormComplete = completedDocsCount === 4;

  const handleSubmitKYC = async () => {
    if (!isFormComplete) {
      showToast('Please upload all 4 mandatory KYC documents', 'error');
      return;
    }

    setIsVerifying(true);
    setVerificationStep('Authenticating with UIDAI Aadhaar Vault...');

    setTimeout(() => {
      setVerificationStep('Verifying NSDL PAN Card details...');
    }, 900);

    setTimeout(() => {
      setVerificationStep('Running Liveness & Face Match check (98.4%)...');
    }, 1800);

    setTimeout(async () => {
      setIsVerifying(false);

      await updateUserKYC({
        selfieUrl,
        selfieCapturedAt: new Date().toISOString(),
        aadharFrontUrl,
        aadharBackUrl,
        aadharNumber: aadharNumber || '5489 1234 8921',
        aadharStatus: 'verified',
        panUrl,
        panNumber: (panNumber || 'ABCPS8921K').toUpperCase(),
        panStatus: 'verified',
        overallStatus: 'verified',
        verifiedAt: new Date().toISOString()
      });

      showToast('🎉 KYC Verification Completed Successfully!', 'success');
    }, 2800);
  };

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar bg-slate-50 text-slate-900 flex flex-col p-4 pb-28">
      {/* Screen Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setActiveTab('home')}
          className="p-1.5 -ml-1 text-slate-500 hover:text-slate-900 rounded-lg transition-colors flex items-center gap-1 text-xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Home</span>
        </button>

        <div className="flex items-center gap-1.5">
          <span className="text-xs text-slate-500">Progress:</span>
          <span className="text-xs font-bold text-slate-900 bg-white px-2.5 py-0.5 rounded-full border border-slate-200 shadow-xs">
            {completedDocsCount}/4 Completed
          </span>
        </div>
      </div>

      {/* Title & Trust Banner */}
      <div className="mb-4">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <span>Digital KYC Verification</span>
          {isVerified && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Government-mandated RBI compliance. Upload 4 clear documents to instantly unlock your personal loan limit.
        </p>
      </div>

      {/* Verified Status Banner */}
      {isVerified && (
        <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 rounded-3xl flex items-start gap-3 shadow-xs">
          <div className="w-9 h-9 rounded-2xl bg-emerald-100 border border-emerald-300 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5 text-emerald-700" />
          </div>
          <div className="flex-1">
            <h3 className="text-xs font-bold text-emerald-900">KYC Verified & Pre-Approved</h3>
            <p className="text-[11px] text-emerald-700 mt-0.5 leading-relaxed">
              Your identity has been authenticated. You can now apply for instant personal loans with immediate disbursal.
            </p>
            <button
              onClick={() => setActiveTab('loans')}
              className="mt-2.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-sm transition-colors cursor-pointer"
            >
              Explore Available Loans →
            </button>
          </div>
        </div>
      )}

      {/* Camera Live Modal Overlay */}
      {isCameraActive && (
        <div className="fixed inset-0 z-50 bg-black/90 flex flex-col p-4 animate-in fade-in">
          <div className="flex items-center justify-between text-white mb-2">
            <span className="text-xs font-semibold capitalize">
              Capture {activeCaptureTarget?.replace(/_/g, ' ')}
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
                className="w-16 h-16 rounded-full bg-white border-4 border-emerald-500 shadow-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all cursor-pointer"
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

      {/* DOCUMENT 1: SELFIE */}
      <div className="mb-3.5 bg-white border border-slate-200 rounded-3xl p-4 shadow-sm">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
              selfieUrl ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-slate-100 text-slate-500'
            }`}>
              1
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <span>Live Selfie</span>
                <span className="text-[10px] text-amber-700 font-normal">(Mandatory)</span>
              </h3>
              <p className="text-[11px] text-slate-500">Clear frontal face snapshot</p>
            </div>
          </div>
          {selfieUrl ? (
            <span className="flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-bold">
              <Check className="w-3 h-3 stroke-[3]" /> Uploaded
            </span>
          ) : (
            <span className="text-[10px] text-amber-800 font-semibold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              Pending
            </span>
          )}
        </div>

        {selfieUrl ? (
          <div className="mt-3 relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 h-36 flex items-center justify-center">
            <img src={selfieUrl} alt="Selfie" className="w-full h-full object-cover" />
            <button
              onClick={() => setSelfieUrl('')}
              className="absolute top-2 right-2 p-1.5 bg-black/70 hover:bg-red-600 rounded-lg text-white transition-colors cursor-pointer"
              title="Remove"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              onClick={() => startCamera('selfie')}
              className="py-2.5 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
            >
              <Camera className="w-4 h-4 text-emerald-600" />
              <span>Camera</span>
            </button>
            <button
              onClick={() => selfieInputRef.current?.click()}
              className="py-2.5 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
            >
              <Upload className="w-4 h-4 text-sky-600" />
              <span>Upload Photo</span>
            </button>
          </div>
        )}
      </div>

      {/* DOCUMENT 2: AADHAAR FRONT */}
      <div className="mb-3.5 bg-white border border-slate-200 rounded-3xl p-4 shadow-sm">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
              aadharFrontUrl ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-slate-100 text-slate-500'
            }`}>
              2
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <span>Aadhaar Card Front</span>
                <span className="text-[10px] text-amber-700 font-normal">(Mandatory)</span>
              </h3>
              <p className="text-[11px] text-slate-500">Photo & 12-digit number side</p>
            </div>
          </div>
          {aadharFrontUrl ? (
            <span className="flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-bold">
              <Check className="w-3 h-3 stroke-[3]" /> Uploaded
            </span>
          ) : (
            <span className="text-[10px] text-amber-800 font-semibold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              Pending
            </span>
          )}
        </div>

        {aadharFrontUrl ? (
          <div className="mt-3 relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 h-32 flex items-center justify-center">
            <img src={aadharFrontUrl} alt="Aadhaar Front" className="w-full h-full object-cover" />
            <button
              onClick={() => setAadharFrontUrl('')}
              className="absolute top-2 right-2 p-1.5 bg-black/70 hover:bg-red-600 rounded-lg text-white transition-colors cursor-pointer"
              title="Remove"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              onClick={() => startCamera('aadhar_front')}
              className="py-2.5 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
            >
              <Camera className="w-4 h-4 text-emerald-600" />
              <span>Capture Front</span>
            </button>
            <button
              onClick={() => aadharFrontInputRef.current?.click()}
              className="py-2.5 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
            >
              <Upload className="w-4 h-4 text-sky-600" />
              <span>Upload File</span>
            </button>
          </div>
        )}
      </div>

      {/* DOCUMENT 3: AADHAAR BACK */}
      <div className="mb-3.5 bg-white border border-slate-200 rounded-3xl p-4 shadow-sm">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
              aadharBackUrl ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-slate-100 text-slate-500'
            }`}>
              3
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <span>Aadhaar Card Back</span>
                <span className="text-[10px] text-amber-700 font-normal">(Mandatory)</span>
              </h3>
              <p className="text-[11px] text-slate-500">Address side with barcode</p>
            </div>
          </div>
          {aadharBackUrl ? (
            <span className="flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-bold">
              <Check className="w-3 h-3 stroke-[3]" /> Uploaded
            </span>
          ) : (
            <span className="text-[10px] text-amber-800 font-semibold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              Pending
            </span>
          )}
        </div>

        {aadharBackUrl ? (
          <div className="mt-3 relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 h-32 flex items-center justify-center">
            <img src={aadharBackUrl} alt="Aadhaar Back" className="w-full h-full object-cover" />
            <button
              onClick={() => setAadharBackUrl('')}
              className="absolute top-2 right-2 p-1.5 bg-black/70 hover:bg-red-600 rounded-lg text-white transition-colors cursor-pointer"
              title="Remove"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              onClick={() => startCamera('aadhar_back')}
              className="py-2.5 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
            >
              <Camera className="w-4 h-4 text-emerald-600" />
              <span>Capture Back</span>
            </button>
            <button
              onClick={() => aadharBackInputRef.current?.click()}
              className="py-2.5 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
            >
              <Upload className="w-4 h-4 text-sky-600" />
              <span>Upload File</span>
            </button>
          </div>
        )}
      </div>

      {/* DOCUMENT 4: PAN CARD */}
      <div className="mb-4 bg-white border border-slate-200 rounded-3xl p-4 shadow-sm">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
              panUrl ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-slate-100 text-slate-500'
            }`}>
              4
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <span>PAN Card</span>
                <span className="text-[10px] text-amber-700 font-normal">(Mandatory)</span>
              </h3>
              <p className="text-[11px] text-slate-500">10-character Permanent Account Number</p>
            </div>
          </div>
          {panUrl ? (
            <span className="flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-bold">
              <Check className="w-3 h-3 stroke-[3]" /> Uploaded
            </span>
          ) : (
            <span className="text-[10px] text-amber-800 font-semibold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              Pending
            </span>
          )}
        </div>

        {panUrl ? (
          <div className="mt-3 relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 h-32 flex items-center justify-center">
            <img src={panUrl} alt="PAN Card" className="w-full h-full object-cover" />
            <button
              onClick={() => setPanUrl('')}
              className="absolute top-2 right-2 p-1.5 bg-black/70 hover:bg-red-600 rounded-lg text-white transition-colors cursor-pointer"
              title="Remove"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              onClick={() => startCamera('pan')}
              className="py-2.5 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
            >
              <Camera className="w-4 h-4 text-emerald-600" />
              <span>Capture PAN</span>
            </button>
            <button
              onClick={() => panInputRef.current?.click()}
              className="py-2.5 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
            >
              <Upload className="w-4 h-4 text-sky-600" />
              <span>Upload File</span>
            </button>
          </div>
        )}

        {/* PAN & Aadhaar number inputs */}
        <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[10px] font-semibold text-slate-500 mb-1">Aadhaar (12 Digits)</label>
            <input
              type="text"
              maxLength={14}
              value={aadharNumber}
              onChange={(e) => setAadharNumber(e.target.value)}
              placeholder="XXXX XXXX 1234"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 font-mono focus:outline-none focus:border-emerald-600 focus:bg-white"
            />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-slate-500 mb-1">PAN Number</label>
            <input
              type="text"
              maxLength={10}
              value={panNumber}
              onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
              placeholder="ABCDE1234F"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 font-mono uppercase focus:outline-none focus:border-emerald-600 focus:bg-white"
            />
          </div>
        </div>
      </div>

      {/* Security notice */}
      <div className="p-3 bg-white border border-slate-200 rounded-2xl flex items-center gap-2.5 text-xs text-slate-500 mb-4 shadow-xs">
        <Lock className="w-4 h-4 text-emerald-600 shrink-0" />
        <span className="text-[11px]">
          256-bit AES encrypted. Documents stored securely via Supabase Cloud Storage bucket.
        </span>
      </div>

      {/* Verification in Progress State */}
      {isVerifying ? (
        <div className="p-4 bg-white border border-emerald-300 rounded-3xl text-center space-y-2 shadow-sm">
          <Loader2 className="w-6 h-6 text-emerald-600 animate-spin mx-auto" />
          <h4 className="text-xs font-bold text-slate-900">Verifying Identity</h4>
          <p className="text-[11px] text-emerald-700 animate-pulse font-mono">
            {verificationStep}
          </p>
        </div>
      ) : (
        <button
          onClick={handleSubmitKYC}
          disabled={!isFormComplete}
          className={`w-full py-3.5 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all ${
            isFormComplete
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-600/20 cursor-pointer'
              : 'bg-slate-200 text-slate-500 cursor-not-allowed border border-slate-300'
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
