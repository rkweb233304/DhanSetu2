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
  PAYMENTS: 'dhansetu_payments',
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

export function generateCustomerId(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const date = String(now.getDate()).padStart(2, '0');
  const dateKey = `${year}${month}${date}`;

  // Read serial counter for today from localStorage
  const counterKey = `dhansetu_customer_sn_${dateKey}`;
  const currentCount = parseInt(localStorage.getItem(counterKey) || '0', 10);
  const nextCount = currentCount + 1;
  localStorage.setItem(counterKey, String(nextCount));
  
  const sn = String(nextCount).padStart(2, '0');
  return `DS${dateKey}${sn}`;
}

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
      const parsed = JSON.parse(data);
      // Ensure existing users without customerId get one
      if (parsed && !parsed.customerId) {
        parsed.customerId = generateCustomerId();
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(parsed));
      }
      return parsed;
    } catch {
      return null;
    }
  }

  public saveUser(user: UserProfile): void {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  }

  public async syncUserDataFromSupabase(customerId: string, profile: UserProfile): Promise<void> {
    try {
      // 1. Fetch KYC Documents by customer_id
      const kycRes = await this.request(`kyc_documents?customer_id=eq.${customerId}&select=*&order=created_at.desc&limit=1`);
      if (kycRes && kycRes.length > 0) {
        const k = kycRes[0];
        profile.kyc = {
          selfieUrl: k.selfie_url,
          aadharFrontUrl: k.aadhar_front_url,
          aadharBackUrl: k.aadhar_back_url,
          aadharNumber: k.aadhar_number,
          aadharStatus: k.aadhar_status || 'verified',
          panUrl: k.pan_url,
          panNumber: k.pan_number,
          panStatus: k.pan_status || 'verified',
          overallStatus: k.overall_status || 'verified',
          verifiedAt: k.verified_at
        };
        profile.kycCompleted = k.overall_status === 'verified';
      }

      // 2. Fetch Active Loans by customer_id
      const loansRes = await this.request(`active_loans?customer_id=eq.${customerId}&select=*&order=created_at.desc`);
      if (loansRes && loansRes.length > 0) {
        const loans: ActiveLoan[] = loansRes.map((l: any) => ({
          id: l.id,
          customerId: l.customer_id,
          loanNumber: l.loan_number,
          title: l.title,
          originalAmount: Number(l.original_amount),
          outstandingBalance: Number(l.outstanding_balance),
          monthlyEmi: Number(l.monthly_emi),
          interestRate: Number(l.interest_rate),
          totalEmis: Number(l.total_emis),
          paidEmis: Number(l.paid_emis || 0),
          nextEmiDate: l.next_emi_date,
          startDate: l.start_date,
          status: l.status
        }));
        this.saveActiveLoans(loans);
      }

      // 3. Fetch Payments by customer_id
      const payRes = await this.request(`payments?customer_id=eq.${customerId}&select=*&order=created_at.desc`);
      if (payRes && payRes.length > 0) {
        const pays: PaymentRecord[] = payRes.map((p: any) => ({
          id: p.id,
          customerId: p.customer_id,
          userId: p.user_id,
          loanId: p.loan_id,
          loanTitle: p.loan_title,
          amount: Number(p.amount),
          paymentType: p.payment_type,
          emiNumber: Number(p.emi_number),
          totalEmis: Number(p.total_emis),
          paymentDate: p.payment_date,
          paymentMethod: p.payment_method,
          referenceId: p.reference_id,
          status: p.status
        }));
        this.savePaymentHistory(pays);
      }

      // 4. Fetch Wallet by customer_id
      const walletRes = await this.request(`wallets?customer_id=eq.${customerId}&select=*&limit=1`);
      if (walletRes && walletRes.length > 0) {
        const bal = Number(walletRes[0].balance) || 0;
        localStorage.setItem(STORAGE_KEYS.WALLET_BALANCE, bal.toString());
      }
    } catch (e) {
      console.warn('Sync user data error:', e);
    }
  }

  public async registerOrLogin(loginInput: string, pin: string, fullName?: string, emailId?: string): Promise<UserProfile> {
    const isCustomerId = loginInput.trim().toUpperCase().startsWith('DS');
    const cleanInput = isCustomerId ? loginInput.trim().toUpperCase() : loginInput.trim();

    // Check if user exists by customer_id or mobile_no
    const queryField = isCustomerId ? `customer_id=eq.${cleanInput}` : `mobile_no=eq.${cleanInput}`;
    const existing = await this.request(`auth_users?${queryField}&select=*`);

    if (existing && existing.length > 0) {
      const dbUser = existing[0];
      if (dbUser.pin === pin) {
        const customerId = dbUser.customer_id || generateCustomerId();

        if (!dbUser.customer_id) {
          await this.request(`auth_users?id=eq.${dbUser.id}`, 'PATCH', { customer_id: customerId });
        }

        const profile: UserProfile = {
          id: dbUser.id,
          customerId: customerId,
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

        await this.syncUserDataFromSupabase(customerId, profile);
        this.saveUser(profile);
        return profile;
      } else {
        throw new Error('Invalid 6-digit PIN');
      }
    }

    if (fullName && emailId) {
      // Generate Unique Customer ID: DS((Years))((Month))((Date))((0+SN))
      const customerId = generateCustomerId();

      const created = await this.request('auth_users', 'POST', {
        customer_id: customerId,
        full_name: fullName,
        mobile_no: cleanInput,
        email_id: emailId,
        pin: pin
      });

      const dbUser = created && created[0] ? created[0] : {
        id: `usr_${Date.now()}`,
        customer_id: customerId,
        full_name: fullName,
        mobile_no: cleanInput,
        email_id: emailId,
        created_at: new Date().toISOString()
      };

      const profile: UserProfile = {
        id: dbUser.id,
        customerId: customerId,
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

      // Create initial wallet linked by customer_id
      await this.request('wallets', 'POST', {
        customer_id: customerId,
        user_id: profile.id,
        balance: 0
      });

      this.saveUser(profile);
      return profile;
    }

    throw new Error(isCustomerId ? 'Customer ID not found. Please register first.' : 'Mobile number not registered. Please register first.');
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
      customer_id: user.customerId,
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
        customer_id: user.customerId,
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
    loans.unshift({ ...loan, customerId: user?.customerId });
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
        customer_id: user.customerId,
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
        customer_id: user.customerId,
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
    const appWithCustomer = { ...app, customerId: user?.customerId };
    const idx = apps.findIndex(a => a.id === app.id);
    if (idx >= 0) {
      apps[idx] = appWithCustomer;
    } else {
      apps.unshift(appWithCustomer);
    }
    this.saveApplications(apps);
  }

  public getPaymentHistory(): PaymentRecord[] {
    const data = localStorage.getItem(STORAGE_KEYS.PAYMENTS);
    if (!data) return [];
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  public savePaymentHistory(payments: PaymentRecord[]): void {
    localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments));
  }

  public async savePaymentToTable(payment: PaymentRecord): Promise<void> {
    const user = this.getUser();
    const userId = user?.id || payment.userId || 'usr_guest';
    const customerId = user?.customerId || payment.customerId || 'DS2026102401';

    await this.request('payments', 'POST', {
      id: payment.id,
      customer_id: customerId,
      user_id: userId,
      loan_id: payment.loanId,
      loan_title: payment.loanTitle,
      amount: payment.amount,
      payment_type: payment.paymentType || 'emi',
      emi_number: payment.emiNumber,
      total_emis: payment.totalEmis,
      payment_method: payment.paymentMethod,
      reference_id: payment.referenceId,
      status: payment.status,
      created_at: new Date().toISOString()
    });

    const list = this.getPaymentHistory();
    list.unshift({ ...payment, userId, customerId });
    this.savePaymentHistory(list);
  }

  public getWalletTransactions(): WalletTransaction[] {
    return [];
  }
  public addWalletTransaction() {}
}

export const supabaseService = new SupabaseService();


