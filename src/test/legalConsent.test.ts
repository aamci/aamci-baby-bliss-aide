import { describe, it, expect } from "vitest";
import {
  adminClient,
  anonClient,
  createTestAccount,
  deleteTestAccount,
  hasServiceRole,
  networkAvailable,
  signInAs,
} from "./helpers/testAccounts";
import { CGU_VERSION, PRIVACY_VERSION, COOKIE_POLICY_VERSION } from "@/lib/legal";

const maybe = async () => (await networkAvailable()) && hasServiceRole();

describe("Legal & consent persistence with RLS", () => {
  it("records CGU acceptance scoped to the signing user (RLS enforced)", async () => {
    if (!(await maybe())) {
      console.warn("Skipping — service role / network unavailable");
      return;
    }
    const a = await createTestAccount();
    const b = await createTestAccount();
    try {
      const clientA = await signInAs(a);
      const ins = await clientA.from("cgu_acceptances").insert({
        user_id: a.userId,
        cgu_version: CGU_VERSION,
        privacy_version: PRIVACY_VERSION,
        user_agent: "vitest",
      });
      expect(ins.error).toBeNull();

      // RLS: A cannot insert for B
      const forged = await clientA.from("cgu_acceptances").insert({
        user_id: b.userId,
        cgu_version: CGU_VERSION,
        privacy_version: PRIVACY_VERSION,
      });
      expect(forged.error).not.toBeNull();

      // RLS: A reads only own rows
      const sel = await clientA.from("cgu_acceptances").select("user_id");
      expect(sel.error).toBeNull();
      expect(sel.data?.every((r: any) => r.user_id === a.userId)).toBe(true);

      // B (other user) cannot see A's acceptance
      const clientB = await signInAs(b);
      const sel2 = await clientB.from("cgu_acceptances").select("user_id").eq("user_id", a.userId);
      expect(sel2.error).toBeNull();
      expect(sel2.data?.length ?? 0).toBe(0);
    } finally {
      await deleteTestAccount(a.userId);
      await deleteTestAccount(b.userId);
    }
  });

  it("allows anonymous consent logging but only owner can read", async () => {
    if (!(await maybe())) return;
    const anon = anonClient();
    const ins = await anon.from("consent_logs").insert({
      user_id: null,
      action: "reject_all",
      categories: { necessary: true, analytics: false, functional: false },
      policy_version: COOKIE_POLICY_VERSION,
      user_agent: "vitest-anon",
    });
    expect(ins.error).toBeNull();

    // Anonymous cannot SELECT (policy is auth.uid() = user_id)
    const sel = await anon.from("consent_logs").select("id").limit(1);
    // Either an error or empty rows — never leak
    expect(sel.data?.length ?? 0).toBe(0);
  });

  it("user_consents: each user manages only their own row", async () => {
    if (!(await maybe())) return;
    const a = await createTestAccount();
    const b = await createTestAccount();
    try {
      const ca = await signInAs(a);
      const up = await ca.from("user_consents").upsert(
        { user_id: a.userId, scope: "ai_processing", granted: true },
        { onConflict: "user_id,scope" }
      );
      expect(up.error).toBeNull();

      // Forge: A tries to grant consent for B
      const forged = await ca.from("user_consents").insert({
        user_id: b.userId,
        scope: "marketing",
        granted: true,
      });
      expect(forged.error).not.toBeNull();

      // B reads own consents — A's row must not appear
      const cb = await signInAs(b);
      const sel = await cb.from("user_consents").select("user_id");
      expect(sel.error).toBeNull();
      expect(sel.data?.every((r: any) => r.user_id === b.userId)).toBe(true);
    } finally {
      await deleteTestAccount(a.userId);
      await deleteTestAccount(b.userId);
    }
  });

  it("rgpd_requests: insert + read scoped to owner", async () => {
    if (!(await maybe())) return;
    const a = await createTestAccount();
    try {
      const ca = await signInAs(a);
      const ins = await ca.from("rgpd_requests").insert({ user_id: a.userId, type: "access" });
      expect(ins.error).toBeNull();

      const sel = await ca.from("rgpd_requests").select("type, user_id");
      expect(sel.error).toBeNull();
      expect(sel.data?.every((r: any) => r.user_id === a.userId)).toBe(true);
      expect(sel.data?.some((r: any) => r.type === "access")).toBe(true);
    } finally {
      await deleteTestAccount(a.userId);
    }
  });
});