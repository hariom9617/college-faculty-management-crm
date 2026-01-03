-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Registrar can insert branches" ON public.branches;
DROP POLICY IF EXISTS "Registrar can update branches" ON public.branches;
DROP POLICY IF EXISTS "Registrar can delete branches" ON public.branches;
DROP POLICY IF EXISTS "Anyone can read branches" ON public.branches;

-- Create permissive policies that actually work
CREATE POLICY "Anyone can read branches" 
ON public.branches 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can insert branches" 
ON public.branches 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update branches" 
ON public.branches 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete branches" 
ON public.branches 
FOR DELETE 
USING (auth.uid() IS NOT NULL);