-- Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    phone_number TEXT,
    role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'retailer', 'admin')),
    kyc_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Loan Offers Table
CREATE TABLE loan_offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    category TEXT,
    min_amount NUMERIC,
    max_amount NUMERIC,
    interest_rate NUMERIC
);

-- Loan Applications Table
CREATE TABLE loan_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    loan_offer_id UUID REFERENCES loan_offers(id),
    requested_amount NUMERIC,
    status TEXT DEFAULT 'submitted' CHECK (status IN ('submitted', 'approved', 'rejected', 'disbursed')),
    current_stage TEXT,
    stage_progress INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Active Loans Table
CREATE TABLE active_loans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    loan_application_id UUID REFERENCES loan_applications(id),
    original_amount NUMERIC,
    outstanding_balance NUMERIC,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'closed', 'overdue'))
);

-- Loan Agreements Table
CREATE TABLE loan_agreements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    loan_application_id UUID REFERENCES loan_applications(id),
    signed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    agreement_content TEXT
);
