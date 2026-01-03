-- Fix RLS policies for branches table
DROP POLICY IF EXISTS "Anyone can read branches" ON public.branches;
DROP POLICY IF EXISTS "Authenticated users can delete branches" ON public.branches;
DROP POLICY IF EXISTS "Authenticated users can insert branches" ON public.branches;
DROP POLICY IF EXISTS "Authenticated users can update branches" ON public.branches;

ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow select branches"
ON public.branches
FOR SELECT
USING (true);

CREATE POLICY "Allow insert branches"
ON public.branches
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow update branches"
ON public.branches
FOR UPDATE
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow delete branches"
ON public.branches
FOR DELETE
USING (true);

-- Fix RLS policies for lectures table
DROP POLICY IF EXISTS "Anyone can insert lectures" ON public.lectures;
DROP POLICY IF EXISTS "Anyone can read lectures" ON public.lectures;
DROP POLICY IF EXISTS "Anyone can update lectures" ON public.lectures;
DROP POLICY IF EXISTS "Authenticated users can delete lectures" ON public.lectures;

ALTER TABLE public.lectures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow select lectures"
ON public.lectures
FOR SELECT
USING (true);

CREATE POLICY "Allow insert lectures"
ON public.lectures
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow update lectures"
ON public.lectures
FOR UPDATE
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow delete lectures"
ON public.lectures
FOR DELETE
USING (true);

-- Fix RLS policies for lecture_reports table
DROP POLICY IF EXISTS "Anyone can insert reports" ON public.lecture_reports;
DROP POLICY IF EXISTS "Anyone can read reports" ON public.lecture_reports;
DROP POLICY IF EXISTS "Anyone can update reports" ON public.lecture_reports;

ALTER TABLE public.lecture_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow select reports"
ON public.lecture_reports
FOR SELECT
USING (true);

CREATE POLICY "Allow insert reports"
ON public.lecture_reports
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow update reports"
ON public.lecture_reports
FOR UPDATE
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow delete reports"
ON public.lecture_reports
FOR DELETE
USING (true);

-- Fix RLS policies for profiles table
DROP POLICY IF EXISTS "Anyone can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can read profiles" ON public.profiles;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow select profiles"
ON public.profiles
FOR SELECT
USING (true);

CREATE POLICY "Allow insert profiles"
ON public.profiles
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow update profiles"
ON public.profiles
FOR UPDATE
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow delete profiles"
ON public.profiles
FOR DELETE
USING (true);