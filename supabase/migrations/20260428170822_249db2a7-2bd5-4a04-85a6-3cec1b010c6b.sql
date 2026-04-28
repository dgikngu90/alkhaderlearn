
-- Helper: get current user's grade
CREATE OR REPLACE FUNCTION public.get_user_grade(_user_id uuid)
RETURNS grade_level
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT grade FROM public.profiles WHERE id = _user_id LIMIT 1
$$;

-- ============== VIDEOS ==============
DROP POLICY IF EXISTS "Anyone can view videos" ON public.videos;

CREATE POLICY "Students view videos for their grade"
ON public.videos FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'teacher'::app_role)
  OR has_role(auth.uid(), 'admin'::app_role)
  OR grade IS NULL
  OR grade = public.get_user_grade(auth.uid())
);

-- ============== QUIZZES ==============
DROP POLICY IF EXISTS "Students can view published quizzes" ON public.quizzes;

CREATE POLICY "Students can view published quizzes for their grade"
ON public.quizzes FOR SELECT
TO authenticated
USING (
  is_published = true
  AND (
    grade IS NULL
    OR grade = public.get_user_grade(auth.uid())
    OR has_role(auth.uid(), 'teacher'::app_role)
    OR has_role(auth.uid(), 'admin'::app_role)
  )
);

-- ============== QUIZ QUESTIONS ==============
DROP POLICY IF EXISTS "Students can view published quiz questions" ON public.quiz_questions;

CREATE POLICY "Students view quiz questions for their grade"
ON public.quiz_questions FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.quizzes q
    WHERE q.id = quiz_questions.quiz_id
      AND q.is_published = true
      AND (
        q.grade IS NULL
        OR q.grade = public.get_user_grade(auth.uid())
        OR has_role(auth.uid(), 'teacher'::app_role)
        OR has_role(auth.uid(), 'admin'::app_role)
      )
  )
);

-- ============== PACMAN GAMES ==============
DROP POLICY IF EXISTS "Students can view published pacman games" ON public.pacman_games;

CREATE POLICY "Students view pacman games for their grade"
ON public.pacman_games FOR SELECT
TO authenticated
USING (
  is_published = true
  AND (
    grade IS NULL
    OR grade = public.get_user_grade(auth.uid())
    OR has_role(auth.uid(), 'teacher'::app_role)
    OR has_role(auth.uid(), 'admin'::app_role)
  )
);

-- ============== PACMAN QUESTIONS ==============
DROP POLICY IF EXISTS "Students can view published pacman questions" ON public.pacman_questions;

CREATE POLICY "Students view pacman questions for their grade"
ON public.pacman_questions FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.pacman_games g
    WHERE g.id = pacman_questions.game_id
      AND g.is_published = true
      AND (
        g.grade IS NULL
        OR g.grade = public.get_user_grade(auth.uid())
        OR has_role(auth.uid(), 'teacher'::app_role)
        OR has_role(auth.uid(), 'admin'::app_role)
      )
  )
);

-- ============== TEACHER ACCESS TO STUDENT PROFILES (for scores) ==============
CREATE POLICY "Teachers can view profiles of students who attempted their quizzes"
ON public.profiles FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'teacher'::app_role)
  AND (
    EXISTS (
      SELECT 1 FROM public.quiz_attempts qa
      JOIN public.quizzes q ON q.id = qa.quiz_id
      WHERE qa.student_id = profiles.id
        AND q.teacher_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.pacman_attempts pa
      JOIN public.pacman_games pg ON pg.id = pa.game_id
      WHERE pa.student_id = profiles.id
        AND pg.teacher_id = auth.uid()
    )
  )
);
