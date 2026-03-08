CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_has_assigned_role boolean;
  v_is_primary_admin boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  ) INTO v_has_assigned_role;

  IF v_has_assigned_role THEN
    RETURN true;
  END IF;

  IF _role = 'admin'::app_role THEN
    SELECT EXISTS (
      SELECT 1
      FROM auth.users
      WHERE id = _user_id
        AND lower(email) = 'hiihhijhj@gmail.com'
    ) INTO v_is_primary_admin;

    RETURN v_is_primary_admin;
  END IF;

  RETURN false;
END;
$$;