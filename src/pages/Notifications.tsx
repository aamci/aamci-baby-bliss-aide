import { ArrowLeft, Calendar, Syringe, Bot, FileText, Users, Bell, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const notifications = [
  {
    id: 1,
    type: "visit",
    icon: Calendar,
    title: "Visite du 9ème mois",
    desc: "La visite obligatoire du 9ème mois approche. Pensez à prendre rendez-vous.",
    time: "Il y a 2h",
    read: false,
    color: "bg-medical-light-orange text-medical-orange",
  },
  {
    id: 2,
    type: "vaccine",
    icon: Syringe,
    title: "Rappel vaccin ROR",
    desc: "Le vaccin ROR est recommandé avant 12 mois. Planifiez-le avec votre pédiatre.",
    time: "Il y a 5h",
    read: false,
    color: "bg-medical-light-red text-medical-red",
  },
  {
    id: 3,
    type: "content",
    icon: Bot,
    title: "Nouveau contenu pour Emma",
    desc: "\"La diversification alimentaire à 8 mois\" — un article personnalisé pour vous.",
    time: "Hier",
    read: true,
    color: "bg-medical-light-blue text-primary",
  },
  {
    id: 4,
    type: "coparent",
    icon: Users,
    title: "Document ajouté",
    desc: "Thomas a ajouté un compte-rendu de consultation au profil d'Emma.",
    time: "Il y a 2 jours",
    read: true,
    color: "bg-medical-light-green text-medical-green",
  },
  {
    id: 5,
    type: "document",
    icon: FileText,
    title: "Partage soignant",
    desc: "Dr. Martin vous a envoyé une fiche pratique sur la diversification alimentaire.",
    time: "Il y a 3 jours",
    read: true,
    color: "bg-accent text-accent-foreground",
  },
];

const Notifications = () => {
  const navigate = useNavigate();
  const [notifs, setNotifs] = useState(notifications);

  const markAllRead = () => {
    setNotifs(notifs.map((n) => ({ ...n, read: true })));
  };

  const unreadCount = notifs.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-background max-w-lg mx-auto">
      {/* Header */}
      <div className="px-4 pt-6 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-muted flex items-center justify-center"
            aria-label="Retour"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-foreground">Notifications</h1>
            {unreadCount > 0 && (
              <p className="text-xs text-muted-foreground">{unreadCount} non lue{unreadCount > 1 ? "s" : ""}</p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="text-xs font-semibold text-primary">
              Tout lire
            </button>
          )}
          <button className="p-2 text-muted-foreground" aria-label="Paramètres de notifications">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* List */}
      <div className="px-4 space-y-2 pb-8">
        {notifs.map((n) => (
          <div
            key={n.id}
            className={`medical-card flex items-start gap-3 cursor-pointer transition-all hover:scale-[1.01] ${!n.read ? "border-l-4 border-primary" : ""}`}
          >
            <div className={`w-10 h-10 rounded-xl ${n.color} flex items-center justify-center shrink-0 mt-0.5`}>
              <n.icon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <p className={`text-sm leading-tight ${!n.read ? "font-bold" : "font-semibold"} text-foreground`}>{n.title}</p>
                {!n.read && <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.desc}</p>
              <p className="text-[10px] text-muted-foreground mt-1">{n.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Notifications;
