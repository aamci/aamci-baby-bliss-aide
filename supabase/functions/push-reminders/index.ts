import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function importVapidKey(privateKeyBase64: string) {
  const raw = Uint8Array.from(atob(privateKeyBase64.replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0));
  return crypto.subtle.importKey("raw", raw, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
}

async function createJWT(aud: string, sub: string, privateKeyPem: string) {
  const header = btoa(JSON.stringify({ typ: "JWT", alg: "ES256" })).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  const now = Math.floor(Date.now() / 1000);
  const payload = btoa(JSON.stringify({ aud, exp: now + 86400, sub })).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");

  const rawKey = Uint8Array.from(atob(privateKeyPem.replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0));
  
  const key = await crypto.subtle.importKey(
    "pkcs8",
    rawKey,
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["sign"]
  );

  const data = new TextEncoder().encode(`${header}.${payload}`);
  const signature = await crypto.subtle.sign({ name: "ECDSA", hash: "SHA-256" }, key, data);
  const sig = btoa(String.fromCharCode(...new Uint8Array(signature))).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");

  return `${header}.${payload}.${sig}`;
}

async function sendPushNotification(
  subscription: { endpoint: string; p256dh: string; auth: string },
  payload: string,
  vapidPublicKey: string,
  vapidPrivateKey: string,
  vapidSubject: string
) {
  // For simplicity, we'll use the fetch API to call the push endpoint
  // In production, you'd want proper encryption. For now, we send via the edge function approach.
  const url = new URL(subscription.endpoint);
  const audience = `${url.protocol}//${url.host}`;

  const jwt = await createJWT(audience, vapidSubject, vapidPrivateKey);

  // Web Push requires encrypted payload - for basic implementation we send without payload
  // and rely on the service worker to show a default notification
  const response = await fetch(subscription.endpoint, {
    method: "POST",
    headers: {
      Authorization: `vapid t=${jwt}, k=${vapidPublicKey}`,
      TTL: "86400",
      "Content-Length": "0",
      Urgency: "high",
    },
  });

  return response;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const VAPID_PUBLIC_KEY = Deno.env.get("VAPID_PUBLIC_KEY");
    const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY");
    const VAPID_SUBJECT = Deno.env.get("VAPID_SUBJECT") || "mailto:contact@parent-bliss.app";

    if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
      return new Response(JSON.stringify({ error: "VAPID keys not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Find appointments in the next hour that haven't been notified
    const now = new Date();
    const inOneHour = new Date(now.getTime() + 60 * 60 * 1000);
    const today = now.toISOString().split("T")[0];
    const currentTime = now.toTimeString().slice(0, 5);
    const futureTime = inOneHour.toTimeString().slice(0, 5);

    const { data: upcomingVisits, error: visitsError } = await supabase
      .from("visits")
      .select("*, child:children(first_name)")
      .eq("visit_date", today)
      .eq("status", "upcoming")
      .gte("visit_time", currentTime)
      .lte("visit_time", futureTime);

    if (visitsError) {
      console.error("Error fetching visits:", visitsError);
      return new Response(JSON.stringify({ error: visitsError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!upcomingVisits || upcomingVisits.length === 0) {
      return new Response(JSON.stringify({ message: "No upcoming visits to notify" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let sent = 0;

    for (const visit of upcomingVisits) {
      // Get parent IDs for this child
      const { data: parents } = await supabase
        .from("child_parents")
        .select("parent_id")
        .eq("child_id", visit.child_id);

      if (!parents) continue;

      for (const parent of parents) {
        const { data: subscriptions } = await supabase
          .from("push_subscriptions")
          .select("*")
          .eq("user_id", parent.parent_id);

        if (!subscriptions) continue;

        for (const sub of subscriptions) {
          try {
            const childName = (visit as any).child?.first_name || "votre enfant";
            console.log(`Sending notification for ${visit.name} - ${childName} to ${sub.endpoint.substring(0, 50)}...`);
            
            await sendPushNotification(
              { endpoint: sub.endpoint, p256dh: sub.p256dh, auth: sub.auth },
              JSON.stringify({
                title: `Rappel : ${visit.name}`,
                body: `RDV pour ${childName} à ${visit.visit_time?.slice(0, 5) || "aujourd'hui"}${visit.doctor_name ? ` avec ${visit.doctor_name}` : ""}`,
                url: "/appointments",
              }),
              VAPID_PUBLIC_KEY,
              VAPID_PRIVATE_KEY,
              VAPID_SUBJECT
            );
            sent++;
          } catch (err) {
            console.error("Push send error:", err);
          }
        }
      }
    }

    return new Response(JSON.stringify({ message: `Sent ${sent} notifications` }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error:", err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
