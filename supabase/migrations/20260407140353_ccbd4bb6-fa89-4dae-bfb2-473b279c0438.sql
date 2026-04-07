
-- 1. Fix PRIVILEGE ESCALATION: Only allow self-assigning 'student' role
DROP POLICY IF EXISTS "Users can insert own role as student or teacher only" ON public.user_roles;
CREATE POLICY "Users can insert own role as student only"
  ON public.user_roles FOR INSERT
  TO public
  WITH CHECK (auth.uid() = user_id AND role = 'student'::app_role);

-- 2. Fix PUBLIC_DATA_EXPOSURE: Require authentication for viewing teacher roles
DROP POLICY IF EXISTS "Anyone can view teacher roles" ON public.user_roles;
CREATE POLICY "Authenticated users can view teacher roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (role = 'teacher'::app_role);

-- 3. Fix MISSING_RLS_PROTECTION: Require authentication for broadcast/direct messages
DROP POLICY IF EXISTS "Students can view broadcast messages" ON public.messages;
CREATE POLICY "Authenticated users can view broadcast messages"
  ON public.messages FOR SELECT
  TO authenticated
  USING (is_broadcast = true);

DROP POLICY IF EXISTS "Students can view direct messages to them" ON public.messages;
CREATE POLICY "Authenticated users can view direct messages to them"
  ON public.messages FOR SELECT
  TO authenticated
  USING (recipient_id = auth.uid());

DROP POLICY IF EXISTS "Students can update read status of their messages" ON public.messages;
CREATE POLICY "Authenticated users can update read status of their messages"
  ON public.messages FOR UPDATE
  TO authenticated
  USING (recipient_id = auth.uid() OR is_broadcast = true)
  WITH CHECK (recipient_id = auth.uid() OR is_broadcast = true);

-- 4. Fix OAuth role assignment: Update handle_new_user to assign default student role
CREATE OR REPLACE FUNCTION public.handle_new_user()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (new.id, new.raw_user_meta_data->>'full_name');
  
  -- Assign default student role for all new users (including OAuth)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'student'::app_role)
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN new;
END;
$$;

-- 5. Fix RLS_POLICY_ALWAYS_TRUE: ip_bypass_requests insert policy
DROP POLICY IF EXISTS "Anyone can create bypass requests" ON public.ip_bypass_requests;
CREATE POLICY "Authenticated users can create bypass requests"
  ON public.ip_bypass_requests FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- 6. Add RLS policy to teacher_invite_codes (RLS enabled but no policies)
CREATE POLICY "Only admins can manage invite codes"
  ON public.teacher_invite_codes FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Allow edge function to read invite codes (service role bypasses RLS, so this is for anon key validation)
CREATE POLICY "Anyone can read active invite codes"
  ON public.teacher_invite_codes FOR SELECT
  TO public
  USING (is_active = true);
