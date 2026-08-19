CREATE UNIQUE INDEX IF NOT EXISTS push_notification_log_user_dedupe_idx ON public.push_notification_log (user_id, dedupe_key);
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;