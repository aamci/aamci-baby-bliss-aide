import { useState, useRef, useEffect } from "react";
import { Bot, Send, Mic, Info, AlertTriangle, Phone, ArrowLeft, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  time: string;
  isUrgent?: boolean;
  sources?: string[];
};

const quickQuestions = [
  "Mon bébé a de la fièvre",
  "Quand introduire les solides ?",
  "Il ne dort pas la nuit",
  "Poussée dentaire, que faire ?",
  "Selles de bébé : quand s'inquiéter ?",
];

const now = () => new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

const initialMessages: Message[] = [
  {
    id: "1",
    role: "assistant",
    content: "Bonjour ! 👋 Je suis votre assistant santé pour Emma. Posez-moi vos questions sur la santé, l'éveil, la nutrition ou le sommeil de votre enfant. Je suis là 24h/24 !",
    time: now(),
  },
];

const Assistant = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = (text: string) => {
    if (!text.trim() || isTyping) return;
    const userMsg: Message = { id: Date.now().toString(), role: "user", content: text.trim(), time: now() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const isUrgent = /fièvre|convulsion|détresse|urgence|vomit|inconscien/i.test(text);
      const response: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        time: now(),
        isUrgent,
        content: isUrgent
          ? "⚠️ Les symptômes que vous décrivez nécessitent une attention médicale rapide. Si votre enfant a moins de 3 mois avec une fièvre supérieure à 38°C, contactez immédiatement votre médecin ou le SAMU.\n\nEn attendant :\n• Ne couvrez pas trop votre enfant\n• Proposez-lui à boire régulièrement\n• Surveillez son comportement\n\nEn cas de doute, consultez votre pédiatre ou médecin traitant."
          : text.toLowerCase().includes("solide") || text.toLowerCase().includes("divers")
            ? "La diversification alimentaire à 8 mois est une étape importante ! Voici quelques conseils :\n\n• Proposez des textures de plus en plus variées\n• Introduisez un aliment nouveau à la fois\n• Respectez le rythme de votre enfant\n• Les protéines animales : 10g/jour environ\n\nChaque enfant est unique, ne vous inquiétez pas s'il refuse certains aliments au début.\n\nEn cas de doute, consultez votre pédiatre ou médecin traitant."
            : text.toLowerCase().includes("dent")
              ? "Les poussées dentaires sont souvent inconfortables pour bébé. Voici comment soulager Emma :\n\n• Un anneau de dentition réfrigéré (pas congelé)\n• Massez doucement les gencives avec un doigt propre\n• Un gant de toilette humide et frais à mordiller\n• En cas de douleur importante, demandez à votre pédiatre\n\n⚠️ Évitez les colliers d'ambre (risque d'étranglement) et les gels gingivaux contenant de la lidocaïne.\n\nEn cas de doute, consultez votre pédiatre ou médecin traitant."
              : text.toLowerCase().includes("dort") || text.toLowerCase().includes("sommeil") || text.toLowerCase().includes("nuit")
                ? "Les troubles du sommeil à 8 mois sont très fréquents ! C'est souvent lié à l'angoisse de la séparation.\n\n• Maintenez un rituel de coucher régulier (15-20 min)\n• Couchez Emma entre 19h et 20h30\n• Favorisez un objet transitionnel (doudou)\n• Évitez les écrans au moins 1h avant le coucher\n• Si elle se réveille, rassurez-la brièvement sans la sortir du lit\n\nEn cas de doute, consultez votre pédiatre ou médecin traitant."
                : "C'est une très bonne question ! À 8 mois, le développement d'Emma est en pleine accélération.\n\nJe vous recommande de :\n• Observer les réactions de votre enfant\n• Consulter nos contenus personnalisés dans l'onglet Contenus\n• Suivre le calendrier des visites obligatoires\n\nN'hésitez pas à poser d'autres questions, je suis là pour vous aider !\n\nEn cas de doute, consultez votre pédiatre ou médecin traitant.",
        sources: isUrgent
          ? ["Société Française de Pédiatrie, 2024", "HAS - Conduite à tenir devant une fièvre chez le nourrisson"]
          : ["AFPA - Recommandations pédiatriques, 2024", "SFP - Guide pratique, 2024"],
      };
      setMessages((prev) => [...prev, response]);
      setIsTyping(false);
    }, 1500 + Math.random() * 1000);
  };

  const newConversation = () => {
    setMessages(initialMessages);
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

              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-1">
                  {msg.sources.map((s, i) => (
                    <p key={i} className="text-[10px] text-muted-foreground">📎 {s}</p>
                  ))}
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

      {/* Input area */}
      <div className="bg-card border-t border-border px-4 pt-3 pb-3">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-3">
          {quickQuestions.map((q, i) => (
            <button
              key={i}
              onClick={() => sendMessage(q)}
              disabled={isTyping}
              className="text-xs bg-accent text-accent-foreground px-3 py-1.5 rounded-full whitespace-nowrap border border-border hover:bg-primary hover:text-primary-foreground transition-colors disabled:opacity-50"
            >
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
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value.slice(0, 500))}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage(input);
                }
              }}
              placeholder="Posez votre question..."
              className="w-full bg-muted rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-ring max-h-24"
              rows={1}
            />
            {input.length > 0 && (
              <span className="absolute right-3 bottom-1 text-[10px] text-muted-foreground">{input.length}/500</span>
            )}
          </div>
          <Button
            size="icon"
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isTyping}
            className="rounded-xl w-10 h-10 shrink-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Assistant;
