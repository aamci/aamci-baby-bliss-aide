CREATE TABLE public.reminder_states (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id uuid NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  reminder_key text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  snoozed_until date,
  completed_at date,
  updated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (child_id, reminder_key)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.reminder_states TO authenticated;
GRANT ALL ON public.reminder_states TO service_role;

ALTER TABLE public.reminder_states ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parents can view reminder states"
  ON public.reminder_states FOR SELECT TO authenticated
  USING (public.is_child_parent(auth.uid(), child_id));

CREATE POLICY "Parents can insert reminder states"
  ON public.reminder_states FOR INSERT TO authenticated
  WITH CHECK (public.is_child_parent(auth.uid(), child_id));

CREATE POLICY "Parents can update reminder states"
  ON public.reminder_states FOR UPDATE TO authenticated
  USING (public.is_child_parent(auth.uid(), child_id))
  WITH CHECK (public.is_child_parent(auth.uid(), child_id));

CREATE POLICY "Parents can delete reminder states"
  ON public.reminder_states FOR DELETE TO authenticated
  USING (public.is_child_parent(auth.uid(), child_id));

CREATE TRIGGER trg_reminder_states_updated
  BEFORE UPDATE ON public.reminder_states
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();