import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface AdminNotificationRequest {
  userEmail: string;
  firstName: string;
  lastName: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userEmail, firstName, lastName }: AdminNotificationRequest = await req.json();

    if (!userEmail || !firstName || !lastName) {
      throw new Error("Missing required fields");
    }

    const logoUrl = "https://msp-craft.lovable.app/logo.png";
    const adminUrl = "https://msp-craft.lovable.app/admin";
    
    // Admin email - quilty59@gmail.com is the primary admin
    const adminEmail = "quilty59@gmail.com";

    const emailResponse = await resend.emails.send({
      from: "CatalMSP <nepasrepondre@catalmsp.fr>",
      to: [adminEmail],
      subject: `🔔 Nouvelle inscription CatalMSP - ${firstName} ${lastName}`,
      html: `
        <!DOCTYPE html>
        <html lang="fr">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Nouvelle inscription</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
          <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
              <td align="center" style="padding: 40px 20px;">
                <table role="presentation" style="max-width: 500px; width: 100%; background: linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%); border-radius: 16px 16px 0 0; overflow: hidden;">
                  <tr>
                    <td align="center" style="padding: 40px 30px;">
                      <img src="${logoUrl}" alt="CatalMSP" style="width: 80px; height: 80px; border-radius: 16px; margin-bottom: 16px;" />
                      <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">
                        🔔 Nouvelle Inscription
                      </h1>
                    </td>
                  </tr>
                </table>
                
                <table role="presentation" style="max-width: 500px; width: 100%; background-color: #ffffff; border-radius: 0 0 16px 16px; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);">
                  <tr>
                    <td style="padding: 40px 30px;">
                      <p style="color: #475569; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
                        Un nouvel utilisateur vient de s'inscrire sur CatalMSP et attend votre validation.
                      </p>
                      
                      <table style="width: 100%; background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border-radius: 12px; margin-bottom: 24px;">
                        <tr>
                          <td style="padding: 20px;">
                            <p style="margin: 0 0 8px; font-size: 14px; color: #64748b;">Nom complet</p>
                            <p style="margin: 0; font-size: 18px; font-weight: 600; color: #1e293b;">${firstName} ${lastName}</p>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 0 20px 20px;">
                            <p style="margin: 0 0 8px; font-size: 14px; color: #64748b;">Email</p>
                            <p style="margin: 0; font-size: 16px; font-weight: 500; color: #3b82f6;">${userEmail}</p>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 0 20px 20px;">
                            <p style="margin: 0 0 8px; font-size: 14px; color: #64748b;">Date d'inscription</p>
                            <p style="margin: 0; font-size: 16px; font-weight: 500; color: #1e293b;">${new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                          </td>
                        </tr>
                      </table>
                      
                      <table role="presentation" style="width: 100%;">
                        <tr>
                          <td align="center">
                            <a href="${adminUrl}" style="display: inline-block; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3);">
                              Valider l'inscription →
                            </a>
                          </td>
                        </tr>
                      </table>
                      
                      <p style="color: #94a3b8; font-size: 13px; text-align: center; margin: 24px 0 0; line-height: 1.5;">
                        Cet email a été envoyé automatiquement suite à une nouvelle inscription sur CatalMSP.
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
      `,
    });

    console.log("Admin notification email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-admin-notification function:", error);
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
