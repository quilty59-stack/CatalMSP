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
  targetUserId?: string;
  metadata?: Record<string, any>;
  sendEmail?: boolean;
  emailSubject?: string;
  emailHtml?: string;
}

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const APP_URL = "https://msp-craft.lovable.app";
const LOGO_URL = "https://msp-craft.lovable.app/logo.png";

// ============================================
// EMAIL TEMPLATES
// ============================================

function generateMspCreatedEmail(metadata: Record<string, any>): { subject: string; html: string } {
  const { mspTitle, creatorName, mspSlug, siteName, commune } = metadata;
  const viewLink = `${APP_URL}/msp/${mspSlug}`;
  
  return {
    subject: "🔔 Nouvelle fiche MSP en attente de validation",
    html: `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Nouvelle MSP en attente</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td align="center" style="padding: 40px 20px;">
              <table role="presentation" style="max-width: 500px; width: 100%; background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); border-radius: 16px 16px 0 0; overflow: hidden;">
                <tr>
                  <td align="center" style="padding: 40px 30px;">
                    <img src="${LOGO_URL}" alt="CatalMSP" style="width: 80px; height: 80px; border-radius: 16px; margin-bottom: 16px;" />
                    <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">
                      🔔 Nouvelle MSP en attente
                    </h1>
                  </td>
                </tr>
              </table>
              
              <table role="presentation" style="max-width: 500px; width: 100%; background-color: #ffffff; border-radius: 0 0 16px 16px; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);">
                <tr>
                  <td style="padding: 40px 30px;">
                    <p style="color: #475569; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
                      Une nouvelle fiche MSP a été soumise et attend votre validation.
                    </p>
                    
                    <table style="width: 100%; background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%); border-radius: 12px; margin-bottom: 24px;">
                      <tr>
                        <td style="padding: 20px;">
                          <p style="margin: 0 0 8px; font-size: 14px; color: #64748b;">Soumise par</p>
                          <p style="margin: 0 0 16px; font-size: 18px; font-weight: 600; color: #1e293b;">${creatorName || 'Formateur'}</p>
                          
                          <p style="margin: 0 0 8px; font-size: 14px; color: #64748b;">Titre de la MSP</p>
                          <p style="margin: 0 0 16px; font-size: 16px; font-weight: 500; color: #dc2626;">${mspTitle || 'Non spécifié'}</p>
                          
                          ${siteName ? `
                          <p style="margin: 0 0 8px; font-size: 14px; color: #64748b;">Site</p>
                          <p style="margin: 0; font-size: 16px; font-weight: 500; color: #1e293b;">${siteName}${commune ? ` - ${commune}` : ''}</p>
                          ` : ''}
                        </td>
                      </tr>
                    </table>
                    
                    <table role="presentation" style="width: 100%;">
                      <tr>
                        <td align="center">
                          <a href="${viewLink}" style="display: inline-block; background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);">
                            Voir la MSP →
                          </a>
                        </td>
                      </tr>
                    </table>
                    
                    <p style="color: #94a3b8; font-size: 13px; text-align: center; margin: 24px 0 0; line-height: 1.5;">
                      Connectez-vous à CatalMSP pour valider ou refuser cette fiche.
                    </p>
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
    `
  };
}

