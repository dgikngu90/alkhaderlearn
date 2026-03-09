DROP POLICY IF EXISTS "Students can update own in-progress attempts" ON public.quiz_attempts;

CREATE POLICY "Students can update own in-progress attempts"
ON public.quiz_attempts
FOR UPDATE
USING (
  student_id = auth.uid()
  AND status = 'in_progress'
)
WITH CHECK (
  student_id = auth.uid()
  AND status IN ('in_progress', 'submitted')
);