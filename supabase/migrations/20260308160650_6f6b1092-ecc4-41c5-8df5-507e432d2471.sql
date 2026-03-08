-- Attach the existing create_admin_if_needed function as a trigger on auth.users
-- This ensures the admin role is auto-assigned when hiihhijhj@gmail.com signs up
CREATE OR REPLACE TRIGGER on_auth_user_created_admin
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.create_admin_if_needed();