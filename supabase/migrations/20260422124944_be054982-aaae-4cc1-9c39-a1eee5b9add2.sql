-- Create games table (teacher creates a game with a set of questions)
CREATE TABLE public.pacman_games (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  grade public.grade_level,
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.pacman_games ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can create pacman games"
ON public.pacman_games FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'teacher'::app_role) AND teacher_id = auth.uid());

CREATE POLICY "Teachers can update own pacman games"
ON public.pacman_games FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'teacher'::app_role) AND teacher_id = auth.uid());

CREATE POLICY "Teachers can delete own pacman games"
ON public.pacman_games FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'teacher'::app_role) AND teacher_id = auth.uid());

CREATE POLICY "Teachers can view own pacman games"
ON public.pacman_games FOR SELECT TO authenticated
USING (teacher_id = auth.uid());

CREATE POLICY "Students can view published pacman games"
ON public.pacman_games FOR SELECT TO authenticated
USING (is_published = true);

CREATE POLICY "Admins can view all pacman games"
ON public.pacman_games FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_pacman_games_updated_at
BEFORE UPDATE ON public.pacman_games
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create questions table (each question with 4 answers a/b/c/d)
CREATE TABLE public.pacman_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  game_id UUID NOT NULL REFERENCES public.pacman_games(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  answer_a TEXT NOT NULL,
  answer_b TEXT NOT NULL,
  answer_c TEXT NOT NULL,
  answer_d TEXT NOT NULL,
  correct_answer TEXT NOT NULL CHECK (correct_answer IN ('a','b','c','d')),
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.pacman_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can manage own pacman questions"
ON public.pacman_questions FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.pacman_games WHERE pacman_games.id = pacman_questions.game_id AND pacman_games.teacher_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM public.pacman_games WHERE pacman_games.id = pacman_questions.game_id AND pacman_games.teacher_id = auth.uid()));

CREATE POLICY "Students can view published pacman questions"
ON public.pacman_questions FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.pacman_games WHERE pacman_games.id = pacman_questions.game_id AND pacman_games.is_published = true));

-- Track game attempts for points
CREATE TABLE public.pacman_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  game_id UUID NOT NULL REFERENCES public.pacman_games(id) ON DELETE CASCADE,
  student_id UUID NOT NULL,
  correct_count INTEGER NOT NULL DEFAULT 0,
  points_earned INTEGER NOT NULL DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.pacman_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can create own pacman attempts"
ON public.pacman_attempts FOR INSERT TO authenticated
WITH CHECK (student_id = auth.uid());

CREATE POLICY "Students can view own pacman attempts"
ON public.pacman_attempts FOR SELECT TO authenticated
USING (student_id = auth.uid());

CREATE POLICY "Teachers can view attempts for own games"
ON public.pacman_attempts FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.pacman_games WHERE pacman_games.id = pacman_attempts.game_id AND pacman_games.teacher_id = auth.uid()));