import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { sendWebPush } from "./webpush.ts";
import { CARE_PLAN } from "./carePlan.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const DAY = 86400000;
const addDays = (d: Date, n: number) => new Date(d.getTime() + n * DAY);
const dayDiff = (a: Date, b: Date) =>
  Math.round((Date.UTC(a.getFullYear(), a.getMonth(), a.getDate()) - Date.UTC(b.getFullYear(), b.getMonth(), b.getDate())) / DAY);

/** Heure locale (HH:mm) du parent selon son fuseau. */
function localTime(tz: string, now: Date) {
  try {
    return new Intl.DateTimeFormat("fr-FR", { timeZone: tz, hour: "2-digit", minute: "2-digit", hour12: false }).format(now);
  } catch {
    return new Intl.DateTimeFormat("fr-FR", { timeZone: "Europe/Paris", hour: "2-digit", minute: "2-digit", hour12: false }).format(now);
  }
}

/** Heures calmes : plage éventuellement à cheval sur minuit. */
function isQuiet(nowHHmm: string, start: string, end: string) {
  const s = start.slice(0, 5);
  const e = end.slice(0, 5);
  return s <= e ? nowHHmm >= s && nowHHmm < e : nowHHmm >= s || nowHHmm < e;
}

interface Msg {
  userId: string;
  childId: string | null;
  dedupeKey: string;
  title: string;
  body: string;
  url: string;
  kind: "visits" | "vaccines" | "screening";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const publicKey = Deno.env.get("VAPID_PUBLIC_KEY");
    const privateKey = Deno.env.get("VAPID_PRIVATE_KEY");
    const subject = Deno.env.get("VAPID_SUBJECT") || "mailto:contact@parent-bliss.app";
    if (!publicKey || !privateKey) {
      return new Response(JSON.stringify({ error: "VAPID keys not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const now = new Date();
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);

    const [{ data: links }, { data: children }, { data: visits }, { data: states }] = await Promise.all([
      supabase.from("child_parents").select("child_id, parent_id"),
      supabase.from("children").select("id, first_name, birth_date"),
      supabase.from("visits").select("id, child_id, name, doctor_name, visit_date, visit_time, status").eq("status", "upcoming"),
      supabase.from("reminder_states").select("child_id, reminder_key, status, snoozed_until"),
    ]);

    const childById = new Map((children ?? []).map((c) => [c.id, c]));
    const parentsOf = new Map<string, string[]>();
    for (const l of links ?? []) {
      const arr = parentsOf.get(l.child_id) ?? [];
      arr.push(l.parent_id);
      parentsOf.set(l.child_id, arr);
    }

    const messages: Msg[] = [];

    // 1. Rendez-vous planifiés : J-7, J-1, J-1h
    for (const v of visits ?? []) {
      if (!v.visit_date) continue;
      const child = childById.get(v.child_id);
      const name = child?.first_name ?? "votre enfant";
      const date = new Date(`${v.visit_date}T${(v.visit_time as string | null)?.slice(0, 8) ?? "09:00:00"}`);
      const d = dayDiff(date, today);
      const hoursTo = (date.getTime() - now.getTime()) / 3600000;
      let slot: string | null = null;
      let body = "";
      if (d === 7) {
        slot = "j7";
        body = `Dans une semaine : ${v.name} pour ${name}. Pensez au carnet de santé.`;
      } else if (d === 1) {
        slot = "j1";
        body = `Demain : ${v.name} pour ${name}${v.visit_time ? ` à ${String(v.visit_time).slice(0, 5)}` : ""}.`;
      } else if (d === 0 && hoursTo > 0 && hoursTo <= 1.25) {
        slot = "h1";
        body = `C'est bientôt : ${v.name} pour ${name}${v.visit_time ? ` à ${String(v.visit_time).slice(0, 5)}` : ""}${v.doctor_name ? ` avec ${v.doctor_name}` : ""}.`;
      }
      if (!slot) continue;
      for (const parent of parentsOf.get(v.child_id) ?? []) {
        messages.push({
          userId: parent,
          childId: v.child_id,
          dedupeKey: `visit:${v.id}:${slot}`,
          title: `Rappel : ${v.name}`,
          body,
          url: "/my-appointments",
          kind: "visits",
        });
      }
    }

    // 2. Parcours de soins : ouverture de fenêtre, date idéale, derniers jours
    for (const child of children ?? []) {
      const birth = new Date(`${child.birth_date}T00:00:00`);
      for (const step of CARE_PLAN) {
        const ideal = addDays(birth, Math.round(step.idealMonths * 30.4375));
        const opens = addDays(ideal, -step.before);
        const closes = addDays(ideal, step.after);
        const state = (states ?? []).find((s) => s.child_id === child.id && s.reminder_key === step.key);
        if (state && (state.status === "done" || state.status === "dismissed")) continue;
        if (state?.status === "snoozed" && state.snoozed_until && new Date(state.snoozed_until) > today) continue;

        let slot: string | null = null;
        let body = "";
        if (dayDiff(opens, today) === 0) {
          slot = "open";
          body = `C'est la bonne période pour ${child.first_name}. Vous avez plusieurs semaines, sans urgence.`;
        } else if (dayDiff(ideal, today) === 0) {
          slot = "ideal";
          body = `Aujourd'hui c'est la date idéale pour ${child.first_name}. Encore possible plus tard si besoin.`;
        } else if (dayDiff(closes, today) === 7) {
          slot = "closing";
          body = `Il reste une semaine de période confortable pour ${child.first_name}. Et après, ce sera encore possible.`;
        }
        if (!slot) continue;
        const kind: Msg["kind"] = step.type === "vaccine" ? "vaccines" : step.type === "screening" ? "screening" : "visits";
        for (const parent of parentsOf.get(child.id) ?? []) {
          messages.push({
            userId: parent,
            childId: child.id,
            dedupeKey: `care:${child.id}:${step.key}:${slot}`,
            title: step.title,
            body,
            url: "/notifications",
            kind,
          });
        }
      }
    }

    if (messages.length === 0) {
      return new Response(JSON.stringify({ sent: 0, message: "Rien à envoyer" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userIds = [...new Set(messages.map((m) => m.userId))];
    const [{ data: prefsRows }, { data: subs }, { data: alreadySent }] = await Promise.all([
      supabase.from("notification_preferences").select("*").in("user_id", userIds),
      supabase.from("push_subscriptions").select("*").in("user_id", userIds),
      supabase.from("push_notification_log").select("user_id, dedupe_key").in("user_id", userIds),
    ]);

    const prefsByUser = new Map((prefsRows ?? []).map((p) => [p.user_id, p]));
    const subsByUser = new Map<string, typeof subs>();
    for (const s of subs ?? []) subsByUser.set(s.user_id, [...(subsByUser.get(s.user_id) ?? []), s]);
    const sentSet = new Set((alreadySent ?? []).map((r) => `${r.user_id}|${r.dedupe_key}`));

    let sent = 0;
    let skipped = 0;

    for (const m of messages) {
      if (sentSet.has(`${m.userId}|${m.dedupeKey}`)) continue;
      const p = prefsByUser.get(m.userId);
      if (p) {
        if (!p.push_enabled) continue;
        if (m.kind === "visits" && !p.visits_enabled) continue;
        if (m.kind === "vaccines" && !p.vaccines_enabled) continue;
        if (m.kind === "screening" && !p.screening_enabled) continue;
        if (p.quiet_enabled && isQuiet(localTime(p.timezone || "Europe/Paris", now), p.quiet_start, p.quiet_end)) {
          skipped++; // différé : renvoyé au prochain passage hors heures calmes
          continue;
        }
      }
      const userSubs = subsByUser.get(m.userId) ?? [];
      if (userSubs.length === 0) continue;

      let delivered = false;
      for (const sub of userSubs) {
        try {
          const res = await sendWebPush(
            { endpoint: sub.endpoint, p256dh: sub.p256dh, auth: sub.auth },
            JSON.stringify({ title: m.title, body: m.body, url: m.url, tag: m.dedupeKey }),
            { publicKey, privateKey, subject }
          );
          if (res.status === 404 || res.status === 410) {
            await supabase.from("push_subscriptions").delete().eq("id", sub.id);
          } else if (res.ok) {
            delivered = true;
          } else {
            console.error(`Push refusé [${res.status}]: ${await res.text()}`);
          }
        } catch (err) {
          console.error("Erreur d'envoi push:", err);
        }
      }
      if (delivered) {
        sent++;
        sentSet.add(`${m.userId}|${m.dedupeKey}`);
        await supabase.from("push_notification_log").insert({
          user_id: m.userId,
          child_id: m.childId,
          dedupe_key: m.dedupeKey,
          title: m.title,
          body: m.body,
          url: m.url,
        });
      }
    }

    return new Response(JSON.stringify({ sent, skipped_quiet_hours: skipped, candidates: messages.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Erreur push-reminders:", err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
