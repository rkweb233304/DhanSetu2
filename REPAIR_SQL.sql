-- DHANSETU DATABASE RESET & REPAIR SCRIPT (FINAL)
-- WARNING: This will DELETE all existing data and recreate tables with correct TEXT IDs.
-- Execute this in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)

-- 1. DROP EXISTING TABLES (to fix UUID vs TEXT mismatch)
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS active_loans CASCADE;
DROP TABLE IF EXISTS loan_applications CASCADE;
DROP TABLE IF EXISTS loan_offers CASCADE;
DROP TABLE IF EXISTS wallets CASCADE;
DROP TABLE IF EXISTS kyc_documents CASCADE;
DROP TABLE IF EXISTS auth_users CASCADE;

-- 2. CREATE Authentication Users Table
CREATE TABLE auth_users (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    customer_id TEXT UNIQUE NOT NULL,
    full_name TEXT,
    mobile_no TEXT UNIQUE NOT NULL,
    email_id TEXT UNIQUE,
    pin TEXT NOT NULL,
    role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'retailer', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. CREATE KYC Documents Table
CREATE TABLE kyc_documents (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    customer_id TEXT UNIQUE REFERENCES auth_users(customer_id) ON DELETE CASCADE,
    user_id TEXT REFERENCES auth_users(id) ON DELETE CASCADE,
    full_name TEXT,
    father_name TEXT,
    mother_name TEXT,
    address TEXT,
    state TEXT,
    nominee_name TEXT,
    nominee_mobile TEXT,
    nominee_relation TEXT,
    guarantor_name TEXT,
    guarantor_mobile TEXT,
    guarantor_relation TEXT,
    selfie_url TEXT,
    aadhar_front_url TEXT,
    aadhar_back_url TEXT,
    aadhar_number TEXT,
    pan_url TEXT,
    pan_number TEXT,
    overall_status TEXT DEFAULT 'submitted' CHECK (overall_status IN ('not_started', 'submitted', 'in_review', 'verified', 'rejected')),
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. CREATE Wallets Table
CREATE TABLE wallets (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    customer_id TEXT UNIQUE REFERENCES auth_users(customer_id) ON DELETE CASCADE,
    user_id TEXT REFERENCES auth_users(id) ON DELETE CASCADE,
    balance NUMERIC DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. CREATE Loan Offers Table (Initial Data)
CREATE TABLE loan_offers (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    title TEXT NOT NULL,
    category TEXT,
    min_amount NUMERIC,
    max_amount NUMERIC,
    interest_rate NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. CREATE Loan Applications Table
CREATE TABLE loan_applications (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    customer_id TEXT REFERENCES auth_users(customer_id) ON DELETE CASCADE,
    user_id TEXT REFERENCES auth_users(id) ON DELETE CASCADE,
    customer_name TEXT,
    customer_mobile TEXT,
    customer_cibil INTEGER,
    loan_title TEXT,
    requested_amount NUMERIC,
    tenure_months INTEGER,
    interest_rate NUMERIC,
    monthly_emi NUMERIC,
    current_stage TEXT,
    stage_progress INTEGER DEFAULT 0,
    retailer_status TEXT DEFAULT 'pending',
    retailer_id TEXT,
    retailer_approved_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. CREATE Active Loans Table
CREATE TABLE active_loans (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    customer_id TEXT REFERENCES auth_users(customer_id) ON DELETE CASCADE,
    user_id TEXT REFERENCES auth_users(id) ON DELETE CASCADE,
    loan_number TEXT,
    title TEXT,
    original_amount NUMERIC,
    outstanding_balance NUMERIC,
    monthly_emi NUMERIC,
    interest_rate NUMERIC,
    total_emis INTEGER,
    paid_emis INTEGER DEFAULT 0,
    next_emi_date DATE,
    start_date DATE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'closed', 'overdue')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. CREATE Payments Table
CREATE TABLE payments (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    customer_id TEXT REFERENCES auth_users(customer_id) ON DELETE CASCADE,
    user_id TEXT REFERENCES auth_users(id) ON DELETE CASCADE,
    loan_id TEXT,
    loan_title TEXT,
    amount NUMERIC,
    payment_type TEXT,
    emi_number INTEGER,
    total_emis INTEGER,
    payment_method TEXT,
    reference_id TEXT,
    status TEXT DEFAULT 'success',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. ENABLE RLS
ALTER TABLE auth_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE kyc_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE loan_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE loan_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE active_loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- 10. CREATE PUBLIC POLICIES (Allow all for anonymous demo)
CREATE POLICY "Public Access" ON auth_users FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Public Access" ON kyc_documents FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Public Access" ON wallets FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Public Access" ON loan_offers FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Public Access" ON loan_applications FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Public Access" ON active_loans FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Public Access" ON payments FOR ALL TO public USING (true) WITH CHECK (true);

-- 11. STORAGE BUCKET & POLICIES
INSERT INTO storage.buckets (id, name, public) 
VALUES ('Documents', 'Documents', true) 
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access" ON storage.objects 
FOR ALL TO public 
USING (bucket_id = 'Documents') 
WITH CHECK (bucket_id = 'Documents');

-- 12. SEED SAMPLE USERS (Customer, Retailer, Admin)
-- All users use PIN: 123456

-- 1. Normal Customer
INSERT INTO auth_users (id, customer_id, full_name, mobile_no, email_id, pin, role)
VALUES ('usr_demo_customer', '2026102401', 'Rahul Sharma', '9876543210', 'rahul.sharma@example.com', '123456', 'customer')
ON CONFLICT (mobile_no) DO NOTHING;

-- 2. Retailer Partner
INSERT INTO auth_users (id, customer_id, full_name, mobile_no, email_id, pin, role)
VALUES ('usr_demo_retailer', '2026102402', 'Amit Retailer', '9876543211', 'amit.retailer@example.com', '123456', 'retailer')
ON CONFLICT (mobile_no) DO NOTHING;

-- 3. Administrator
INSERT INTO auth_users (id, customer_id, full_name, mobile_no, email_id, pin, role)
VALUES ('usr_demo_admin', '2026102403', 'Admin Control', '9876543212', 'admin@dhansetu.in', '123456', 'admin')
ON CONFLICT (mobile_no) DO NOTHING;
