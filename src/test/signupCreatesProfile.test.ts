import { describe, it, expect } from "vitest";
import {
  createTestAccount,
  deleteTestAccount,
  hasServiceRole,
  networkAvailable,
  signInAs,
  adminClient,
} from "./helpers/testAccounts";

describe("signup → profile persistence", () => {
  it("creates a profiles row at signup and returns it after login", async () => {
    if (!hasServiceRole() || !(await networkAvailable())) {
      console.warn("SKIP: SUPABASE_SERVICE_ROLE_KEY not set or network unavailable");
      return;
    }
    const account = await createTestAccount();
    try {
      // Trigger handle_new_user runs synchronously on INSERT INTO auth.users.
      // Verify the profile row exists with the metadata we sent.
      const admin = adminClient()!;
      const { data: profile, error: pErr } = await admin
        .from("profiles")
        .select("id, first_name, last_name")
        .eq("id", account.userId)
        .single();
      expect(pErr).toBeNull();
      expect(profile?.id).toBe(account.userId);
      expect(profile?.first_name).toBe(account.firstName);
      expect(profile?.last_name).toBe(account.lastName);

      // Login as the user (anon key) and re-fetch via RLS-scoped select.
      const client = await signInAs(account);
      const { data: own, error: oErr } = await client
        .from("profiles")
        .select("id, first_name, last_name")
        .eq("id", account.userId)
        .single();
      expect(oErr).toBeNull();
      expect(own?.first_name).toBe(account.firstName);
      expect(own?.last_name).toBe(account.lastName);
      await client.auth.signOut();
    } finally {
      await deleteTestAccount(account.userId);
    }
  }, 30_000);
});