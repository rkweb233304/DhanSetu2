import { 
  UserProfile, 
  LoanOffer, 
  ActiveLoan, 
  PaymentRecord, 
  WalletTransaction, 
  LoanApplication,
  SupabaseConfig 
} from '../types';

const STORAGE_KEYS = {
  USER: 'dhansetu_user',
  ACTIVE_LOANS: 'dhansetu_active_loans',
  WALLET_BALANCE: 'dhansetu_wallet_balance',
  APPLICATIONS: 'dhansetu_applications',
  SUPABASE_CONFIG: 'dhansetu_supabase_config'
};

export const INITIAL_LOAN_OFFERS: LoanOffer[] = [
  {
    id: 'offer-prime-personal',
    title: 'DhanSetu Prime Personal Loan',
    category: 'personal',
    minAmount: 50000,
    maxAmount: 500000,
    minTenureMonths: 6,
    maxTenureMonths: 36,
    interestRatePerAnnum: 10.75,
    processingFeePercent: 1.5,
    tag: 'Pre-Approved Special',
    description: 'Lowest interest rates for salaried individuals with instant bank transfer upon verification.',
    features: ['Instant digital approval', 'Zero prepayment charges', 'Flexible 6-36 months EMI', 'Direct Wallet Disbursal'],
    recommended: true
  },
  {
    id: 'offer-instant-cash',
    title: 'Instant Cash Advance',
    category: 'instant',
    minAmount: 10000,
    maxAmount: 75000,
    minTenureMonths: 3,
    maxTenureMonths: 12,
    interestRatePerAnnum: 12.5,
    processingFeePercent: 1.0,
    tag: '5-Minute Disbursal',
    description: 'Immediate liquidity for urgent expenses, shopping, or emergency bill payments.',
    features: ['Minimal document requirement', 'Disbursal in under 5 minutes', 'Short flexible tenure', 'No collateral needed']
  },
  {
    id: 'offer-flexi-credit',
    title: 'Flexi-Line Emergency Credit',
    category: 'flexi',
    minAmount: 25000,
    maxAmount: 250000,
    minTenureMonths: 6,
    maxTenureMonths: 24,
    interestRatePerAnnum: 11.9,
    processingFeePercent: 1.25,
    tag: 'Pay As You Use',
    description: 'Pre-approved credit line. Withdraw anytime into your wallet and pay interest only on the used amount.',
    features: ['Reusable credit limit', 'Interest only on utilized funds', 'Instant top-up to wallet', 'UPI linked repayments']
  },
  {
    id: 'offer-education-growth',
    title: 'Career & Education Loan',
    category: 'education',
    minAmount: 50000,
    maxAmount: 750000,
    minTenureMonths: 12,
    maxTenureMonths: 48,
    interestRatePerAnnum: 9.9,
    processingFeePercent: 1.0,
    tag: 'Lowest 9.9% p.a.',
    description: 'Special subsidized interest rate for upskilling, certifications, college fees, and professional tools.',
    features: ['Subsidized rates from 9.9%', 'Moratorium period option', 'Long repayment tenure', 'Tax benefits eligible']
  }
];

export class SupabaseService {
  private config: SupabaseConfig;

  constructor() {
    const savedConfig = localStorage.getItem(STORAGE_KEYS.SUPABASE_CONFIG);
    if (savedConfig) {
      try {
        this.config = JSON.parse(savedConfig);
      } catch {
        this.config = this.getDefaultConfig();
      }
    } else {
      this.config = this.getDefaultConfig();
    }
  }

  private getDefaultConfig(): SupabaseConfig {
    return {
      supabaseUrl: 'https://ypeatqlvnppnwxmqkwod.supabase.co',
      supabaseAnonKey: 'sb_publishable_MBKsFvZeZ3ayg00hkz2WKA_jMHn645L',
      isConnected: true,
      storageBucket: 'kyc-documents'
    };
  }

  public getConfig(): SupabaseConfig {
    return this.config;
  }

