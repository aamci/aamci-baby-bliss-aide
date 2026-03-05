import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authErr } = await createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!
    ).auth.getUser(token);

    if (authErr || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }

    const url = new URL(req.url);

    // POST = create invite
    if (req.method === "POST") {
      const { child_id, invite_email, invite_phone } = await req.json();

      if (!child_id || (!invite_email && !invite_phone)) {
        return new Response(JSON.stringify({ error: "child_id and email/phone required" }), { status: 400, headers: corsHeaders });
      }

      // verify parent
      const { data: isParent } = await supabase.rpc("is_child_parent", { _child_id: child_id, _user_id: user.id });
      if (!isParent) {
        return new Response(JSON.stringify({ error: "Not authorized" }), { status: 403, headers: corsHeaders });
      }

      const inviteToken = crypto.randomUUID();
      const { data, error } = await supabase.from("co_parent_invites").insert({
        child_id,
        invited_by: user.id,
        invite_email: invite_email || null,
        invite_phone: invite_phone || null,
        token: inviteToken,
        status: "pending",
      }).select().single();

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });
      }

      // For now we return the token/link - in production you'd send via email service
      return new Response(JSON.stringify({
        success: true,
        invite: data,
        invite_link: `${Deno.env.get("SUPABASE_URL")}/functions/v1/invite-coparent?action=accept&token=${inviteToken}`,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // GET = accept invite
    if (req.method === "GET") {
      const action = url.searchParams.get("action");
      const inviteToken = url.searchParams.get("token");

      if (action === "accept" && inviteToken) {
        // Find the invite
        const { data: invite, error: findErr } = await supabase
          .from("co_parent_invites")
          .select("*")
          .eq("token", inviteToken)
          .eq("status", "pending")
          .single();

        if (findErr || !invite) {
          return new Response(JSON.stringify({ error: "Invitation invalide ou expirée" }), { status: 404, headers: corsHeaders });
        }

        // Check not expired
        if (new Date(invite.expires_at) < new Date()) {
          await supabase.from("co_parent_invites").update({ status: "expired" }).eq("id", invite.id);
          return new Response(JSON.stringify({ error: "Invitation expirée" }), { status: 410, headers: corsHeaders });
        }

        // Add to child_parents
        const { error: linkErr } = await supabase.from("child_parents").insert({
          child_id: invite.child_id,
          parent_id: user.id,
          role: "coparent",
        });

        if (linkErr) {
          if (linkErr.code === "23505") {
            return new Response(JSON.stringify({ error: "Vous êtes déjà parent de cet enfant" }), { status: 409, headers: corsHeaders });
          }
          return new Response(JSON.stringify({ error: linkErr.message }), { status: 500, headers: corsHeaders });
        }

        // Mark invite as accepted
        await supabase.from("co_parent_invites").update({ status: "accepted" }).eq("id", invite.id);

        return new Response(JSON.stringify({ success: true, message: "Vous avez été ajouté comme co-parent !" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    return new Response(JSON.stringify({ error: "Invalid request" }), { status: 400, headers: corsHeaders });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsHeaders });
  }
});
