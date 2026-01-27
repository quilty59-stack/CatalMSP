import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface IsochroneRequest {
  latitude: number;
  longitude: number;
  profile: 'driving-car' | 'driving-hgv' | 'cycling-regular' | 'foot-walking';
  range: number; // in minutes
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const ORS_API_KEY = Deno.env.get("OpenRouteService");
    
    if (!ORS_API_KEY) {
      console.error("OpenRouteService API key not configured");
      return new Response(
        JSON.stringify({ error: "OpenRouteService API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { latitude, longitude, profile, range }: IsochroneRequest = await req.json();

    if (!latitude || !longitude) {
      return new Response(
        JSON.stringify({ error: "Latitude and longitude are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Convert minutes to seconds for ORS API
    const rangeSeconds = (range || 15) * 60;
    
    // ORS Isochrone API call
    const orsResponse = await fetch(
      `https://api.openrouteservice.org/v2/isochrones/${profile || 'driving-car'}`,
      {
        method: "POST",
        headers: {
          "Authorization": ORS_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          locations: [[longitude, latitude]], // ORS uses [lng, lat] format
          range: [rangeSeconds],
          range_type: "time",
          attributes: ["total_pop"],
        }),
      }
    );

    if (!orsResponse.ok) {
      const errorText = await orsResponse.text();
      console.error("ORS API error:", orsResponse.status, errorText);
      return new Response(
        JSON.stringify({ error: "Failed to fetch isochrone", details: errorText }),
        { status: orsResponse.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const isochroneData = await orsResponse.json();

    return new Response(
      JSON.stringify(isochroneData),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Isochrone function error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
