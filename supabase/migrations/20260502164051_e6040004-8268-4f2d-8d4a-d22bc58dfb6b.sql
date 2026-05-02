
-- 1. Restrict teacher_invite_codes SELECT to admins only
DROP POLICY IF EXISTS "Anyone can read active invite codes" ON public.teacher_invite_codes;

-- 2. Remove hardcoded admin email from has_role
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
END;
$$;

-- 3. Hide correct answers from students until quiz is graded
DROP POLICY IF EXISTS "Students view quiz questions for their grade" ON public.quiz_questions;

-- Security-definer function returning quiz questions WITHOUT correct_answer
CREATE OR REPLACE FUNCTION public.get_quiz_questions_safe(p_quiz_id uuid)
RETURNS TABLE (
  id uuid,
  quiz_id uuid,
  question_text text,
  question_type text,
  options jsonb,
  points integer,
  order_index integer
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.quizzes q
    WHERE q.id = p_quiz_id
      AND q.is_published = true
      AND (q.grade IS NULL OR q.grade = public.get_user_grade(auth.uid())
           OR public.has_role(auth.uid(), 'teacher'::app_role)
           OR public.has_role(auth.uid(), 'admin'::app_role))
  ) THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT qq.id, qq.quiz_id, qq.question_text, qq.question_type,
         qq.options, qq.points, qq.order_index
  FROM public.quiz_questions qq
  WHERE qq.quiz_id = p_quiz_id
  ORDER BY qq.order_index;
END;
$$;

-- Security-definer function: full questions (with correct_answer) only after attempt is graded
CREATE OR REPLACE FUNCTION public.get_quiz_questions_for_review(p_attempt_id uuid)
RETURNS TABLE (
  id uuid,
  quiz_id uuid,
  question_text text,
  question_type text,
  options jsonb,
  correct_answer text,
  points integer,
  order_index integer
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_quiz_id uuid;
  v_student_id uuid;
  v_status text;
BEGIN
  SELECT a.quiz_id, a.student_id, a.status
    INTO v_quiz_id, v_student_id, v_status
  FROM public.quiz_attempts a
  WHERE a.id = p_attempt_id;

  IF v_quiz_id IS NULL THEN
    RETURN;
  END IF;

  -- Allow only the student who took it (when graded), or teacher/admin
  IF NOT (
    (v_student_id = auth.uid() AND v_status = 'graded')
    OR public.has_role(auth.uid(), 'teacher'::app_role)
    OR public.has_role(auth.uid(), 'admin'::app_role)
  ) THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT qq.id, qq.quiz_id, qq.question_text, qq.question_type,
         qq.options, qq.correct_answer, qq.points, qq.order_index
  FROM public.quiz_questions qq
  WHERE qq.quiz_id = v_quiz_id
  ORDER BY qq.order_index;
END;
$$;
