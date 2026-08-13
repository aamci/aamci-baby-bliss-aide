import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Send, Trash2, Users, Stethoscope, StickyNote, Baby } from "lucide-react";
import { format, parseISO, isToday, isYesterday } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";
import PageTransition from "@/components/PageTransition";
import { useAuth } from "@/contexts/AuthContext";
import { useChildren } from "@/hooks/useChildren";
import {
  useMessages,
  useSendMessage,
  useDeleteMessage,
  useChildParticipants,
  useUnreadMessages,
  type MessageChannel,
} from "@/hooks/useMessages";

const CHANNELS: { id: MessageChannel; label: string; icon: typeof Users; hint: string }[] = [
  { id: "coparent", label: "Co-parents", icon: Users, hint: "Discussion entre les parents de l'enfant" },
  { id: "pro", label: "Questions au pro", icon: Stethoscope, hint: "Préparez ici vos questions pour la prochaine consultation. Ce canal n'est pas relié à un médecin : en cas d'urgence, appelez le 15." },
  { id: "note", label: "Notes", icon: StickyNote, hint: "Notes partagées sur l'enfant (traitements, habitudes...)" },
];

const dayLabel = (iso: string) => {
  const d = parseISO(iso);
  if (isToday(d)) return "Aujourd'hui";
  if (isYesterday(d)) return "Hier";
  return format(d, "EEEE d MMMM", { locale: fr });
};

const Messages = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: children = [] } = useChildren();
  const [childId, setChildId] = useState<string | undefined>();
  const [channel, setChannel] = useState<MessageChannel>("coparent");
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!childId && children.length) setChildId(children[0].id);
  }, [children, childId]);

  const { data: messages = [], isLoading } = useMessages(childId, channel);
  const { data: names = {} } = useChildParticipants(childId);
  const { data: unread, markRead } = useUnreadMessages(childId);
  const send = useSendMessage();
  const remove = useDeleteMessage();

  useEffect(() => {
    if (childId) markRead(channel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [childId, channel, messages.length]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, channel]);

  const grouped = useMemo(() => {
    const out: { day: string; items: typeof messages }[] = [];
    messages.forEach((m) => {
      const day = dayLabel(m.created_at);
      const last = out[out.length - 1];
      if (last && last.day === day) last.items.push(m);
      else out.push({ day, items: [m] });
    });
    return out;
  }, [messages]);

  const handleSend = async () => {
    const content = text.trim();
    if (!content || !childId) return;
    setText("");
    try {
      await send.mutateAsync({ child_id: childId, channel, content });
    } catch (e: any) {
      setText(content);
      toast.error(e.message || "Envoi impossible");
    }
  };

  const activeChannel = CHANNELS.find((c) => c.id === channel)!;

  return (
    <PageTransition>
      <div className="h-[100dvh] flex flex-col bg-background max-w-lg mx-auto">
        {/* Header */}
        <header className="px-4 pt-[calc(env(safe-area-inset-top)+0.75rem)] pb-3 border-b border-border bg-card">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} aria-label="Retour" className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center">
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
            <div className="min-w-0">
              <h1 className="text-lg font-extrabold text-foreground leading-tight">Messagerie</h1>
              <p className="text-[11px] text-muted-foreground truncate">{activeChannel.hint}</p>
            </div>
          </div>

          {/* Child selector */}
          {children.length > 1 && (
            <div className="flex gap-2 mt-3 overflow-x-auto no-scrollbar" role="tablist" aria-label="Enfants">
              {children.map((c) => (
                <button
                  key={c.id}
                  role="tab"
                  aria-selected={childId === c.id}
                  onClick={() => setChildId(c.id)}
                  className={`shrink-0 px-3 h-9 rounded-xl text-xs font-semibold flex items-center gap-1.5 ${
                    childId === c.id ? "bg-primary text-primary-foreground" : "bg-accent text-foreground"
                  }`}
                >
                  <Baby className="w-3.5 h-3.5" /> {c.first_name}
                </button>
              ))}
            </div>
          )}

          {/* Channel tabs */}
          <div className="grid grid-cols-3 gap-2 mt-3" role="tablist" aria-label="Canaux de discussion">
            {CHANNELS.map((c) => {
              const count = unread?.[c.id] ?? 0;
              const active = channel === c.id;
              return (
                <button
                  key={c.id}
                  role="tab"
                  aria-selected={active}
                  onClick={() => setChannel(c.id)}
                  className={`relative h-11 rounded-xl text-[11px] font-bold flex flex-col items-center justify-center gap-0.5 ${
                    active ? "bg-primary text-primary-foreground" : "bg-accent text-muted-foreground"
                  }`}
                >
                  <c.icon className="w-4 h-4" />
                  {c.label}
                  {count > 0 && !active && (
                    <span className="absolute top-1 right-2 min-w-[16px] h-4 px-1 rounded-full bg-destructive text-destructive-foreground text-[9px] font-bold flex items-center justify-center">
                      {count > 9 ? "9+" : count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4" aria-live="polite">
          {!childId ? (
            <p className="text-sm text-muted-foreground text-center mt-10">Ajoutez d'abord un enfant pour ouvrir une conversation.</p>
          ) : isLoading ? (
            <p className="text-sm text-muted-foreground text-center mt-10">Chargement…</p>
          ) : messages.length === 0 ? (
            <div className="text-center mt-10 space-y-1">
              <activeChannel.icon className="w-10 h-10 text-muted-foreground/40 mx-auto" />
              <p className="text-sm font-semibold text-foreground">Aucun message</p>
              <p className="text-xs text-muted-foreground px-8">{activeChannel.hint}</p>
            </div>
          ) : (
            grouped.map((g) => (
              <div key={g.day} className="space-y-2">
                <p className="text-center text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">{g.day}</p>
                {g.items.map((m) => {
                  const mine = m.sender_id === user?.id;
                  return (
                    <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                      <div className={`group max-w-[80%] rounded-2xl px-3 py-2 ${mine ? "bg-primary text-primary-foreground" : "bg-card border border-border text-foreground"}`}>
                        {!mine && (
                          <p className="text-[10px] font-bold text-primary mb-0.5">{names[m.sender_id] || "Parent"}</p>
                        )}
                        <p className="text-sm whitespace-pre-wrap break-words">{m.content}</p>
                        <div className={`flex items-center gap-2 justify-end mt-0.5 ${mine ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                          <span className="text-[10px]">{format(parseISO(m.created_at), "HH:mm")}</span>
                          {mine && (
                            <button
                              aria-label="Supprimer le message"
                              onClick={() => remove.mutate({ id: m.id, child_id: m.child_id, channel })}
                              className="opacity-70 hover:opacity-100"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>

        {/* Composer */}
        <div className="border-t border-border bg-card px-3 py-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)]">
          <div className="flex items-end gap-2">
            <label htmlFor="message-input" className="sr-only">Votre message</label>
            <textarea
              id="message-input"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
              }}
              rows={1}
              disabled={!childId}
              placeholder={channel === "note" ? "Ajouter une note partagée…" : "Écrire un message…"}
              className="flex-1 resize-none max-h-28 rounded-2xl bg-accent px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              onClick={handleSend}
              disabled={!text.trim() || !childId || send.isPending}
              aria-label="Envoyer le message"
              className="w-12 h-12 shrink-0 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-40 active:scale-95 transition-transform"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Messages;
