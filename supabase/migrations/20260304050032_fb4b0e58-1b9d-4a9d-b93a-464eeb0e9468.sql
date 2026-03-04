
-- 1. Profiles table (linked to auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL DEFAULT '',
  last_name TEXT NOT NULL DEFAULT '',
  phone TEXT,
  avatar_url TEXT,
  blood_type TEXT,
  allergies TEXT[] DEFAULT '{}',
  medical_history TEXT,
  doctor_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- 2. Children table
CREATE TABLE public.children (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  birth_date DATE NOT NULL,
  gender TEXT CHECK (gender IN ('Garçon', 'Fille', 'Non précisé')),
  blood_type TEXT,
  allergies TEXT[] DEFAULT '{}',
  doctor_name TEXT,
  birth_weight NUMERIC(4,2),
  birth_height NUMERIC(5,1),
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.children ENABLE ROW LEVEL SECURITY;

-- 3. Child-parent membership
CREATE TABLE public.child_parents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  parent_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'parent' CHECK (role IN ('parent', 'co-parent')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (child_id, parent_id)
);

ALTER TABLE public.child_parents ENABLE ROW LEVEL SECURITY;

-- 4. Security definer function to check if user is parent of a child
CREATE OR REPLACE FUNCTION public.is_child_parent(_user_id UUID, _child_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.child_parents
    WHERE parent_id = _user_id AND child_id = _child_id
  )
$$;

-- RLS for children using security definer
CREATE POLICY "Parents can view their children" ON public.children FOR SELECT USING (public.is_child_parent(auth.uid(), id));
CREATE POLICY "Parents can update their children" ON public.children FOR UPDATE USING (public.is_child_parent(auth.uid(), id));
CREATE POLICY "Authenticated users can create children" ON public.children FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- RLS for child_parents
CREATE POLICY "Parents can view their memberships" ON public.child_parents FOR SELECT USING (parent_id = auth.uid());
CREATE POLICY "Parents can add co-parents" ON public.child_parents FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL AND public.is_child_parent(auth.uid(), child_id)
);

-- 5. Growth measurements
CREATE TABLE public.measurements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  measurement_type TEXT NOT NULL CHECK (measurement_type IN ('weight', 'height', 'head')),
  value NUMERIC(6,2) NOT NULL,
  measured_at DATE NOT NULL DEFAULT CURRENT_DATE,
  recorded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.measurements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parents can view child measurements" ON public.measurements FOR SELECT USING (public.is_child_parent(auth.uid(), child_id));
CREATE POLICY "Parents can add measurements" ON public.measurements FOR INSERT WITH CHECK (public.is_child_parent(auth.uid(), child_id));
CREATE POLICY "Parents can update measurements" ON public.measurements FOR UPDATE USING (public.is_child_parent(auth.uid(), child_id));
CREATE POLICY "Parents can delete measurements" ON public.measurements FOR DELETE USING (public.is_child_parent(auth.uid(), child_id));

-- 6. Vaccines
CREATE TABLE public.vaccines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  dose_number INT DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('done', 'upcoming', 'late')),
  administered_at DATE,
  recommended_age TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.vaccines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parents can view child vaccines" ON public.vaccines FOR SELECT USING (public.is_child_parent(auth.uid(), child_id));
CREATE POLICY "Parents can add vaccines" ON public.vaccines FOR INSERT WITH CHECK (public.is_child_parent(auth.uid(), child_id));
CREATE POLICY "Parents can update vaccines" ON public.vaccines FOR UPDATE USING (public.is_child_parent(auth.uid(), child_id));

-- 7. Medical visits
CREATE TABLE public.visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  doctor_name TEXT,
  visit_date DATE,
  status TEXT NOT NULL DEFAULT 'future' CHECK (status IN ('done', 'upcoming', 'future')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.visits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parents can view visits" ON public.visits FOR SELECT USING (public.is_child_parent(auth.uid(), child_id));
CREATE POLICY "Parents can add visits" ON public.visits FOR INSERT WITH CHECK (public.is_child_parent(auth.uid(), child_id));
CREATE POLICY "Parents can update visits" ON public.visits FOR UPDATE USING (public.is_child_parent(auth.uid(), child_id));

-- 8. Milestones
CREATE TABLE public.milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  domain TEXT NOT NULL,
  expected_age TEXT,
  acquired BOOLEAN NOT NULL DEFAULT false,
  acquired_at DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parents can view milestones" ON public.milestones FOR SELECT USING (public.is_child_parent(auth.uid(), child_id));
CREATE POLICY "Parents can add milestones" ON public.milestones FOR INSERT WITH CHECK (public.is_child_parent(auth.uid(), child_id));
CREATE POLICY "Parents can update milestones" ON public.milestones FOR UPDATE USING (public.is_child_parent(auth.uid(), child_id));

-- 9. Saved articles
CREATE TABLE public.saved_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  article_slug TEXT NOT NULL,
  article_title TEXT NOT NULL,
  article_category TEXT,
  article_author TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, article_slug)
);

ALTER TABLE public.saved_articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own saved articles" ON public.saved_articles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can save articles" ON public.saved_articles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unsave articles" ON public.saved_articles FOR DELETE USING (auth.uid() = user_id);

-- 10. Chat messages
CREATE TABLE public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own chats" ON public.chat_messages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own chats" ON public.chat_messages FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 11. Co-parent invitations
CREATE TABLE public.co_parent_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invite_email TEXT,
  invite_phone TEXT,
  token TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '7 days')
);

ALTER TABLE public.co_parent_invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Inviters can view their invites" ON public.co_parent_invites FOR SELECT USING (invited_by = auth.uid());
CREATE POLICY "Parents can create invites" ON public.co_parent_invites FOR INSERT WITH CHECK (
  auth.uid() = invited_by AND public.is_child_parent(auth.uid(), child_id)
);

-- 12. Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', '')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 13. Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_children_updated_at BEFORE UPDATE ON public.children FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 14. Storage bucket for medical documents
INSERT INTO storage.buckets (id, name, public) VALUES ('medical-documents', 'medical-documents', false);

CREATE POLICY "Parents can upload documents" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'medical-documents' AND auth.uid() IS NOT NULL
);

CREATE POLICY "Parents can view own documents" ON storage.objects FOR SELECT USING (
  bucket_id = 'medical-documents' AND auth.uid() IS NOT NULL
);

CREATE POLICY "Parents can delete own documents" ON storage.objects FOR DELETE USING (
  bucket_id = 'medical-documents' AND auth.uid()::text = (storage.foldername(name))[1]
);
