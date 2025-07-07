CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    client_id UUID REFERENCES clients(id),
    client_name TEXT,
    progress INT,
    created_at TIMESTAMPTZ DEFAULT now(),
    due_date TIMESTAMPTZ,
    status TEXT,
    contract_value NUMERIC,
    link TEXT,
    archived BOOLEAN DEFAULT false,
    payments JSONB
);
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public projects are viewable by everyone." ON projects FOR SELECT USING (true);
CREATE POLICY "Users can insert their own projects." ON projects FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their own projects." ON projects FOR UPDATE USING (true);
CREATE POLICY "Users can delete their own projects." ON projects FOR DELETE USING (true);