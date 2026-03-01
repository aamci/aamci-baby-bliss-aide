import { User, Baby, Bell, Lock, CreditCard, LogOut, ChevronRight, Shield, Users, FileText } from "lucide-react";

const menuItems = [
  { icon: User, label: "Informations personnelles", desc: "Nom, email, téléphone" },
  { icon: Baby, label: "Profils enfants", desc: "Emma · 8 mois" },
  { icon: Users, label: "Co-parentalité", desc: "Inviter un co-parent" },
  { icon: Bell, label: "Notifications", desc: "Push, email, SMS" },
  { icon: Lock, label: "Sécurité", desc: "Mot de passe, biométrie, 2FA" },
  { icon: FileText, label: "Documents médicaux", desc: "Coffre-fort numérique" },
  { icon: CreditCard, label: "Abonnement", desc: "Gratuit · 7/10 questions IA restantes" },
  { icon: Shield, label: "Confidentialité", desc: "RGPD, données de santé" },
];

const Profile = () => {
  return (
    <div className="px-4 pt-6 pb-4 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xl font-bold">
          M
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">Marie Dupont</h1>
          <p className="text-sm text-muted-foreground">marie.dupont@email.com</p>
        </div>
      </div>

      {/* Premium CTA */}
      <div className="medical-card-elevated bg-gradient-to-r from-primary/10 to-accent space-y-2">
        <h3 className="font-bold text-sm text-foreground">Passez à Premium ✨</h3>
        <p className="text-xs text-muted-foreground">Questions IA illimitées, 5 Go de stockage, contenus exclusifs</p>
        <button className="bg-primary text-primary-foreground text-xs font-semibold px-4 py-2 rounded-xl mt-1">
          Découvrir l'offre
        </button>
      </div>

      {/* Menu */}
      <div className="space-y-1">
        {menuItems.map((item, i) => (
          <button key={i} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors text-left">
            <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center">
              <item.icon className="w-4 h-4 text-accent-foreground" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm text-foreground">{item.label}</p>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        ))}
      </div>

      {/* Logout */}
      <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-medical-light-red transition-colors text-left">
        <div className="w-9 h-9 rounded-xl bg-medical-light-red flex items-center justify-center">
          <LogOut className="w-4 h-4 text-destructive" />
        </div>
        <p className="font-semibold text-sm text-destructive">Se déconnecter</p>
      </button>

      <p className="text-[10px] text-center text-muted-foreground">
        BébéSanté v1.0 · Hébergement HDS · Données chiffrées AES-256
      </p>
    </div>
  );
};

export default Profile;
