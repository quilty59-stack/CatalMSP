import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface PasswordResetRequest {
  email: string;
  firstName: string;
  resetUrl: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, firstName, resetUrl }: PasswordResetRequest = await req.json();

    if (!email || !resetUrl) {
      throw new Error("Email et URL de réinitialisation requis");
    }

    const logoUrl = "https://msp-craft.lovable.app/logo.png";
    const displayName = firstName || "Utilisateur";

    const emailResponse = await resend.emails.send({
      from: "CatalMSP <noreply@catalmsp.fr>",
      to: [email],
      subject: "Réinitialisation de votre mot de passe CatalMSP",
      html: `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Réinitialisation de mot de passe</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); overflow: hidden;">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); padding: 40px 40px 30px; text-align: center;">
              <img src="${logoUrl}" alt="CatalMSP" style="width: 80px; height: 80px; border-radius: 12px; margin-bottom: 16px;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">
                Réinitialisation du mot de passe
              </h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; color: #1e293b; font-size: 18px; line-height: 1.6;">
                Bonjour <strong>${displayName}</strong>,
              </p>
              
              <p style="margin: 0 0 24px; color: #475569; font-size: 16px; line-height: 1.7;">
                Vous avez demandé la réinitialisation de votre mot de passe sur <strong>CatalMSP</strong>. Cliquez sur le bouton ci-dessous pour définir un nouveau mot de passe :
              </p>
              
              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 32px 0;">
                <tr>
                  <td align="center">
                    <a href="${resetUrl}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 8px; box-shadow: 0 4px 14px 0 rgba(220, 38, 38, 0.39);">
                      Réinitialiser mon mot de passe
                    </a>
                  </td>
                </tr>
              </table>
              
              <!-- Warning Box -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 24px 0;">
                <tr>
                  <td style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 16px; border-radius: 0 8px 8px 0;">
                    <p style="margin: 0; color: #991b1b; font-size: 14px; line-height: 1.5;">
                      <strong>⚠️ Ce lien expire dans 1 heure.</strong><br>
                      Si vous n'avez pas demandé cette réinitialisation, ignorez cet email. Votre compte reste sécurisé.
                    </p>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 24px 0 0; color: #94a3b8; font-size: 13px; line-height: 1.6;">
                Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :<br>
                <a href="${resetUrl}" style="color: #dc2626; word-break: break-all;">${resetUrl}</a>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f1f5f9; padding: 24px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0 0 8px; color: #64748b; font-size: 14px;">
                © ${new Date().getFullYear()} CatalMSP - Tous droits réservés
              </p>
              <p style="margin: 0; color: #94a3b8; font-size: 12px;">
                Cet email a été envoyé automatiquement, merci de ne pas y répondre.
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `,
    });

    console.log("Password reset email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-password-reset function:", error);
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
