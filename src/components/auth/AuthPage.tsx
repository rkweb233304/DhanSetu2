import React, { useState } from 'react';
import { 
  User, 
  Phone, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ShieldCheck, 
  KeyRound, 
  Sparkles,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { supabaseService } from '../../services/supabaseService';

export const AuthPage: React.FC = () => {
  const { setUser, setActiveTab, showToast } = useApp();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  
  // Login Form State
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPin, setLoginPin] = useState('');
  const [showLoginPin, setShowLoginPin] = useState(false);

  // Register Form State
  const [fullName, setFullName] = useState('');
  const [registerMobile, setRegisterMobile] = useState('');
  const [emailId, setEmailId] = useState('');
  const [createPin, setCreatePin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showRegisterPin, setShowRegisterPin] = useState(false);

  // Registration Success with Customer ID popup/card
  const [registeredUser, setRegisteredUser] = useState<any | null>(null);

  const [isLoading, setIsLoading] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = loginIdentifier.trim();
    if (!cleanId || !loginPin) {
      showToast('Please enter both Mobile / Customer ID and 6-digit PIN', 'error');
      return;
    }

    const isCustomer = cleanId.toUpperCase().startsWith('DS');
    if (!isCustomer && cleanId.length < 10) {
      showToast('Please enter a valid 10-digit mobile number or Customer ID (e.g. DS2026102401)', 'error');
      return;
    }

    if (loginPin.length !== 6) {
      showToast('PIN must be exactly 6 digits', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const loggedUser = await supabaseService.registerOrLogin(cleanId, loginPin);
      setIsLoading(false);
      setUser(loggedUser);
      showToast(`Welcome back, ${loggedUser.fullName}! (${loggedUser.customerId})`, 'success');
      setActiveTab('home');
    } catch (err: any) {
      setIsLoading(false);
      showToast(err.message || 'Login failed. Please check your credentials or register.', 'error');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !registerMobile || !emailId || !createPin || !confirmPin) {
      showToast('Please fill all mandatory fields', 'error');
      return;
    }

    if (registerMobile.length < 10) {
      showToast('Please enter a valid 10-digit mobile number', 'error');
      return;
    }

    if (createPin.length !== 6) {
      showToast('Create PIN must be exactly 6 digits', 'error');
      return;
    }

    if (createPin !== confirmPin) {
      showToast('Create PIN and Confirm PIN do not match', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const newUser = await supabaseService.registerOrLogin(registerMobile, createPin, fullName, emailId);
      setIsLoading(false);
      setRegisteredUser(newUser);
      showToast(`Account registered! Your Customer ID is ${newUser.customerId}`, 'success');
    } catch (err: any) {
      setIsLoading(false);
      showToast('Registration error: ' + err.message, 'error');
    }
  };

  const handleProceedAfterRegistration = () => {
    if (registeredUser) {
      setUser(registeredUser);
      setActiveTab('home');
      showToast('⚠️ Please complete your mandatory KYC to unlock personal loans', 'warning');
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 flex flex-col justify-center items-center p-4 select-none">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl">
        {/* App Branding */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-emerald-600/20 mb-3">
            ₹
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">DhanSetu</h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Instant Personal Loans & Digital KYC Bridge
          </p>
        </div>

        {/* REGISTRATION SUCCESS CARD (SHOWING CUSTOMER ID) */}
        {registeredUser ? (
          <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200 text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            
            <div>
              <h2 className="text-base font-bold text-slate-900">Registration Successful!</h2>
              <p className="text-xs text-slate-500 mt-0.5">Welcome, {registeredUser.fullName}</p>
            </div>

            <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-300 rounded-2xl text-left">
              <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                Your Unique Customer ID (Custmer ID)
              </span>
              <div className="flex items-center justify-between mt-1.5">
                <span className="text-lg font-mono font-black text-emerald-950 tracking-wider">
                  {registeredUser.customerId}
                </span>
                <span className="text-[10px] bg-emerald-600 text-white font-bold px-2 py-0.5 rounded-full">
                  Assigned
                </span>
              </div>
              <p className="text-[11px] text-slate-600 mt-2 leading-relaxed">
                Save this Customer ID. All your Supabase data, KYC documents, active loans, and repayments are permanently linked to <strong className="text-slate-900 font-mono">{registeredUser.customerId}</strong>.
              </p>
            </div>

            <button
              onClick={handleProceedAfterRegistration}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <span>Proceed to DhanSetu App</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <>
            {/* Tab Switcher (Page inline tabs, no popup) */}
            <div className="flex bg-slate-100 p-1 rounded-2xl mb-6 border border-slate-200">
              <button
                type="button"
                onClick={() => setMode('login')}
                className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  mode === 'login'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setMode('register')}
                className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  mode === 'register'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Register
              </button>
            </div>

            {/* LOGIN PAGE VIEW */}
            {mode === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Please Enter Registered Mobile or Customer ID
                  </label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-3 text-slate-400">
                      <Phone className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      maxLength={16}
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      placeholder="e.g. 9876543210 or DS2026102401"
                      required
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-3 py-3 text-sm text-slate-900 placeholder-slate-400 font-mono focus:outline-none focus:border-emerald-600 focus:bg-white transition-all uppercase"
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Tip: Enter 10-digit mobile or your Unique Customer ID (DS...)
                  </span>
                </div>

                <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Please Enter Pin (6 Digit)
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-3 text-slate-400">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type={showLoginPin ? 'text' : 'password'}
                  maxLength={6}
                  value={loginPin}
                  onChange={(e) => setLoginPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="••••••"
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-10 py-3 text-sm text-slate-900 placeholder-slate-400 font-mono tracking-widest focus:outline-none focus:border-emerald-600 focus:bg-white transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPin(!showLoginPin)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showLoginPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-[11px] text-emerald-800 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Direct encrypted authentication via Supabase Auth Table.</span>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In to DhanSetu</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setMode('register')}
                className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold"
              >
                Don't have an account? Register here →
              </button>
            </div>
          </form>
        )}

        {/* REGISTER PAGE VIEW */}
        {mode === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-2.5 text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-3 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mobile No
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-2.5 text-slate-400">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="tel"
                  maxLength={10}
                  value={registerMobile}
                  onChange={(e) => setRegisterMobile(e.target.value.replace(/\D/g, ''))}
                  placeholder="9876543210"
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-3 py-2.5 text-xs text-slate-900 placeholder-slate-400 font-mono focus:outline-none focus:border-emerald-600 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Id
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-2.5 text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={emailId}
                  onChange={(e) => setEmailId(e.target.value)}
                  placeholder="rahul@example.com"
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-3 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Create Pin (6 Digit)
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-2.5 text-slate-400">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type={showRegisterPin ? 'text' : 'password'}
                  maxLength={6}
                  value={createPin}
                  onChange={(e) => setCreatePin(e.target.value.replace(/\D/g, ''))}
                  placeholder="••••••"
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-10 py-2.5 text-xs text-slate-900 placeholder-slate-400 font-mono tracking-widest focus:outline-none focus:border-emerald-600 focus:bg-white transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowRegisterPin(!showRegisterPin)}
                  className="absolute right-3.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showRegisterPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Confirm Pin (6 Digit)
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-2.5 text-slate-400">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type={showRegisterPin ? 'text' : 'password'}
                  maxLength={6}
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="••••••"
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-3 py-2.5 text-xs text-slate-900 placeholder-slate-400 font-mono tracking-widest focus:outline-none focus:border-emerald-600 focus:bg-white transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 mt-2"
            >
              {isLoading ? (
                <span>Registering Account...</span>
              ) : (
                <>
                  <span>Register & Proceed to KYC</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold"
              >
                Already registered? Sign in here →
              </button>
            </div>
          </form>
        )}
        </>
        )}
      </div>
    </div>
  );
};
