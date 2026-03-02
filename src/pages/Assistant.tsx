import { useState, useRef, useEffect } from "react";
import { Bot, Send, Mic, Info, AlertTriangle, Phone, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  time: string;
  isUrgent?: boolean;
};

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

const quickQuestions = [
  "Mon bébé a de la fièvre",
  "Quand introduire les solides ?",
  "Il ne dort pas la nuit",
  "Poussée dentaire, que faire ?",
  "Selles de bébé : quand s'inquiéter ?",
];

const now = () => new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

const URGENT_PATTERN = /fièvre.*(3 mois|nourrisson)|convulsion|détresse respiratoire|perte de conscience|urgence|inconscien|étouff/i;

const Assistant = () => {
  const [messages, setMessages] = useState<Message[]>([
    { id: "1", role: "assistant", content: "Bonjour ! 👋 Je suis votre assistant santé pour Emma. Posez-moi vos questions sur la santé, l'éveil, la nutrition ou le sommeil de votre enfant. Je suis là 24h/24 !", time: now() },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isTyping) return;
    const userMsg: Message = { id: Date.now().toString(), role: "user", content: text.trim(), time: now() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setIsTyping(true);

    let assistantContent = "";
    const assistantId = (Date.now() + 1).toString();

    try {
      const apiMessages = newMessages
        .filter(m => m.id !== "1")
        .map(m => ({ role: m.role, content: m.content }));

      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: apiMessages }),
      });

      if (resp.status === 429) { toast.error("Trop de requêtes, réessayez dans un instant"); setIsTyping(false); return; }
      if (resp.status === 402) { toast.error("Crédits IA épuisés"); setIsTyping(false); return; }
      if (!resp.ok || !resp.body) throw new Error("Stream failed");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let nl: number;
        while ((nl = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, nl);
          buffer = buffer.slice(nl + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") break;
          try {
            const parsed = JSON.parse(json);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              assistantContent += delta;
              const isUrgent = URGENT_PATTERN.test(assistantContent);
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.id === assistantId) {
                  return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantContent, isUrgent } : m);
                }
                return [...prev, { id: assistantId, role: "assistant", content: assistantContent, time: now(), isUrgent }];
              });
            }
          } catch { /* partial JSON */ }
        }
      }
    } catch (e) {
      console.error(e);
      // Fallback to local response
      assistantContent = "Je suis temporairement indisponible. Veuillez réessayer dans quelques instants.\n\nEn cas d'urgence, appelez le 15 (SAMU).";
      setMessages(prev => [...prev, { id: assistantId, role: "assistant", content: assistantContent, time: now() }]);
    }

    setIsTyping(false);
  };

  const newConversation = () => {
    setMessages([{ id: "1", role: "assistant", content: "Bonjour ! 👋 Comment puis-je vous aider aujourd'hui ?", time: now() }]);
    setInput("");
  };

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] bg-background">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-border bg-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center">
              <Bot className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-foreground text-sm">Assistant Parents</h1>
              <p className="text-[11px] text-muted-foreground">Recommandations officielles · 24h/24</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={newConversation} className="p-2 text-muted-foreground hover:text-foreground transition-colors" aria-label="Nouvelle conversation">
              <RotateCcw className="w-4 h-4" />
            </button>
            <button onClick={() => setShowInfo(!showInfo)} className="p-2 text-muted-foreground hover:text-foreground transition-colors" aria-label="Informations">
              <Info className="w-4 h-4" />
            </button>
          </div>
        </div>
        {showInfo && (
          <div className="mt-3 p-3 rounded-xl bg-medical-light-orange text-sm text-foreground animate-fade-in">
            <p className="font-semibold flex items-center gap-1 mb-1">
              <AlertTriangle className="w-4 h-4 text-medical-orange" /> Limites de l'assistant
            </p>
            <p className="text-xs text-muted-foreground">
              Cet assistant ne pose aucun diagnostic et ne prescrit aucun médicament. En cas d'urgence, appelez le 15 (SAMU).
            </p>
          </div>
        )}
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-hide">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-fade-in`}>
            <div className="max-w-[85%] space-y-1">
              {msg.role === "assistant" && (
                <div className="flex items-center gap-1.5 mb-1">
                  <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                    <Bot className="w-3 h-3 text-primary-foreground" />
                  </div>
                  <span className="text-[10px] text-muted-foreground">Assistant</span>
                </div>
              )}
              <div
                className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
                  msg.role === "user"
                    ? "bg-chat-user text-chat-user-foreground rounded-br-md"
                    : "bg-chat-assistant text-chat-assistant-foreground rounded-bl-md border border-border"
                }`}
                style={msg.role === "assistant" ? { boxShadow: "var(--shadow-card)" } : undefined}
              >
                {msg.content}
              </div>
              {msg.isUrgent && (
                <div className="flex gap-2 mt-2">
                  <a href="tel:15" className="flex items-center gap-1.5 bg-destructive text-destructive-foreground px-3 py-2 rounded-xl text-xs font-semibold">
                    <Phone className="w-3.5 h-3.5" /> Appeler le 15
                  </a>
                </div>
              )}
              <p className={`text-[10px] ${msg.role === "user" ? "text-right" : "text-left"} text-muted-foreground`}>
                {msg.time}
              </p>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start animate-fade-in">
            <div className="bg-card border border-border rounded-2xl rounded-bl-md px-4 py-3 flex gap-1">
              <span className="w-2 h-2 rounded-full bg-muted-foreground animate-pulse-dot" style={{ animationDelay: "0ms" }} />
              <span className="w-2 h-2 rounded-full bg-muted-foreground animate-pulse-dot" style={{ animationDelay: "200ms" }} />
              <span className="w-2 h-2 rounded-full bg-muted-foreground animate-pulse-dot" style={{ animationDelay: "400ms" }} />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="bg-card border-t border-border px-4 pt-3 pb-3">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-3">
          {quickQuestions.map((q, i) => (
            <button key={i} onClick={() => sendMessage(q)} disabled={isTyping} className="text-xs bg-accent text-accent-foreground px-3 py-1.5 rounded-full whitespace-nowrap border border-border hover:bg-primary hover:text-primary-foreground transition-colors disabled:opacity-50">
              {q}
            </button>
          ))}
        </div>
        <div className="flex items-end gap-2">
          <button className="p-2.5 text-muted-foreground hover:text-foreground transition-colors" aria-label="Dictée vocale">
            <Mic className="w-5 h-5" />
          </button>
          <div className="flex-1 relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value.slice(0, 500))}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }}
              placeholder="Posez votre question..."
              className="w-full bg-muted rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-ring max-h-24"
              rows={1}
            />
            {input.length > 0 && <span className="absolute right-3 bottom-1 text-[10px] text-muted-foreground">{input.length}/500</span>}
          </div>
          <Button size="icon" onClick={() => sendMessage(input)} disabled={!input.trim() || isTyping} className="rounded-xl w-10 h-10 shrink-0">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Assistant;
