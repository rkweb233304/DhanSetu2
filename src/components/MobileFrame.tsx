import React, { useState, useEffect } from 'react';
import { 
  Smartphone, 
  Wifi, 
  BatteryMedium, 
  RotateCcw, 
  Sparkles, 
  ShieldCheck,
  Maximize2,
  Database
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface MobileFrameProps {
  children: React.ReactNode;
  onOpenSupabaseModal?: () => void;
}

export const MobileFrame: React.FC<MobileFrameProps> = ({ children, onOpenSupabaseModal }) => {
  const { deviceFrame, setDeviceFrame, supabaseConfig } = useApp();
  const [currentTime, setCurrentTime] = useState<string>('09:41');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleResetDemoData = () => {
    if (window.confirm('Reset DhanSetu app data to default demo state?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-start p-2 sm:p-4 select-none">
      {/* Top App Environment Control Bar */}
      <header className="w-full max-w-4xl flex flex-wrap items-center justify-between gap-3 py-2 px-3 mb-2 bg-slate-900/80 backdrop-blur border border-slate-800 rounded-xl text-xs text-slate-300">
        <div className="flex items-center gap-2.5">
          <img 
            src="https://i.ibb.co/9kKQLfDf/ip-logo.png" 
            alt="DhanSetu Logo" 
            className="w-6 h-6 rounded-lg object-contain bg-white border border-emerald-500/40 p-0.5" 
          />
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-white tracking-tight">DhanSetu</span>
            <span className="text-slate-500 font-mono text-[11px]">com.app.dhansetu</span>
          </div>
          <span className="hidden sm:inline text-slate-600">·</span>
          <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
            <ShieldCheck className="w-3 h-3" /> Personal Loans & Digital KYC
          </span>
        </div>

        {/* Device Switcher and Actions */}
        <div className="flex items-center gap-2 ml-auto">
          {/* Supabase status button */}
          <button
            onClick={onOpenSupabaseModal}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-medium transition-all ${
              supabaseConfig.isConnected
                ? 'bg-emerald-950/80 border-emerald-700/60 text-emerald-300 hover:bg-emerald-900/80'
                : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
            title="Configure Supabase connection"
          >
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden md:inline">Supabase:</span>
            <span>{supabaseConfig.isConnected ? 'Connected' : 'Local Storage Mode'}</span>
          </button>

          {/* View mode toggle */}
          <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800">
            <button
              onClick={() => setDeviceFrame('ios')}
              className={`px-2 py-1 rounded text-[11px] font-medium flex items-center gap-1 transition-colors ${
                deviceFrame === 'ios'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Smartphone className="w-3 h-3 text-sky-400" />
              <span>iOS</span>
            </button>
            <button
              onClick={() => setDeviceFrame('android')}
              className={`px-2 py-1 rounded text-[11px] font-medium flex items-center gap-1 transition-colors ${
                deviceFrame === 'android'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Smartphone className="w-3 h-3 text-emerald-400" />
              <span>Android</span>
            </button>
            <button
              onClick={() => setDeviceFrame('fullscreen')}
              className={`px-2 py-1 rounded text-[11px] font-medium flex items-center gap-1 transition-colors ${
                deviceFrame === 'fullscreen'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Maximize2 className="w-3 h-3 text-amber-400" />
              <span>Full</span>
            </button>
          </div>

          <button
            onClick={handleResetDemoData}
            title="Reset to default demo data"
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Frame Container */}
      <main className="w-full flex justify-center items-center flex-1 py-1">
        {deviceFrame === 'fullscreen' ? (
          <div className="w-full max-w-md h-[92vh] max-h-[920px] bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col relative">
            {children}
          </div>
        ) : deviceFrame === 'ios' ? (
          // Realistic iPhone 16 Pro Chassis
          <div className="relative w-[390px] h-[844px] max-h-[94vh] rounded-[52px] p-[11px] bg-gradient-to-b from-slate-700 via-slate-800 to-slate-900 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_0_1px_rgba(255,255,255,0.1)] flex flex-col">
            {/* Outer titanium edge highlights */}
            <div className="absolute inset-0 rounded-[52px] pointer-events-none ring-1 ring-white/10" />

            {/* Inner display bezel */}
            <div className="w-full h-full bg-slate-950 rounded-[42px] overflow-hidden flex flex-col relative border border-slate-900 shadow-inner">
              {/* iPhone Status Bar with Dynamic Island */}
              <div className="h-11 w-full pt-3 px-7 flex items-center justify-between text-xs font-semibold text-slate-100 z-40 bg-slate-900/90 backdrop-blur shrink-0">
                <span className="tracking-tight text-[13px]">{currentTime}</span>

                {/* Dynamic Island */}
                <div className="w-28 h-6 bg-black rounded-full flex items-center justify-between px-2 shadow-sm border border-slate-800/60">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center">
                    <div className="w-1 h-1 rounded-full bg-emerald-500/80" />
                  </div>
                  <div className="flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5 text-amber-400 animate-pulse" />
                    <span className="text-[9px] font-mono text-emerald-400 font-medium">₹ Disbursal</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono font-bold tracking-tighter">5G</span>
                  <Wifi className="w-3.5 h-3.5" />
                  <BatteryMedium className="w-4 h-4 text-emerald-400" />
                </div>
              </div>

              {/* Mobile Viewport Screen */}
              <div className="flex-1 w-full overflow-hidden flex flex-col relative bg-slate-950">
                {children}
              </div>

              {/* iOS Home Indicator */}
              <div className="h-5 w-full flex items-center justify-center bg-slate-950 shrink-0 pointer-events-none">
                <div className="w-32 h-1 bg-slate-600/70 rounded-full" />
              </div>
            </div>
          </div>
        ) : (
          // Android Pixel 9 Chassis
          <div className="relative w-[392px] h-[848px] max-h-[94vh] rounded-[44px] p-[10px] bg-gradient-to-b from-zinc-700 via-zinc-800 to-zinc-900 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_0_1px_rgba(255,255,255,0.08)] flex flex-col">
            <div className="w-full h-full bg-slate-950 rounded-[34px] overflow-hidden flex flex-col relative border border-slate-900">
              {/* Android Status Bar */}
              <div className="h-9 w-full px-5 flex items-center justify-between text-xs font-medium text-slate-200 z-40 bg-slate-900/90 backdrop-blur shrink-0">
                <span className="tracking-tight text-[12px]">{currentTime}</span>
                {/* Punch hole front camera */}
                <div className="w-3.5 h-3.5 rounded-full bg-black border border-slate-800 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-900" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono">LTE+</span>
                  <Wifi className="w-3 h-3" />
                  <BatteryMedium className="w-3.5 h-3.5 text-emerald-400" />
                </div>
              </div>

              {/* Android Viewport Screen */}
              <div className="flex-1 w-full overflow-hidden flex flex-col relative bg-slate-950">
                {children}
              </div>

              {/* Android Gesture Bar */}
              <div className="h-4 w-full flex items-center justify-center bg-slate-950 shrink-0 pointer-events-none">
                <div className="w-20 h-1 bg-slate-500/80 rounded-full" />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
