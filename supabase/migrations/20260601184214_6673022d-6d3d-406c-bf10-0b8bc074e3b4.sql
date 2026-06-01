
-- Defense-in-depth: enforce parent relationship via triggers on documents and audit logs

CREATE OR REPLACE FUNCTION public.enforce_document_parent()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_child_id uuid;
BEGIN
  v_child_id := COALESCE(NEW.child_id, OLD.child_id);
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required for document access';
  END IF;
  IF NOT public.is_child_parent(auth.uid(), v_child_id) THEN
    RAISE EXCEPTION 'Access denied: caller is not a parent of child %', v_child_id
      USING ERRCODE = '42501';
  END IF;
  IF TG_OP = 'INSERT' AND TG_TABLE_NAME = 'documents' THEN
    IF NEW.uploaded_by IS DISTINCT FROM auth.uid() THEN
      RAISE EXCEPTION 'uploaded_by must match the authenticated user'
        USING ERRCODE = '42501';
    END IF;
  END IF;
  IF TG_OP = 'INSERT' AND TG_TABLE_NAME = 'document_audit_logs' THEN
    IF NEW.user_id IS DISTINCT FROM auth.uid() THEN
      RAISE EXCEPTION 'user_id must match the authenticated user'
        USING ERRCODE = '42501';
    END IF;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS documents_enforce_parent_ins ON public.documents;
CREATE TRIGGER documents_enforce_parent_ins
  BEFORE INSERT ON public.documents
  FOR EACH ROW EXECUTE FUNCTION public.enforce_document_parent();

DROP TRIGGER IF EXISTS documents_enforce_parent_del ON public.documents;
CREATE TRIGGER documents_enforce_parent_del
  BEFORE DELETE ON public.documents
  FOR EACH ROW EXECUTE FUNCTION public.enforce_document_parent();

DROP TRIGGER IF EXISTS audit_logs_enforce_parent_ins ON public.document_audit_logs;
CREATE TRIGGER audit_logs_enforce_parent_ins
  BEFORE INSERT ON public.document_audit_logs
  FOR EACH ROW EXECUTE FUNCTION public.enforce_document_parent();
