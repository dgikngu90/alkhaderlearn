
-- Fix RLS policy for quiz_attempts to allow transition from in_progress to submitted
DROP POLICY IF EXISTS "Students can update own in-progress attempts" ON public.quiz_attempts;

CREATE POLICY "Students can update own in-progress attempts" ON public.quiz_attempts
FOR UPDATE TO authenticated
USING (student_id = auth.uid() AND status = 'in_progress')
WITH CHECK (student_id = auth.uid() AND (status = 'in_progress' OR status = 'submitted'));