function generateMspValidatedEmail(metadata: Record<string, any>): { subject: string; html: string } {
  const { mspTitle, mspSlug } = metadata;
  const viewLink = `${APP_URL}/msp/${mspSlug}`;
  
  return {
    subject: "✅ Votre fiche MSP a été validée !",
    html: `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>MSP Validée</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td align="center" style="padding: 40px 20px;">
              <table role="presentation" style="max-width: 500px; width: 100%; background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); border-radius: 16px 16px 0 0; overflow: hidden;">
                <tr>
                  <td align="center" style="padding: 40px 30px;">
                    <img src="${LOGO_URL}" alt="CatalMSP" style="width: 80px; height: 80px; border-radius: 16px; margin-bottom: 16px;" />
                    <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">
                      ✅ MSP Validée !
                    </h1>
                  </td>
                </tr>
              </table>
              
              <table role="presentation" style="max-width: 500px; width: 100%; background-color: #ffffff; border-radius: 0 0 16px 16px; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);">
                <tr>
                  <td style="padding: 40px 30px;">
                    <p style="color: #475569; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
                      Bonne nouvelle ! Votre fiche MSP a été validée par un administrateur.
                    </p>
                    
                    <table style="width: 100%; background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border-radius: 12px; margin-bottom: 24px;">
                      <tr>
                        <td style="padding: 20px;">
                          <p style="margin: 0 0 8px; font-size: 14px; color: #64748b;">Titre de la MSP</p>
                          <p style="margin: 0 0 16px; font-size: 18px; font-weight: 600; color: #16a34a;">${mspTitle || 'Votre MSP'}</p>
                          
                          <p style="margin: 0; font-size: 14px; color: #475569; line-height: 1.5;">
                            Elle est maintenant consultable par tous les formateurs de CatalMSP.
                          </p>
                        </td>
                      </tr>
                    </table>
                    
                    <table role="presentation" style="width: 100%;">
                      <tr>
                        <td align="center">
                          <a href="${viewLink}" style="display: inline-block; background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(22, 163, 74, 0.3);">
                            Consulter ma MSP →
                          </a>
                        </td>
                      </tr>
                    </table>
                    
                    <p style="color: #94a3b8; font-size: 13px; text-align: center; margin: 24px 0 0; line-height: 1.5;">
                      Merci pour votre contribution à CatalMSP !
                    </p>
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
    `
  };
}

function generateMspRejectedEmail(metadata: Record<string, any>): { subject: string; html: string } {
  const { mspTitle, reason } = metadata;
  
  return {
    subject: "❌ Votre fiche MSP n'a pas été validée",
    html: `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>MSP non validée</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td align="center" style="padding: 40px 20px;">
              <table role="presentation" style="max-width: 500px; width: 100%; background: linear-gradient(135deg, #ea580c 0%, #c2410c 100%); border-radius: 16px 16px 0 0; overflow: hidden;">
                <tr>
                  <td align="center" style="padding: 40px 30px;">
                    <img src="${LOGO_URL}" alt="CatalMSP" style="width: 80px; height: 80px; border-radius: 16px; margin-bottom: 16px;" />
                    <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">
                      MSP non validée
                    </h1>
                  </td>
                </tr>
              </table>
              
              <table role="presentation" style="max-width: 500px; width: 100%; background-color: #ffffff; border-radius: 0 0 16px 16px; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);">
                <tr>
                  <td style="padding: 40px 30px;">
                    <p style="color: #475569; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
                      Nous sommes désolés, votre fiche MSP n'a pas été validée par l'administrateur.
                    </p>
                    
                    <table style="width: 100%; background: linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%); border-radius: 12px; margin-bottom: 24px;">
                      <tr>
                        <td style="padding: 20px;">
                          <p style="margin: 0 0 8px; font-size: 14px; color: #64748b;">Titre de la MSP</p>
                          <p style="margin: 0 0 16px; font-size: 18px; font-weight: 600; color: #ea580c;">${mspTitle || 'Votre MSP'}</p>
                          
                          ${reason ? `
                          <p style="margin: 0 0 8px; font-size: 14px; color: #64748b;">Raison</p>
                          <p style="margin: 0; font-size: 14px; color: #475569; line-height: 1.5;">${reason}</p>
                          ` : `
                          <p style="margin: 0; font-size: 14px; color: #475569; line-height: 1.5;">
                            Vous pouvez contacter l'administrateur pour plus d'informations.
                          </p>
                          `}
                        </td>
                      </tr>
                    </table>
                    
                    <p style="color: #94a3b8; font-size: 13px; text-align: center; margin: 0; line-height: 1.5;">
                      N'hésitez pas à soumettre une nouvelle fiche MSP si nécessaire.
                    </p>
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
    `
  };
}

