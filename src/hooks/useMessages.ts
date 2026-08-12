import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type MessageChannel = "coparent" | "pro" | "note";

export type ChildMessage = {
  id: string;
  child_id: string;
  sender_id: string;
  channel: MessageChannel;
  content: string;
  attachment_path: string | null;
  created_at: string;
  updated_at: string;
};

const db = supabase as unknown as {
  from: (t: string) => any;
};

export const useMessages = (childId?: string, channel: MessageChannel = "coparent") => {
  const qc = useQueryClient();

  useEffect(() => {
    if (!childId) return;
    const ch = supabase
      .channel(`messages-${childId}-${channel}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "child_messages", filter: `child_id=eq.${childId}` },
        () => qc.invalidateQueries({ queryKey: ["child_messages", childId] })
      )
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [childId, channel, qc]);

  return useQuery({
    queryKey: ["child_messages", childId, channel],
    queryFn: async () => {
      const { data, error } = await db
        .from("child_messages")
        .select("*")
        .eq("child_id", childId!)
        .eq("channel", channel)
        .order("created_at", { ascending: true })
        .limit(500);
      if (error) throw error;
      return (data ?? []) as ChildMessage[];
    },
    enabled: !!childId,
  });
};

export const useSendMessage = () => {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (m: { child_id: string; channel: MessageChannel; content: string }) => {
      const { data, error } = await db
        .from("child_messages")
        .insert({ ...m, sender_id: user!.id })
        .select()
        .single();
      if (error) throw error;
      return data as ChildMessage;
    },
    onSuccess: (_d, v) => qc.invalidateQueries({ queryKey: ["child_messages", v.child_id, v.channel] }),
  });
};

export const useDeleteMessage = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (m: { id: string; child_id: string; channel: MessageChannel }) => {
      const { error } = await db.from("child_messages").delete().eq("id", m.id);
      if (error) throw error;
      return m;
    },
    onSuccess: (m) => qc.invalidateQueries({ queryKey: ["child_messages", m.child_id, m.channel] }),
  });
};

/** Noms des parents rattachés à l'enfant (pour afficher l'auteur des messages). */
export const useChildParticipants = (childId?: string) => {
  return useQuery({
    queryKey: ["child_participants", childId],
    queryFn: async () => {
      const { data: links, error } = await db
        .from("child_parents")
        .select("parent_id, role")
        .eq("child_id", childId!);
      if (error) throw error;
      const ids = (links ?? []).map((l: any) => l.parent_id);
      if (!ids.length) return {} as Record<string, string>;
      const { data: profiles } = await db.from("profiles").select("id, first_name, last_name").in("id", ids);
      const map: Record<string, string> = {};
      (profiles ?? []).forEach((p: any) => {
        map[p.id] = [p.first_name, p.last_name].filter(Boolean).join(" ") || "Parent";
      });
      return map;
    },
    enabled: !!childId,
  });
};

/** Marque un canal comme lu et expose le nombre de messages non lus. */
export const useUnreadMessages = (childId?: string) => {
  const { user } = useAuth();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["child_message_unread", childId, user?.id],
    queryFn: async () => {
      const { data: reads } = await db
        .from("child_message_reads")
        .select("channel, last_read_at")
        .eq("child_id", childId!)
        .eq("user_id", user!.id);
      const readMap: Record<string, string> = {};
      (reads ?? []).forEach((r: any) => { readMap[r.channel] = r.last_read_at; });

      const { data: msgs } = await db
        .from("child_messages")
        .select("channel, created_at, sender_id")
        .eq("child_id", childId!)
        .order("created_at", { ascending: false })
        .limit(500);

      const counts: Record<MessageChannel, number> = { coparent: 0, pro: 0, note: 0 };
      (msgs ?? []).forEach((m: any) => {
        if (m.sender_id === user!.id) return;
        const last = readMap[m.channel];
        if (!last || new Date(m.created_at) > new Date(last)) counts[m.channel as MessageChannel] += 1;
      });
      return counts;
    },
    enabled: !!childId && !!user,
  });

  const markRead = async (channel: MessageChannel) => {
    if (!childId || !user) return;
    await db
      .from("child_message_reads")
      .upsert(
        { child_id: childId, user_id: user.id, channel, last_read_at: new Date().toISOString() },
        { onConflict: "child_id,user_id,channel" }
      );
    qc.invalidateQueries({ queryKey: ["child_message_unread", childId, user.id] });
  };

  return { ...query, markRead };
};
