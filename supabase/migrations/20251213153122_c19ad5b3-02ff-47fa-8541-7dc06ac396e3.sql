-- Create role enum
CREATE TYPE public.app_role AS ENUM ('faculty', 'hod', 'registrar');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  department TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (profile_id, role)
);

-- Create lectures table
CREATE TABLE public.lectures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  faculty_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  subject TEXT NOT NULL,
  time TEXT NOT NULL,
  room TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled',
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create lecture_reports table
CREATE TABLE public.lecture_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  faculty_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  subject TEXT NOT NULL,
  date DATE NOT NULL,
  topic_covered TEXT NOT NULL,
  duration INTEGER NOT NULL,
  status TEXT NOT NULL,
  remarks TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lectures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lecture_reports ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_profile_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE profile_id = _profile_id
      AND role = _role
  )
$$;

-- RLS Policies for profiles (everyone can read for demo)
CREATE POLICY "Anyone can read profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Anyone can insert profiles" ON public.profiles FOR INSERT WITH CHECK (true);

-- RLS Policies for user_roles (everyone can read for demo)
CREATE POLICY "Anyone can read roles" ON public.user_roles FOR SELECT USING (true);
CREATE POLICY "Anyone can insert roles" ON public.user_roles FOR INSERT WITH CHECK (true);

-- RLS Policies for lectures (everyone can read/write for demo)
CREATE POLICY "Anyone can read lectures" ON public.lectures FOR SELECT USING (true);
CREATE POLICY "Anyone can insert lectures" ON public.lectures FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update lectures" ON public.lectures FOR UPDATE USING (true);

-- RLS Policies for lecture_reports (everyone can read/write for demo)
CREATE POLICY "Anyone can read reports" ON public.lecture_reports FOR SELECT USING (true);
CREATE POLICY "Anyone can insert reports" ON public.lecture_reports FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update reports" ON public.lecture_reports FOR UPDATE USING (true);