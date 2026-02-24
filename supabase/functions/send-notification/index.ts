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

async function getAllApprovedUserIds(): Promise<string[]> {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  const { data, error } = await supabase
    .from('profiles')
    .select('user_id')
    .eq('is_approved', true);
  
  if (error) {
    console.error('Error fetching approved users:', error);
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

async function getAllApprovedEmails(): Promise<string[]> {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  const { data, error } = await supabase
    .from('profiles')
    .select('email')
    .eq('is_approved', true);
  
  if (error) {
    console.error('Error fetching approved user emails:', error);
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
  
  const payload = JSON.stringify({
    title,
    body,
    icon: '/logo.png',
    badge: '/logo.png',
    data: { url: link || '/' },
  });

  // Helper: base64url encode/decode
  const b64url = (buf: ArrayBuffer | Uint8Array) => {
    const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
    return btoa(String.fromCharCode(...bytes))
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  };
  const b64urlJson = (obj: unknown) => {
    return btoa(JSON.stringify(obj)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  };
  const b64urlDecode = (s: string) => {
    const padded = s.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - s.length % 4) % 4);
    return Uint8Array.from(atob(padded), c => c.charCodeAt(0));
  };

  // Import VAPID private key as JWK for ECDSA signing
  const vapidPrivateKeyBytes = b64urlDecode(vapidPrivateKey);
  const vapidPublicKeyBytes = b64urlDecode(vapidPublicKey);

  // Decode uncompressed public key (65 bytes: 0x04 || x(32) || y(32))
  const vapidPubX = b64url(vapidPublicKeyBytes.slice(1, 33));
  const vapidPubY = b64url(vapidPublicKeyBytes.slice(33, 65));
  const vapidPrivD = b64url(vapidPrivateKeyBytes);

  const vapidSigningKey = await crypto.subtle.importKey(
    'jwk',
    { kty: 'EC', crv: 'P-256', x: vapidPubX, y: vapidPubY, d: vapidPrivD },
    { name: 'ECDSA', namedCurve: 'P-256' },
    false,
    ['sign']
  );

  for (const sub of subscriptions) {
    try {
      const endpoint = new URL(sub.endpoint);
      const audience = `${endpoint.protocol}//${endpoint.host}`;

      // --- VAPID JWT ---
      const now = Math.floor(Date.now() / 1000);
      const jwtHeader = b64urlJson({ typ: 'JWT', alg: 'ES256' });
      const jwtPayload = b64urlJson({ aud: audience, exp: now + 12 * 3600, sub: 'mailto:quilty59@gmail.com' });
      const unsignedToken = `${jwtHeader}.${jwtPayload}`;

      const sigBuf = await crypto.subtle.sign(
        { name: 'ECDSA', hash: 'SHA-256' },
        vapidSigningKey,
        new TextEncoder().encode(unsignedToken)
      );
      // ECDSA signature from WebCrypto is raw r||s (64 bytes)
      const jwt = `${unsignedToken}.${b64url(sigBuf)}`;

      // --- Web Push Encryption (aes128gcm, RFC 8291) ---
      const clientP256dh = b64urlDecode(sub.p256dh);  // 65-byte uncompressed public key
      const clientAuth = b64urlDecode(sub.auth);       // 16-byte auth secret

      // 1. Generate ephemeral ECDH key pair
      const localKeyPair = await crypto.subtle.generateKey(
        { name: 'ECDH', namedCurve: 'P-256' },
        true,
        ['deriveBits']
      );

      // 2. Import client public key (p256dh) — usages MUST be empty for public keys in Deno
      const clientPubKey = await crypto.subtle.importKey(
        'raw',
        clientP256dh,
        { name: 'ECDH', namedCurve: 'P-256' },
        false,
        [] // Empty key usages for ECDH public keys
      );

      // 3. Derive shared secret via ECDH
      const sharedSecret = new Uint8Array(
        await crypto.subtle.deriveBits(
          { name: 'ECDH', public: clientPubKey },
          localKeyPair.privateKey,
          256
        )
      );

      // 4. Export local public key (for encryption header)
      const localPubKeyRaw = new Uint8Array(
        await crypto.subtle.exportKey('raw', localKeyPair.publicKey)
      );

      // 5. HKDF-based key derivation (RFC 8291)
      const encoder = new TextEncoder();

      // IKM = HKDF(auth, sharedSecret, "WebPush: info\0" || client_pub || server_pub)
      const authInfo = new Uint8Array([
        ...encoder.encode('WebPush: info\0'),
        ...clientP256dh,
        ...localPubKeyRaw,
      ]);
      const prkAuth = await hkdf(clientAuth, sharedSecret, authInfo, 32);

      // Content Encryption Key
      const cekInfo = encoder.encode('Content-Encoding: aes128gcm\0');
      const salt = crypto.getRandomValues(new Uint8Array(16));
      const cek = await hkdf(salt, prkAuth, cekInfo, 16);

      // Nonce
      const nonceInfo = encoder.encode('Content-Encoding: nonce\0');
      const nonce = await hkdf(salt, prkAuth, nonceInfo, 12);

      // 6. Encrypt payload with AES-128-GCM
      const paddedPayload = new Uint8Array([...encoder.encode(payload), 2]); // delimiter byte
      const aesKey = await crypto.subtle.importKey('raw', cek, 'AES-GCM', false, ['encrypt']);
      const encrypted = new Uint8Array(
        await crypto.subtle.encrypt({ name: 'AES-GCM', iv: nonce }, aesKey, paddedPayload)
      );

      // 7. Build aes128gcm body: salt(16) || rs(4) || idlen(1) || keyid(65) || encrypted
      const rs = new Uint8Array(4);
      new DataView(rs.buffer).setUint32(0, 4096, false);
      const body = new Uint8Array([
        ...salt,
        ...rs,
        localPubKeyRaw.length,
        ...localPubKeyRaw,
        ...encrypted,
      ]);

      // --- Send ---
      console.log(`[PUSH] Sending to endpoint: ${sub.endpoint.substring(0, 80)}...`);
      console.log(`[PUSH] Body size: ${body.byteLength} bytes, user: ${sub.user_id}`);
      
      const response = await fetch(sub.endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `vapid t=${jwt}, k=${vapidPublicKey}`,
          'Content-Type': 'application/octet-stream',
          'Content-Encoding': 'aes128gcm',
          'TTL': '86400',
        },
        body: body.buffer,
      });
      
      const respText = await response.text();
      console.log(`[PUSH] Response status: ${response.status}, body: ${respText.substring(0, 200)}`);
      
      if (response.status === 201 || response.status === 200) {
        console.log('[PUSH] ✅ Push sent successfully');
      } else if (response.status === 410 || response.status === 404) {
        console.log('[PUSH] Subscription expired, removing:', sub.id);
        await supabase.from('push_subscriptions').delete().eq('id', sub.id);
      } else {
        console.error(`[PUSH] ❌ Failed: ${response.status} ${respText}`);
      }
    } catch (pushError) {
      console.error('[PUSH] Error sending push to subscription:', sub.id, pushError?.message || pushError);
    }
  }
}

