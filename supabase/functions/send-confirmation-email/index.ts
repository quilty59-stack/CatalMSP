import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface ConfirmationEmailRequest {
  email: string;
  firstName: string;
  lastName: string;
  confirmationUrl: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, firstName, lastName, confirmationUrl }: ConfirmationEmailRequest = await req.json();

    if (!email || !firstName || !confirmationUrl) {
      throw new Error("Missing required fields");
    }

    const logoUrl = "https://msp-craft.lovable.app/logo.png";

    const emailResponse = await resend.emails.send({
      from: "CatalMSP <nepasrepondre@catalmsp.fr>",
      to: [email],
      subject: "📧 Confirmez votre adresse email - CatalMSP",
      html: `
        <!DOCTYPE html>
        <html lang="fr">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Confirmez votre email</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
          <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
              <td align="center" style="padding: 40px 20px;">
                <!-- Header avec gradient rouge -->
                <table role="presentation" style="max-width: 500px; width: 100%; background: linear-gradient(135deg, #8b2020 0%, #a52a2a 100%); border-radius: 16px 16px 0 0; overflow: hidden;">
                  <tr>
                    <td align="center" style="padding: 40px 30px;">
                      <img src="${logoUrl}" alt="CatalMSP" style="width: 80px; height: 80px; border-radius: 16px; margin-bottom: 16px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);" />
                      <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">
                        Bienvenue sur CatalMSP !
                      </h1>
                    </td>
                  </tr>
                </table>
                
                <!-- Contenu principal -->
                <table role="presentation" style="max-width: 500px; width: 100%; background-color: #ffffff; border-radius: 0 0 16px 16px; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);">
                  <tr>
                    <td style="padding: 40px 30px;">
                      <p style="color: #1e293b; font-size: 18px; line-height: 1.6; margin: 0 0 20px;">
                        Bonjour <strong>${firstName} ${lastName}</strong>,
                      </p>
                      
                      <p style="color: #475569; font-size: 16px; line-height: 1.7; margin: 0 0 24px;">
                        Merci de vous être inscrit sur <strong>CatalMSP</strong>, la plateforme de gestion des Mises en Situation Professionnelle pour les formateurs.
                      </p>
                      
                      <p style="color: #475569; font-size: 16px; line-height: 1.7; margin: 0 0 32px;">
                        Veuillez confirmer votre adresse email en cliquant sur le bouton ci-dessous :
                      </p>
                      
                      <!-- Bouton CTA -->
                      <table role="presentation" style="width: 100%;">
                        <tr>
                          <td align="center">
                            <a href="${confirmationUrl}" style="display: inline-block; background: linear-gradient(135deg, #8b2020 0%, #a52a2a 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 10px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(139, 32, 32, 0.3);">
                              ✉️ Confirmer mon email
                            </a>
                          </td>
                        </tr>
                      </table>
                      
                      <!-- Info box -->
                      <table style="width: 100%; background: linear-gradient(135deg, #fef3c7 0%, #fef9c3 100%); border-radius: 12px; margin: 32px 0 24px;">
                        <tr>
                          <td style="padding: 20px;">
                            <p style="margin: 0 0 8px; font-size: 14px; font-weight: 600; color: #92400e;">
                              ⏳ Prochaine étape
                            </p>
                            <p style="margin: 0; font-size: 14px; color: #a16207; line-height: 1.5;">
                              Après confirmation de votre email, votre compte devra être validé par un administrateur avant de pouvoir accéder à toutes les fonctionnalités.
                            </p>
                          </td>
                        </tr>
                      </table>
                      
                      <p style="color: #94a3b8; font-size: 13px; text-align: center; margin: 24px 0 0; line-height: 1.5;">
                        Si vous n'avez pas créé de compte, vous pouvez ignorer cet email.
                      </p>
                    </td>
                  </tr>
                </table>
                
                <!-- Footer -->
                <p style="color: #94a3b8; font-size: 12px; margin-top: 24px;">
                  © ${new Date().getFullYear()} CatalMSP - Tous droits réservés
                </p>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });

    console.log("Confirmation email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-confirmation-email function:", error);
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
