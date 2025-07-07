CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    links JSONB,
    assigner_id UUID REFERENCES personnel(id),
    assignee_id UUID REFERENCES personnel(id),
    deadline TIMESTAMPTZ,
    priority TEXT,
    status TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public tasks are viewable by everyone." ON tasks FOR SELECT USING (true);
CREATE POLICY "Users can insert their own tasks." ON tasks FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their own tasks." ON tasks FOR UPDATE USING (true);
CREATE POLICY "Users can delete their own tasks." ON tasks FOR DELETE USING (true);