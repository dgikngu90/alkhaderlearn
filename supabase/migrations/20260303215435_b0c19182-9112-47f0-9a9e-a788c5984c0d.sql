CREATE OR REPLACE FUNCTION public.assign_user_role(p_user_id uuid, p_role app_role)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_role NOT IN ('student'::app_role, 'teacher'::app_role) THEN
    RAISE EXCEPTION 'Only student or teacher roles can be assigned via assign_user_role';
  END IF;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (p_user_id, p_role)
  ON CONFLICT (user_id, role) DO NOTHING;
END;
$$;

GRANT EXECUTE ON FUNCTION public.assign_user_role(uuid, app_role) TO anon, authenticated, service_role;