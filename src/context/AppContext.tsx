import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  UserProfile, 
  LoanOffer, 
  ActiveLoan, 
  PaymentRecord, 
  WalletTransaction, 
  LoanApplication,
  SupabaseConfig,
  ApplicationStage
} from '../types';
import { 
  supabaseService, 
  INITIAL_LOAN_OFFERS 
} from '../services/supabaseService';

export type TabType = 'home' | 'loans' | 'payments' | 'wallet' | 'profile' | 'kyc' | 'retailer';
export type DeviceFrameType = 'ios' | 'android' | 'fullscreen';

interface AppContextType {
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;
  logout: () => void;
  userRole: 'customer' | 'retailer';
  setUserRole: (role: 'customer' | 'retailer') => void;
  toggleUserRole: () => void;
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  deviceFrame: DeviceFrameType;
  setDeviceFrame: (frame: DeviceFrameType) => void;
  
  // KYC
  updateUserKYC: (kycData: Partial<UserProfile['kyc']>) => Promise<void>;
  
  // Loans & Dashboard
  activeLoans: ActiveLoan[];
  loanOffers: LoanOffer[];
  payments: PaymentRecord[];
  payEmi: (loanId: string, amount: number, paymentMethod: PaymentRecord['paymentMethod'], payType?: 'emi' | 'custom' | 'full', customRefId?: string) => Promise<void> | void;
  
  // Applications & Real-time tracking
  applications: LoanApplication[];
  pendingApplicationsCount: number;
  activeApplication: LoanApplication | null;
  setActiveApplication: (app: LoanApplication | null) => void;
  applyForLoan: (offer: LoanOffer, amount: number, tenure: number, purpose: string) => Promise<LoanApplication>;
  simulateNextApplicationStage: (applicationId: string) => Promise<void>;
  
  // Retailer Portal Actions
  approveLoanByRetailer: (applicationId: string, channel?: 'wallet' | 'bank') => Promise<void>;
  rejectLoanByRetailer: (applicationId: string, reason: string) => Promise<void>;
  
  // Wallet
  walletBalance: number;
  walletTransactions: WalletTransaction[];
  addMoneyToWallet: (amount: number, source: string) => Promise<void>;
  withdrawToBank: (amount: number) => Promise<boolean>;
  
  // Supabase Settings
  supabaseConfig: SupabaseConfig;
  updateSupabaseConfig: (config: Partial<SupabaseConfig>) => void;
  
  // Notifications & Modals
  authModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
  authMode: 'login' | 'register' | 'forgot_password';
  setAuthMode: (mode: 'login' | 'register' | 'forgot_password') => void;
  unreadNotificationsCount: number;
  resetNotifications: () => void;
  toastMessage: { text: string; type: 'success' | 'info' | 'warning' | 'error' } | null;
  showToast: (text: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUserState] = useState<UserProfile | null>(() => supabaseService.getUser());
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [deviceFrame, setDeviceFrame] = useState<DeviceFrameType>('fullscreen');
  
  const [activeLoans, setActiveLoans] = useState<ActiveLoan[]>(() => supabaseService.getActiveLoans());
  const [loanOffers] = useState<LoanOffer[]>(INITIAL_LOAN_OFFERS);
  const [payments, setPayments] = useState<PaymentRecord[]>(() => supabaseService.getPaymentHistory());
  const [applications, setApplications] = useState<LoanApplication[]>(() => supabaseService.getApplications());
  const [activeApplication, setActiveApplication] = useState<LoanApplication | null>(null);
  
  const [walletBalance, setWalletBalance] = useState<number>(() => supabaseService.getWalletBalance());
  const [walletTransactions] = useState<WalletTransaction[]>([]);
  
