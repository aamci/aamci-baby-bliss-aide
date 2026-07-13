import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type VideoCapsule = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  age_min_months: number;
  age_max_months: number;
  storage_path: string | null;
  external_url: string | null;
  thumbnail_url: string | null;
  duration_sec: number | null;
  author: string | null;
  source_url: string | null;
  published_at: string;
};

export const useVideoCapsules = (ageMonths?: number, category?: string) => {
  return useQuery({
    queryKey: ["video_capsules", ageMonths, category],
    queryFn: async () => {
      let q = supabase.from("video_capsules").select("*").order("published_at", { ascending: false });
      if (category && category !== "Tous") q = q.eq("category", category);
      const { data, error } = await q;
      if (error) throw error;
      let list = (data ?? []) as VideoCapsule[];
      if (typeof ageMonths === "number") {
        list = list.filter((v) => ageMonths >= v.age_min_months && ageMonths <= v.age_max_months);
      }
      return list;
    },
  });
};

export const useSignedVideoUrl = (path: string | null) => {
  return useQuery({
    queryKey: ["signed_video", path],
    queryFn: async () => {
      if (!path) return null;
      const { data, error } = await supabase.storage.from("videos").createSignedUrl(path, 3600);
      if (error) throw error;
      return data.signedUrl;
    },
    enabled: !!path,
  });
};