  public saveConfig(config: Partial<SupabaseConfig>): SupabaseConfig {
    this.config = { ...this.config, ...config };
    localStorage.setItem(STORAGE_KEYS.SUPABASE_CONFIG, JSON.stringify(this.config));
    return this.config;
  }

  private async request(endpoint: string, method: string = 'GET', body?: any) {
    if (!this.config.isConnected || !this.config.supabaseUrl) return null;
    try {
      const res = await fetch(`${this.config.supabaseUrl}/rest/v1/${endpoint}`, {
        method,
        headers: {
          'apikey': this.config.supabaseAnonKey,
          'Authorization': `Bearer ${this.config.supabaseAnonKey}`,
          'Content-Type': 'application/json',
          'Prefer': method === 'POST' ? 'return=representation' : 'return=minimal'
        },
        body: body ? JSON.stringify(body) : undefined
      });
      if (res.ok) {
        const text = await res.text();
        return text ? JSON.parse(text) : null;
      }
    } catch (e) {
      console.warn('Supabase request error:', e);
    }
    return null;
  }

  public getUser(): UserProfile | null {
    const data = localStorage.getItem(STORAGE_KEYS.USER);
    if (!data) return null;
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  }

  public saveUser(user: UserProfile): void {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  }

  public async registerOrLogin(mobileNo: string, pin: string, fullName?: string, emailId?: string): Promise<UserProfile> {
    const existing = await this.request(`auth_users?mobile_no=eq.${mobileNo}&select=*`);
    if (existing && existing.length > 0) {
      const dbUser = existing[0];
      if (dbUser.pin === pin) {
        const profile: UserProfile = {
          id: dbUser.id,
          email: dbUser.email_id,
          fullName: dbUser.full_name,
          phoneNumber: dbUser.mobile_no,
          cibilScore: 780,
          monthlyIncome: 60000,
          employmentType: 'Salaried',
          bankName: 'State Bank of India',
          accountNumber: '••••••••4892',
          ifscCode: 'SBIN0004521',
          isFirstTimeLogin: false,
          kycCompleted: false,
          kyc: { aadharStatus: 'pending', panStatus: 'pending', overallStatus: 'not_started' },
          createdAt: dbUser.created_at
        };
        this.saveUser(profile);
        return profile;
      } else {
        throw new Error('Invalid 6-digit PIN');
      }
    }

    if (fullName && emailId) {
      const created = await this.request('auth_users', 'POST', {
        full_name: fullName,
        mobile_no: mobileNo,
        email_id: emailId,
        pin: pin
      });

      const dbUser = created && created[0] ? created[0] : {
        id: `usr_${Date.now()}`,
        full_name: fullName,
        mobile_no: mobileNo,
        email_id: emailId,
        created_at: new Date().toISOString()
      };

      const profile: UserProfile = {
        id: dbUser.id,
        email: dbUser.email_id,
        fullName: dbUser.full_name,
        phoneNumber: dbUser.mobile_no,
        cibilScore: 750,
        monthlyIncome: 50000,
        employmentType: 'Salaried',
        bankName: 'State Bank of India',
        accountNumber: '••••••••4892',
        ifscCode: 'SBIN0004521',
        isFirstTimeLogin: true,
        kycCompleted: false,
        kyc: { aadharStatus: 'pending', panStatus: 'pending', overallStatus: 'not_started' },
        createdAt: dbUser.created_at
      };
      this.saveUser(profile);
      return profile;
    }

    throw new Error('Mobile number not registered. Please register first.');
  }

