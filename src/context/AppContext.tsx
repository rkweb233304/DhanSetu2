import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  UserProfile, 
  LoanOffer, 
  ActiveLoan, 
  PaymentRecord, 
  WalletTransaction, 
  LoanApplication,
  SupabaseConfig,
  ApplicationStage,
  UserRole
} from '../types';
import { 
  supabaseService, 
  INITIAL_LOAN_OFFERS 
} from '../services/supabaseService';

export type TabType = 
  | 'home' 
  | 'active-loan' 
  | 'payments' 
  | 'profile' 
  | 'admin-home' 
  | 'admin-users' 
  | 'admin-applications' 
  | 'admin-payments' 
  | 'kyc';
export type DeviceFrameType = 'ios' | 'android' | 'fullscreen';

interface AppContextType {
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;
  logout: () => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  toggleUserRole: () => void;
  adminStats: {
    totalUsers: number;
    totalActiveLoans: number;
    totalGivenAmount: number;
    totalRecovered: number;
  };
  fetchAdminStats: () => Promise<void>;
  updateUserRole: (customerId: string, newRole: UserRole) => Promise<void>;
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  deviceFrame: DeviceFrameType;
  setDeviceFrame: (frame: DeviceFrameType) => void;
  
  // KYC
  updateUserKYC: (kycData: Partial<UserProfile['kyc']>) => Promise<void>;
  kycRequests: any[];
  fetchKycRequests: () => Promise<void>;
  approveKYC: (customerId: string, allotmentAmount: number) => Promise<void>;
  
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
  approveLoanByRetailer: (applicationId: string, channel?: 'upi' | 'bank') => Promise<void>;
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
  
  const [payments, setPayments] = useState<PaymentRecord[]>(() => supabaseService.getPaymentHistory());
  
  const [walletBalance, setWalletBalance] = useState<number>(() => supabaseService.getWalletBalance());
  const [walletTransactions] = useState<WalletTransaction[]>([]);
  
