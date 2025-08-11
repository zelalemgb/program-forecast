import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
      return new Response(JSON.stringify({ error: 'Missing Supabase env config' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const serviceClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    const { email, password } = await req.json().catch(() => ({ email: undefined, password: undefined }));

    if (!email || !password) {
      return new Response(JSON.stringify({ error: 'email and password are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Block if any admin already exists (bootstrap once)
    const { data: existingAdmins, error: countErr } = await serviceClient
      .from('user_roles')
      .select('id', { count: 'exact', head: false })
      .eq('role', 'admin');

    if (countErr) {
      console.error('Count admins error:', countErr);
      return new Response(JSON.stringify({ error: 'Failed to verify existing admins' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    if ((existingAdmins?.length ?? 0) > 0) {
      return new Response(JSON.stringify({ error: 'Super admin already exists. Use an admin account to create more.' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Create the user with confirmed email
    const { data: created, error: createErr } = await serviceClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (createErr || !created?.user) {
      console.error('Create user error:', createErr);
      return new Response(JSON.stringify({ error: createErr?.message || 'Failed to create user' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Promote to admin role
    const { error: roleErr } = await serviceClient
      .from('user_roles')
      .insert({ user_id: created.user.id, role: 'admin' });

    if (roleErr) {
      console.error('Assign role error:', roleErr);
      return new Response(JSON.stringify({ error: 'User created but failed to assign admin role' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    return new Response(
      JSON.stringify({ ok: true, user_id: created.user.id, message: 'Super admin created and promoted.' }),
      { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  } catch (e) {
    console.error('Unhandled error:', e);
    return new Response(JSON.stringify({ error: 'Unexpected error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
});
