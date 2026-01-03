-- Add year column to subjects table
ALTER TABLE public.subjects ADD COLUMN year integer NOT NULL DEFAULT 1;

-- Add constraint to ensure year is between 1 and 4
ALTER TABLE public.subjects ADD CONSTRAINT subjects_year_check CHECK (year >= 1 AND year <= 4);

-- Add unique constraint for subject code within branch and year
ALTER TABLE public.subjects ADD CONSTRAINT subjects_code_branch_year_unique UNIQUE (code, branch_id, year);