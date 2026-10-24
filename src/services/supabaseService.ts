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
      storageBucket: 'Documents'
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

    // 1. Try Supabase REST query
    const queryField = isCustomerId ? `customer_id=eq.${cleanInput}` : `mobile_no=eq.${cleanInput}`;
    let existing = await this.request(`auth_users?${queryField}&select=*`);

    // 2. Check local fallback users cache if Supabase table is unreachable or empty
    const localUsers: any[] = JSON.parse(localStorage.getItem('dhansetu_local_auth_users') || '[]');
    if ((!existing || existing.length === 0) && localUsers.length > 0) {
      const found = localUsers.find(u => 
        (isCustomerId ? u.customer_id === cleanInput : u.mobile_no === cleanInput)
      );
      if (found) {
        existing = [found];
      }
    }

    // 3. Fallback demo user if credentials match standard demo
    if ((!existing || existing.length === 0) && (cleanInput === '9876543210' || cleanInput === 'DS2026102401' || cleanInput === 'DEMO')) {
      if (pin === '123456') {
        const demoUser: UserProfile = {
          id: 'usr_demo_01',
          customerId: 'DS2026102401',
          email: 'rahul.sharma@example.com',
          fullName: 'Rahul Sharma',
          phoneNumber: '+91 9876543210',
          cibilScore: 780,
          monthlyIncome: 65000,
          employmentType: 'Salaried',
          bankName: 'HDFC Bank Ltd',
          accountNumber: '••••••••4892',
          ifscCode: 'HDFC0001234',
          isFirstTimeLogin: false,
          kycCompleted: true,
          kyc: {
            selfieUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
            aadharFrontUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
            aadharBackUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
            aadharNumber: '•••• •••• 8912',
            aadharStatus: 'verified',
            panUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
            panNumber: 'ABCDE1234F',
            panStatus: 'verified',
            overallStatus: 'verified',
            verifiedAt: '2026-10-24T10:00:00.000Z'
          },
          createdAt: new Date().toISOString()
        };
        this.saveUser(demoUser);
        return demoUser;
      }
    }

    if (existing && existing.length > 0) {
      const dbUser = existing[0];
      if (dbUser.pin === pin) {
        const customerId = dbUser.customer_id || generateCustomerId();

        if (!dbUser.customer_id) {
          await this.request(`auth_users?id=eq.${dbUser.id}`, 'PATCH', { customer_id: customerId });
        }

        const userRole: 'customer' | 'retailer' = (dbUser.role === 'retailer' || dbUser.role === 'customer') 
          ? dbUser.role 
          : ((localStorage.getItem('dhansetu_user_role') as 'customer' | 'retailer') || 'customer');

        const profile: UserProfile = {
          id: dbUser.id,
          customerId: customerId,
          email: dbUser.email_id || 'user@dhansetu.in',
          fullName: dbUser.full_name || 'DhanSetu User',
          phoneNumber: dbUser.mobile_no || cleanInput,
          cibilScore: 780,
          monthlyIncome: 60000,
          employmentType: 'Salaried',
          bankName: 'State Bank of India',
          accountNumber: '••••••••4892',
          ifscCode: 'SBIN0004521',
          role: userRole,
          retailerId: dbUser.retailer_id || (userRole === 'retailer' ? 'RT-DHAN-9021' : undefined),
          retailerStoreName: dbUser.store_name || (userRole === 'retailer' ? `${dbUser.full_name || 'Partner'} Store` : undefined),
          isFirstTimeLogin: false,
          kycCompleted: false,
          kyc: { aadharStatus: 'pending', panStatus: 'pending', overallStatus: 'not_started' },
          createdAt: dbUser.created_at || new Date().toISOString()
        };

        await this.syncUserDataFromSupabase(customerId, profile);
        this.saveUser(profile);
        return profile;
      } else {
        throw new Error('Invalid 6-digit PIN. Please try again.');
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
        pin: pin,
        role: 'customer'
      });

      const dbUser = created && created[0] ? created[0] : {
        id: `usr_${Date.now()}`,
        customer_id: customerId,
        full_name: fullName,
        mobile_no: cleanInput,
        email_id: emailId,
        pin: pin,
        role: 'customer',
        created_at: new Date().toISOString()
      };

      // Save to local auth cache as fallback
      localUsers.push(dbUser);
      localStorage.setItem('dhansetu_local_auth_users', JSON.stringify(localUsers));
      localStorage.setItem('dhansetu_user_role', 'customer');

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
        role: 'customer',
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

    throw new Error(isCustomerId ? 'Customer ID not found. Please check your Customer ID or register a new account.' : 'Mobile number not registered. Please register first.');
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

  public async uploadKYCDocument(
    folder: 'Selfie' | 'Aadhar Card' | 'Pan Card',
    fileName: string,
    fileOrDataUrl: File | Blob | string
  ): Promise<string> {
    const bucket = 'Documents';
    const cleanFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const filePath = `${folder}/${cleanFileName}`;
    
    let blob: Blob;
    let contentType = 'image/jpeg';

    if (typeof fileOrDataUrl === 'string') {
      if (fileOrDataUrl.startsWith('data:')) {
        const matches = fileOrDataUrl.match(/^data:([^;]+);base64,(.+)$/);
        if (matches) {
          contentType = matches[1];
          try {
            const byteCharacters = atob(matches[2]);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
              byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            blob = new Blob([byteArray], { type: contentType });
          } catch {
            blob = new Blob([fileOrDataUrl], { type: contentType });
          }
        } else {
          blob = new Blob([fileOrDataUrl], { type: 'text/plain' });
        }
      } else {
        // Already a remote URL
        return fileOrDataUrl;
      }
    } else {
      blob = fileOrDataUrl;
      if (fileOrDataUrl.type) {
        contentType = fileOrDataUrl.type;
      }
    }

    const publicUrl = `${this.config.supabaseUrl}/storage/v1/object/public/${bucket}/${encodeURIComponent(filePath).replace(/%2F/g, '/')}`;

    try {
      // Supabase Storage REST endpoint for object upload
      const response = await fetch(`${this.config.supabaseUrl}/storage/v1/object/${bucket}/${filePath}`, {
        method: 'POST',
        headers: {
          'apikey': this.config.supabaseAnonKey,
          'Authorization': `Bearer ${this.config.supabaseAnonKey}`,
          'Content-Type': contentType,
          'x-upsert': 'true'
        },
        body: blob
      });

      if (!response.ok) {
        const errText = await response.text();
        console.warn(`Supabase Storage upload to ${bucket}/${filePath} status:`, response.status, errText);
      }
    } catch (err) {
      console.warn(`Storage network call to ${bucket}/${filePath}:`, err);
    }

    return publicUrl;
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
    if (!data) {
      const initialSeed: LoanApplication[] = [
        {
          id: 'DS-APP-894102',
          customerId: 'DS2026102401',
          customerName: 'Rahul Sharma',
          customerMobile: '+91 9876543210',
          customerCibil: 780,
          customerEmployment: 'Salaried (HDFC Bank)',
          customerBank: 'HDFC Bank Ltd (••••4892)',
          loanId: 'offer-prime-personal',
          loanTitle: 'DhanSetu Prime Personal Loan',
          requestedAmount: 150000,
          tenureMonths: 18,
          interestRate: 10.75,
          monthlyEmi: 9058,
          totalInterest: 13044,
          processingFee: 2250,
          netDisbursalAmount: 147750,
          purpose: 'Medical & Household Expenses',
          appliedAt: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          currentStage: 'submitted',
          stageProgress: 30,
          retailerStatus: 'pending',
          sanctionLetterId: 'SANCTION-DS-884920',
          history: [
            {
              stage: 'submitted',
              title: 'Loan Request Submitted',
              description: 'Customer submitted loan request with Aadhaar & PAN KYC.',
              timestamp: 'Today, 10:15 AM',
              completed: true
            },
            {
              stage: 'retailer_review',
              title: 'Retailer Review & Approval',
              description: 'Waiting for authorized DhanSetu Retailer verification.',
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
              title: 'Loan Disbursal to Wallet',
              description: 'Instant transfer upon Retailer confirmation.',
              timestamp: 'Pending',
              completed: false
            }
          ]
        }
      ];
      this.saveApplications(initialSeed);
      return initialSeed;
    }
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
        customer_id: app.customerId || user.customerId,
        user_id: user.id,
        customer_name: app.customerName || user.fullName,
        customer_mobile: app.customerMobile || user.phoneNumber,
        customer_cibil: app.customerCibil || user.cibilScore,
        loan_title: app.loanTitle,
        requested_amount: app.requestedAmount,
        tenure_months: app.tenureMonths,
        interest_rate: app.interestRate,
        monthly_emi: app.monthlyEmi,
        current_stage: app.currentStage,
        stage_progress: app.stageProgress,
        retailer_status: app.retailerStatus || 'pending',
        retailer_id: app.retailerId,
        retailer_approved_at: app.retailerApprovedAt,
        rejection_reason: app.rejectionReason
      });
    }

    const apps = this.getApplications();
    const appWithCustomer: LoanApplication = {
      ...app,
      customerId: app.customerId || user?.customerId,
      customerName: app.customerName || user?.fullName,
      customerMobile: app.customerMobile || user?.phoneNumber,
      customerCibil: app.customerCibil || user?.cibilScore,
      customerEmployment: app.customerEmployment || user?.employmentType,
      customerBank: app.customerBank || `${user?.bankName} (${user?.accountNumber})`
    };
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


