import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
// This function sends a professional welcome email to new users explaining the validation process
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface WelcomeEmailRequest {
  email: string;
  firstName: string;
  lastName: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, firstName, lastName }: WelcomeEmailRequest = await req.json();

    if (!email || !firstName) {
      throw new Error("Email et prénom requis");
    }

    const logoUrl = "https://msp-craft.lovable.app/logo.png";
    
    const emailResponse = await resend.emails.send({
      from: "CatalMSP <nepasrepondre@catalmsp.fr>",
      to: [email],
      subject: "Bienvenue sur CatalMSP - Inscription en attente de validation",
      html: `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bienvenue sur CatalMSP</title>
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
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                Bienvenue sur CatalMSP
              </h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; color: #1e293b; font-size: 18px; line-height: 1.6;">
                Bonjour <strong>${firstName} ${lastName}</strong>,
              </p>
              
              <p style="margin: 0 0 24px; color: #475569; font-size: 16px; line-height: 1.7;">
                Merci pour votre inscription sur <strong>CatalMSP</strong>, la plateforme de gestion des Mises en Situation Professionnelle pour les formateurs.
              </p>
              
              <!-- Status Box -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 24px 0;">
                <tr>
                  <td style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; border-radius: 0 8px 8px 0;">
                    <table role="presentation" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td style="width: 40px; vertical-align: top;">
                          <span style="display: inline-block; width: 32px; height: 32px; background-color: #f59e0b; border-radius: 50%; text-align: center; line-height: 32px; color: white; font-size: 16px;">⏳</span>
                        </td>
                        <td style="padding-left: 12px;">
                          <p style="margin: 0 0 4px; color: #92400e; font-size: 16px; font-weight: 600;">
                            En attente de validation
                          </p>
                          <p style="margin: 0; color: #a16207; font-size: 14px; line-height: 1.5;">
                            Votre compte doit être approuvé par un administrateur avant que vous puissiez accéder à toutes les fonctionnalités.
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 0 0 24px; color: #475569; font-size: 16px; line-height: 1.7;">
                Vous recevrez un email de confirmation dès que votre compte sera validé.
              </p>
              
              <!-- Features -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 24px 0;">
                <tr>
                  <td style="padding: 16px; background-color: #f8fafc; border-radius: 8px;">
                    <p style="margin: 0 0 12px; color: #1e293b; font-size: 15px; font-weight: 600;">
                      Ce que vous pourrez faire :
                    </p>
                    <ul style="margin: 0; padding-left: 20px; color: #64748b; font-size: 14px; line-height: 1.8;">
                      <li>Créer et gérer des fiches MSP</li>
                      <li>Accéder au catalogue de sites conventionnés</li>
                      <li>Générer des documents PDF professionnels</li>
                      <li>Visualiser les sites sur une carte interactive</li>
                    </ul>
                  </td>
                </tr>
              </table>
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

    console.log("Welcome email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-welcome-email function:", error);
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
