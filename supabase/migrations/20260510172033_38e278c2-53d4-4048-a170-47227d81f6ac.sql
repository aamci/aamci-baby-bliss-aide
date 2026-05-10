
-- 1) Auto-link creator as parent when a child row is inserted
CREATE OR REPLACE FUNCTION public.link_child_creator()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NOT NULL THEN
    INSERT INTO public.child_parents (child_id, parent_id, role)
    VALUES (NEW.id, auth.uid(), 'parent')
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS link_child_creator_trigger ON public.children;
CREATE TRIGGER link_child_creator_trigger
AFTER INSERT ON public.children
FOR EACH ROW EXECUTE FUNCTION public.link_child_creator();

-- 2) Tighten child_parents INSERT: only existing parents can add co-parents
DROP POLICY IF EXISTS "Parents can link themselves or co-parents" ON public.child_parents;
CREATE POLICY "Existing parents can add co-parents"
ON public.child_parents FOR INSERT
TO authenticated
WITH CHECK (public.is_child_parent(auth.uid(), child_id));

-- 3) Add explicit UPDATE policy on storage to scope file modifications to owning parents
CREATE POLICY "Parents can update own children medical files"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'medical-documents'
  AND EXISTS (
    SELECT 1 FROM public.documents d
    WHERE d.file_path = storage.objects.name
      AND public.is_child_parent(auth.uid(), d.child_id)
  )
)
WITH CHECK (
  bucket_id = 'medical-documents'
  AND EXISTS (
    SELECT 1 FROM public.documents d
    WHERE d.file_path = storage.objects.name
      AND public.is_child_parent(auth.uid(), d.child_id)
  )
);
