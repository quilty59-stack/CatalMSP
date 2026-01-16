import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { siteName, siteType, commune, address, theme, briefDescription } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Generating MSP for:", { siteName, siteType, theme, commune });

    const systemPrompt = `Tu es un expert en formation sapeur-pompier spécialisé dans la création de Mises en Situation Professionnelle (MSP). 
Tu dois générer une fiche MSP complète et détaillée basée sur les informations minimales fournies.

Réponds UNIQUEMENT avec un JSON valide, sans markdown, sans explication. Le JSON doit suivre exactement cette structure:

{
  "title": "Titre accrocheur de la MSP",
  "competences": "Compétences visées (reconnaissance, attaque, sauvetage, etc.)",
  "objectives": "Objectifs pédagogiques détaillés",
  "situation": "Scénario détaillé de la mise en situation",
  "missionReason": "Motif de l'ordre de mission (appel signalant...)",
  "difficulty": 2,
  "difficultyFacilitator": "Éléments qui facilitent l'exercice (niveau 1)",
  "difficultyInitial": "Situation de base attendue en fin de formation (niveau 2)",
  "difficultyComplex": "Éléments ajoutant de la complexité (niveau 3)",
  "instructions": "Consignes pour victimes et témoins",
  "expectedActivities": "Actions observables attendues de l'apprenant",
  "cognitiveEffects": "Transformations cognitives attendues",
  "reservationDetails": "Procédure de réservation du site",
  "hasWaterPoint": true,
  "waterPointDetails": "Détails sur le point d'eau disponible",
  "authorizations": "Autorisations nécessaires",
  "constraints": "Contraintes spécifiques au site",
  "safetyBriefing": "Consignes de sécurité pour l'exercice",
  "equipment": ["ARI", "Radios", "etc."],
  "siteNotes": "Notes importantes sur le site"
}`;

    const userPrompt = `Génère une fiche MSP complète pour:
- Site: ${siteName}
- Type de site: ${siteType}
- Commune: ${commune}
- Adresse: ${address || "Non spécifiée"}
- Thème: ${theme}
- Description/Contexte: ${briefDescription || "Non spécifié"}

Adapte le contenu au type de site et au thème. Sois précis et professionnel.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Trop de requêtes. Veuillez réessayer dans quelques instants." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Crédits IA insuffisants. Veuillez contacter l'administrateur." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    console.log("AI response received, parsing...");

    // Parse the JSON response
    let mspData;
    try {
      // Clean potential markdown formatting
      const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
      mspData = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      throw new Error("Impossible de parser la réponse de l'IA");
    }

    console.log("MSP generated successfully");

    return new Response(
      JSON.stringify({ success: true, mspData }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error generating MSP:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erreur inconnue" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
