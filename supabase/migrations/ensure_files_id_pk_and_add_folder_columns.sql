/*
  # Ensure 'id' is PRIMARY KEY and add 'is_folder' and 'parent_id' columns to 'files' table
  1. Ensure 'id' column in 'files' table is a PRIMARY KEY.
  2. Add 'is_folder' column (BOOLEAN, default FALSE) if it doesn't exist.
  3. Add 'parent_id' column (UUID, references files(id), ON DELETE CASCADE) if it doesn't exist.
*/
DO $$
BEGIN
    -- 1. Ensure 'id' column is a PRIMARY KEY
    -- Check if a primary key constraint exists on 'files' table
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conrelid = 'files'::regclass
          AND contype = 'p'
    ) THEN
        -- If no primary key exists, add one on 'id'
        ALTER TABLE files ADD PRIMARY KEY (id);
    END IF;

    -- 2. Add 'is_folder' column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='files' AND column_name='is_folder') THEN
        ALTER TABLE files ADD COLUMN is_folder BOOLEAN DEFAULT FALSE;
    END IF;

    -- 3. Add 'parent_id' column if it doesn't exist, referencing 'files(id)'
    -- Check if 'parent_id' column exists before attempting to add it
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='files' AND column_name='parent_id') THEN
        ALTER TABLE files ADD COLUMN parent_id UUID REFERENCES files(id) ON DELETE CASCADE;
    END IF;

END $$;
