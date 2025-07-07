-- Step 1: Drop existing foreign key constraints that reference personnel
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_assigner_id_fkey;
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_assignee_id_fkey;
ALTER TABLE feedback DROP CONSTRAINT IF EXISTS feedback_user_id_fkey;
ALTER TABLE intern_tasks DROP CONSTRAINT IF EXISTS intern_tasks_intern_id_fkey;

-- Step 2: Drop the old primary key on personnel
ALTER TABLE personnel DROP CONSTRAINT IF EXISTS personnel_pkey;

-- Step 3: Drop the default value for the id column
ALTER TABLE personnel ALTER COLUMN id DROP DEFAULT;

-- Step 4: Add the new foreign key to auth.users and make it the primary key
ALTER TABLE personnel 
ADD CONSTRAINT personnel_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE,
ADD PRIMARY KEY (id);

-- Step 5: Re-add the foreign key constraints to the other tables
ALTER TABLE tasks 
ADD CONSTRAINT tasks_assigner_id_fkey FOREIGN KEY (assigner_id) REFERENCES personnel(id) ON DELETE SET NULL,
ADD CONSTRAINT tasks_assignee_id_fkey FOREIGN KEY (assignee_id) REFERENCES personnel(id) ON DELETE SET NULL;

ALTER TABLE feedback 
ADD CONSTRAINT feedback_user_id_fkey FOREIGN KEY (user_id) REFERENCES personnel(id) ON DELETE SET NULL;

ALTER TABLE intern_tasks 
ADD CONSTRAINT intern_tasks_intern_id_fkey FOREIGN KEY (intern_id) REFERENCES personnel(id) ON DELETE SET NULL;