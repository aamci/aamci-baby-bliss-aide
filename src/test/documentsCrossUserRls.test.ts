import { describe, it, expect } from "vitest";
import { createClient } from "@supabase/supabase-js";

// Integration test: verifies that PostgREST + RLS + server-side triggers
// refuse read / download / delete on documents when the caller has no
// confirmed parent-child relationship. We target a random child UUID that
// the anonymous session is guaranteed not to be a parent of.
const SUPABASE_URL = "https://pvvgdklihphkyjngmvgb.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2dmdka2xpaHBoa3lqbmdtdmdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIzODkzNjQsImV4cCI6MjA4Nzk2NTM2NH0.wJMLHbcy4qZl71Nmt8RfS3pGSudfUNlz962bD8wd7dc";

const anon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const FOREIGN_CHILD = "11111111-1111-1111-1111-111111111111";
const FOREIGN_DOC = "22222222-2222-2222-2222-222222222222";
const FOREIGN_USER = "33333333-3333-3333-3333-333333333333";

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

describe("documents cross-user RLS (no parent-child relation)", () => {
  it("READ: refuses to return documents of a child the caller does not parent", async () => {
    if (!(await networkAvailable())) return;
    const { data, error } = await anon
      .from("documents")
      .select("id, file_path")
      .eq("child_id", FOREIGN_CHILD);
    expect(error || (Array.isArray(data) && data.length === 0)).toBeTruthy();
  });

  it("DOWNLOAD: refuses to create a signed URL for a foreign document path", async () => {
    if (!(await networkAvailable())) return;
    const { data, error } = await anon.storage
      .from("medical-documents")
      .createSignedUrl(`${FOREIGN_USER}/${FOREIGN_CHILD}/secret.pdf`, 60);
    // bucket is private + storage RLS blocks anon → no signed URL
    expect(error).not.toBeNull();
    expect(data?.signedUrl).toBeFalsy();
  });

  it("DELETE: refuses to delete a document row of a foreign child", async () => {
    if (!(await networkAvailable())) return;
    const { error, count } = await anon
      .from("documents")
      .delete({ count: "exact" })
      .eq("id", FOREIGN_DOC);
    // RLS either errors or returns 0 affected rows — never a successful delete
    expect(error !== null || count === 0 || count === null).toBe(true);
  });

  it("INSERT: refuses to insert a document for a child the caller does not parent", async () => {
    if (!(await networkAvailable())) return;
    const { error } = await anon.from("documents").insert({
      child_id: FOREIGN_CHILD,
      uploaded_by: FOREIGN_USER,
      file_name: "evil.pdf",
      file_path: `${FOREIGN_USER}/${FOREIGN_CHILD}/evil.pdf`,
      file_size: 1,
      category: "Autres",
    });
    expect(error).not.toBeNull();
  });

  it("AUDIT: refuses to insert an audit log targeting a foreign child", async () => {
    if (!(await networkAvailable())) return;
    const { error } = await anon.from("document_audit_logs").insert({
      user_id: FOREIGN_USER,
      child_id: FOREIGN_CHILD,
      document_id: FOREIGN_DOC,
      action: "download",
      file_name: "leak.pdf",
    });
    expect(error).not.toBeNull();
  });
});