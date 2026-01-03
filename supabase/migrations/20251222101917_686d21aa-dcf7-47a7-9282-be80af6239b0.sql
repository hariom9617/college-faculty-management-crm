-- Allow authenticated users to delete lectures
CREATE POLICY "Authenticated users can delete lectures" 
ON public.lectures 
FOR DELETE 
USING (auth.uid() IS NOT NULL);