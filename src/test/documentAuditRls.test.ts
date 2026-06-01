import { describe, it, expect } from "vitest";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://pvvgdklihphkyjngmvgb.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2dmdka2xpaHBoa3lqbmdtdmdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIzODkzNjQsImV4cCI6MjA4Nzk2NTM2NH0.wJMLHbcy4qZl71Nmt8RfS3pGSudfUNlz962bD8wd7dc";

// Network-dependent integration tests against the live Supabase project.
// They verify that RLS + server-side triggers block unauthenticated access
// to document_audit_logs and to documents.
const anon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const RANDOM_UUID = "00000000-0000-0000-0000-000000000000";

const networkAvailable = async () => {
  try {
    const r = await fetch(`${SUPABASE_URL}/auth/v1/health`, {
      headers: { apikey: SUPABASE_ANON_KEY },
    });
    return r.ok;
  } catch {
    return false;
  }
};

describe("document_audit_logs RLS (integration)", () => {
  it("denies anonymous SELECT on document_audit_logs", async () => {
    if (!(await networkAvailable())) return;
    const { data, error } = await anon
      .from("document_audit_logs")
      .select("id")
      .limit(1);
    // Either an explicit error, or an empty array filtered out by RLS.
    expect(error || (Array.isArray(data) && data.length === 0)).toBeTruthy();
  });

  it("denies anonymous INSERT on document_audit_logs", async () => {
    if (!(await networkAvailable())) return;
    const { error } = await anon.from("document_audit_logs").insert({
      user_id: RANDOM_UUID,
      child_id: RANDOM_UUID,
      action: "view",
      file_name: "rls-test.pdf",
    });
    expect(error).not.toBeNull();
  });

  it("denies anonymous SELECT on documents", async () => {
    if (!(await networkAvailable())) return;
    const { data, error } = await anon.from("documents").select("id").limit(1);
    expect(error || (Array.isArray(data) && data.length === 0)).toBeTruthy();
  });

  it("denies anonymous INSERT on documents", async () => {
    if (!(await networkAvailable())) return;
    const { error } = await anon.from("documents").insert({
      child_id: RANDOM_UUID,
      uploaded_by: RANDOM_UUID,
      file_name: "x.pdf",
      file_path: "x/x.pdf",
      file_size: 1,
      category: "Autres",
    });
    expect(error).not.toBeNull();
  });
});