import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface ApprovalEmailRequest {
  email: string;
  firstName: string;
  lastName: string;
  isApproved: boolean;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, firstName, lastName, isApproved }: ApprovalEmailRequest = await req.json();

    console.log("Processing approval email request:", { email, firstName, lastName, isApproved });

    if (!email || !firstName) {
      throw new Error("Missing required fields");
    }

    const logoUrl = "https://msp-craft.lovable.app/logo.png";
    const loginUrl = "https://msp-craft.lovable.app/connexion";

    const subject = isApproved 
      ? "✅ Votre compte CatalMSP a été validé !"
      : "❌ Votre demande d'inscription CatalMSP";

    const htmlContent = isApproved 
      ? `
        <!DOCTYPE html>
        <html lang="fr">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Compte validé</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
          <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
              <td align="center" style="padding: 40px 20px;">
                <!-- Header avec gradient vert -->
                <table role="presentation" style="max-width: 500px; width: 100%; background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); border-radius: 16px 16px 0 0; overflow: hidden;">
                  <tr>
                    <td align="center" style="padding: 40px 30px;">
                      <img src="${logoUrl}" alt="CatalMSP" style="width: 80px; height: 80px; border-radius: 16px; margin-bottom: 16px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);" />
                      <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">
                        🎉 Compte Validé !
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
                        Excellente nouvelle ! Votre compte <strong>CatalMSP</strong> a été approuvé par un administrateur.
                      </p>
                      
                      <!-- Success Box -->
                      <table style="width: 100%; background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%); border-radius: 12px; margin: 24px 0;">
                        <tr>
                          <td style="padding: 20px;">
                            <p style="margin: 0 0 8px; font-size: 14px; font-weight: 600; color: #166534;">
                              ✅ Accès complet activé
                            </p>
                            <p style="margin: 0; font-size: 14px; color: #15803d; line-height: 1.5;">
                              Vous pouvez maintenant accéder à toutes les fonctionnalités de l'application.
                            </p>
                          </td>
                        </tr>
                      </table>
                      
                      <!-- Bouton CTA -->
                      <table role="presentation" style="width: 100%;">
                        <tr>
                          <td align="center">
                            <a href="${loginUrl}" style="display: inline-block; background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 10px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(22, 163, 74, 0.3);">
                              🚀 Se connecter maintenant
                            </a>
                          </td>
                        </tr>
                      </table>
                      
                      <p style="color: #94a3b8; font-size: 13px; text-align: center; margin: 24px 0 0; line-height: 1.5;">
                        Bienvenue dans l'équipe CatalMSP !
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
      `
      : `
        <!DOCTYPE html>
        <html lang="fr">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Demande refusée</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
          <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
              <td align="center" style="padding: 40px 20px;">
                <!-- Header avec gradient rouge -->
                <table role="presentation" style="max-width: 500px; width: 100%; background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); border-radius: 16px 16px 0 0; overflow: hidden;">
                  <tr>
                    <td align="center" style="padding: 40px 30px;">
                      <img src="${logoUrl}" alt="CatalMSP" style="width: 80px; height: 80px; border-radius: 16px; margin-bottom: 16px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);" />
                      <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">
                        Demande non approuvée
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
                        Nous sommes au regret de vous informer que votre demande d'accès à <strong>CatalMSP</strong> n'a pas été approuvée.
                      </p>
                      
                      <!-- Info Box -->
                      <table style="width: 100%; background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%); border-radius: 12px; margin: 24px 0;">
                        <tr>
                          <td style="padding: 20px;">
                            <p style="margin: 0 0 8px; font-size: 14px; font-weight: 600; color: #991b1b;">
                              Accès non autorisé
                            </p>
                            <p style="margin: 0; font-size: 14px; color: #b91c1c; line-height: 1.5;">
                              Si vous pensez qu'il s'agit d'une erreur, veuillez contacter l'administrateur.
                            </p>
                          </td>
                        </tr>
                      </table>
                      
                      <p style="color: #94a3b8; font-size: 13px; text-align: center; margin: 24px 0 0; line-height: 1.5;">
                        Cordialement,<br/>L'équipe CatalMSP
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
      `;

    const emailResponse = await resend.emails.send({
      from: "CatalMSP <nepasrepondre@catalmsp.fr>",
      to: [email],
      subject,
      html: htmlContent,
    });

    console.log("Approval email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-approval-email function:", error);
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
