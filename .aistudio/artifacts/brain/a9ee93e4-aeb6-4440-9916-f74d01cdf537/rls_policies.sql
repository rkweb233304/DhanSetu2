-- 1. ENABLE RLS ON ALL TABLES
ALTER TABLE auth_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE kyc_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE loan_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE loan_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE active_loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- 2. CREATE PERMISSIVE POLICIES FOR TABLES (Required for anonymous API access)
-- Note: These allow all operations for anyone with the API key. 
-- In production, you would restrict these using 'auth.uid()'.

-- auth_users
CREATE POLICY "Allow public access" ON auth_users FOR ALL TO public USING (true) WITH CHECK (true);

-- kyc_documents
CREATE POLICY "Allow public access" ON kyc_documents FOR ALL TO public USING (true) WITH CHECK (true);

-- wallets
CREATE POLICY "Allow public access" ON wallets FOR ALL TO public USING (true) WITH CHECK (true);

-- loan_offers
CREATE POLICY "Allow public access" ON loan_offers FOR ALL TO public USING (true) WITH CHECK (true);

-- loan_applications
CREATE POLICY "Allow public access" ON loan_applications FOR ALL TO public USING (true) WITH CHECK (true);

-- active_loans
CREATE POLICY "Allow public access" ON active_loans FOR ALL TO public USING (true) WITH CHECK (true);

-- payments
CREATE POLICY "Allow public access" ON payments FOR ALL TO public USING (true) WITH CHECK (true);


-- 3. STORAGE RLS POLICIES (Fixes "AccessDenied" for Uploads)

-- Ensure the bucket is public
UPDATE storage.buckets SET public = true WHERE id = 'Documents';

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Public Access" ON storage.objects;

-- Create full access policy for the Documents bucket
CREATE POLICY "Public Access" ON storage.objects
FOR ALL TO public
USING (bucket_id = 'Documents')
WITH CHECK (bucket_id = 'Documents');
