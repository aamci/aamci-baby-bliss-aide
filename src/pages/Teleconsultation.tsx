import { useState, useEffect } from "react";
import { Mic, MicOff, Video, VideoOff, PhoneOff, MessageSquare, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PageTransition from "@/components/PageTransition";
import doctorImg from "@/assets/doctor-teleconsultation.png";

const Teleconsultation = () => {
  const navigate = useNavigate();
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [elapsed, setElapsed] = useState(0);
  const [showChat, setShowChat] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<{ from: string; text: string }[]>([
    { from: "doctor", text: "Bonjour ! Je suis le Dr. Martin. Comment va Emma aujourd'hui ?" },
  ]);

  useEffect(() => {
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const sendChat = () => {
    if (!chatInput.trim()) return;
    setChatMessages((prev) => [...prev, { from: "me", text: chatInput.trim() }]);
    setChatInput("");
  };

  const hangUp = () => navigate(-1);

  return (
    <PageTransition>
      <div className="fixed inset-0 z-50 bg-black flex flex-col">
        {/* Doctor video - fullscreen */}
        <div className="flex-1 relative overflow-hidden">
          <img
            src={doctorImg}
            alt="Dr. Martin - Téléconsultation"
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* Top overlay */}
          <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/60 to-transparent z-10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-bold text-sm">Dr. Sophie Martin</p>
                <p className="text-white/70 text-xs">Pédiatre · Téléconsultation</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-white/80 text-xs font-mono">{fmt(elapsed)}</span>
              </div>
            </div>
          </div>

          {/* Self camera preview */}
          {camOn && (
            <div className="absolute top-20 right-4 w-24 h-32 rounded-2xl bg-gray-800 border-2 border-white/20 overflow-hidden z-10 shadow-lg">
              <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                <Video className="w-6 h-6 text-white/40" />
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="bg-black/80 backdrop-blur-md px-6 pt-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
          <div className="flex items-center justify-center gap-5">
            <button
              onClick={() => setMicOn(!micOn)}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
                micOn ? "bg-white/20" : "bg-white"
              }`}
              aria-label={micOn ? "Couper le micro" : "Activer le micro"}
            >
              {micOn ? <Mic className="w-6 h-6 text-white" /> : <MicOff className="w-6 h-6 text-gray-900" />}
            </button>

            <button
              onClick={() => setCamOn(!camOn)}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
                camOn ? "bg-white/20" : "bg-white"
              }`}
              aria-label={camOn ? "Couper la caméra" : "Activer la caméra"}
            >
              {camOn ? <Video className="w-6 h-6 text-white" /> : <VideoOff className="w-6 h-6 text-gray-900" />}
            </button>

            <button
              onClick={hangUp}
              className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center active:scale-95 transition-transform"
              aria-label="Raccrocher"
            >
              <PhoneOff className="w-7 h-7 text-white" />
            </button>

            <button
              onClick={() => setShowChat(!showChat)}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
                showChat ? "bg-white" : "bg-white/20"
              }`}
              aria-label="Chat"
            >
              <MessageSquare className={`w-6 h-6 ${showChat ? "text-gray-900" : "text-white"}`} />
            </button>
          </div>
        </div>

        {/* Chat overlay */}
        {showChat && (
          <div className="absolute bottom-36 left-0 right-0 mx-4 bg-black/80 backdrop-blur-lg rounded-2xl max-h-[40vh] flex flex-col z-20 border border-white/10">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <p className="text-white text-sm font-semibold">Chat</p>
              <button onClick={() => setShowChat(false)} className="text-white/60">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 scrollbar-hide">
              {chatMessages.map((m, i) => (
                <div key={i} className={`flex ${m.from === "me" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] px-3 py-2 rounded-xl text-xs ${
                    m.from === "me"
                      ? "bg-blue-500 text-white rounded-br-sm"
                      : "bg-white/15 text-white rounded-bl-sm"
                  }`}>
                    {m.text}
                  </div>
                </div>
              ))}
            </div>
            <div className="px-3 pb-3 pt-1 flex gap-2">
              <input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") sendChat(); }}
                placeholder="Message..."
                className="flex-1 bg-white/10 text-white text-xs rounded-xl px-3 py-2.5 placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-white/30"
              />
              <button onClick={sendChat} className="text-blue-400 text-xs font-semibold px-2">Envoyer</button>
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
};

export default Teleconsultation;
