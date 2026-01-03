-- Create branches table
CREATE TABLE public.branches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read branches
CREATE POLICY "Anyone can read branches"
ON public.branches
FOR SELECT
USING (true);

-- Add branch_id to profiles
ALTER TABLE public.profiles 
ADD COLUMN branch_id UUID REFERENCES public.branches(id);

-- Insert default branches
INSERT INTO branches (id, name, code) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Computer Science', 'CS'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Electronics', 'ECE'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Administration', 'ADMIN');

-- Update existing profiles with branch_id based on department
UPDATE profiles SET branch_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' WHERE department = 'Computer Science';
UPDATE profiles SET branch_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb' WHERE department = 'Electronics';
UPDATE profiles SET branch_id = 'cccccccc-cccc-cccc-cccc-cccccccccccc' WHERE department = 'Administration';