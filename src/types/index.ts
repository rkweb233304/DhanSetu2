export type UserRole = 'customer' | 'retailer' | 'admin';

export interface KYCDocuments {
  selfieUrl?: string;
  selfieCapturedAt?: string;
  aadharFrontUrl?: string;
  aadharBackUrl?: string;
  aadharNumber?: string;
  aadharStatus: 'pending' | 'submitted' | 'verified' | 'rejected';
  panUrl?: string;
  panNumber?: string;
  panStatus: 'pending' | 'submitted' | 'verified' | 'rejected';
  
  // New Fields
  fullName?: string;
  fatherName?: string;
  motherName?: string;
  address?: string;
  state?: string;
  nomineeName?: string;
  nomineeMobile?: string;
  nomineeRelation?: string;
  guarantorName?: string;
  guarantorMobile?: string;
  guarantorRelation?: string;
  
  overallStatus: 'not_started' | 'submitted' | 'in_review' | 'verified' | 'rejected';
  verifiedAt?: string;
  rejectionReason?: string;
}

export interface UserProfile {
  id: string;
  customerId: string; // Format: DSYYYYMMDD01 e.g. DS2026102401
  role?: UserRole; // 'customer' or 'retailer'
  retailerId?: string; // e.g. RT-DHAN-9021
  retailerStoreName?: string; // e.g. DhanSetu Partner Store
  email: string;
  fullName: string;
  phoneNumber: string;
  monthlyIncome: number;
  employmentType: 'Salaried' | 'Self-Employed' | 'Business';
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  isFirstTimeLogin: boolean;
  kycCompleted: boolean;
  kyc: KYCDocuments;
  createdAt: string;
}

export interface LoanOffer {
  id: string;
  title: string;
  category: 'instant' | 'personal' | 'flexi' | 'education';
  minAmount: number;
  maxAmount: number;
  minTenureMonths: number;
  maxTenureMonths: number;
  interestRatePerAnnum: number; // e.g. 11.5 for 11.5%
  processingFeePercent: number; // e.g. 1.5%
  tag: string;
  description: string;
  features: string[];
  recommended?: boolean;
}

export type ApplicationStage = 
  | 'submitted'
  | 'retailer_review'
  | 'document_verification'
  | 'credit_assessment'
  | 'sanction_issued'
  | 'approved'
  | 'disbursed'
  | 'rejected';

export interface LoanApplication {
  id: string;
  customerId?: string;
  customerName?: string;
  customerMobile?: string;
  customerCibil?: number;
  customerEmployment?: string;
  customerBank?: string;
  loanId: string;
  loanTitle: string;
  requestedAmount: number;
  tenureMonths: number;
  interestRate: number;
  monthlyEmi: number;
  totalInterest: number;
  processingFee: number;
  netDisbursalAmount: number;
  purpose: string;
  appliedAt: string;
  currentStage: ApplicationStage;
  stageProgress: number; // 0 to 100
  disbursementTxId?: string;
  sanctionLetterId?: string;
  retailerStatus?: 'pending' | 'approved' | 'rejected';
  retailerId?: string;
  retailerName?: string;
  retailerApprovedAt?: string;
  rejectionReason?: string;
  disbursalChannel?: 'wallet' | 'bank';
  history: {
    stage: ApplicationStage;
    title: string;
    description: string;
    timestamp: string;
    completed: boolean;
  }[];
}

export interface ActiveLoan {
  id: string;
  customerId?: string;
  loanNumber: string;
  title: string;
  originalAmount: number;
  outstandingBalance: number;
  monthlyEmi: number;
  interestRate: number;
  totalEmis: number;
  paidEmis: number;
  nextEmiDate: string;
  startDate: string;
  status: 'active' | 'closed' | 'overdue';
}

export interface PaymentRecord {
  id: string;
  customerId?: string;
  userId?: string;
  loanId: string;
  loanTitle: string;
  amount: number;
  paymentType?: 'emi' | 'custom' | 'full';
  emiNumber: number;
  totalEmis: number;
  paymentDate: string;
  paymentMethod: 'UPI' | 'DhanSetu Wallet' | 'Net Banking' | 'Debit Card';
  referenceId: string;
  status: 'success' | 'pending' | 'failed';
}

export interface WalletTransaction {
  id: string;
  type: 'credit' | 'debit';
  category: 'loan_disbursal' | 'add_money' | 'emi_payment' | 'bank_withdrawal' | 'cashback';
  amount: number;
  description: string;
  timestamp: string;
  referenceId: string;
  status: 'success' | 'pending' | 'failed';
  balanceAfter: number;
}

export interface SupabaseConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  isConnected: boolean;
  storageBucket: string;
}
