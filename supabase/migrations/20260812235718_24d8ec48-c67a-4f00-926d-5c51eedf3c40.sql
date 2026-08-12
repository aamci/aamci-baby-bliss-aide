
CREATE TABLE public.child_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id uuid NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL,
  channel text NOT NULL DEFAULT 'coparent',
  content text NOT NULL,
  attachment_path text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT child_messages_channel_check CHECK (channel IN ('coparent','pro','note')),
  CONSTRAINT child_messages_content_check CHECK (char_length(content) BETWEEN 1 AND 4000)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.child_messages TO authenticated;
GRANT ALL ON public.child_messages TO service_role;
ALTER TABLE public.child_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parents read child messages" ON public.child_messages
  FOR SELECT TO authenticated USING (public.is_child_parent(auth.uid(), child_id));
CREATE POLICY "Parents send child messages" ON public.child_messages
  FOR INSERT TO authenticated WITH CHECK (public.is_child_parent(auth.uid(), child_id) AND sender_id = auth.uid());
CREATE POLICY "Authors update own messages" ON public.child_messages
  FOR UPDATE TO authenticated USING (sender_id = auth.uid() AND public.is_child_parent(auth.uid(), child_id))
  WITH CHECK (sender_id = auth.uid());
CREATE POLICY "Authors delete own messages" ON public.child_messages
  FOR DELETE TO authenticated USING (sender_id = auth.uid() AND public.is_child_parent(auth.uid(), child_id));

CREATE INDEX idx_child_messages_child_channel ON public.child_messages (child_id, channel, created_at DESC);

CREATE TRIGGER trg_child_messages_updated
  BEFORE UPDATE ON public.child_messages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.child_message_reads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id uuid NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  channel text NOT NULL,
  last_read_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT child_message_reads_channel_check CHECK (channel IN ('coparent','pro','note')),
  UNIQUE (child_id, user_id, channel)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.child_message_reads TO authenticated;
GRANT ALL ON public.child_message_reads TO service_role;
ALTER TABLE public.child_message_reads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own read markers" ON public.child_message_reads
  FOR ALL TO authenticated
  USING (user_id = auth.uid() AND public.is_child_parent(auth.uid(), child_id))
  WITH CHECK (user_id = auth.uid() AND public.is_child_parent(auth.uid(), child_id));

CREATE TRIGGER trg_child_message_reads_updated
  BEFORE UPDATE ON public.child_message_reads
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.child_messages REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.child_messages;
