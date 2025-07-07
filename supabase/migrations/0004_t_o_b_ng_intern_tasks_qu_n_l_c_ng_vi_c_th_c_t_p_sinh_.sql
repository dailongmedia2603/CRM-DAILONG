CREATE TABLE intern_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    intern_id UUID REFERENCES personnel(id),
    intern_name TEXT,
    deadline TIMESTAMPTZ,
    priority TEXT,
    comment_status TEXT,
    post_status TEXT,
    comment_count INT,
    post_count INT,
    work_link TEXT
);
ALTER TABLE intern_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public intern_tasks are viewable by everyone." ON intern_tasks FOR SELECT USING (true);
CREATE POLICY "Users can insert their own intern_tasks." ON intern_tasks FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their own intern_tasks." ON intern_tasks FOR UPDATE USING (true);
CREATE POLICY "Users can delete their own intern_tasks." ON intern_tasks FOR DELETE USING (true);