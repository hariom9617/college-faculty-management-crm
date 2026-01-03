-- Drop existing policies on subjects table
DROP POLICY IF EXISTS "Anyone can read subjects" ON public.subjects;
DROP POLICY IF EXISTS "Authenticated users can delete subjects" ON public.subjects;
DROP POLICY IF EXISTS "Authenticated users can insert subjects" ON public.subjects;
DROP POLICY IF EXISTS "Authenticated users can update subjects" ON public.subjects;

-- Enable RLS if not already enabled
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to INSERT subjects
CREATE POLICY "Allow insert subjects"
ON public.subjects
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow authenticated users to SELECT subjects
CREATE POLICY "Allow select subjects"
ON public.subjects
FOR SELECT
TO authenticated
USING (true);

-- Allow authenticated users to UPDATE subjects
CREATE POLICY "Allow update subjects"
ON public.subjects
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Allow authenticated users to DELETE subjects
CREATE POLICY "Allow delete subjects"
ON public.subjects
FOR DELETE
TO authenticated
USING (true);