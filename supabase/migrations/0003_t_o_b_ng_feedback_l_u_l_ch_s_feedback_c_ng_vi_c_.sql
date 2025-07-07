CREATE TABLE feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    user_id UUID REFERENCES personnel(id),
    user_name TEXT,
    message TEXT,
    timestamp TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public feedback is viewable by everyone." ON feedback FOR SELECT USING (true);
CREATE POLICY "Users can insert their own feedback." ON feedback FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their own feedback." ON feedback FOR UPDATE USING (true);
CREATE POLICY "Users can delete their own feedback." ON feedback FOR DELETE USING (true);