-- Sleep logs
CREATE TABLE public.sleep_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id uuid NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  recorded_by uuid NOT NULL,
  start_at timestamptz NOT NULL,
  end_at timestamptz,
  duration_min integer,
  kind text NOT NULL DEFAULT 'nap' CHECK (kind IN ('night','nap')),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sleep_logs TO authenticated;
GRANT ALL ON public.sleep_logs TO service_role;
ALTER TABLE public.sleep_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sleep_logs_select" ON public.sleep_logs FOR SELECT TO authenticated
  USING (public.is_child_parent(auth.uid(), child_id));
CREATE POLICY "sleep_logs_insert" ON public.sleep_logs FOR INSERT TO authenticated
  WITH CHECK (public.is_child_parent(auth.uid(), child_id) AND recorded_by = auth.uid());
CREATE POLICY "sleep_logs_update" ON public.sleep_logs FOR UPDATE TO authenticated
  USING (public.is_child_parent(auth.uid(), child_id))
  WITH CHECK (public.is_child_parent(auth.uid(), child_id));
CREATE POLICY "sleep_logs_delete" ON public.sleep_logs FOR DELETE TO authenticated
  USING (public.is_child_parent(auth.uid(), child_id));
CREATE TRIGGER trg_sleep_logs_updated BEFORE UPDATE ON public.sleep_logs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_sleep_logs_child_start ON public.sleep_logs(child_id, start_at DESC);

-- Feeding logs
CREATE TABLE public.feeding_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id uuid NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  recorded_by uuid NOT NULL,
  fed_at timestamptz NOT NULL DEFAULT now(),
  kind text NOT NULL CHECK (kind IN ('breast','bottle','solid')),
  side text CHECK (side IN ('left','right','both')),
  amount_ml integer,
  food text,
  duration_min integer,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.feeding_logs TO authenticated;
GRANT ALL ON public.feeding_logs TO service_role;
ALTER TABLE public.feeding_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "feeding_logs_select" ON public.feeding_logs FOR SELECT TO authenticated
  USING (public.is_child_parent(auth.uid(), child_id));
CREATE POLICY "feeding_logs_insert" ON public.feeding_logs FOR INSERT TO authenticated
  WITH CHECK (public.is_child_parent(auth.uid(), child_id) AND recorded_by = auth.uid());
CREATE POLICY "feeding_logs_update" ON public.feeding_logs FOR UPDATE TO authenticated
  USING (public.is_child_parent(auth.uid(), child_id))
  WITH CHECK (public.is_child_parent(auth.uid(), child_id));
CREATE POLICY "feeding_logs_delete" ON public.feeding_logs FOR DELETE TO authenticated
  USING (public.is_child_parent(auth.uid(), child_id));
CREATE TRIGGER trg_feeding_logs_updated BEFORE UPDATE ON public.feeding_logs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_feeding_logs_child_fedat ON public.feeding_logs(child_id, fed_at DESC);

-- Diaper logs
CREATE TABLE public.diaper_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id uuid NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  recorded_by uuid NOT NULL,
  changed_at timestamptz NOT NULL DEFAULT now(),
  kind text NOT NULL CHECK (kind IN ('wet','dirty','both')),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.diaper_logs TO authenticated;
GRANT ALL ON public.diaper_logs TO service_role;
ALTER TABLE public.diaper_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "diaper_logs_select" ON public.diaper_logs FOR SELECT TO authenticated
  USING (public.is_child_parent(auth.uid(), child_id));
CREATE POLICY "diaper_logs_insert" ON public.diaper_logs FOR INSERT TO authenticated
  WITH CHECK (public.is_child_parent(auth.uid(), child_id) AND recorded_by = auth.uid());
CREATE POLICY "diaper_logs_update" ON public.diaper_logs FOR UPDATE TO authenticated
  USING (public.is_child_parent(auth.uid(), child_id))
  WITH CHECK (public.is_child_parent(auth.uid(), child_id));
CREATE POLICY "diaper_logs_delete" ON public.diaper_logs FOR DELETE TO authenticated
  USING (public.is_child_parent(auth.uid(), child_id));
CREATE TRIGGER trg_diaper_logs_updated BEFORE UPDATE ON public.diaper_logs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_diaper_logs_child_changed ON public.diaper_logs(child_id, changed_at DESC);

-- Video capsules (editorial content)
CREATE TABLE public.video_capsules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  category text NOT NULL DEFAULT 'general',
  age_min_months integer NOT NULL DEFAULT 0,
  age_max_months integer NOT NULL DEFAULT 48,
  storage_path text,
  external_url text,
  thumbnail_url text,
  duration_sec integer,
  author text,
  source_url text,
  published_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.video_capsules TO authenticated, anon;
GRANT ALL ON public.video_capsules TO service_role;
ALTER TABLE public.video_capsules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "video_capsules_public_read" ON public.video_capsules FOR SELECT
  USING (true);
CREATE TRIGGER trg_video_capsules_updated BEFORE UPDATE ON public.video_capsules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for co-parenting live sync
ALTER PUBLICATION supabase_realtime ADD TABLE public.sleep_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.feeding_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.diaper_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.measurements;
ALTER PUBLICATION supabase_realtime ADD TABLE public.milestones;
ALTER PUBLICATION supabase_realtime ADD TABLE public.documents;

-- Seed video capsules (editorial, expert sources)
INSERT INTO public.video_capsules (title, description, category, age_min_months, age_max_months, external_url, thumbnail_url, duration_sec, author, source_url) VALUES
('Le sommeil du nourrisson', 'Comprendre les cycles de sommeil de 0 à 6 mois et instaurer de bonnes habitudes.', 'sommeil', 0, 6, 'https://www.youtube-nocookie.com/embed/2eBz3G_x8xI', 'https://images.unsplash.com/photo-1522771930-78848d9293e8?w=600', 240, 'Dr. équipe HAS', 'https://www.has-sante.fr/'),
('Diversification alimentaire', 'Introduire les premiers aliments entre 4 et 6 mois : ordre, textures, allergènes.', 'alimentation', 4, 12, 'https://www.youtube-nocookie.com/embed/6vT-1Ic8fH8', 'https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?w=600', 300, 'mpedia.fr', 'https://www.mpedia.fr/'),
('Vaccination obligatoire 0-2 ans', 'Le calendrier vaccinal français simplifié et pourquoi vacciner.', 'sante', 0, 24, 'https://www.youtube-nocookie.com/embed/lC7GkFWZ4gc', 'https://images.unsplash.com/photo-1584515933487-779824d29309?w=600', 210, 'Santé Publique France', 'https://vaccination-info-service.fr/'),
('Éveil et jalons moteurs', 'Comment stimuler la motricité libre entre 6 et 18 mois.', 'developpement', 6, 18, 'https://www.youtube-nocookie.com/embed/3JpzB5v9WwY', 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=600', 280, 'Kinésithérapeute pédiatrique', 'https://www.ameli.fr/'),
('Prévention mort subite du nourrisson', 'Les 5 règles d''or pour un couchage sûr.', 'securite', 0, 12, 'https://www.youtube-nocookie.com/embed/K8V5b8XlS0Q', 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=600', 180, 'Association Naître et Vivre', 'https://naitre-et-vivre.org/'),
('Langage : les premiers mots', 'Favoriser l''acquisition du langage entre 12 et 36 mois.', 'developpement', 12, 36, 'https://www.youtube-nocookie.com/embed/N7oz366X0-8', 'https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=600', 320, 'Orthophoniste', 'https://www.mpedia.fr/');