/** HKDF-SHA256 extract-then-expand */
async function hkdf(salt: Uint8Array, ikm: Uint8Array, info: Uint8Array, length: number): Promise<Uint8Array> {
  const keyMaterial = await crypto.subtle.importKey('raw', ikm, 'HKDF', false, ['deriveBits']);
  const derived = await crypto.subtle.deriveBits(
    { name: 'HKDF', hash: 'SHA-256', salt, info },
    keyMaterial,
    length * 8
  );
  return new Uint8Array(derived);
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

    // Determine target users for in-app + push notifications
    if (type === 'msp_created') {
      // Only admins receive notification for new MSP drafts
      targetUserIds = await getAdminUserIds();
    } else if (type === 'msp_validated') {
      // ALL approved users receive notification when a MSP is validated
      targetUserIds = await getAllApprovedUserIds();
    } else if (type === 'site_created') {
      // ALL approved users receive notification when a new site is published
      targetUserIds = await getAllApprovedUserIds();
    } else if (targetUserId) {
      // Specific user (e.g. msp_rejected → the creator)
      targetUserIds = [targetUserId];
    } else {
      // Fallback: notify admins
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
      // Send email to all approved users
      const allEmails = await getAllApprovedEmails();
      if (allEmails.length > 0) {
        const { subject, html } = generateMspValidatedEmail(metadata || {});
        await sendEmailNotification(allEmails, subject, html);
        console.log('MSP validated email sent to all users:', allEmails);
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
      // Send email to all approved users
      const allEmails = await getAllApprovedEmails();
      const { subject, html } = generateSiteCreatedEmail(metadata || {});
      await sendEmailNotification(allEmails, subject, html);
      console.log('Site created email sent to all users:', allEmails);
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
