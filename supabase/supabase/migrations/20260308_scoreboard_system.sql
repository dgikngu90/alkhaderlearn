-- Create user_scores table for tracking student points
CREATE TABLE IF NOT EXISTS public.user_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  total_points INTEGER DEFAULT 0,
  video_watch_time_minutes INTEGER DEFAULT 0,
  quiz_correct_answers INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_scores ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own score" ON public.user_scores
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own score" ON public.user_scores
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage scores" ON public.user_scores
  FOR ALL USING (auth.role() = 'service_role');

-- Function to add video watch time points
CREATE OR REPLACE FUNCTION add_video_points(
  p_user_id UUID,
  p_minutes INTEGER
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.user_scores (user_id, total_points, video_watch_time_minutes, updated_at)
  VALUES (p_user_id, p_minutes, p_minutes, now())
  ON CONFLICT (user_id) DO UPDATE SET
    total_points = public.user_scores.total_points + p_minutes,
    video_watch_time_minutes = public.user_scores.video_watch_time_minutes + p_minutes,
    updated_at = now();
END;
$$;

-- Function to add quiz points (10 points per correct answer)
CREATE OR REPLACE FUNCTION add_quiz_points(
  p_user_id UUID,
  p_correct_answers INTEGER
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.user_scores (user_id, total_points, quiz_correct_answers, updated_at)
  VALUES (p_user_id, p_correct_answers * 10, p_correct_answers, now())
  ON CONFLICT (user_id) DO UPDATE SET
    total_points = public.user_scores.total_points + (p_correct_answers * 10),
    quiz_correct_answers = public.user_scores.quiz_correct_answers + p_correct_answers,
    updated_at = now();
END;
$$;
