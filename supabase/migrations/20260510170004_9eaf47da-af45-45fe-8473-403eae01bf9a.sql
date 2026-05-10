
-- Drop overly permissive storage policies
DROP POLICY IF EXISTS "Parents can view medical documents" ON storage.objects;
DROP POLICY IF EXISTS "Parents can view own documents" ON storage.objects;
DROP POLICY IF EXISTS "Parents can delete medical documents" ON storage.objects;
DROP POLICY IF EXISTS "Parents can delete own documents" ON storage.objects;
DROP POLICY IF EXISTS "Parents can upload documents" ON storage.objects;
DROP POLICY IF EXISTS "Parents can upload medical documents" ON storage.objects;

-- SELECT: allow only if the file is referenced by a document of a child the user parents
CREATE POLICY "Parents can read own children medical files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'medical-documents'
  AND EXISTS (
    SELECT 1 FROM public.documents d
    WHERE d.file_path = storage.objects.name
      AND public.is_child_parent(auth.uid(), d.child_id)
  )
);

-- DELETE: same scoping
CREATE POLICY "Parents can delete own children medical files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'medical-documents'
  AND EXISTS (
    SELECT 1 FROM public.documents d
    WHERE d.file_path = storage.objects.name
      AND public.is_child_parent(auth.uid(), d.child_id)
  )
);

-- INSERT: limit users to their own folder (prefix = auth.uid()).
-- The documents table policy enforces the parent/child link separately.
CREATE POLICY "Parents can upload to own folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'medical-documents'
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] = auth.uid()::text
);
