import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const allowedOrigins = [
  'https://alkhaderlearn.lovable.app',
  'http://localhost:8080',
  'http://localhost:5173',
];

function getCorsHeaders(req: Request) {
  const origin = req.headers.get('origin') || '';
  const isAllowed = allowedOrigins.includes(origin) || origin.endsWith('.lovable.app');
  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : allowedOrigins[0],
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
  };
}

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { role, action, reason, userId } = await req.json();
    
    const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() 
      || req.headers.get('x-real-ip') 
      || req.headers.get('cf-connecting-ip')
      || 'unknown';
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    if (action === 'check') {
      const { data, error } = await supabase.rpc('can_ip_register', {
        p_ip_address: clientIP,
        p_role: role
      });
      
      if (error) {
        console.error('Error checking IP:', error);
        throw error;
      }
      
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
      
    } else if (action === 'register') {
      if (!userId) {
        throw new Error('User ID is required for registration');
      }

      if (role !== 'student' && role !== 'teacher') {
        throw new Error('Invalid role. Only student or teacher are allowed');
      }

      const { error: roleError } = await supabase.rpc('assign_user_role', {
        p_user_id: userId,
        p_role: role,
      });

      if (roleError) {
        console.error('Error assigning role:', roleError);
        throw new Error('Failed to assign role during registration');
      }

      const { error } = await supabase.rpc('register_ip_account', {
        p_ip_address: clientIP,
        p_user_id: userId,
        p_role: role
      });

      if (error) {
        console.error('Error registering IP:', error);
        throw error;
      }
      
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
      
    } else if (action === 'request_bypass') {
      const { error } = await supabase
        .from('ip_bypass_requests')
        .insert({
          ip_address: clientIP,
          requested_role: role,
          reason: reason || 'No reason provided'
        });
      
      if (error) {
        console.error('Error creating bypass request:', error);
        throw error;
      }
      
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Bypass request submitted. Please wait for admin approval.' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    throw new Error('Invalid action');
    
  } catch (error: unknown) {
    const corsHeaders = getCorsHeaders(req);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in check-ip-registration:', errorMessage);
    return new Response(JSON.stringify({ 
      error: errorMessage,
      allowed: false 
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});