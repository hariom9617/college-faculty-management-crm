-- Add year and block columns to lectures table
ALTER TABLE public.lectures 
ADD COLUMN year integer NOT NULL DEFAULT 1 CHECK (year >= 1 AND year <= 4),
ADD COLUMN block text NOT NULL DEFAULT 'A' CHECK (block IN ('A', 'B', 'C', 'D'));

-- Update room column to be integer (room number within block)
-- First drop the old room column and recreate as integer
ALTER TABLE public.lectures DROP COLUMN room;
ALTER TABLE public.lectures ADD COLUMN room integer NOT NULL DEFAULT 1 CHECK (room >= 1 AND room <= 15);

-- Add RLS policies for branches table to allow registrar to manage
CREATE POLICY "Registrar can insert branches" 
ON public.branches 
FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Registrar can update branches" 
ON public.branches 
FOR UPDATE 
TO authenticated
USING (true);

CREATE POLICY "Registrar can delete branches" 
ON public.branches 
FOR DELETE 
TO authenticated
USING (true);