  const [supabaseConfig, setSupabaseConfigState] = useState<SupabaseConfig>(() => supabaseService.getConfig());
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(!user);
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot_password'>('login');
  const [unreadNotificationsCount] = useState<number>(0);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'warning' | 'error' } | null>(null);
  const [activeLoans, setActiveLoans] = useState<ActiveLoan[]>([]);
  const [loanOffers, setLoanOffers] = useState<LoanOffer[]>([]);
  const [applications, setApplications] = useState<LoanApplication[]>(() => supabaseService.getApplications());
  const [activeApplication, setActiveApplication] = useState<LoanApplication | null>(null);
  const [kycRequests, setKycRequests] = useState<any[]>([]);
  
  const [userRole, setUserRoleState] = useState<UserRole>(() => {
    const saved = localStorage.getItem('dhansetu_user_role');
    if (saved === 'retailer' || saved === 'customer' || saved === 'admin') return saved;
    return user?.role || 'customer';
  });

  const [adminStats, setAdminStats] = useState({
    totalUsers: 0,
    totalActiveLoans: 0,
    totalGivenAmount: 0,
    totalRecovered: 0
  });

  // Sync active application whenever applications change
  useEffect(() => {
    if (applications.length > 0) {
      // Find the most recent or active application for the current user
      const userApps = applications.filter(a => a.customerId === user?.customerId);
      if (userApps.length > 0) {
        setActiveApplication(userApps[0]);
      }
    }
  }, [applications, user?.customerId]);

  // Initial data fetch
  useEffect(() => {
    if (user) {
      fetchKycRequests();
      if (userRole === 'admin') fetchAdminStats();
    }
  }, [user, userRole]);

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
      if (newUser.role === 'admin') {
        setActiveTab('admin-home');
        setUserRoleState('admin');
      } else {
        setActiveTab('home');
        setUserRoleState('customer');
      }
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

  const fetchKycRequests = async () => {
    const res = await supabaseService.fetchPendingKYC();
    setKycRequests(res);
  };

  const approveKYC = async (customerId: string, allotmentAmount: number) => {
    await supabaseService.request(`kyc_documents?customer_id=eq.${customerId}`, 'PATCH', {
      overall_status: 'verified',
      verified_at: new Date().toISOString()
    });
    if (user?.customerId === customerId) {
      const updatedUser = { 
        ...user, 
        kycCompleted: true, 
        kyc: { ...user.kyc, overallStatus: 'verified' as any } 
      };
      setUser(updatedUser);
    }
    const kycReq = kycRequests.find(r => r.customer_id === customerId);
    if (!kycReq) return;
    const newApp: LoanApplication = {
      id: `APP-${Date.now()}`,
      customerId,
      customerName: kycReq.full_name,
      loanId: 'allotted-loan',
      loanTitle: 'Allotted Personal Loan',
      requestedAmount: allotmentAmount,
      tenureMonths: 12,
      interestRate: 12,
      monthlyEmi: Math.round(allotmentAmount / 12),
      totalInterest: 0,
      processingFee: 0,
      netDisbursalAmount: allotmentAmount,
      purpose: 'Allotted by Retailer',
      appliedAt: new Date().toISOString(),
      currentStage: 'approved',
      stageProgress: 100,
      retailerStatus: 'approved',
      history: []
    };
    await supabaseService.saveApplicationToTable(newApp);
    setApplications(prev => [newApp, ...prev]);
    setActiveApplication(newApp);
    showToast(`Loan of ₹${allotmentAmount} allotted successfully!`, 'success');
    await fetchKycRequests();
  };

  const applyForLoan = async (offer: LoanOffer, amount: number, tenure: number, purpose: string): Promise<LoanApplication> => {
    const newApp: LoanApplication = {
      id: `APP-${Date.now()}`,
      customerId: user?.customerId || 'DS_GUEST',
      customerName: user?.fullName || 'User',
      customerMobile: user?.phoneNumber,
      loanId: offer.id,
      loanTitle: offer.title,
      requestedAmount: amount,
      tenureMonths: tenure,
      interestRate: offer.interestRatePerAnnum,
      monthlyEmi: Math.round((amount + (amount * offer.interestRatePerAnnum / 100)) / tenure),
      totalInterest: Math.round(amount * offer.interestRatePerAnnum / 100),
      processingFee: Math.round(amount * offer.processingFeePercent / 100),
      netDisbursalAmount: amount - Math.round(amount * offer.processingFeePercent / 100),
      purpose,
      appliedAt: new Date().toISOString(),
      currentStage: 'submitted',
      stageProgress: 25,
      retailerStatus: 'pending',
      history: [
        {
          stage: 'submitted',
          title: 'Application Submitted',
          description: 'Your loan application has been received and is waiting for retailer review.',
          timestamp: new Date().toISOString(),
          completed: true
        }
      ]
    };
    await supabaseService.saveApplicationToTable(newApp);
    setApplications(prev => [newApp, ...prev]);
    setActiveApplication(newApp);
    showToast('Loan application submitted successfully!', 'success');
    return newApp;
  };

  const approveLoanByRetailer = async (applicationId: string, channel: 'upi' | 'bank' = 'upi') => {
    const app = applications.find(a => a.id === applicationId);
    if (!app) return;
    const updatedApp: LoanApplication = {
      ...app,
      currentStage: 'approved',
      retailerStatus: 'approved',
      retailerApprovedAt: new Date().toISOString(),
      disbursalChannel: channel,
      stageProgress: 100,
      history: [
        ...app.history,
        {
          stage: 'approved',
          title: 'Loan Approved',
          description: `Retailer has approved your loan of ₹${app.requestedAmount.toLocaleString()}. Please complete withdrawal.`,
          timestamp: new Date().toISOString(),
          completed: true
        }
      ]
    };
    await supabaseService.saveApplicationToTable(updatedApp);
    setApplications(prev => prev.map(a => a.id === applicationId ? updatedApp : a));
    showToast('Loan application approved by retailer!', 'success');
  };

  const rejectLoanByRetailer = async (applicationId: string, reason: string) => {
    const app = applications.find(a => a.id === applicationId);
    if (!app) return;
    const updatedApp: LoanApplication = {
      ...app,
      currentStage: 'rejected',
      retailerStatus: 'rejected',
      rejectionReason: reason,
      stageProgress: 100,
      history: [
        ...app.history,
        {
          stage: 'rejected',
          title: 'Application Rejected',
          description: `Reason: ${reason}`,
          timestamp: new Date().toISOString(),
          completed: true
        }
      ]
    };
    await supabaseService.saveApplicationToTable(updatedApp);
    setApplications(prev => prev.map(a => a.id === applicationId ? updatedApp : a));
    showToast('Loan application rejected.', 'info');
  };

  const updateUserKYC = async (kycData: Partial<UserProfile['kyc']>) => {
    const updated = await supabaseService.updateKYC(kycData);
    setUserState(updated);
    if (kycData.overallStatus === 'submitted') {
      showToast('KYC documents submitted for retailer review', 'info');
    }
  };

  const setUserRole = (role: UserRole) => {
    setUserRoleState(role);
    localStorage.setItem('dhansetu_user_role', role);
    showToast(`Switched to ${role === 'retailer' ? 'Retailer Partner' : role === 'admin' ? 'Admin Control' : 'Customer App'}`, 'info');
  };

  const fetchAdminStats = async () => {
    try {
      const users = await supabaseService.request('auth_users', 'GET');
      const activeLoans = await supabaseService.request('active_loans', 'GET');
      const payments = await supabaseService.request('payments', 'GET');
      const totalUsers = users ? users.length : 0;
      const filteredLoans = (activeLoans || []).filter((l: any) => l.status === 'active');
      const totalActiveLoans = filteredLoans.length;
      const totalGivenAmount = filteredLoans.reduce((sum: number, l: any) => sum + Number(l.original_amount), 0);
      const successfulPayments = (payments || []).filter((p: any) => p.status === 'success');
      const totalRecovered = successfulPayments.reduce((sum: number, p: any) => sum + Number(p.amount), 0);
      setAdminStats({
        totalUsers,
        totalActiveLoans,
        totalGivenAmount,
        totalRecovered
      });
    } catch (e) {
      console.warn('Failed to fetch admin stats', e);
    }
  };

  const toggleUserRole = () => {
    const nextRole = userRole === 'customer' ? 'retailer' : 'customer';
    setUserRole(nextRole);
  };

  const updateUserRole = async (customerId: string, newRole: UserRole) => {
    await supabaseService.request(`auth_users?customer_id=eq.${customerId}`, 'PATCH', { role: newRole });
    showToast(`User ${customerId} role updated to ${newRole}`, 'success');
    if (user?.customerId === customerId) {
      setUser({ ...user, role: newRole });
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
        kycRequests,
        fetchKycRequests,
        approveKYC,
        activeLoans,
        loanOffers,
        payments,
        payEmi: () => {},
        applications,
        pendingApplicationsCount: applications.filter(a => a.retailerStatus === 'pending').length,
        activeApplication,
        setActiveApplication,
        applyForLoan,
        simulateNextApplicationStage: async () => {},
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
        showToast,
        adminStats,
        fetchAdminStats,
        updateUserRole
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
