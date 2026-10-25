import React from 'react';
import { Shield, ArrowLeft, CheckCircle2 } from 'lucide-react';

interface TermsAndConditionsProps {
  onClose: () => void;
}

export const TermsAndConditions: React.FC<TermsAndConditionsProps> = ({ onClose }) => {
  return (
    <div className="flex-1 overflow-y-auto no-scrollbar bg-white text-slate-900 flex flex-col p-5 pb-28">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4 shrink-0">
        <button onClick={onClose} className="p-2 -ml-2 text-slate-500 hover:text-slate-900 flex items-center gap-1.5 text-xs font-bold">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="flex items-center gap-1.5">
          <Shield className="w-4 h-4 text-emerald-600" />
          <span className="text-xs font-extrabold text-slate-900 uppercase tracking-widest">Legal</span>
        </div>
      </div>

      <div className="space-y-6 text-xs text-slate-600 leading-relaxed">
        <div className="text-center space-y-1">
          <h1 className="text-xl font-black text-slate-900 tracking-tight">DHANSETU</h1>
          <h2 className="text-sm font-bold text-emerald-700 uppercase">Terms & Conditions</h2>
          <p className="text-[10px] font-medium text-slate-400">Effective Date: 25 October 2026</p>
        </div>

        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 italic">
          Welcome to DhanSetu. These Terms & Conditions (“Terms”) govern your access to and use of the DhanSetu mobile application and related services (“Platform”). By registering or using the Platform, you agree to these Terms.
        </div>

        <section className="space-y-2">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px]">1</span>
            About DhanSetu
          </h3>
          <p>
            DhanSetu provides a digital platform for loan applications and related financial services. Depending on the arrangement, loans may be offered by a bank, Non-Banking Financial Company (NBFC), or another legally authorised lender.
          </p>
          <p>
            The actual lender's legal name and relevant details will be disclosed to the User before acceptance of a loan offer. DhanSetu shall not be represented as the lender unless it legally acts in that capacity.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px]">2</span>
            User Eligibility and Registration
          </h3>
          <p>
            To use DhanSetu, you must meet the applicable eligibility requirements and provide accurate, complete, and up-to-date information.
          </p>
          <p>
            You agree not to use another person's identity, submit false information, or provide forged or misleading documents. You are responsible for maintaining the security of your account and reporting suspected unauthorised access.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px]">3</span>
            Required Documents and Verification
          </h3>
          <div className="space-y-2 pl-7">
            <p>For registration, identity verification, and loan processing, you may be asked to submit the following documents, as applicable:</p>
            <ul className="list-decimal space-y-1 pl-4">
              <li><strong>Selfie Photograph:</strong> A recent photograph for identity verification and, where applicable, liveness verification.</li>
              <li><strong>Aadhaar Card:</strong> Aadhaar details or a legally permitted Aadhaar-based verification method, where applicable. Alternative officially valid documents may be accepted where required or permitted.</li>
              <li><strong>PAN Card:</strong> PAN details or another legally permitted verification method, where applicable.</li>
            </ul>
            <p>Additional documents may be requested when necessary and legally permitted.</p>
            <p>By submitting documents, you confirm that the information provided is accurate and relates to you or that you are otherwise legally authorised to provide it.</p>
            <p>Aadhaar collection, authentication, storage, and use shall comply with applicable Aadhaar laws and UIDAI requirements. Documents shall be protected against unauthorised access and used only for disclosed, lawful purposes.</p>
          </div>
        </section>

        <section className="space-y-2">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px]">4</span>
            Loan Application and Approval
          </h3>
          <p>Submitting a loan application does not guarantee approval or disbursement.</p>
          <p>Loan eligibility, credit assessment, interest rates, loan limits, tenure, and approval decisions are subject to the actual lender's policies and applicable laws.</p>
          <p>Before accepting a loan, you should review the loan offer, Key Facts Statement (KFS), Annual Percentage Rate (APR), applicable charges, repayment schedule, and separate loan agreement.</p>
        </section>

        <section className="space-y-2">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px]">5</span>
            Interest, Fees, and Charges
          </h3>
          <p>The applicable interest rate, processing fee, taxes, repayment obligations, and other permitted charges will be disclosed before loan acceptance.</p>
          <p>No undisclosed or unauthorised charges shall be imposed. Late-payment, penal, prepayment, or foreclosure charges shall apply only as legally permitted and properly disclosed.</p>
        </section>

        <section className="space-y-2">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px]">6</span>
            Loan Repayment
          </h3>
          <p>If your loan application is approved and you accept the loan, you agree to repay the amounts lawfully due according to the applicable loan agreement and repayment schedule.</p>
          <p>You should make payments through authorised payment channels and retain transaction receipts. Applicable statements, payment confirmations, and outstanding balances shall be provided in accordance with the relevant lending arrangements and applicable law.</p>
          <p>Failure to repay may result in lawful recovery action or other consequences disclosed in the loan documents. No unlawful harassment, threats, or unauthorised disclosure of personal information is permitted.</p>
        </section>

        <section className="space-y-2">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px]">7</span>
            Privacy and Personal Information
          </h3>
          <p>DhanSetu may collect and process personal information necessary for registration, identity verification, loan processing, customer support, fraud prevention, and legal or regulatory compliance.</p>
          <p>Where legally permitted or required, information may be shared with the actual lender, authorised service providers, verification partners, and competent authorities.</p>
          <p>Personal information shall be handled in accordance with the DhanSetu Privacy Policy and applicable Indian data-protection laws. Required consents shall be obtained where applicable. Acceptance of these Terms does not automatically constitute consent to every optional data-processing activity.</p>
        </section>

        <section className="space-y-2">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px]">8</span>
            Electronic Records and Communication
          </h3>
          <p>DhanSetu may send service-related notifications, application updates, loan documents, and repayment reminders through the contact channels provided by you, subject to applicable law.</p>
          <p>Electronic signing shall follow the applicable legal requirements and the signing process offered by the lender or authorised service provider. OTP verification alone shall not automatically be treated as a legally sufficient signature for every document.</p>
          <p>Where applicable, a copy of the executed loan agreement and required disclosures shall be made available to you.</p>
        </section>

        <section className="space-y-2">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px]">9</span>
            User Responsibilities
          </h3>
          <ul className="list-disc space-y-1 pl-7">
            <li>Provide truthful and accurate information.</li>
            <li>Submit genuine documents.</li>
            <li>Keep your account credentials confidential.</li>
            <li>Use the Platform only for lawful purposes.</li>
            <li>Avoid fraudulent applications or unauthorised transactions.</li>
            <li>Review loan terms before accepting a loan.</li>
            <li>Notify the relevant support team of suspected fraud, errors, or unauthorised activity.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px]">10</span>
            Platform Availability
          </h3>
          <p>DhanSetu will make reasonable efforts to maintain the security and availability of the Platform. Temporary interruptions may occur because of maintenance, technical issues, or third-party service failures.</p>
        </section>

        <section className="space-y-2 border-t border-slate-100 pt-4">
          <h3 className="text-sm font-bold text-slate-900">Complaints and Customer Support</h3>
          <div className="space-y-1.5 text-slate-500">
            <p><strong>Support Email:</strong> support@dhansetu.in</p>
            <p><strong>Support Phone:</strong> 1800-889-7388</p>
            <p><strong>Registered Business Address:</strong> DhanSetu FinTech Tower, G-Block, BKC, Bandra East, Mumbai 400051</p>
          </div>
        </section>

        <section className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 space-y-3">
          <h3 className="text-sm font-bold text-emerald-950">15. User Acceptance</h3>
          <p className="text-emerald-900">By using this application, you confirm that:</p>
          <ul className="space-y-1.5 text-emerald-900 list-decimal pl-4">
            <li>You have had the opportunity to read and understand these Terms.</li>
            <li>You understand the document requirements applicable to your application.</li>
            <li>You understand that loan approval is not guaranteed.</li>
            <li>You agree to use the Platform in accordance with these Terms.</li>
          </ul>
          
          <div className="mt-4 pt-3 border-t border-emerald-200 text-[10px] space-y-1">
            <p className="font-bold uppercase tracking-wider text-emerald-800">Digital Acceptance Record</p>
            <div className="flex justify-between">
              <span>Agreement Version:</span>
              <span className="font-mono font-bold">V2.4.2026</span>
            </div>
            <div className="flex justify-between">
              <span>Status:</span>
              <span className="font-bold text-emerald-700 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Accepted</span>
            </div>
          </div>
        </section>

        <div className="text-center py-4 border-t border-slate-100">
          <p className="text-[10px] font-bold text-slate-400">DhanSetu — Digital Loan Services</p>
        </div>
      </div>
    </div>
  );
};
