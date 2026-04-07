
-- Fix the remaining WITH CHECK (true) on ip_bypass_requests
DROP POLICY IF EXISTS "Authenticated users can create bypass requests" ON public.ip_bypass_requests;
CREATE POLICY "Authenticated users can create bypass requests"
  ON public.ip_bypass_requests FOR INSERT
  TO authenticated
  WITH CHECK (ip_address IS NOT NULL AND requested_role IS NOT NULL);