  public async updateKYC(kycData: Partial<UserProfile['kyc']>): Promise<UserProfile> {
    const user = this.getUser();
    if (!user) throw new Error('No active user');

    const updatedKYC = {
      ...user.kyc,
      ...kycData
    };
    const isCompleted = 
      Boolean(updatedKYC.selfieUrl) && 
      Boolean(updatedKYC.aadharFrontUrl) && 
      Boolean(updatedKYC.aadharBackUrl) && 
      Boolean(updatedKYC.panUrl);

    if (isCompleted && updatedKYC.overallStatus === 'not_started') {
      updatedKYC.overallStatus = 'verified';
      updatedKYC.verifiedAt = new Date().toISOString();
      updatedKYC.aadharStatus = 'verified';
      updatedKYC.panStatus = 'verified';
    }

    const updatedUser: UserProfile = {
      ...user,
      isFirstTimeLogin: false,
      kycCompleted: updatedKYC.overallStatus === 'verified',
      kyc: updatedKYC
    };

    await this.request('kyc_documents', 'POST', {
      user_id: user.id,
      selfie_url: updatedKYC.selfieUrl,
      aadhar_front_url: updatedKYC.aadharFrontUrl,
      aadhar_back_url: updatedKYC.aadharBackUrl,
      aadhar_number: updatedKYC.aadharNumber,
      pan_url: updatedKYC.panUrl,
      pan_number: updatedKYC.panNumber,
      overall_status: updatedKYC.overallStatus,
      verified_at: updatedKYC.verifiedAt
    });

    this.saveUser(updatedUser);
    return updatedUser;
  }

  public getActiveLoans(): ActiveLoan[] {
    const data = localStorage.getItem(STORAGE_KEYS.ACTIVE_LOANS);
    if (!data) return [];
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  public saveActiveLoans(loans: ActiveLoan[]): void {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_LOANS, JSON.stringify(loans));
  }

  public async saveActiveLoanToTable(loan: ActiveLoan): Promise<void> {
    const user = this.getUser();
    if (user) {
      await this.request('active_loans', 'POST', {
        id: loan.id,
        user_id: user.id,
        loan_number: loan.loanNumber,
        title: loan.title,
        original_amount: loan.originalAmount,
        outstanding_balance: loan.outstandingBalance,
        monthly_emi: loan.monthlyEmi,
        interest_rate: loan.interestRate,
        total_emis: loan.totalEmis,
        paid_emis: loan.paidEmis,
        next_emi_date: loan.nextEmiDate,
        start_date: loan.startDate,
        status: loan.status
      });
    }

    const loans = this.getActiveLoans();
    loans.unshift(loan);
    this.saveActiveLoans(loans);
  }

  public getWalletBalance(): number {
    const bal = localStorage.getItem(STORAGE_KEYS.WALLET_BALANCE);
    if (bal === null) {
      localStorage.setItem(STORAGE_KEYS.WALLET_BALANCE, '0');
      return 0;
    }
    return parseFloat(bal) || 0;
  }

  public async setWalletBalance(balance: number): Promise<void> {
    const user = this.getUser();
    localStorage.setItem(STORAGE_KEYS.WALLET_BALANCE, balance.toString());
    if (user) {
      await this.request('wallets', 'POST', {
        user_id: user.id,
        balance: balance
      });
    }
  }

  public getApplications(): LoanApplication[] {
    const data = localStorage.getItem(STORAGE_KEYS.APPLICATIONS);
    if (!data) return [];
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  public saveApplications(apps: LoanApplication[]): void {
    localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(apps));
  }

  public async saveApplicationToTable(app: LoanApplication): Promise<void> {
    const user = this.getUser();
    if (user) {
      await this.request('loan_applications', 'POST', {
        id: app.id,
        user_id: user.id,
        loan_title: app.loanTitle,
        requested_amount: app.requestedAmount,
        tenure_months: app.tenureMonths,
        interest_rate: app.interestRate,
        monthly_emi: app.monthlyEmi,
        current_stage: app.currentStage,
        stage_progress: app.stageProgress
      });
    }

    const apps = this.getApplications();
    const idx = apps.findIndex(a => a.id === app.id);
    if (idx >= 0) {
      apps[idx] = app;
    } else {
      apps.unshift(app);
    }
    this.saveApplications(apps);
  }

  public getPaymentHistory(): PaymentRecord[] {
    return [];
  }
  public getWalletTransactions(): WalletTransaction[] {
    return [];
  }
  public addPayment() {}
  public addWalletTransaction() {}
}

export const supabaseService = new SupabaseService();
