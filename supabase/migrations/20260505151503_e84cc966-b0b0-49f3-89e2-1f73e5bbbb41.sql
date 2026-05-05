-- Add target_grade to messages for grade-targeted broadcasts
ALTER TABLE public.messages
ADD COLUMN IF NOT EXISTS target_grade public.grade_level NULL;

-- Allow teachers and admins to view student roles (so they can list students to message)
CREATE POLICY "Teachers and admins can view student roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (
  role = 'student'::app_role
  AND (has_role(auth.uid(), 'teacher'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
);

-- Replace broadcast view policy to respect target_grade
DROP POLICY IF EXISTS "Authenticated users can view broadcast messages" ON public.messages;

CREATE POLICY "Authenticated users can view broadcast messages"
ON public.messages
FOR SELECT
TO authenticated
USING (
  is_broadcast = true
  AND (
    target_grade IS NULL
    OR target_grade = public.get_user_grade(auth.uid())
    OR has_role(auth.uid(), 'teacher'::app_role)
    OR has_role(auth.uid(), 'admin'::app_role)
  )
);
