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
  const [applications, setApplications] = useState<LoanApplication[]>([]);
  const [activeApplication, setActiveApplication] = useState<LoanApplication | null>(null);

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
        payEmi: () => {},
        applications,
        pendingApplicationsCount: 0,
        activeApplication,
        setActiveApplication,
        applyForLoan: async () => ({} as any),
        simulateNextApplicationStage: async () => {},
        approveLoanByRetailer: async () => {},
        rejectLoanByRetailer: async () => {},
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
