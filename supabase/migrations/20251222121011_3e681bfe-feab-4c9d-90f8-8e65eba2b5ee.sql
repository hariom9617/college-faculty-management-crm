-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create attendance table
CREATE TABLE IF NOT EXISTS public.attendance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  role TEXT NOT NULL,
  branch_id UUID,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'present',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Enable RLS on notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow select notifications"
ON public.notifications
FOR SELECT
USING (true);

CREATE POLICY "Allow insert notifications"
ON public.notifications
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow update notifications"
ON public.notifications
FOR UPDATE
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow delete notifications"
ON public.notifications
FOR DELETE
USING (true);

-- Enable RLS on attendance
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow select attendance"
ON public.attendance
FOR SELECT
USING (true);

CREATE POLICY "Allow insert attendance"
ON public.attendance
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow update attendance"
ON public.attendance
FOR UPDATE
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow delete attendance"
ON public.attendance
FOR DELETE
USING (true);

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;