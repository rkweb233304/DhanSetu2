-- ==========================================================
-- DHANSETU DATABASE INITIALIZATION SCRIPT
-- ==========================================================
-- 1. DROP EXISTING TABLES (CAUTION: THIS WILL DELETE ALL DATA)
-- Remove this block if you want to keep existing data.
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS active_loans;
DROP TABLE IF EXISTS loan_applications;
DROP TABLE IF EXISTS loan_offers;
DROP TABLE IF EXISTS wallets;
DROP TABLE IF EXISTS kyc_documents;
DROP TABLE IF EXISTS auth_users;

-- 2. CREATE TABLES
CREATE TABLE auth_users (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    customer_id TEXT UNIQUE NOT NULL,
    full_name TEXT,
    mobile_no TEXT UNIQUE NOT NULL,
    email_id TEXT UNIQUE,
    pin TEXT NOT NULL,
    role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE kyc_documents (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    customer_id TEXT UNIQUE REFERENCES auth_users(customer_id),
    user_id TEXT REFERENCES auth_users(id),
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
    selfie_url TEXT NOT NULL,
    aadhar_front_url TEXT NOT NULL,
    aadhar_back_url TEXT NOT NULL,
    aadhar_number TEXT NOT NULL,
    pan_url TEXT NOT NULL,
    pan_number TEXT NOT NULL,
    overall_status TEXT DEFAULT 'submitted' CHECK (overall_status IN ('not_started', 'submitted', 'in_review', 'verified', 'rejected')),
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE wallets (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    customer_id TEXT UNIQUE REFERENCES auth_users(customer_id),
    user_id TEXT REFERENCES auth_users(id),
    balance NUMERIC DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE loan_offers (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    title TEXT NOT NULL,
    category TEXT,
    min_amount NUMERIC,
    max_amount NUMERIC,
    interest_rate NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE loan_applications (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    customer_id TEXT REFERENCES auth_users(customer_id),
    user_id TEXT REFERENCES auth_users(id),
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
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE active_loans (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    customer_id TEXT REFERENCES auth_users(customer_id),
    user_id TEXT REFERENCES auth_users(id),
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

CREATE TABLE payments (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    customer_id TEXT REFERENCES auth_users(customer_id),
    user_id TEXT REFERENCES auth_users(id),
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

-- 3. INSERT SAMPLE DATA

-- Admin User
INSERT INTO auth_users (id, customer_id, full_name, mobile_no, pin, role)
VALUES ('usr_admin_001', 'cust_admin_001', 'Admin User', '9999999999', '1234', 'admin');

-- Normal User
INSERT INTO auth_users (id, customer_id, full_name, mobile_no, pin, role)
VALUES ('usr_cust_001', 'cust_001', 'John Doe', '9876543210', '5678', 'customer');

-- KYC Document for Normal User
INSERT INTO kyc_documents (customer_id, user_id, full_name, selfie_url, aadhar_front_url, aadhar_back_url, aadhar_number, pan_url, pan_number, overall_status)
VALUES ('cust_001', 'usr_cust_001', 'John Doe', 'https://example.com/selfie.jpg', 'https://example.com/aadhaar_f.jpg', 'https://example.com/aadhaar_b.jpg', '123456789012', 'https://example.com/pan.jpg', 'ABCDE1234F', 'submitted');

-- Wallet for Normal User
INSERT INTO wallets (customer_id, user_id, balance)
VALUES ('cust_001', 'usr_cust_001', 0);

-- Active Loan for Normal User
INSERT INTO active_loans (customer_id, user_id, loan_number, title, original_amount, outstanding_balance, monthly_emi, interest_rate, total_emis, start_date, next_emi_date, status)
VALUES ('cust_001', 'usr_cust_001', 'DSL2026102501', 'Instant Cash Advance', 5000, 5350, 1783, 7, 3, '2026-10-25', '2026-11-25', 'active');
