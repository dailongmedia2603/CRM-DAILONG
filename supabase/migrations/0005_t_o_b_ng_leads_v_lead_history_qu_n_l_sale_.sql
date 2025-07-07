CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    phone TEXT,
    product TEXT,
    created_by_id UUID,
    created_by_name TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    potential TEXT,
    status TEXT,
    result TEXT,
    archived BOOLEAN DEFAULT false,
    next_follow_up_date TIMESTAMPTZ
);
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public leads are viewable by everyone." ON leads FOR SELECT USING (true);
CREATE POLICY "Users can manage their own leads." ON leads FOR ALL USING (true);

CREATE TABLE lead_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    date TIMESTAMPTZ DEFAULT now(),
    user_id UUID,
    user_name TEXT,
    content TEXT,
    type TEXT,
    next_follow_up_date TIMESTAMPTZ,
    next_follow_up_content TEXT
);
ALTER TABLE lead_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public lead history is viewable by everyone." ON lead_history FOR SELECT USING (true);
CREATE POLICY "Users can manage their own lead history." ON lead_history FOR ALL USING (true);