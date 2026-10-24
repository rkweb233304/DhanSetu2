import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Sparkles, 
  CreditCard,
  Play,
  RotateCw,
  Percent,
  Check
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

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

  const handleAdvanceStage = async () => {
    setIsSimulating(true);
    await simulateNextApplicationStage(activeApplication.id);
    setIsSimulating(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-sm bg-white border border-slate-200 rounded-3xl p-5 shadow-2xl text-slate-900 max-h-[92vh] overflow-y-auto no-scrollbar flex flex-col relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-ping" />
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">Real-Time Approval Tracker</h2>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">App ID: #{activeApplication.id}</span>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Loan Brief Header Card with Percentile */}
        <div className="my-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] text-slate-500 block">{activeApplication.loanTitle}</span>
              <span className="text-lg font-extrabold text-slate-900 font-mono">
                ₹{activeApplication.requestedAmount.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="text-right">
              {/* Highlighted Percentile Badge */}
              <div className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 border border-emerald-300 rounded-xl text-emerald-800 font-extrabold text-xs shadow-xs">
                <Percent className="w-3 h-3" />
                <span>{activeApplication.stageProgress}% Completed</span>
              </div>
              <span className="text-[10px] text-slate-500 block mt-1">
                EMI: ₹{activeApplication.monthlyEmi.toLocaleString('en-IN')} / mo
              </span>
            </div>
          </div>

          <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden mt-3 p-0.5">
            <div 
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500 rounded-full"
              style={{ width: `${activeApplication.stageProgress}%` }}
            />
          </div>
        </div>

        {/* PIPELINE STAGES TIMELINE */}
        <div className="space-y-3.5 my-2 flex-1">
          {activeApplication.history.map((step, index) => {
            const isCurrent = step.stage === activeApplication.currentStage;
            const isPast = step.completed;

            const stagePercentMap: Record<string, string> = {
              submitted: '20%',
              document_verification: '45%',
              credit_assessment: '70%',
              sanction_issued: '90%',
              disbursed: '100%'
            };

            return (
              <div key={step.stage} className="flex items-start gap-3 relative">
                {/* Connecting Line */}
                {index < activeApplication.history.length - 1 && (
                  <div 
                    className={`absolute left-3.5 top-6 bottom-0 w-0.5 -ml-[1px] ${
                      isPast ? 'bg-emerald-500' : 'bg-slate-200'
                    }`} 
                  />
                )}

                {/* Circle Icon */}
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 z-10 transition-colors ${
                  isPast 
                    ? 'bg-emerald-600 text-white font-bold' 
                    : isCurrent 
                    ? 'bg-sky-100 text-sky-700 ring-2 ring-sky-500' 
                    : 'bg-slate-100 text-slate-400'
                }`}>
                  {isPast ? (
                    <Check className="w-4 h-4 stroke-[3]" />
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
                      isCurrent ? 'text-sky-800' : isPast ? 'text-slate-900' : 'text-slate-500'
                    }`}>
                      {step.title}
                    </h4>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                      {stagePercentMap[step.stage] || ''}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                    {step.description}
                  </p>

                  {/* Stage-specific interactive action banner */}
                  {step.stage === 'sanction_issued' && isCurrent && (
                    <div className="mt-2 p-2 bg-purple-50 border border-purple-200 rounded-xl flex items-center justify-between">
                      <span className="text-[10px] text-purple-900 font-medium">Digital sanction letter ready</span>
                      <button
                        onClick={() => setShowSanctionPreview(true)}
                        className="px-2.5 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-[10px] font-bold cursor-pointer"
                      >
                        Preview & E-Sign
                      </button>
                    </div>
                  )}

                  {step.stage === 'disbursed' && isPast && (
                    <div className="mt-2 p-2 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-[11px] text-emerald-800 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Disbursal Completed (100% Percentile)</span>
                      </div>
                      <button
                        onClick={() => {
                          onClose();
                          setActiveTab('payments');
                        }}
                        className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[10px] font-bold cursor-pointer"
                      >
                        View Payments
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
          <div className="pt-3 border-t border-slate-200 space-y-2">
            <button
              onClick={handleAdvanceStage}
              disabled={isSimulating}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSimulating ? (
                <>
                  <RotateCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Advancing Approval Engine...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Simulate Next Approval Step</span>
                </>
              )}
            </button>
            <span className="text-[10px] text-slate-500 block text-center">
              Real-time loan underwriting pipeline (Advances percentile towards 100%)
            </span>
          </div>
        )}

        {/* Digital Sanction Letter Modal */}
        {showSanctionPreview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70">
            <div className="w-full max-w-xs bg-white border border-slate-200 rounded-2xl p-4 text-xs space-y-2.5 shadow-2xl">
              <div className="text-center pb-2 border-b border-slate-200">
                <span className="text-emerald-700 font-bold text-xs uppercase tracking-wider">DHANSETU NBFC PARTNER</span>
                <h4 className="text-sm font-bold text-slate-900">Digital Loan Sanction Letter</h4>
                <span className="text-[10px] text-slate-500 font-mono">Ref: {activeApplication.sanctionLetterId}</span>
              </div>

              <div className="space-y-1.5 text-slate-700 text-[11px]">
                <p><strong>Customer ID:</strong> <span className="font-mono font-bold text-emerald-800">{user?.customerId || 'DS2026102401'}</span></p>
                <p><strong>Borrower:</strong> {user?.fullName}</p>
                <p><strong>Loan Amount:</strong> ₹{activeApplication.requestedAmount.toLocaleString('en-IN')}</p>
                <p><strong>Interest Rate:</strong> {activeApplication.interestRate}% p.a.</p>
                <p><strong>Monthly EMI:</strong> ₹{activeApplication.monthlyEmi.toLocaleString('en-IN')}</p>
                <p><strong>Tenure:</strong> {activeApplication.tenureMonths} Months</p>
                <p><strong>Processing Fee:</strong> ₹{activeApplication.processingFee.toLocaleString('en-IN')}</p>
              </div>

              <div className="p-2 bg-emerald-50 rounded-lg border border-emerald-200 text-[10px] text-emerald-800 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Digitally verified via Aadhaar e-Sign protocol.</span>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  onClick={() => {
                    setShowSanctionPreview(false);
                    handleAdvanceStage();
                  }}
                  className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs cursor-pointer"
                >
                  Confirm & e-Sign
                </button>
                <button
                  onClick={() => setShowSanctionPreview(false)}
                  className="px-3 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-xs cursor-pointer"
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
