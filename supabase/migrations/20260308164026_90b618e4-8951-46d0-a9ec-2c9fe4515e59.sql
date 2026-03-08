
-- Create grade_level enum
CREATE TYPE public.grade_level AS ENUM (
  'الصف السابع',
  'الصف الثامن',
  'الصف التاسع',
  'الصف العاشر',
  'الصف الحادي عشر',
  'الصف الثاني عشر'
);

-- Add grade column to videos
ALTER TABLE public.videos ADD COLUMN grade public.grade_level NULL;

-- Add grade column to quizzes
ALTER TABLE public.quizzes ADD COLUMN grade public.grade_level NULL;

-- Add grade column to profiles (student's grade)
ALTER TABLE public.profiles ADD COLUMN grade public.grade_level NULL;