function generateSiteCreatedEmail(metadata: Record<string, any>): { subject: string; html: string } {
  const { siteName, creatorName, commune, siteSlug } = metadata;
  const viewLink = `${APP_URL}/sites/${siteSlug}`;
  
  return {
    subject: "📍 Nouveau site conventionné ajouté",
    html: `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Nouveau site conventionné</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td align="center" style="padding: 40px 20px;">
              <table role="presentation" style="max-width: 500px; width: 100%; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); border-radius: 16px 16px 0 0; overflow: hidden;">
                <tr>
                  <td align="center" style="padding: 40px 30px;">
                    <img src="${LOGO_URL}" alt="CatalMSP" style="width: 80px; height: 80px; border-radius: 16px; margin-bottom: 16px;" />
                    <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">
                      📍 Nouveau site conventionné
                    </h1>
                  </td>
                </tr>
              </table>
              
              <table role="presentation" style="max-width: 500px; width: 100%; background-color: #ffffff; border-radius: 0 0 16px 16px; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);">
                <tr>
                  <td style="padding: 40px 30px;">
                    <p style="color: #475569; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
                      Un nouveau site conventionné a été ajouté à CatalMSP.
                    </p>
                    
                    <table style="width: 100%; background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border-radius: 12px; margin-bottom: 24px;">
                      <tr>
                        <td style="padding: 20px;">
                          <p style="margin: 0 0 8px; font-size: 14px; color: #64748b;">Ajouté par</p>
                          <p style="margin: 0 0 16px; font-size: 18px; font-weight: 600; color: #1e293b;">${creatorName || 'Formateur'}</p>
                          
                          <p style="margin: 0 0 8px; font-size: 14px; color: #64748b;">Nom du site</p>
                          <p style="margin: 0 0 16px; font-size: 16px; font-weight: 500; color: #2563eb;">${siteName || 'Non spécifié'}</p>
                          
                          ${commune ? `
                          <p style="margin: 0 0 8px; font-size: 14px; color: #64748b;">Commune</p>
                          <p style="margin: 0; font-size: 16px; font-weight: 500; color: #1e293b;">${commune}</p>
                          ` : ''}
                        </td>
                      </tr>
                    </table>
                    
                    <table role="presentation" style="width: 100%;">
                      <tr>
                        <td align="center">
                          <a href="${viewLink}" style="display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);">
                            Voir le site →
                          </a>
                        </td>
                      </tr>
                    </table>
                    
                    <p style="color: #94a3b8; font-size: 13px; text-align: center; margin: 24px 0 0; line-height: 1.5;">
                      Ce site est maintenant disponible pour créer des MSP.
                    </p>
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
    `
  };
}

// ============================================
// HELPER FUNCTIONS
// ============================================

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

async function getAdminEmails(): Promise<string[]> {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  const adminUserIds = await getAdminUserIds();
  if (adminUserIds.length === 0) return [];
  
  const { data, error } = await supabase
    .from('profiles')
    .select('email')
    .in('user_id', adminUserIds);
  
  if (error) {
    console.error('Error fetching admin emails:', error);
    return [];
  }
  
  return data.map((p: any) => p.email).filter(Boolean);
}

async function getUserEmail(userId: string): Promise<string | null> {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  const { data, error } = await supabase
    .from('profiles')
    .select('email')
    .eq('user_id', userId)
    .single();
  
  if (error) {
    console.error('Error fetching user email:', error);
    return null;
  }
  
  return data?.email || null;
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
  const vapidPublicKey = Deno.env.get("VAPID_PUBLIC_KEY");
  const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY");
  
  if (!vapidPublicKey || !vapidPrivateKey) {
    console.log('VAPID keys not configured, skipping push notification');
    return;
  }
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  const { data: subscriptions, error } = await supabase
    .from('push_subscriptions')
    .select('*')
    .eq('user_id', userId);
  
  if (error || !subscriptions?.length) {
    console.log('No push subscriptions found for user:', userId);
    return;
  }
  
  console.log(`Sending push notification to ${subscriptions.length} subscription(s) for user:`, userId);
  
  // Web Push payload
  const payload = JSON.stringify({
    title,
    body,
    icon: '/logo.png',
    badge: '/logo.png',
    data: { url: link || '/' },
  });
  
  for (const sub of subscriptions) {
    try {
      // Build the JWT for VAPID authentication
      const endpoint = new URL(sub.endpoint);
      const audience = `${endpoint.protocol}//${endpoint.host}`;
      
      // Create VAPID JWT
      const header = { typ: 'JWT', alg: 'ES256' };
      const now = Math.floor(Date.now() / 1000);
      const claims = {
        aud: audience,
        exp: now + 12 * 60 * 60, // 12 hours
        sub: 'mailto:quilty59@gmail.com',
      };
      
      // Base64url encode
      const base64url = (data: any) => {
        const json = typeof data === 'string' ? data : JSON.stringify(data);
        const base64 = btoa(json);
        return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
      };
      
      const unsignedToken = `${base64url(header)}.${base64url(claims)}`;
      
      // Import the private key and sign
      const privateKeyBase64 = vapidPrivateKey.replace(/-/g, '+').replace(/_/g, '/');
      const privateKeyBuffer = Uint8Array.from(atob(privateKeyBase64), c => c.charCodeAt(0));
      
      const cryptoKey = await crypto.subtle.importKey(
        'raw',
        privateKeyBuffer,
        { name: 'ECDSA', namedCurve: 'P-256' },
        false,
        ['sign']
      );
      
      const signatureBuffer = await crypto.subtle.sign(
        { name: 'ECDSA', hash: 'SHA-256' },
        cryptoKey,
        new TextEncoder().encode(unsignedToken)
      );
      
      // Convert signature from DER to raw format (if needed) and base64url encode
      const signatureArray = new Uint8Array(signatureBuffer);
      const signatureBase64 = btoa(String.fromCharCode(...signatureArray))
        .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
      
      const jwt = `${unsignedToken}.${signatureBase64}`;
      
      // Send the push notification
      const response = await fetch(sub.endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `vapid t=${jwt}, k=${vapidPublicKey}`,
          'Content-Type': 'application/octet-stream',
          'Content-Encoding': 'aes128gcm',
          'TTL': '86400',
        },
        body: payload,
      });
      
      if (response.status === 201 || response.status === 200) {
        console.log('Push notification sent successfully to:', sub.endpoint.substring(0, 50) + '...');
      } else if (response.status === 410 || response.status === 404) {
        // Subscription expired or invalid, remove it
        console.log('Subscription expired, removing:', sub.id);
        await supabase.from('push_subscriptions').delete().eq('id', sub.id);
      } else {
        console.error('Push notification failed:', response.status, await response.text());
      }
    } catch (pushError) {
      console.error('Error sending push to subscription:', sub.id, pushError);
    }
  }
}

