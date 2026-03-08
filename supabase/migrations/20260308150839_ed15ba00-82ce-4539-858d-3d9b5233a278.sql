
CREATE TABLE public.user_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  total_points integer NOT NULL DEFAULT 0,
  quiz_correct_answers integer NOT NULL DEFAULT 0,
  video_watch_time_minutes integer NOT NULL DEFAULT 0,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.user_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own scores" ON public.user_scores FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own scores" ON public.user_scores FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own scores" ON public.user_scores FOR UPDATE USING (auth.uid() = user_id);

-- Function to add points (used by edge functions with service role)
CREATE OR REPLACE FUNCTION public.add_points(p_user_id uuid, p_points integer, p_correct_answers integer DEFAULT 0, p_watch_minutes integer DEFAULT 0)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.user_scores (user_id, total_points, quiz_correct_answers, video_watch_time_minutes)
  VALUES (p_user_id, p_points, p_correct_answers, p_watch_minutes)
  ON CONFLICT (user_id) DO UPDATE SET
    total_points = user_scores.total_points + p_points,
    quiz_correct_answers = user_scores.quiz_correct_answers + p_correct_answers,
    video_watch_time_minutes = user_scores.video_watch_time_minutes + p_watch_minutes,
    updated_at = now();
END;
$$;
