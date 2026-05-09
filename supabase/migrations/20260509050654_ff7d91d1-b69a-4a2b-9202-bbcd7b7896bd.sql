
-- Fix: allow first parent to link themselves to a newly created child
DROP POLICY IF EXISTS "Parents can add co-parents" ON public.child_parents;

CREATE POLICY "Parents can link themselves or co-parents"
ON public.child_parents
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() IS NOT NULL
  AND (
    -- Existing parent inviting a co-parent
    public.is_child_parent(auth.uid(), child_id)
    -- OR linking yourself to a child that has no parent yet (creator case)
    OR (
      parent_id = auth.uid()
      AND NOT EXISTS (
        SELECT 1 FROM public.child_parents cp WHERE cp.child_id = child_parents.child_id
      )
    )
  )
);

-- Allow parents to leave a child (delete their own membership)
CREATE POLICY "Parents can remove memberships"
ON public.child_parents
FOR DELETE
TO authenticated
USING (public.is_child_parent(auth.uid(), child_id));

-- Allow parents to delete a child
CREATE POLICY "Parents can delete their children"
ON public.children
FOR DELETE
TO authenticated
USING (public.is_child_parent(auth.uid(), id));

-- Allow cleanup of related rows on child deletion
CREATE POLICY "Parents can delete vaccines"
ON public.vaccines
FOR DELETE
TO authenticated
USING (public.is_child_parent(auth.uid(), child_id));

CREATE POLICY "Parents can delete milestones"
ON public.milestones
FOR DELETE
TO authenticated
USING (public.is_child_parent(auth.uid(), child_id));
