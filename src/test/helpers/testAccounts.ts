import { createClient, SupabaseClient } from "@supabase/supabase-js";

export const SUPABASE_URL = "https://pvvgdklihphkyjngmvgb.supabase.co";
export const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2dmdka2xpaHBoa3lqbmdtdmdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIzODkzNjQsImV4cCI6MjA4Nzk2NTM2NH0.wJMLHbcy4qZl71Nmt8RfS3pGSudfUNlz962bD8wd7dc";

/**
 * Service-role key is read from the environment so it never lands in the
 * repo. Export it before running tests:
 *
 *   export SUPABASE_SERVICE_ROLE_KEY="..."
 *   bunx vitest run
 *
 * When the key is absent, helpers return null and the test suites that
 * rely on real accounts mark themselves as skipped instead of failing.
 */
export const SERVICE_ROLE_KEY: string | undefined =
  (typeof process !== "undefined" && process.env?.SUPABASE_SERVICE_ROLE_KEY) ||
  undefined;

export const hasServiceRole = () => Boolean(SERVICE_ROLE_KEY);

export const adminClient = (): SupabaseClient | null => {
  if (!SERVICE_ROLE_KEY) return null;
  return createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
};

export const anonClient = (): SupabaseClient =>
  createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

export const networkAvailable = async () => {
  try {
    const r = await fetch(`${SUPABASE_URL}/auth/v1/health`, {
      headers: { apikey: SUPABASE_ANON_KEY },
    });
    return r.ok;
  } catch {
    return false;
  }
};

export type TestAccount = {
  userId: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
};

/**
 * Create a confirmed test user (no OTP / email verification needed) using
 * the service-role admin API. user_metadata mirrors what the signup form
 * sends so the `handle_new_user` trigger populates `profiles` exactly as
 * in production.
 */
export const createTestAccount = async (
  overrides: Partial<TestAccount> = {}
): Promise<TestAccount> => {
  const admin = adminClient();
  if (!admin) throw new Error("SUPABASE_SERVICE_ROLE_KEY not set");
  const rand = Math.random().toString(36).slice(2, 10);
  const account: TestAccount = {
    userId: "",
    email: overrides.email ?? `test_${rand}@bebesante-tests.local`,
    password: overrides.password ?? `Test_${rand}_Pwd!`,
    firstName: overrides.firstName ?? "Test",
    lastName: overrides.lastName ?? `User${rand}`,
  };
  const { data, error } = await admin.auth.admin.createUser({
    email: account.email,
    password: account.password,
    email_confirm: true,
    user_metadata: {
      first_name: account.firstName,
      last_name: account.lastName,
      phone: "",
    },
  });
  if (error || !data.user) throw error ?? new Error("createUser failed");
  account.userId = data.user.id;
  return account;
};

export const deleteTestAccount = async (userId: string) => {
  const admin = adminClient();
  if (!admin) return;
  try {
    await admin.auth.admin.deleteUser(userId);
  } catch {
    /* ignore */
  }
};

export const signInAs = async (account: TestAccount) => {
  const client = anonClient();
  const { error } = await client.auth.signInWithPassword({
    email: account.email,
    password: account.password,
  });
  if (error) throw error;
  return client;
};