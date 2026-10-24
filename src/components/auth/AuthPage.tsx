import React, { useState } from 'react';
import { 
  User, 
  Phone, 
  Mail, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ShieldCheck, 
  KeyRound, 
  CheckCircle2,
  Copy,
  Building2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { supabaseService } from '../../services/supabaseService';

export const AuthPage: React.FC = () => {
  const { setUser, setUserRole, setActiveTab, showToast } = useApp();

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

  // Registration Success State
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
      showToast(`Welcome back, ${loggedUser.fullName}!`, 'success');
      setActiveTab('home');
    } catch (err: any) {
      setIsLoading(false);
      showToast(err.message || 'Login failed. Please verify credentials or register.', 'error');
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
      newUser.role = 'customer';
      setIsLoading(false);
      setRegisteredUser(newUser);
      showToast(`Account registered! Your Customer ID is: ${newUser.customerId}`, 'success');
    } catch (err: any) {
      setIsLoading(false);
      showToast('Registration error: ' + err.message, 'error');
    }
  };

  const handleProceedAfterRegistration = () => {
    if (registeredUser) {
      setUser(registeredUser);
      setUserRole(registeredUser.role || 'customer');
      if (registeredUser.role === 'retailer') {
        setActiveTab('retailer');
        showToast('Welcome Retailer! You can now review and approve customer loans.', 'success');
      } else {
        setActiveTab('home');
        showToast('Welcome to DhanSetu! Complete your KYC to unlock personal loans.', 'info');
      }
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-100 flex flex-col justify-center items-center p-4 select-none">
      <div className="w-full max-w-sm bg-white border border-slate-200 rounded-3xl p-6 shadow-xl">
        
        {/* App Logo & Title (Simple, Short Theme) */}
        <div className="text-center mb-5">
          <img 
            src="https://i.ibb.co/9kKQLfDf/ip-logo.png" 
            alt="DhanSetu Logo" 
            className="w-12 h-12 mx-auto rounded-2xl object-contain bg-white shadow-md shadow-emerald-600/20 border border-slate-200 p-1 mb-2" 
          />
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">DhanSetu</h1>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Instant Credit & Personal Loans
          </p>
        </div>

        {/* REGISTRATION SUCCESS VIEW */}
        {registeredUser ? (
          <div className="space-y-4 text-center animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            
            <div>
              <h2 className="text-base font-bold text-slate-900">Registration Successful!</h2>
              <p className="text-xs text-slate-500 mt-0.5">Welcome, {registeredUser.fullName}</p>
            </div>

            <div className="p-3.5 bg-emerald-50/70 border border-emerald-300 rounded-2xl text-left">
              <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                Your Unique Customer ID
              </span>
              <div className="flex items-center justify-between mt-1">
                <span className="text-base font-mono font-black text-emerald-950 tracking-wider">
                  {registeredUser.customerId}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(registeredUser.customerId);
                    showToast('Customer ID copied!', 'success');
                  }}
                  className="px-2 py-0.5 bg-white border border-emerald-300 rounded text-[10px] font-semibold text-emerald-800 flex items-center gap-1 hover:bg-emerald-100 cursor-pointer"
                >
                  <Copy className="w-3 h-3" />
                  <span>Copy</span>
                </button>
              </div>
              <p className="text-[10px] text-slate-600 mt-1.5 leading-relaxed">
                Format: <span className="font-mono">DS[Year][Month][Date][SN]</span>. All loans, KYC documents, and payments are permanently linked to this ID.
              </p>
            </div>

            <button
              onClick={handleProceedAfterRegistration}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <span>Proceed to DhanSetu App</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <>
            {/* Simple Tab Switcher */}
            <div className="flex bg-slate-100 p-1 rounded-2xl mb-4 border border-slate-200">
              <button
                type="button"
                onClick={() => setMode('login')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  mode === 'login'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setMode('register')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  mode === 'register'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Register
              </button>
            </div>

            {/* LOGIN FORM */}
            {mode === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Mobile Number or Customer ID
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-2.5 text-slate-400">
                      <Phone className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      maxLength={16}
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      placeholder="9876543210 or DS2026102401"
                      required
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-900 placeholder-slate-400 font-mono uppercase focus:outline-none focus:border-emerald-600 focus:bg-white transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    6-Digit Security PIN
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-2.5 text-slate-400">
                      <KeyRound className="w-4 h-4" />
                    </div>
                    <input
                      type={showLoginPin ? 'text' : 'password'}
                      maxLength={6}
                      value={loginPin}
                      onChange={(e) => setLoginPin(e.target.value.replace(/\D/g, ''))}
                      placeholder="••••••"
                      required
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-9 py-2.5 text-xs text-slate-900 placeholder-slate-400 font-mono tracking-widest focus:outline-none focus:border-emerald-600 focus:bg-white transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPin(!showLoginPin)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showLoginPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50 mt-1"
                >
                  {isLoading ? <span>Signing in...</span> : <span>Sign In</span>}
                </button>
              </form>
            )}

            {/* REGISTER FORM */}
            {mode === 'register' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-3">

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-2.5 text-slate-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      required
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Mobile Number
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-2.5 text-slate-400">
                      <Phone className="w-4 h-4" />
                    </div>
                    <input
                      type="tel"
                      maxLength={10}
                      value={registerMobile}
                      onChange={(e) => setRegisterMobile(e.target.value.replace(/\D/g, ''))}
                      placeholder="9876543210"
                      required
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 font-mono focus:outline-none focus:border-emerald-600 focus:bg-white transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-2.5 text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      value={emailId}
                      onChange={(e) => setEmailId(e.target.value)}
                      placeholder="rahul@example.com"
                      required
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Set 6-Digit PIN
                    </label>
                    <div className="relative">
                      <input
                        type={showRegisterPin ? 'text' : 'password'}
                        maxLength={6}
                        value={createPin}
                        onChange={(e) => setCreatePin(e.target.value.replace(/\D/g, ''))}
                        placeholder="••••••"
                        required
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-2 text-xs text-slate-900 placeholder-slate-400 font-mono tracking-widest focus:outline-none focus:border-emerald-600 focus:bg-white transition-colors text-center"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Confirm PIN
                    </label>
                    <div className="relative">
                      <input
                        type={showRegisterPin ? 'text' : 'password'}
                        maxLength={6}
                        value={confirmPin}
                        onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                        placeholder="••••••"
                        required
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-2 text-xs text-slate-900 placeholder-slate-400 font-mono tracking-widest focus:outline-none focus:border-emerald-600 focus:bg-white transition-colors text-center"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-0.5">
                  <button
                    type="button"
                    onClick={() => setShowRegisterPin(!showRegisterPin)}
                    className="text-[10px] text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
                  >
                    {showRegisterPin ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    <span>{showRegisterPin ? 'Hide PIN' : 'Show PIN'}</span>
                  </button>
                  <span className="text-[10px] text-emerald-700 font-medium">Customer ID auto-generated</span>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50 mt-1"
                >
                  {isLoading ? <span>Creating Account...</span> : <span>Register Account</span>}
                </button>
              </form>
            )}

            {/* Short Rules & Security Assurance */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[10px] text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>RBI Digital Lending Guidelines Compliant</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
