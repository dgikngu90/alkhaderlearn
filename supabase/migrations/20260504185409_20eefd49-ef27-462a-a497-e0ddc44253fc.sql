
-- Modules table
CREATE TABLE public.modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  grade public.grade_level,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can manage own modules"
ON public.modules FOR ALL TO authenticated
USING (has_role(auth.uid(), 'teacher'::app_role) AND teacher_id = auth.uid())
WITH CHECK (has_role(auth.uid(), 'teacher'::app_role) AND teacher_id = auth.uid());

CREATE POLICY "Admins can view all modules"
ON public.modules FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Students view published modules for their grade"
ON public.modules FOR SELECT TO authenticated
USING (
  is_published = true AND (
    grade IS NULL
    OR grade = get_user_grade(auth.uid())
    OR has_role(auth.uid(), 'teacher'::app_role)
    OR has_role(auth.uid(), 'admin'::app_role)
  )
);

CREATE TRIGGER update_modules_updated_at
BEFORE UPDATE ON public.modules
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Lessons table
CREATE TABLE public.lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  youtube_video_id TEXT,
  notes TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can manage own lessons"
ON public.lessons FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.modules m WHERE m.id = lessons.module_id AND m.teacher_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM public.modules m WHERE m.id = lessons.module_id AND m.teacher_id = auth.uid()));

CREATE POLICY "Students view lessons of accessible modules"
ON public.lessons FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.modules m
    WHERE m.id = lessons.module_id
      AND m.is_published = true
      AND (
        m.grade IS NULL
        OR m.grade = get_user_grade(auth.uid())
        OR has_role(auth.uid(), 'teacher'::app_role)
        OR has_role(auth.uid(), 'admin'::app_role)
      )
  )
);

CREATE TRIGGER update_lessons_updated_at
BEFORE UPDATE ON public.lessons
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_lessons_module ON public.lessons(module_id, order_index);
CREATE INDEX idx_modules_teacher ON public.modules(teacher_id, order_index);
