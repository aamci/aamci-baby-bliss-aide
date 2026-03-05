
-- Create a documents metadata table to track uploaded files
CREATE TABLE public.documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id uuid REFERENCES public.children(id) ON DELETE CASCADE NOT NULL,
  uploaded_by uuid NOT NULL,
  file_name text NOT NULL,
  file_path text NOT NULL,
  file_size bigint NOT NULL DEFAULT 0,
  category text NOT NULL DEFAULT 'Autres',
  doctor_name text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parents can view child documents" ON public.documents
  FOR SELECT USING (is_child_parent(auth.uid(), child_id));

CREATE POLICY "Parents can add documents" ON public.documents
  FOR INSERT WITH CHECK (is_child_parent(auth.uid(), child_id) AND auth.uid() = uploaded_by);

CREATE POLICY "Parents can delete documents" ON public.documents
  FOR DELETE USING (is_child_parent(auth.uid(), child_id));

-- Storage RLS policies for medical-documents bucket
CREATE POLICY "Parents can upload medical documents"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'medical-documents' AND auth.uid() IS NOT NULL);

CREATE POLICY "Parents can view medical documents"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'medical-documents' AND auth.uid() IS NOT NULL);

CREATE POLICY "Parents can delete medical documents"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'medical-documents' AND auth.uid() IS NOT NULL);
