
-- 1. cgu_acceptances
CREATE TABLE public.cgu_acceptances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  cgu_version text NOT NULL,
  privacy_version text NOT NULL,
  ip text,
  user_agent text,
  accepted_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.cgu_acceptances TO authenticated;
GRANT ALL ON public.cgu_acceptances TO service_role;
ALTER TABLE public.cgu_acceptances ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own cgu acceptances - select" ON public.cgu_acceptances
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Own cgu acceptances - insert" ON public.cgu_acceptances
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE INDEX cgu_acceptances_user_idx ON public.cgu_acceptances(user_id, accepted_at DESC);

-- 2. consent_logs (cookies journal)
CREATE TABLE public.consent_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  action text NOT NULL,
  categories jsonb NOT NULL DEFAULT '{}'::jsonb,
  policy_version text NOT NULL,
  ip text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.consent_logs TO anon;
GRANT SELECT, INSERT ON public.consent_logs TO authenticated;
GRANT ALL ON public.consent_logs TO service_role;
ALTER TABLE public.consent_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can log consent" ON public.consent_logs
  FOR INSERT TO anon, authenticated
  WITH CHECK (user_id IS NULL OR auth.uid() = user_id);
CREATE POLICY "Own consent logs - select" ON public.consent_logs
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- 3. user_consents
CREATE TABLE public.user_consents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  scope text NOT NULL,
  granted boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, scope)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_consents TO authenticated;
GRANT ALL ON public.user_consents TO service_role;
ALTER TABLE public.user_consents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own user_consents" ON public.user_consents
  FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_user_consents_updated_at
  BEFORE UPDATE ON public.user_consents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. rgpd_requests
DO $$ BEGIN
  CREATE TYPE public.rgpd_request_type AS ENUM ('access', 'export', 'delete', 'rectification', 'consent_withdrawal');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE public.rgpd_request_status AS ENUM ('pending', 'processing', 'completed', 'rejected');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE public.rgpd_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type public.rgpd_request_type NOT NULL,
  status public.rgpd_request_status NOT NULL DEFAULT 'pending',
  payload jsonb DEFAULT '{}'::jsonb,
  result_url text,
  requested_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.rgpd_requests TO authenticated;
GRANT ALL ON public.rgpd_requests TO service_role;
ALTER TABLE public.rgpd_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own rgpd requests - select" ON public.rgpd_requests
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Own rgpd requests - insert" ON public.rgpd_requests
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_rgpd_requests_updated_at
  BEFORE UPDATE ON public.rgpd_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
