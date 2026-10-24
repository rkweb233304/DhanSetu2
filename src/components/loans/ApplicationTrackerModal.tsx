import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  Clock, 
  FileCheck, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles, 
  Download, 
  Wallet,
  Play,
  RotateCw
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ConfettiEffect } from '../common/Confetti';

interface ApplicationTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApplicationTrackerModal: React.FC<ApplicationTrackerModalProps> = ({ isOpen, onClose }) => {
  const { 
    activeApplication, 
    simulateNextApplicationStage, 
    user,
    setActiveTab 
  } = useApp();

  const [showSanctionPreview, setShowSanctionPreview] = useState<boolean>(false);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  if (!isOpen || !activeApplication) return null;

  const isDisbursed = activeApplication.currentStage === 'disbursed';

  const handleAdvanceStage = () => {
    setIsSimulating(true);
    setTimeout(() => {
      setIsSimulating(false);
      simulateNextApplicationStage(activeApplication.id);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in">
      <ConfettiEffect trigger={isDisbursed} />

      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl text-slate-100 max-h-[92vh] overflow-y-auto no-scrollbar flex flex-col relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <h2 className="text-sm font-bold text-white tracking-tight">Real-Time Approval Tracker</h2>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">App ID: #{activeApplication.id}</span>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Loan Brief Header Card */}
        <div className="my-3 p-3.5 bg-slate-950 rounded-2xl border border-slate-800">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] text-slate-400 block">{activeApplication.loanTitle}</span>
              <span className="text-lg font-extrabold text-white font-mono">
                ₹{activeApplication.requestedAmount.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-emerald-400 font-bold block">
                {activeApplication.stageProgress}% Approved
              </span>
              <span className="text-[10px] text-slate-400">
                EMI: ₹{activeApplication.monthlyEmi.toLocaleString('en-IN')} / mo
              </span>
            </div>
          </div>

          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mt-2.5">
            <div 
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500 rounded-full"
              style={{ width: `${activeApplication.stageProgress}%` }}
            />
          </div>
        </div>

        {/* PIPELINE STAGES TIMELINE */}
        <div className="space-y-3.5 my-2 flex-1">
          {activeApplication.history.map((step, index) => {
            const isCurrent = step.stage === activeApplication.currentStage;
            const isPast = step.completed;

            return (
              <div key={step.stage} className="flex items-start gap-3 relative">
                {/* Connecting Line */}
                {index < activeApplication.history.length - 1 && (
                  <div 
                    className={`absolute left-3.5 top-6 bottom-0 w-0.5 -ml-[1px] ${
                      isPast ? 'bg-emerald-500/80' : 'bg-slate-800'
                    }`} 
                  />
                )}

                {/* Circle Icon */}
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 z-10 transition-colors ${
                  isPast 
                    ? 'bg-emerald-500 text-slate-950 font-bold' 
                    : isCurrent 
                    ? 'bg-sky-500/20 text-sky-400 ring-2 ring-sky-500/50' 
                    : 'bg-slate-800 text-slate-500'
                }`}>
                  {isPast ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : isCurrent ? (
                    <Clock className="w-4 h-4 animate-spin" />
                  ) : (
                    <span className="text-[11px] font-mono">{index + 1}</span>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 pb-1">
                  <div className="flex items-center justify-between">
                    <h4 className={`text-xs font-bold ${
                      isCurrent ? 'text-sky-300' : isPast ? 'text-white' : 'text-slate-400'
                    }`}>
                      {step.title}
                    </h4>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {step.timestamp}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                    {step.description}
                  </p>

                  {/* Stage-specific interactive action banner */}
                  {step.stage === 'sanction_issued' && isCurrent && (
                    <div className="mt-2 p-2 bg-purple-950/40 border border-purple-800/40 rounded-xl flex items-center justify-between">
                      <span className="text-[10px] text-purple-300">Sanction Letter generated</span>
                      <button
                        onClick={() => setShowSanctionPreview(true)}
                        className="px-2 py-0.5 bg-purple-600 hover:bg-purple-500 text-white rounded text-[10px] font-bold"
                      >
                        Preview & E-Sign
                      </button>
                    </div>
                  )}

                  {step.stage === 'disbursed' && isPast && (
                    <div className="mt-2 p-2 bg-emerald-950/60 border border-emerald-800/60 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-[11px] text-emerald-300 font-medium">
                        <Wallet className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Transferred to DhanSetu Wallet</span>
                      </div>
                      <button
                        onClick={() => {
                          onClose();
                          setActiveTab('wallet');
                        }}
                        className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[10px] font-bold"
                      >
                        View Wallet
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Real-time progression simulator button */}
        {!isDisbursed && (
          <div className="pt-3 border-t border-slate-800 space-y-2">
            <button
              onClick={handleAdvanceStage}
              disabled={isSimulating}
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSimulating ? (
                <>
                  <RotateCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Advancing Real-time Engine...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Simulate Next Approval Step</span>
                </>
              )}
            </button>
            <span className="text-[10px] text-slate-500 block text-center">
              Demonstrates automatic real-time loan underwriting pipeline
            </span>
          </div>
        )}

        {/* Digital Sanction Letter Modal */}
        {showSanctionPreview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90">
            <div className="w-full max-w-xs bg-slate-900 border border-slate-700 rounded-2xl p-4 text-xs space-y-2.5">
              <div className="text-center pb-2 border-b border-slate-800">
                <span className="text-emerald-400 font-bold text-xs">DHANSETU NBFC PARTNERS</span>
                <h4 className="text-sm font-bold text-white">Digital Loan Sanction Letter</h4>
                <span className="text-[10px] text-slate-400 font-mono">Ref: {activeApplication.sanctionLetterId}</span>
              </div>

              <div className="space-y-1.5 text-slate-300 text-[11px]">
                <p><strong>Borrower:</strong> {user?.fullName}</p>
                <p><strong>Loan Amount:</strong> ₹{activeApplication.requestedAmount.toLocaleString('en-IN')}</p>
                <p><strong>Interest Rate:</strong> {activeApplication.interestRate}% p.a.</p>
                <p><strong>Monthly EMI:</strong> ₹{activeApplication.monthlyEmi.toLocaleString('en-IN')}</p>
                <p><strong>Tenure:</strong> {activeApplication.tenureMonths} Months</p>
                <p><strong>Processing Fee:</strong> ₹{activeApplication.processingFee.toLocaleString('en-IN')}</p>
              </div>

              <div className="p-2 bg-emerald-950/60 rounded-lg border border-emerald-800/40 text-[10px] text-emerald-300 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Digitally verified via Aadhaar e-Sign protocol.</span>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  onClick={() => {
                    setShowSanctionPreview(false);
                    handleAdvanceStage();
                  }}
                  className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs"
                >
                  Confirm & e-Sign
                </button>
                <button
                  onClick={() => setShowSanctionPreview(false)}
                  className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg text-xs"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