  const [supabaseConfig, setSupabaseConfigState] = useState<SupabaseConfig>(() => supabaseService.getConfig());
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(!user);
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot_password'>('login');
  const [unreadNotificationsCount] = useState<number>(0);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'warning' | 'error' } | null>(null);

  useEffect(() => {
    if (applications.length > 0 && !activeApplication) {
      setActiveApplication(applications[0]);
    }
  }, [applications]);

  const showToast = (text: string, type: 'success' | 'info' | 'warning' | 'error' = 'info') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage((prev) => (prev?.text === text ? null : prev));
    }, 4000);
  };

  const setUser = (newUser: UserProfile | null) => {
    setUserState(newUser);
    if (newUser) {
      supabaseService.saveUser(newUser);
    } else {
      localStorage.removeItem('dhansetu_user');
    }
  };

  const logout = () => {
    setUser(null);
    setActiveTab('home');
    setAuthMode('login');
    showToast('You have been logged out securely.', 'info');
  };

  const updateUserKYC = async (kycData: Partial<UserProfile['kyc']>) => {
    const updated = await supabaseService.updateKYC(kycData);
    setUserState(updated);
    showToast('KYC documents linked to Supabase successfully', 'success');
  };

  const payEmi = async (
    loanId: string, 
    amount: number, 
    paymentMethod: PaymentRecord['paymentMethod'],
    payType: 'emi' | 'custom' | 'full' = 'emi',
    customRefId?: string
  ) => {
    const loan = activeLoans.find(l => l.id === loanId);
    if (!loan) return;

    if (paymentMethod === 'DhanSetu Wallet' && walletBalance < amount) {
      showToast('Insufficient wallet balance. Please add money first.', 'error');
      return;
    }

    if (paymentMethod === 'DhanSetu Wallet') {
      const newBal = Math.max(0, walletBalance - amount);
      setWalletBalance(newBal);
      await supabaseService.setWalletBalance(newBal);
    }

    const newPaidEmis = loan.paidEmis + 1;
    const newBalance = Math.max(0, loan.outstandingBalance - amount);
    const updatedLoans = activeLoans.map(l => l.id === loanId ? {
      ...l,
      paidEmis: newPaidEmis,
      outstandingBalance: newBalance,
      status: newPaidEmis >= l.totalEmis || newBalance <= 0 ? ('closed' as const) : ('active' as const)
    } : l);

    setActiveLoans(updatedLoans);
    await supabaseService.saveActiveLoanToTable({
      ...loan,
      paidEmis: newPaidEmis,
      outstandingBalance: newBalance,
      status: newPaidEmis >= loan.totalEmis || newBalance <= 0 ? 'closed' : 'active'
    });

    // Record payment in Supabase payments table
    const refId = customRefId?.trim() || `TXN-DS-${Math.floor(10000000 + Math.random() * 90000000)}`;
    const newPayment: PaymentRecord = {
      id: `PAY-${Date.now()}`,
      userId: user?.id,
      loanId: loan.id,
      loanTitle: loan.title,
      amount: amount,
      paymentType: payType,
      emiNumber: newPaidEmis,
      totalEmis: loan.totalEmis,
      paymentDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      paymentMethod: paymentMethod,
      referenceId: refId,
      status: 'success'
    };

    await supabaseService.savePaymentToTable(newPayment);
    setPayments(supabaseService.getPaymentHistory());
    showToast(`Payment of ₹${amount.toLocaleString('en-IN')} confirmed & saved to Supabase!`, 'success');
  };

  const [userRole, setUserRoleState] = useState<'customer' | 'retailer'>(() => {
    const saved = localStorage.getItem('dhansetu_user_role');
    if (saved === 'retailer' || saved === 'customer') return saved;
    return user?.role === 'retailer' ? 'retailer' : 'customer';
  });

  const setUserRole = (role: 'customer' | 'retailer') => {
    setUserRoleState(role);
    localStorage.setItem('dhansetu_user_role', role);
    showToast(`Switched to ${role === 'retailer' ? 'Retailer Partner Portal' : 'Customer App'}`, 'info');
  };

  const toggleUserRole = () => {
    const nextRole = userRole === 'customer' ? 'retailer' : 'customer';
    setUserRole(nextRole);
  };

  const pendingApplicationsCount = applications.filter(
    a => a.retailerStatus === 'pending' || a.currentStage === 'submitted' || a.currentStage === 'retailer_review'
  ).length;

  const applyForLoan = async (offer: LoanOffer, amount: number, tenure: number, purpose: string): Promise<LoanApplication> => {
    const monthlyInterestRate = (offer.interestRatePerAnnum / 12) / 100;
    const emi = Math.round(
      (amount * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, tenure)) /
      (Math.pow(1 + monthlyInterestRate, tenure) - 1)
    );
    const totalAmount = emi * tenure;
    const totalInterest = totalAmount - amount;
    const processingFee = Math.round((amount * offer.processingFeePercent) / 100);
    const netDisbursal = amount - processingFee;

    const appId = `DS-APP-${Date.now().toString().slice(-6)}`;
    const newApp: LoanApplication = {
      id: appId,
      customerId: user?.customerId || 'DS2026102401',
      customerName: user?.fullName || 'Valued Customer',
      customerMobile: user?.phoneNumber || '+91 9876543210',
      customerCibil: user?.cibilScore || 750,
      customerEmployment: user?.employmentType || 'Salaried',
      customerBank: `${user?.bankName || 'State Bank of India'} (${user?.accountNumber || '••••4892'})`,
      loanId: offer.id,
      loanTitle: offer.title,
      requestedAmount: amount,
      tenureMonths: tenure,
      interestRate: offer.interestRatePerAnnum,
      monthlyEmi: emi,
      totalInterest,
      processingFee,
      netDisbursalAmount: netDisbursal,
      purpose: purpose || 'Personal Requirement',
      appliedAt: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      currentStage: 'submitted',
      stageProgress: 30,
      retailerStatus: 'pending',
      sanctionLetterId: `SANCTION-DS-${Math.floor(100000 + Math.random() * 900000)}`,
      history: [
        {
          stage: 'submitted',
          title: 'Loan Request Submitted',
          description: 'Normal user submitted loan application. Queued for Retailer review.',
          timestamp: 'Just now',
          completed: true
        },
        {
          stage: 'retailer_review',
          title: 'Retailer Review & Approval',
          description: 'Waiting for authorized DhanSetu Retailer to inspect and approve.',
          timestamp: 'Pending Review',
          completed: false
        },
        {
          stage: 'sanction_issued',
          title: 'Sanction Letter Issued',
          description: 'Digital agreement approved by Retailer underwriting.',
          timestamp: 'Pending',
          completed: false
        },
        {
          stage: 'disbursed',
          title: 'Instant Loan Disbursement',
          description: 'Net loan funds transferred to DhanSetu Wallet upon Retailer sign-off.',
          timestamp: 'Pending',
          completed: false
        }
      ]
    };

    await supabaseService.saveApplicationToTable(newApp);
    setApplications(supabaseService.getApplications());
    setActiveApplication(newApp);
    showToast(`Loan request submitted to Retailer! Application #${appId}`, 'success');
    return newApp;
  };

  const approveLoanByRetailer = async (applicationId: string, channel: 'wallet' | 'bank' = 'wallet') => {
    const app = applications.find(a => a.id === applicationId);
    if (!app) return;

    const updatedHistory = app.history.map(h => ({
      ...h,
      completed: true,
      timestamp: h.stage === 'retailer_review' ? 'Approved by Retailer just now' : h.timestamp
    }));

    const updatedApp: LoanApplication = {
      ...app,
      currentStage: 'disbursed',
      stageProgress: 100,
      retailerStatus: 'approved',
      retailerApprovedAt: new Date().toISOString(),
      retailerId: user?.retailerId || 'RT-DHAN-9021',
      retailerName: user?.retailerStoreName || 'DhanSetu Partner Retailer',
      disbursalChannel: channel,
      history: updatedHistory
    };

    // Save applications
    const currentApps = supabaseService.getApplications();
    const updatedApps = currentApps.map(a => a.id === applicationId ? updatedApp : a);
    supabaseService.saveApplications(updatedApps);
    setApplications(updatedApps);
    if (activeApplication?.id === applicationId) {
      setActiveApplication(updatedApp);
    }

    // 1. Create Active Loan for the customer
    const newActiveLoan: ActiveLoan = {
      id: `loan-act-${Date.now()}`,
      customerId: app.customerId || user?.customerId || 'DS2026102401',
      loanNumber: `DS-LN-${Date.now().toString().slice(-6)}`,
      title: app.loanTitle,
      originalAmount: app.requestedAmount,
      outstandingBalance: app.requestedAmount,
      monthlyEmi: app.monthlyEmi,
      interestRate: app.interestRate,
      totalEmis: app.tenureMonths,
      paidEmis: 0,
      nextEmiDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }),
      startDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      status: 'active'
    };

    await supabaseService.saveActiveLoanToTable(newActiveLoan);
    setActiveLoans(supabaseService.getActiveLoans());

    // 2. Disburse money into customer wallet
    if (channel === 'wallet') {
      const newBal = walletBalance + app.netDisbursalAmount;
      setWalletBalance(newBal);
      await supabaseService.setWalletBalance(newBal);
    }

    showToast(`✓ Loan #${app.id} for Customer ${app.customerId || 'DS...'} APPROVED & Disbursed!`, 'success');
  };

  const rejectLoanByRetailer = async (applicationId: string, reason: string) => {
    const app = applications.find(a => a.id === applicationId);
    if (!app) return;

    const updatedApp: LoanApplication = {
      ...app,
      currentStage: 'rejected',
      stageProgress: 0,
      retailerStatus: 'rejected',
      retailerApprovedAt: new Date().toISOString(),
      rejectionReason: reason || 'Application not eligible under Retailer Credit Policy'
    };

    const currentApps = supabaseService.getApplications();
    const updatedApps = currentApps.map(a => a.id === applicationId ? updatedApp : a);
    supabaseService.saveApplications(updatedApps);
    setApplications(updatedApps);
    if (activeApplication?.id === applicationId) {
      setActiveApplication(updatedApp);
    }

    showToast(`Loan application #${app.id} REJECTED by Retailer. Reason: ${reason}`, 'error');
  };

  const simulateNextApplicationStage = async (applicationId: string) => {
    // If not approved by retailer yet, prompt user
    const app = applications.find(a => a.id === applicationId);
    if (!app) return;

    if (app.retailerStatus === 'pending') {
      showToast('⚠️ Waiting for Retailer Approval! Normal users cannot self-approve.', 'warning');
      return;
    }
  };

  const addMoneyToWallet = async (amount: number, source: string) => {
    const newBal = walletBalance + amount;
    setWalletBalance(newBal);
    await supabaseService.setWalletBalance(newBal);
    showToast(`₹${amount.toLocaleString('en-IN')} added via ${source} & saved to Supabase table!`, 'success');
  };

  const withdrawToBank = async (amount: number): Promise<boolean> => {
    if (walletBalance < amount) {
      showToast('Insufficient balance in wallet', 'error');
      return false;
    }
    const newBal = walletBalance - amount;
    setWalletBalance(newBal);
    await supabaseService.setWalletBalance(newBal);
    showToast(`₹${amount.toLocaleString('en-IN')} transferred to bank successfully!`, 'success');
    return true;
  };

  const updateSupabaseConfig = (cfg: Partial<SupabaseConfig>) => {
    const updated = supabaseService.saveConfig(cfg);
    setSupabaseConfigState(updated);
    showToast('Supabase settings updated', 'success');
  };

  const resetNotifications = () => {};

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        logout,
        userRole,
        setUserRole,
        toggleUserRole,
        activeTab,
        setActiveTab,
        deviceFrame,
        setDeviceFrame,
        updateUserKYC,
        activeLoans,
        loanOffers,
        payments,
        payEmi,
        applications,
        pendingApplicationsCount,
        activeApplication,
        setActiveApplication,
        applyForLoan,
        simulateNextApplicationStage,
        approveLoanByRetailer,
        rejectLoanByRetailer,
        walletBalance,
        walletTransactions,
        addMoneyToWallet,
        withdrawToBank,
        supabaseConfig,
        updateSupabaseConfig,
        authModalOpen,
        setAuthModalOpen,
        authMode,
        setAuthMode,
        unreadNotificationsCount,
        resetNotifications,
        toastMessage,
        showToast
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
