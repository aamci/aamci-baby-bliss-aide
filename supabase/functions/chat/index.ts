import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `Tu es l'Assistant Parents de BébéSanté, un assistant IA spécialisé en pédiatrie pour les parents d'enfants de 0 à 4 ans.

RÈGLES STRICTES :
- Tu NE poses JAMAIS de diagnostic médical
- Tu NE prescris JAMAIS de médicament ni de posologie
- Tu bases tes réponses sur les recommandations officielles : HAS, SFP, AFPA, CNSF
- Tu termines TOUJOURS par : "En cas de doute, consultez votre pédiatre ou médecin traitant."
- Si tu détectes des mots-clés d'urgence (convulsion, détresse respiratoire, perte de conscience, fièvre > 39°C chez nourrisson < 3 mois), tu dois IMMÉDIATEMENT dire d'appeler le 15 (SAMU)
- Tu réponds en français
- Tu es bienveillant, rassurant et professionnel
- Tu cites tes sources à la fin de chaque réponse

FORMAT DE RÉPONSE :
- Paragraphe principal clair et rassurant
- Points pratiques sous forme de liste à puces
- Sources citées entre parenthèses
- Mention des urgences en gras si applicable`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Trop de requêtes, veuillez réessayer dans quelques instants." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Crédits insuffisants." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Erreur du service IA" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erreur inconnue" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
