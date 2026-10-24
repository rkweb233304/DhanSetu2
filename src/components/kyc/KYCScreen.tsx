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
  Check,
  Clock
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { supabaseService } from '../../services/supabaseService';

export const KYCScreen: React.FC = () => {
  const { user, updateUserKYC, setActiveTab, showToast } = useApp();

  const [selfieUrl, setSelfieUrl] = useState<string>(user?.kyc?.selfieUrl || '');
  const [aadharFrontUrl, setAadharFrontUrl] = useState<string>(user?.kyc?.aadharFrontUrl || '');
  const [aadharBackUrl, setAadharBackUrl] = useState<string>(user?.kyc?.aadharBackUrl || '');
  const [panUrl, setPanUrl] = useState<string>(user?.kyc?.panUrl || '');

  const [aadharNumber, setAadharNumber] = useState<string>(user?.kyc?.aadharNumber || '');
  const [panNumber, setPanNumber] = useState<string>(user?.kyc?.panNumber || '');

  // New Fields
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [formData, setFormData] = useState({
    fullName: user?.kyc?.fullName || user?.fullName || '',
    fatherName: user?.kyc?.fatherName || '',
    motherName: user?.kyc?.motherName || '',
    address: user?.kyc?.address || '',
    state: user?.kyc?.state || '',
    nomineeName: user?.kyc?.nomineeName || '',
    nomineeMobile: user?.kyc?.nomineeMobile || '',
    nomineeRelation: user?.kyc?.nomineeRelation || '',
    guarantorName: user?.kyc?.guarantorName || '',
    guarantorMobile: user?.kyc?.guarantorMobile || '',
    guarantorRelation: user?.kyc?.guarantorRelation || '',
  });

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
  const isSubmitted = user?.kyc?.overallStatus === 'submitted';

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

  const captureSnapshot = async () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);

    const target = activeCaptureTarget;
    if (!target) return;

    const typeMap: Record<string, 'selfie' | 'aadhaar_front' | 'aadhaar_back' | 'pan'> = {
      'selfie': 'selfie',
      'aadhar_front': 'aadhaar_front',
      'aadhar_back': 'aadhaar_back',
      'pan': 'pan'
    };

    const docType = typeMap[target];
    try {
      const uploadedUrl = await supabaseService.uploadKYCDocument(user?.customerId || 'DS_GUEST', docType, dataUrl);

      if (target === 'selfie') setSelfieUrl(uploadedUrl);
      if (target === 'aadhar_front') setAadharFrontUrl(uploadedUrl);
      if (target === 'aadhar_back') setAadharBackUrl(uploadedUrl);
      if (target === 'pan') setPanUrl(uploadedUrl);

      stopCamera();
      showToast(`Document captured successfully!`, 'success');
    } catch (error) {
      showToast('Capture upload failed', 'error');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'selfie' | 'aadhar_front' | 'aadhar_back' | 'pan') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const typeMap: Record<string, 'selfie' | 'aadhaar_front' | 'aadhaar_back' | 'pan'> = {
      'selfie': 'selfie',
      'aadhar_front': 'aadhaar_front',
      'aadhar_back': 'aadhaar_back',
      'pan': 'pan'
    };

    const docType = typeMap[target];
    try {
      const uploadedUrl = await supabaseService.uploadKYCDocument(user?.customerId || 'DS_GUEST', docType, file);

      if (target === 'selfie') setSelfieUrl(uploadedUrl);
      if (target === 'aadhar_front') setAadharFrontUrl(uploadedUrl);
      if (target === 'aadhar_back') setAadharBackUrl(uploadedUrl);
      if (target === 'pan') setPanUrl(uploadedUrl);

      showToast(`Document uploaded successfully!`, 'success');
    } catch (error) {
      console.error('Upload failed:', error);
      showToast(`Failed to upload document. Please try again.`, 'error');
    }
  };

  const completedDocsCount = [selfieUrl, aadharFrontUrl, aadharBackUrl, panUrl].filter(Boolean).length;
  const isFormComplete = completedDocsCount === 4;

  const handleSubmitKYC = async () => {
    if (!isFormComplete) {
      showToast('Please upload all 4 mandatory KYC documents', 'error');
      return;
    }

    setIsVerifying(true);
    setVerificationStep('Uploading documents to Supabase...');

    setTimeout(async () => {
      setIsVerifying(false);
      await updateUserKYC({
        ...formData,
        selfieUrl,
        aadharFrontUrl,
        aadharBackUrl,
        aadharNumber: aadharNumber || '5489 1234 8921',
        panUrl,
        panNumber: (panNumber || 'ABCPS8921K').toUpperCase(),
        overallStatus: 'submitted'
      });
      showToast('KYC Documents submitted for retailer review!', 'success');
    }, 1500);
  };

  const isStep1Valid = formData.fullName && formData.fatherName && formData.motherName && formData.address && formData.state;
  const isStep2Valid = formData.nomineeName && formData.nomineeMobile && formData.nomineeRelation && formData.guarantorName && formData.guarantorMobile && formData.guarantorRelation;

  const handleNext = async () => {
    if (step === 1 && !isStep1Valid) {
      showToast('Please fill all fields in step 1', 'error');
      return;
    }
    if (step === 2 && !isStep2Valid) {
      showToast('Please fill all fields in step 2', 'error');
      return;
    }
    
    // Save current state to Supabase at each step for persistence
    try {
      await updateUserKYC({
        ...formData,
        overallStatus: user?.kyc?.overallStatus || 'not_started'
      });
    } catch (e) {
      console.warn('Step save failed:', e);
    }

    setStep(prev => (prev < 3 ? (prev + 1) as 1 | 2 | 3 : prev));
  };

  const handlePrev = () => setStep(prev => (prev > 1 ? (prev - 1) as 1 | 2 | 3 : prev));

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar bg-slate-50 text-slate-900 flex flex-col p-4 pb-28">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => setActiveTab('home')} className="p-1.5 -ml-1 text-slate-500 hover:text-slate-900 flex items-center gap-1 text-xs">
          <ArrowLeft className="w-4 h-4" /> Home
        </button>
        {!isVerified && !isSubmitted && <span className="text-xs font-bold bg-white px-3 py-1 rounded-full border">Step {step} of 3</span>}
      </div>

      {isSubmitted && (
        <div className="p-8 bg-amber-50 border border-amber-200 rounded-3xl text-center space-y-4 shadow-sm">
          <Clock className="w-16 h-16 text-amber-500 mx-auto" />
          <h2 className="text-xl font-bold text-amber-900">KYC Under Review</h2>
          <p className="text-sm text-amber-700">Your documents are being reviewed by a retailer. You will be notified once a loan is allotted to you.</p>
          <button onClick={() => setActiveTab('home')} className="w-full py-3 bg-white border border-amber-300 text-amber-900 rounded-2xl font-bold">Back to Dashboard</button>
        </div>
      )}

      {isVerified && (
        <div className="p-8 bg-emerald-50 border border-emerald-200 rounded-3xl text-center space-y-4 shadow-sm">
          <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto" />
          <h2 className="text-xl font-bold text-emerald-900">KYC Verified</h2>
          <p className="text-sm text-emerald-700">Congratulations! Your identity is verified and you have active loan offers.</p>
          <button onClick={() => setActiveTab('home')} className="w-full py-3 bg-emerald-600 text-white rounded-2xl font-bold">View Offers</button>
        </div>
      )}

      {!isVerified && !isSubmitted && (
        <>
          {/* Camera Live Modal Overlay */}
          {isCameraActive && (
            <div className="fixed inset-0 z-50 bg-black/90 flex flex-col p-4 animate-in fade-in">
              <div className="flex items-center justify-between text-white mb-2">
                <span className="text-xs font-semibold capitalize">Capture {activeCaptureTarget?.replace(/_/g, ' ')}</span>
                <button onClick={stopCamera} className="p-1 rounded-full bg-slate-800 text-slate-300 hover:text-white">✕</button>
              </div>
              <div className="flex-1 bg-slate-950 rounded-2xl overflow-hidden relative flex items-center justify-center border border-slate-800">
                {cameraError ? (
                  <div className="p-4 text-center">
                    <AlertCircle className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                    <p className="text-xs text-slate-300">{cameraError}</p>
                    <button onClick={stopCamera} className="mt-3 px-3 py-1.5 bg-slate-800 text-xs text-white rounded-lg">Close & Upload Instead</button>
                  </div>
                ) : (
                  <>
                    <video ref={videoRef} playsInline autoPlay muted className="w-full h-full object-cover" />
                    <div className="absolute inset-4 border-2 border-dashed border-emerald-400/60 rounded-2xl pointer-events-none flex items-center justify-center">
                      {activeCaptureTarget === 'selfie' && <div className="w-48 h-60 border-2 border-emerald-400/80 rounded-full" />}
                    </div>
                  </>
                )}
              </div>
              {!cameraError && (
                <div className="py-4 flex justify-center items-center gap-4">
                  <button onClick={captureSnapshot} className="w-16 h-16 rounded-full bg-white border-4 border-emerald-500 shadow-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all cursor-pointer">
                    <div className="w-12 h-12 rounded-full bg-emerald-600" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Hidden File Inputs */}
          <input type="file" ref={selfieInputRef} accept="image/*" capture="user" className="hidden" onChange={(e) => handleFileUpload(e, 'selfie')} />
          <input type="file" ref={aadharFrontInputRef} accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, 'aadhar_front')} />
          <input type="file" ref={aadharBackInputRef} accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, 'aadhar_back')} />
          <input type="file" ref={panInputRef} accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, 'pan')} />

          {step === 1 && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold">Personal Information</h2>
          <input type="text" placeholder="Full Name" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="w-full p-3 border rounded-xl" />
          <input type="text" placeholder="Father's Name" value={formData.fatherName} onChange={e => setFormData({...formData, fatherName: e.target.value})} className="w-full p-3 border rounded-xl" />
          <input type="text" placeholder="Mother's Name" value={formData.motherName} onChange={e => setFormData({...formData, motherName: e.target.value})} className="w-full p-3 border rounded-xl" />
          <input type="text" disabled value={user?.phoneNumber || ''} className="w-full p-3 border rounded-xl bg-slate-100" />
          <input type="text" placeholder="Full Address" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full p-3 border rounded-xl" />
          <input type="text" placeholder="State" value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} className="w-full p-3 border rounded-xl" />
          <button onClick={handleNext} className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold">Next</button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold">Nominee & Guarantor</h2>
          <div className="space-y-2">
            <h3 className="font-semibold text-sm">Nominee Details</h3>
            <input type="text" placeholder="Name" value={formData.nomineeName} onChange={e => setFormData({...formData, nomineeName: e.target.value})} className="w-full p-3 border rounded-xl" />
            <input type="text" placeholder="Contact Number" value={formData.nomineeMobile} onChange={e => setFormData({...formData, nomineeMobile: e.target.value})} className="w-full p-3 border rounded-xl" />
            <input type="text" placeholder="Relation" value={formData.nomineeRelation} onChange={e => setFormData({...formData, nomineeRelation: e.target.value})} className="w-full p-3 border rounded-xl" />
          </div>
          <div className="space-y-2 pt-4">
            <h3 className="font-semibold text-sm">Guarantor Details</h3>
            <input type="text" placeholder="Name" value={formData.guarantorName} onChange={e => setFormData({...formData, guarantorName: e.target.value})} className="w-full p-3 border rounded-xl" />
            <input type="text" placeholder="Contact Number" value={formData.guarantorMobile} onChange={e => setFormData({...formData, guarantorMobile: e.target.value})} className="w-full p-3 border rounded-xl" />
            <input type="text" placeholder="Relation" value={formData.guarantorRelation} onChange={e => setFormData({...formData, guarantorRelation: e.target.value})} className="w-full p-3 border rounded-xl" />
          </div>
          <div className="flex gap-2">
            <button onClick={handlePrev} className="flex-1 py-3 bg-slate-200 rounded-xl font-bold">Back</button>
            <button onClick={handleNext} className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-bold">Next</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold">Upload Documents</h2>
          
          {/* Document 1: Selfie */}
          <div className="p-4 bg-white border border-slate-200 rounded-3xl">
            <h3 className="text-xs font-bold mb-2">Live Selfie (Mandatory)</h3>
            {selfieUrl ? (
              <div className="relative h-36 flex items-center justify-center border rounded-2xl bg-slate-50">
                <img src={selfieUrl} alt="Selfie" className="w-full h-full object-cover" />
                <button onClick={() => setSelfieUrl('')} className="absolute top-2 right-2 p-1.5 bg-black/70 rounded-lg text-white"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => startCamera('selfie')} className="py-2 bg-slate-100 rounded-xl text-xs font-semibold">Camera</button>
                <button onClick={() => selfieInputRef.current?.click()} className="py-2 bg-slate-100 rounded-xl text-xs font-semibold">Upload Photo</button>
              </div>
            )}
          </div>
          
          {/* Document 2: Aadhaar Front */}
          <div className="p-4 bg-white border border-slate-200 rounded-3xl">
            <h3 className="text-xs font-bold mb-2">Aadhaar Front (Mandatory)</h3>
            {aadharFrontUrl ? (
              <div className="relative h-36 flex items-center justify-center border rounded-2xl bg-slate-50">
                <img src={aadharFrontUrl} alt="Aadhaar Front" className="w-full h-full object-cover" />
                <button onClick={() => setAadharFrontUrl('')} className="absolute top-2 right-2 p-1.5 bg-black/70 rounded-lg text-white"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => startCamera('aadhar_front')} className="py-2 bg-slate-100 rounded-xl text-xs font-semibold">Camera</button>
                <button onClick={() => aadharFrontInputRef.current?.click()} className="py-2 bg-slate-100 rounded-xl text-xs font-semibold">Upload File</button>
              </div>
            )}
          </div>

          {/* Document 3: Aadhaar Back */}
          <div className="p-4 bg-white border border-slate-200 rounded-3xl">
            <h3 className="text-xs font-bold mb-2">Aadhaar Back (Mandatory)</h3>
            {aadharBackUrl ? (
              <div className="relative h-36 flex items-center justify-center border rounded-2xl bg-slate-50">
                <img src={aadharBackUrl} alt="Aadhaar Back" className="w-full h-full object-cover" />
                <button onClick={() => setAadharBackUrl('')} className="absolute top-2 right-2 p-1.5 bg-black/70 rounded-lg text-white"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => startCamera('aadhar_back')} className="py-2 bg-slate-100 rounded-xl text-xs font-semibold">Camera</button>
                <button onClick={() => aadharBackInputRef.current?.click()} className="py-2 bg-slate-100 rounded-xl text-xs font-semibold">Upload File</button>
              </div>
            )}
          </div>

          {/* Document 4: PAN Card */}
          <div className="p-4 bg-white border border-slate-200 rounded-3xl">
            <h3 className="text-xs font-bold mb-2">PAN Card (Mandatory)</h3>
            {panUrl ? (
              <div className="relative h-36 flex items-center justify-center border rounded-2xl bg-slate-50">
                <img src={panUrl} alt="PAN Card" className="w-full h-full object-cover" />
                <button onClick={() => setPanUrl('')} className="absolute top-2 right-2 p-1.5 bg-black/70 rounded-lg text-white"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => startCamera('pan')} className="py-2 bg-slate-100 rounded-xl text-xs font-semibold">Camera</button>
                <button onClick={() => panInputRef.current?.click()} className="py-2 bg-slate-100 rounded-xl text-xs font-semibold">Upload File</button>
              </div>
            )}
          </div>

          <div className="pt-4 flex gap-2">
            <button onClick={handlePrev} className="flex-1 py-3 bg-slate-200 rounded-xl font-bold">Back</button>
            <button onClick={handleSubmitKYC} className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-bold">Submit</button>
          </div>
        </div>
      )}
    </>
  )}
</div>
);
};
