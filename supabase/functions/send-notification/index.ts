import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

type NotificationType = 'msp_created' | 'msp_validated' | 'msp_rejected' | 'site_created' | 'user_signup';

interface NotificationRequest {
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  targetUserId?: string; // If set, send to specific user; otherwise send to all admins
  metadata?: Record<string, any>;
  sendEmail?: boolean;
  emailSubject?: string;
  emailHtml?: string;
}

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

async function getAdminUserIds(): Promise<string[]> {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  const { data, error } = await supabase
    .from('user_roles')
    .select('user_id')
    .eq('role', 'admin');
  
  if (error) {
    console.error('Error fetching admin users:', error);
    return [];
  }
  
  return data.map((r: any) => r.user_id);
}

async function createInAppNotification(
  userId: string,
  type: NotificationType,
  title: string,
  message: string,
  link?: string,
  metadata?: Record<string, any>
): Promise<void> {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  const { error } = await supabase
    .from('notifications')
    .insert({
      user_id: userId,
      type,
      title,
      message,
      link: link || null,
      metadata: metadata || {},
    });
  
  if (error) {
    console.error('Error creating notification:', error);
  }
}

async function sendPushNotification(
  userId: string,
  title: string,
  body: string,
  link?: string
): Promise<void> {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  // Get user's push subscriptions
  const { data: subscriptions, error } = await supabase
    .from('push_subscriptions')
    .select('*')
    .eq('user_id', userId);
  
  if (error || !subscriptions?.length) {
    console.log('No push subscriptions found for user:', userId);
    return;
  }
  
  // Note: In production, you would use web-push library to send actual push notifications
  // For now, we log this - the actual push would require VAPID private key
  console.log('Would send push notification to', subscriptions.length, 'subscription(s) for user:', userId);
  console.log('Push payload:', { title, body, link });
}

async function sendEmailNotification(
  email: string,
  subject: string,
  html: string
): Promise<void> {
  try {
    const result = await resend.emails.send({
      from: "CatalMSP <nepasrepondre@catalmsp.fr>",
      to: [email],
      subject,
      html,
    });
    console.log('Email sent:', result);
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

function generateEmailTemplate(title: string, message: string, link?: string, buttonText?: string): string {
  const logoUrl = "https://msp-craft.lovable.app/logo.png";
  const buttonHtml = link && buttonText ? `
    <table role="presentation" style="width: 100%; margin-top: 24px;">
      <tr>
        <td align="center">
          <a href="${link}" style="display: inline-block; background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
            ${buttonText} →
          </a>
        </td>
      </tr>
    </table>
  ` : '';

  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
      <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
          <td align="center" style="padding: 40px 20px;">
            <table role="presentation" style="max-width: 500px; width: 100%; background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); border-radius: 16px 16px 0 0; overflow: hidden;">
              <tr>
                <td align="center" style="padding: 40px 30px;">
                  <img src="${logoUrl}" alt="CatalMSP" style="width: 80px; height: 80px; border-radius: 16px; margin-bottom: 16px;" />
                  <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">
                    ${title}
                  </h1>
                </td>
              </tr>
            </table>
            
            <table role="presentation" style="max-width: 500px; width: 100%; background-color: #ffffff; border-radius: 0 0 16px 16px; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);">
              <tr>
                <td style="padding: 40px 30px;">
                  <p style="color: #475569; font-size: 16px; line-height: 1.6; margin: 0;">
                    ${message}
                  </p>
                  ${buttonHtml}
                </td>
              </tr>
            </table>
            
            <p style="color: #94a3b8; font-size: 12px; margin-top: 24px;">
              © ${new Date().getFullYear()} CatalMSP - Tous droits réservés
            </p>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: NotificationRequest = await req.json();
    const { type, title, message, link, targetUserId, metadata, sendEmail, emailSubject, emailHtml } = body;

    if (!type || !title || !message) {
      throw new Error("Missing required fields: type, title, message");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    let targetUserIds: string[] = [];

    // Determine target users
    if (targetUserId) {
      targetUserIds = [targetUserId];
    } else {
      // Send to all admins
      targetUserIds = await getAdminUserIds();
    }

    console.log(`Sending ${type} notification to ${targetUserIds.length} user(s)`);

    // Create in-app notifications for all target users
    for (const userId of targetUserIds) {
      await createInAppNotification(userId, type, title, message, link, metadata);
      await sendPushNotification(userId, title, message, link);
    }

    // Send email if requested
    if (sendEmail && targetUserIds.length > 0) {
      // Get email addresses for target users
      const { data: profiles } = await supabase
        .from('profiles')
        .select('email')
        .in('user_id', targetUserIds);
      
      const html = emailHtml || generateEmailTemplate(title, message, link, 'Voir les détails');
      
      for (const profile of (profiles || [])) {
        await sendEmailNotification(profile.email, emailSubject || title, html);
      }
    }

    return new Response(
      JSON.stringify({ success: true, notifiedUsers: targetUserIds.length }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
