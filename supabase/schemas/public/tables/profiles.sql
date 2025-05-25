-- Profiles table schema
-- Purpose: Store user profile information with proper RLS policies
-- Dependencies: auth.users (Supabase Auth)

CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT profiles_email_check CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT profiles_user_id_unique UNIQUE (user_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS profiles_user_id_idx ON profiles(user_id);
CREATE INDEX IF NOT EXISTS profiles_email_idx ON profiles(email);
CREATE INDEX IF NOT EXISTS profiles_created_at_idx ON profiles(created_at);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for anon role (public access)
CREATE POLICY "anon_select_profiles" ON profiles
    FOR SELECT TO anon
    USING (true); -- Allow public read access to all profiles

-- RLS Policies for authenticated role
CREATE POLICY "authenticated_select_profiles" ON profiles
    FOR SELECT TO authenticated
    USING (true); -- Allow authenticated users to read all profiles

CREATE POLICY "authenticated_insert_profiles" ON profiles
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id); -- Users can only create their own profile

CREATE POLICY "authenticated_update_profiles" ON profiles
    FOR UPDATE TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id); -- Users can only update their own profile

CREATE POLICY "authenticated_delete_profiles" ON profiles
    FOR DELETE TO authenticated
    USING (auth.uid() = user_id); -- Users can only delete their own profile

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 
