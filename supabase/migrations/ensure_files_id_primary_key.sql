/*
  # Ensure 'id' column in 'files' table is a PRIMARY KEY
  1. Check if a primary key constraint exists on 'files' table.
  2. If not, add a primary key on the 'id' column.
*/
DO $$
BEGIN
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
END $$;
