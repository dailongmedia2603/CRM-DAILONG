ALTER TABLE projects
ADD COLUMN start_date TIMESTAMPTZ,
ADD COLUMN team JSONB;

ALTER TABLE projects
RENAME COLUMN due_date TO end_date;