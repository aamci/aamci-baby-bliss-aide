import { describe, it, expect } from "vitest";
import {
  createTestAccount,
  deleteTestAccount,
  hasServiceRole,
  networkAvailable,
  signInAs,
  adminClient,
} from "./helpers/testAccounts";

/**
 * End-to-end audit-log test:
 *   1. parent A uploads a document → audit `upload`
 *   2. parent A downloads it (signed URL) → audit `download`
 *   3. parent A deletes it → audit `delete`
 *   4. parent A sees only their own audit rows; parent B sees none of A's.
 *
 * Reproduces what `/document-audit` queries (`select * from document_audit_logs
 * where child_id in (...)`) — but through the RLS-scoped anon client.
 */
describe("document audit log — end-to-end", () => {
  it("records upload/download/delete and isolates logs per parent", async () => {
    if (!hasServiceRole() || !(await networkAvailable())) {
      console.warn("SKIP: SUPABASE_SERVICE_ROLE_KEY not set or network unavailable");
      return;
    }

    const parentA = await createTestAccount();
    const parentB = await createTestAccount();
    const admin = adminClient()!;

    try {
      const clientA = await signInAs(parentA);

      // create child for parent A (trigger link_child_creator wires child_parents)
      const { data: child, error: cErr } = await clientA
        .from("children")
        .insert({
          first_name: "Audit",
          last_name: "Kid",
          birth_date: "2024-01-01",
          gender: "M",
        })
        .select()
        .single();
      expect(cErr).toBeNull();
      const childId = child!.id as string;

      // --- UPLOAD ---
      const filePath = `${parentA.userId}/${childId}/${Date.now()}.txt`;
      const fileBlob = new Blob(["hello-audit"], { type: "text/plain" });
      const { error: upErr } = await clientA.storage
        .from("medical-documents")
        .upload(filePath, fileBlob);
      expect(upErr).toBeNull();

      const { data: doc, error: dErr } = await clientA
        .from("documents")
        .insert({
          child_id: childId,
          uploaded_by: parentA.userId,
          file_name: "audit.txt",
          file_path: filePath,
          file_size: 11,
          category: "Ordonnances",
        })
        .select()
        .single();
      expect(dErr).toBeNull();
      const docId = doc!.id as string;

      await clientA.from("document_audit_logs").insert({
        user_id: parentA.userId,
        document_id: docId,
        child_id: childId,
        action: "upload",
        file_name: "audit.txt",
      });

      // --- DOWNLOAD ---
      const { data: signed } = await clientA.storage
        .from("medical-documents")
        .createSignedUrl(filePath, 60);
      expect(signed?.signedUrl).toBeTruthy();
      await clientA.from("document_audit_logs").insert({
        user_id: parentA.userId,
        document_id: docId,
        child_id: childId,
        action: "download",
        file_name: "audit.txt",
      });

      // --- DELETE ---
      await clientA.storage.from("medical-documents").remove([filePath]);
      await clientA.from("documents").delete().eq("id", docId);
      await clientA.from("document_audit_logs").insert({
        user_id: parentA.userId,
        document_id: docId,
        child_id: childId,
        action: "delete",
        file_name: "audit.txt",
      });

      // --- Parent A sees their 3 logs ---
      const { data: logsA, error: lErr } = await clientA
        .from("document_audit_logs")
        .select("action, user_id, child_id")
        .eq("child_id", childId)
        .order("created_at", { ascending: true });
      expect(lErr).toBeNull();
      const actions = (logsA || []).map((l: any) => l.action);
      expect(actions).toEqual(expect.arrayContaining(["upload", "download", "delete"]));
      expect((logsA || []).every((l: any) => l.user_id === parentA.userId)).toBe(true);

      // --- Parent B is NOT a parent of the child → sees nothing ---
      const clientB = await signInAs(parentB);
      const { data: logsB } = await clientB
        .from("document_audit_logs")
        .select("id")
        .eq("child_id", childId);
      expect(logsB || []).toEqual([]);

      // and cannot insert a forged log for that child either
      const { error: forge } = await clientB.from("document_audit_logs").insert({
        user_id: parentB.userId,
        document_id: docId,
        child_id: childId,
        action: "view",
        file_name: "stolen.txt",
      });
      expect(forge).not.toBeNull();

      await clientA.auth.signOut();
      await clientB.auth.signOut();

      // server-side cleanup of any leftover rows
      await admin.from("document_audit_logs").delete().eq("child_id", childId);
      await admin.from("children").delete().eq("id", childId);
    } finally {
      await deleteTestAccount(parentA.userId);
      await deleteTestAccount(parentB.userId);
    }
  }, 60_000);
});