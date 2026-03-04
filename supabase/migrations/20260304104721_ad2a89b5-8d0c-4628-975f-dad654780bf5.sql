
-- Quizzes table
CREATE TABLE public.quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  time_limit_minutes INTEGER,
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Quiz questions table
CREATE TABLE public.quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL DEFAULT 'multiple_choice',
  options JSONB,
  correct_answer TEXT NOT NULL,
  points INTEGER NOT NULL DEFAULT 1,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Quiz attempts table
CREATE TABLE public.quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  student_id UUID NOT NULL,
  answers JSONB NOT NULL DEFAULT '{}',
  score NUMERIC,
  max_score NUMERIC,
  ai_feedback TEXT,
  status TEXT NOT NULL DEFAULT 'in_progress',
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;

-- Quizzes policies
CREATE POLICY "Teachers can create quizzes" ON public.quizzes FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'teacher') AND teacher_id = auth.uid());

CREATE POLICY "Teachers can update own quizzes" ON public.quizzes FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'teacher') AND teacher_id = auth.uid());

CREATE POLICY "Teachers can delete own quizzes" ON public.quizzes FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'teacher') AND teacher_id = auth.uid());

CREATE POLICY "Teachers can view own quizzes" ON public.quizzes FOR SELECT TO authenticated
  USING (teacher_id = auth.uid());

CREATE POLICY "Students can view published quizzes" ON public.quizzes FOR SELECT TO authenticated
  USING (is_published = true);

CREATE POLICY "Admins can view all quizzes" ON public.quizzes FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Quiz questions policies
CREATE POLICY "Teachers can manage own quiz questions" ON public.quiz_questions FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.quizzes WHERE quizzes.id = quiz_questions.quiz_id AND quizzes.teacher_id = auth.uid()));

CREATE POLICY "Students can view published quiz questions" ON public.quiz_questions FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.quizzes WHERE quizzes.id = quiz_questions.quiz_id AND quizzes.is_published = true));

-- Quiz attempts policies
CREATE POLICY "Students can create attempts" ON public.quiz_attempts FOR INSERT TO authenticated
  WITH CHECK (student_id = auth.uid());

CREATE POLICY "Students can view own attempts" ON public.quiz_attempts FOR SELECT TO authenticated
  USING (student_id = auth.uid());

CREATE POLICY "Students can update own in-progress attempts" ON public.quiz_attempts FOR UPDATE TO authenticated
  USING (student_id = auth.uid() AND status = 'in_progress');

CREATE POLICY "Teachers can view attempts for own quizzes" ON public.quiz_attempts FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.quizzes WHERE quizzes.id = quiz_attempts.quiz_id AND quizzes.teacher_id = auth.uid()));

CREATE POLICY "Admins can view all attempts" ON public.quiz_attempts FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
