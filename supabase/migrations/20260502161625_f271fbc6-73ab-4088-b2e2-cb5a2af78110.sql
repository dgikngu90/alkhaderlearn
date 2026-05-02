CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_grade public.grade_level;
BEGIN
  BEGIN
    v_grade := (new.raw_user_meta_data->>'grade')::public.grade_level;
  EXCEPTION WHEN OTHERS THEN
    v_grade := NULL;
  END;

  INSERT INTO public.profiles (id, full_name, grade)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', v_grade);

  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'student'::app_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN new;
END;
$function$;