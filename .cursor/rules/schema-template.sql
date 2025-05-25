-- Table: example_table
-- Purpose: Template for creating tables with proper RLS
-- Dependencies: auth.users (if user-related)

CREATE TABLE IF NOT EXISTS example_table (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT example_table_name_check CHECK (length(name) > 0)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS example_table_user_id_idx ON example_table(user_id);
CREATE INDEX IF NOT EXISTS example_table_created_at_idx ON example_table(created_at);

-- Enable Row Level Security
ALTER TABLE example_table ENABLE ROW LEVEL SECURITY;

-- RLS Policies for anon role
CREATE POLICY "anon_select_example_table" ON example_table
    FOR SELECT TO anon
    USING (true); -- Adjust condition as needed

-- RLS Policies for authenticated role
CREATE POLICY "authenticated_select_example_table" ON example_table
    FOR SELECT TO authenticated
    USING (true); -- Adjust condition as needed

CREATE POLICY "authenticated_insert_example_table" ON example_table
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "authenticated_update_example_table" ON example_table
    FOR UPDATE TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "authenticated_delete_example_table" ON example_table
    FOR DELETE TO authenticated
    USING (auth.uid() = user_id); 
