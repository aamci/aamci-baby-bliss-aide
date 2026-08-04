CREATE TABLE public.news_read_history (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  news_slug text NOT NULL,
  action text NOT NULL DEFAULT 'read',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.news_read_history TO authenticated;
GRANT ALL ON public.news_read_history TO service_role;

ALTER TABLE public.news_read_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own news history"
  ON public.news_read_history FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own news history"
  ON public.news_read_history FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_news_history_user ON public.news_read_history(user_id, news_slug);