CREATE TABLE public.document_audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  document_id UUID,
  child_id UUID NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('view','download','upload','delete')),
  file_name TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_doc_audit_child ON public.document_audit_logs(child_id, created_at DESC);
CREATE INDEX idx_doc_audit_user ON public.document_audit_logs(user_id, created_at DESC);

GRANT SELECT, INSERT ON public.document_audit_logs TO authenticated;
GRANT ALL ON public.document_audit_logs TO service_role;

ALTER TABLE public.document_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parents can view child audit logs"
ON public.document_audit_logs
FOR SELECT
TO authenticated
USING (public.is_child_parent(auth.uid(), child_id));

CREATE POLICY "Users log own actions"
ON public.document_audit_logs
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id AND public.is_child_parent(auth.uid(), child_id));