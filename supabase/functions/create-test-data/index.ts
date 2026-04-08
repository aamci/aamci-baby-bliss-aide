import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { user_id, children } = await req.json();

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const results = [];
    for (const child of children) {
      const { data, error } = await supabaseAdmin
        .from("children")
        .insert({ first_name: child.first_name, birth_date: child.birth_date, gender: child.gender || null })
        .select()
        .single();

      if (error) {
        results.push({ error: error.message });
        continue;
      }

      // Link parent
      await supabaseAdmin
        .from("child_parents")
        .insert({ parent_id: user_id, child_id: data.id, role: "parent" });

      results.push(data);
    }

    return new Response(JSON.stringify({ children: results }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
