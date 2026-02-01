import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ManageUserRequest {
  action: 'create' | 'delete' | 'reset_password';
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  userId?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Non autorisé' }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    // Verify user is admin
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Non autorisé' }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Check admin role
    const { data: roleData } = await userClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (roleData?.role !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'Accès refusé - Admin requis' }),
        { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Admin client with service role
    const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    const body: ManageUserRequest = await req.json();
    const { action } = body;

    switch (action) {
      case 'create': {
        const { email, password, firstName, lastName } = body;
        if (!email || !password || !firstName || !lastName) {
          throw new Error('Email, mot de passe, prénom et nom requis');
        }

        const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: { first_name: firstName, last_name: lastName }
        });

        if (createError) throw createError;

        return new Response(
          JSON.stringify({ success: true, user: newUser.user }),
          { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      case 'delete': {
        const { userId } = body;
        if (!userId) {
          throw new Error('ID utilisateur requis');
        }

        // Delete profile first (cascade will handle user_roles)
        await adminClient.from('profiles').delete().eq('user_id', userId);
        await adminClient.from('user_roles').delete().eq('user_id', userId);

        const { error: deleteError } = await adminClient.auth.admin.deleteUser(userId);
        if (deleteError) throw deleteError;

        return new Response(
          JSON.stringify({ success: true }),
          { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      case 'reset_password': {
        const { email } = body;
        if (!email) {
          throw new Error('Email requis');
        }

        // Generate password reset link
        const { data, error: resetError } = await adminClient.auth.admin.generateLink({
          type: 'recovery',
          email,
          options: {
            redirectTo: `${req.headers.get('origin') || 'https://msp-craft.lovable.app'}/reset-password`
          }
        });

        if (resetError) throw resetError;

        // Get user info for email
        const { data: profile } = await adminClient
          .from('profiles')
          .select('first_name')
          .eq('email', email)
          .single();

        // Send custom reset email via Resend
        const resendResponse = await fetch(
          `${supabaseUrl}/functions/v1/send-password-reset`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${supabaseAnonKey}`
            },
            body: JSON.stringify({
              email,
              firstName: profile?.first_name || '',
              resetUrl: data.properties?.action_link
            })
          }
        );

        if (!resendResponse.ok) {
          const error = await resendResponse.json();
          throw new Error(error.error || 'Erreur envoi email');
        }

        return new Response(
          JSON.stringify({ success: true, message: 'Email de réinitialisation envoyé' }),
          { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      default:
        throw new Error('Action non reconnue');
    }
  } catch (error: any) {
    console.error("Error in admin-manage-user function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
