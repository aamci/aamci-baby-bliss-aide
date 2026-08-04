// deno-lint-ignore-file no-explicit-any
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { text, voice = "alloy", language = "fr", instructions, speed } = await req.json();
    if (!text || typeof text !== "string") {
      return new Response(JSON.stringify({ error: "text required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY missing" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Cap input size to keep single-request TTS reliable
    const clean = text.replace(/\s+/g, " ").trim().slice(0, 3800);

    const langMap: Record<string, string> = {
      fr: "Speak in warm, natural French with clear articulation, like a caring pediatric professional.",
      en: "Speak in warm, natural English with clear articulation.",
      es: "Habla en español natural y cálido, con articulación clara.",
      ar: "تحدث بلغة عربية فصيحة ودافئة مع نطق واضح.",
    };
    const finalInstructions = instructions || langMap[language] || langMap.fr;

    const upstream = await fetch("https://ai.gateway.lovable.dev/v1/audio/speech", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini-tts",
        input: clean,
        voice,
        instructions: finalInstructions,
        response_format: "mp3",
        ...(typeof speed === "number" && speed >= 0.25 && speed <= 4.0 ? { speed } : {}),
      }),
    });

    if (!upstream.ok) {
      const body = await upstream.text().catch(() => "");
      console.error(`TTS upstream failed [${upstream.status}]: ${body}`);
      return new Response(
        JSON.stringify({ error: "TTS failed", status: upstream.status, details: body }),
        { status: upstream.status, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(upstream.body, {
      headers: { ...corsHeaders, "Content-Type": "audio/mpeg", "Cache-Control": "no-store" },
    });
  } catch (err: any) {
    console.error("tts error", err);
    return new Response(JSON.stringify({ error: err?.message ?? "unknown" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});