async function sendEmailNotification(
  emails: string[],
  subject: string,
  html: string
): Promise<void> {
  if (emails.length === 0) {
    console.log('No emails to send to');
    return;
  }
  
  try {
    const result = await resend.emails.send({
      from: "CatalMSP <nepasrepondre@catalmsp.fr>",
      to: emails,
      subject,
      html,
    });
    console.log('Email sent:', result);
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

// ============================================
// MAIN HANDLER
// ============================================

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: NotificationRequest = await req.json();
    const { type, title, message, link, targetUserId, metadata } = body;

    if (!type || !title || !message) {
      throw new Error("Missing required fields: type, title, message");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    let targetUserIds: string[] = [];

    // Determine target users for in-app notification
    if (targetUserId) {
      targetUserIds = [targetUserId];
    } else {
      targetUserIds = await getAdminUserIds();
    }

    console.log(`Sending ${type} notification to ${targetUserIds.length} user(s)`);

    // Create in-app notifications for all target users
    for (const userId of targetUserIds) {
      await createInAppNotification(userId, type, title, message, link, metadata);
      await sendPushNotification(userId, title, message, link);
    }

    // ============================================
    // AUTOMATIC EMAIL SENDING BASED ON TYPE
    // ============================================
    
    if (type === 'msp_created') {
      // Send email to admins
      const adminEmails = await getAdminEmails();
      const { subject, html } = generateMspCreatedEmail(metadata || {});
      await sendEmailNotification(adminEmails, subject, html);
      console.log('MSP created email sent to admins:', adminEmails);
    }
    
    else if (type === 'msp_validated') {
      // Send email to the creator (formateur)
      if (targetUserId) {
        const userEmail = await getUserEmail(targetUserId);
        if (userEmail) {
          const { subject, html } = generateMspValidatedEmail(metadata || {});
          await sendEmailNotification([userEmail], subject, html);
          console.log('MSP validated email sent to:', userEmail);
        }
      }
    }
    
    else if (type === 'msp_rejected') {
      // Send email to the creator (formateur)
      if (targetUserId) {
        const userEmail = await getUserEmail(targetUserId);
        if (userEmail) {
          const { subject, html } = generateMspRejectedEmail(metadata || {});
          await sendEmailNotification([userEmail], subject, html);
          console.log('MSP rejected email sent to:', userEmail);
        }
      }
    }
    
    else if (type === 'site_created') {
      // Send email to admins
      const adminEmails = await getAdminEmails();
      const { subject, html } = generateSiteCreatedEmail(metadata || {});
      await sendEmailNotification(adminEmails, subject, html);
      console.log('Site created email sent to admins:', adminEmails);
    }
    
    // Note: 'user_signup' emails are handled by send-admin-notification function

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
