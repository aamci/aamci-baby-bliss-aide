import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Menu, X, Shield, Check, Database, MapPin, Lock, Star, Stethoscope, Bot, LineChart, Syringe, CalendarCheck, FolderLock, Users, Quote } from "lucide-react";

const APP_NAME = "BébéSanté";
const PRIMARY = "#0596DE";

const Logo = () => (
  <div className="flex items-center gap-2">
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <rect width="32" height="32" rx="8" fill={PRIMARY} />
      <path d="M16 8c-3.5 0-6 2.5-6 5.5 0 4 6 10.5 6 10.5s6-6.5 6-10.5C22 10.5 19.5 8 16 8z" fill="#fff" />
      <circle cx="16" cy="14" r="2" fill={PRIMARY} />
    </svg>
    <span className="font-semibold text-[#212121] text-lg tracking-tight">{APP_NAME}</span>
  </div>
);

const navLinks = [
  { href: "#fonctionnalites", label: "Fonctionnalités" },
  { href: "#temoignages", label: "Témoignages" },
  { href: "#soignants", label: "Soignants" },
  { href: "#apropos", label: "À propos" },
];

const useReveal = () => {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>("[data-reveal]");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("opacity-100", "translate-y-0");
            e.target.classList.remove("opacity-0", "translate-y-4");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 },
    );
    els.forEach((el) => {
      el.classList.add("opacity-0", "translate-y-4", "transition-all", "duration-700", "ease-out");
      io.observe(el);
    });
    return () => io.disconnect();
  }, []);
};

const Avatars = () => {
  const items = [
    { i: "SL", bg: "#0596DE" },
    { i: "MK", bg: "#4CAF50" },
    { i: "CR", bg: "#FF7A59" },
    { i: "JT", bg: "#8B5CF6" },
    { i: "EN", bg: "#F59E0B" },
  ];
  return (
    <div className="flex -space-x-2">
      {items.map((a) => (
        <div
          key={a.i}
          className="w-8 h-8 rounded-full ring-2 ring-white flex items-center justify-center text-[11px] font-semibold text-white"
          style={{ background: a.bg }}
        >
          {a.i}
        </div>
      ))}
    </div>
  );
};

const PhoneMockup = () => (
  <div className="relative mx-auto w-[280px] sm:w-[320px]">
    <div className="rounded-[2.5rem] bg-[#1a1a1a] p-3 shadow-[0_30px_80px_-20px_rgba(5,150,222,0.45)]">
      <div className="rounded-[2rem] bg-white overflow-hidden">
        <div className="h-6 bg-[#1a1a1a] flex items-center justify-center">
          <div className="w-20 h-4 bg-black rounded-full" />
        </div>
        <div className="p-4 bg-[#F5F7FA] min-h-[460px] flex flex-col gap-3">
          <div className="flex items-center gap-2 pb-2 border-b border-[#E5E7EB]">
            <div className="w-8 h-8 rounded-full bg-[#0596DE] flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-xs font-semibold text-[#212121]">Assistant médical</p>
              <p className="text-[10px] text-[#4CAF50]">En ligne · Certifié</p>
            </div>
          </div>
          <div className="self-end max-w-[80%] bg-[#0596DE] text-white rounded-2xl rounded-tr-sm px-3 py-2 text-xs">
            Mon bébé a 38,5 de fièvre, que faire ?
          </div>
          <div className="self-start max-w-[85%] bg-white border border-[#E5E7EB] rounded-2xl rounded-tl-sm px-3 py-2 text-xs text-[#212121] shadow-sm">
            <p className="mb-1">À cet âge, une fièvre à 38,5 n'est pas alarmante. Hydratez régulièrement, surveillez le comportement et consultez si elle dépasse 48h.</p>
            <div className="flex items-center gap-1 mt-2 pt-2 border-t border-[#F3F4F6]">
              <Shield className="w-3 h-3 text-[#0596DE]" />
              <span className="text-[10px] text-[#757575]">Validé par Dr. Martin, Pédiatre</span>
            </div>
          </div>
          <div className="self-start max-w-[60%] bg-white border border-[#E5E7EB] rounded-2xl px-3 py-2 text-xs text-[#757575]">
            <span className="inline-flex gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0596DE] animate-pulse" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#0596DE] animate-pulse [animation-delay:200ms]" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#0596DE] animate-pulse [animation-delay:400ms]" />
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const Home = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useReveal();

  useEffect(() => {
    if (!sentinelRef.current) return;
    const io = new IntersectionObserver(([e]) => setScrolled(!e.isIntersecting), { threshold: 0 });
    io.observe(sentinelRef.current);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    document.documentElement.style.scrollBehavior = "smooth";
    return () => {
      document.documentElement.style.scrollBehavior = "";
    };
  }, []);

  const firstName = profile?.first_name?.trim();
  const greeting = user ? (firstName ? `Bonjour, ${firstName}` : "Bonjour") : "Bonjour";
  const ctaLabel = user ? "Accéder à mon tableau de bord" : "Commencer maintenant";
  const ctaAction = () => navigate(user ? "/dashboard" : "/signup");

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="min-h-screen bg-white text-[#212121] font-[Inter,sans-serif] overflow-x-hidden">
      <div ref={sentinelRef} className="absolute top-0 h-1 w-full" />

      <header
        className={`fixed top-0 inset-x-0 z-[100] bg-white transition-shadow ${scrolled ? "shadow-md" : "shadow-none"}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6 min-w-0">
            <a href="#top" className="shrink-0"><Logo /></a>
            {user && (
              <span className="hidden sm:inline text-sm text-[#757575] truncate">{greeting}</span>
            )}
          </div>

          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((l) => (
              <a key={l.href} href={l.href} className="text-sm font-medium text-[#212121] hover:text-[#0596DE] transition-colors">
                {l.label}
              </a>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <button
                onClick={() => navigate("/dashboard")}
                className="h-11 px-5 rounded-xl bg-[#0596DE] hover:bg-[#0477B4] text-white text-sm font-semibold transition-colors"
              >
                Tableau de bord
              </button>
            ) : (
              <>
                <button
                  onClick={() => navigate("/login")}
                  className="h-11 px-5 rounded-xl border border-[#0596DE] text-[#0596DE] hover:bg-[#EBF5FF] text-sm font-semibold transition-colors"
                >
                  Se connecter
                </button>
                <button
                  onClick={() => navigate("/signup")}
                  className="h-11 px-5 rounded-xl bg-[#0596DE] hover:bg-[#0477B4] text-white text-sm font-semibold transition-colors"
                >
                  Rejoindre
                </button>
              </>
            )}
          </div>

          <button
            className="md:hidden w-11 h-11 inline-flex items-center justify-center rounded-lg text-[#212121]"
            onClick={() => setMenuOpen(true)}
            aria-label="Ouvrir le menu"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </header>

      {menuOpen && (
        <div className="fixed inset-0 z-[200] md:hidden" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/40" onClick={closeMenu} />
          <aside className="absolute right-0 top-0 h-full w-[85%] max-w-sm bg-white shadow-2xl flex flex-col">
            <div className="h-16 px-5 flex items-center justify-between border-b border-[#E5E7EB]">
              <Logo />
              <button onClick={closeMenu} className="w-11 h-11 inline-flex items-center justify-center" aria-label="Fermer">
                <X className="w-6 h-6" />
              </button>
            </div>
            <nav className="flex-1 px-5 py-6 flex flex-col gap-1">
              {user && (
                <p className="text-sm text-[#757575] pb-4">{greeting}</p>
              )}
              {navLinks.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={closeMenu}
                  className="py-3 text-base font-medium text-[#212121] border-b border-[#F3F4F6]"
                >
                  {l.label}
                </a>
              ))}
            </nav>
            <div className="p-5 border-t border-[#E5E7EB] flex flex-col gap-3">
              {user ? (
                <button
                  onClick={() => { closeMenu(); navigate("/dashboard"); }}
                  className="h-12 rounded-xl bg-[#0596DE] text-white font-semibold"
                >
                  Tableau de bord
                </button>
              ) : (
                <>
                  <button
                    onClick={() => { closeMenu(); navigate("/login"); }}
                    className="h-12 rounded-xl border border-[#0596DE] text-[#0596DE] font-semibold"
                  >
                    Se connecter
                  </button>
                  <button
                    onClick={() => { closeMenu(); navigate("/signup"); }}
                    className="h-12 rounded-xl bg-[#0596DE] text-white font-semibold"
                  >
                    Rejoindre
                  </button>
                </>
              )}
            </div>
          </aside>
        </div>
      )}

      <main id="top" className="pt-16">
        <section className="relative min-h-[calc(100vh-4rem)] flex items-center bg-gradient-to-b from-[#EBF5FF] to-white">
          <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 lg:py-20 grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] text-[#757575]">
                {greeting} · La référence santé pour les parents d'enfants de 0 à 4 ans
              </p>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.05] text-[#212121]">
                Votre enfant mérite des réponses exactes, pas des approximations.
              </h1>
              <p className="text-base sm:text-lg text-[#555] leading-relaxed max-w-xl">
                Des réponses médicales certifiées par des pédiatres en quelques secondes. Le suivi complet de votre enfant. La tranquillité d'esprit que tout parent mérite.
              </p>
              <div className="inline-flex items-start gap-2 px-4 py-3 rounded-xl bg-white border border-[#E5E7EB] max-w-xl">
                <Shield className="w-5 h-5 text-[#0596DE] shrink-0 mt-0.5" />
                <span className="text-xs sm:text-sm text-[#212121] font-medium">
                  Validé par la Société Française de Pédiatrie, l'AFPA et le Collège National des Sages-Femmes
                </span>
              </div>
              <div>
                <button
                  onClick={ctaAction}
                  className="h-[52px] px-8 rounded-xl bg-[#0596DE] hover:bg-[#0477B4] text-white text-base font-semibold shadow-lg shadow-[#0596DE]/30 transition-all hover:shadow-xl hover:-translate-y-0.5"
                >
                  {ctaLabel}
                </button>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <Avatars />
                <p className="text-sm text-[#555]">
                  Plus de <span className="font-semibold text-[#212121]">12 000 parents</span> font confiance à l'application
                </p>
              </div>
            </div>
            <div data-reveal>
              <PhoneMockup />
            </div>
          </div>
        </section>

        <section className="bg-white border-y border-[#E5E7EB]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex md:justify-between items-center gap-6 md:gap-4 py-6 overflow-x-auto md:overflow-visible whitespace-nowrap">
              {[
                { icon: Database, label: "Données chiffrées HDS" },
                { icon: MapPin, label: "Hébergement France" },
                { icon: Lock, label: "Certification RGPD" },
                { icon: Star, label: "Note 4.9 sur 5" },
                { icon: Stethoscope, label: "Recommandé par des pédiatres" },
              ].map((it, idx, arr) => (
                <div key={it.label} className="flex items-center gap-3 shrink-0">
                  <div className="flex items-center gap-2">
                    <it.icon className="w-5 h-5 text-[#0596DE]" />
                    <span className="text-sm font-medium text-[#212121]">{it.label}</span>
                  </div>
                  {idx < arr.length - 1 && <span className="hidden md:inline w-px h-6 bg-[#E5E7EB]" />}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 data-reveal className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center text-[#212121] mb-12">
              Vous connaissez ces moments ?
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  title: "2h du matin, fièvre et angoisse",
                  text: "Vous cherchez sur internet et vous tombez sur des réponses contradictoires. Certaines vous font paniquer davantage. Aucune ne vient d'un médecin.",
                },
                {
                  title: "Le vaccin du mois prochain ?",
                  text: "Vous ne savez plus si le prochain vaccin est ce mois-ci ou le suivant. Le carnet de santé est introuvable et le cabinet est fermé.",
                },
                {
                  title: "Normal ou inquiétant ?",
                  text: "Votre enfant tarde à acquérir certains réflexes. Est-ce dans la norme ? Vous ne savez pas à qui poser la question sans sembler alarmiste.",
                },
              ].map((c) => (
                <div data-reveal key={c.title} className="bg-white border border-[#E5E7EB] rounded-2xl p-8 shadow-sm">
                  <div className="w-12 h-12 rounded-xl bg-[#EBF5FF] flex items-center justify-center mb-5">
                    <Shield className="w-6 h-6 text-[#0596DE]" />
                  </div>
                  <h3 className="text-lg font-bold text-[#212121] mb-3">{c.title}</h3>
                  <p className="text-[#555] leading-relaxed">{c.text}</p>
                </div>
              ))}
            </div>
            <p data-reveal className="text-center text-xl sm:text-2xl font-bold text-[#212121] mt-12 max-w-3xl mx-auto">
              Cette application a été conçue précisément pour ces moments-là.
            </p>
          </div>
        </section>

        <section id="fonctionnalites" className="py-20 bg-[#F8FAFC]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#212121] mb-4">Tout ce dont vous avez besoin</h2>
              <p className="text-lg text-[#757575] max-w-2xl mx-auto">Un outil complet pensé pour le quotidien des parents</p>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {[
                { icon: Bot, title: "Assistant médical 24h/24", text: "Réponses immédiates à vos questions sur la santé, l'éveil et la nutrition. Certifiées par nos experts pédiatriques." },
                { icon: LineChart, title: "Courbes de croissance OMS", text: "Suivez le poids et la taille de votre enfant sur les courbes officielles de l'Organisation Mondiale de la Santé." },
                { icon: Syringe, title: "Calendrier vaccinal officiel", text: "Rappels automatiques, historique complet, partage direct avec votre pédiatre. Plus jamais de vaccin oublié." },
                { icon: CalendarCheck, title: "14 visites obligatoires suivies", text: "Toutes les consultations médicales obligatoires avant 4 ans sont planifiées et rappelées au bon moment." },
                { icon: FolderLock, title: "Coffre-fort médical chiffré", text: "Ordonnances, comptes-rendus, résultats. Centralisés, chiffrés, partageables avec votre soignant en un clic." },
                { icon: Users, title: "Co-parentalité intégrée", text: "Les deux parents ont accès au même profil. La charge mentale de la santé de l'enfant est enfin partagée." },
              ].map((f) => (
                <div data-reveal key={f.title} className="bg-white rounded-2xl p-5 sm:p-7 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 rounded-xl bg-[#EBF5FF] flex items-center justify-center mb-4">
                    <f.icon className="w-6 h-6 text-[#0596DE]" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-[#212121] mb-2">{f.title}</h3>
                  <p className="text-sm text-[#555] leading-relaxed">{f.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 bg-gradient-to-br from-[#0596DE] to-[#0477B4] text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
              {[
                { n: "85%", l: "des rendez-vous médicaux enfants pris uniquement par la mère" },
                { n: "66%", l: "des parents stressés par les fausses informations santé en ligne" },
                { n: "14", l: "visites médicales obligatoires à ne manquer avant les 4 ans" },
                { n: "24/7", l: "disponibilité de l'assistant médical certifié" },
              ].map((s) => (
                <div data-reveal key={s.n} className="text-center lg:text-left">
                  <p className="text-5xl sm:text-6xl font-bold mb-3">{s.n}</p>
                  <p className="text-sm sm:text-base text-white/80 leading-relaxed">{s.l}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="soignants" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-center">
            <div data-reveal className="space-y-6">
              <span className="inline-block px-3 py-1 rounded-full bg-[#EBF5FF] text-[#0596DE] text-xs font-semibold uppercase tracking-wider">
                Pour les professionnels de santé
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#212121] leading-tight">
                Recevez des patients mieux préparés
              </h2>
              <p className="text-lg text-[#555] leading-relaxed">
                Les parents qui utilisent cette application arrivent en consultation avec leurs données de suivi complètes, leurs questions précises, et leurs documents organisés. Le temps médical est mieux utilisé, les échanges sont plus ciblés.
              </p>
              <ul className="space-y-4">
                {[
                  "Partage de ressources médicales certifiées directement depuis la consultation",
                  "Accès aux données de suivi de l'enfant partagées par le parent en un clic",
                  "Rappels automatiques pour ne manquer aucune des 14 visites obligatoires",
                ].map((p) => (
                  <li key={p} className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-[#0596DE] flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-4 h-4 text-white" />
                    </span>
                    <span className="text-[#212121]">{p}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div data-reveal className="bg-gradient-to-br from-[#EBF5FF] to-white rounded-3xl p-8 border border-[#E5E7EB]">
              <div className="bg-white rounded-2xl p-6 shadow-md space-y-4">
                <div className="flex items-center gap-3 pb-4 border-b border-[#E5E7EB]">
                  <div className="w-12 h-12 rounded-full bg-[#0596DE] flex items-center justify-center">
                    <Stethoscope className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-[#212121]">Dr. Sophie Bernard</p>
                    <p className="text-xs text-[#757575]">Pédiatre · Paris 15</p>
                  </div>
                </div>
                {[
                  { l: "Dossier patient", v: "Complet" },
                  { l: "Vaccins à jour", v: "Oui" },
                  { l: "Documents partagés", v: "12" },
                  { l: "Dernière mesure", v: "Hier" },
                ].map((r) => (
                  <div key={r.l} className="flex justify-between text-sm">
                    <span className="text-[#757575]">{r.l}</span>
                    <span className="font-semibold text-[#212121]">{r.v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="temoignages" className="py-20 bg-[#F8FAFC]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center text-[#212121] mb-14">
              Ce que disent les parents
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { q: "A trois heures du matin avec un bébé fiévreux, j'ai eu une réponse claire et rassurante en moins de vingt secondes. Cette application m'a évité une nuit de panique totale.", a: "Sophie", d: "maman d'Emma, 8 mois", i: "S", c: "#0596DE" },
                { q: "Mon mari prend désormais les rendez-vous tout seul. La co-parentalité a transformé notre organisation au quotidien.", a: "Camille", d: "maman de Théo, 14 mois", i: "C", c: "#4CAF50" },
                { q: "Mon pédiatre a été impressionné que j'arrive avec tout l'historique vaccinal et les courbes de croissance sur mon téléphone.", a: "Marc", d: "papa de Zoé, 2 ans", i: "M", c: "#FF7A59" },
              ].map((t) => (
                <div data-reveal key={t.a} className="bg-white rounded-2xl p-7 shadow-sm">
                  <Quote className="w-10 h-10 text-[#0596DE] mb-3" />
                  <p className="italic text-[#212121] leading-relaxed mb-5">{t.q}</p>
                  <div className="h-px bg-[#E5E7EB] mb-5" />
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full flex items-center justify-center text-white font-semibold" style={{ background: t.c }}>
                      {t.i}
                    </div>
                    <div>
                      <p className="font-semibold text-[#212121]">{t.a}</p>
                      <p className="text-xs text-[#757575]">{t.d}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="apropos" className="py-20 bg-gradient-to-br from-[#0596DE] to-[#023E6E] text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
            <h2 data-reveal className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
              La santé de votre enfant ne souffre d'aucun compromis.
            </h2>
            <p data-reveal className="text-lg text-white/85 max-w-2xl mx-auto">
              Rejoignez les 12 000 parents qui font confiance à cette application pour le suivi complet de leur enfant.
            </p>
            <div data-reveal className="pt-2">
              <button
                onClick={ctaAction}
                className="h-14 px-10 rounded-xl bg-white text-[#023E6E] font-bold text-base shadow-xl hover:shadow-2xl transition-all hover:-translate-y-0.5"
              >
                {user ? "Accéder à mon tableau de bord" : "Rejoindre maintenant"}
              </button>
            </div>
          </div>
        </section>

        <footer className="bg-[#0F172A] text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-10">
              <div className="col-span-2 lg:col-span-1">
                <div className="flex items-center gap-2 mb-4">
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
                    <rect width="32" height="32" rx="8" fill={PRIMARY} />
                    <path d="M16 8c-3.5 0-6 2.5-6 5.5 0 4 6 10.5 6 10.5s6-6.5 6-10.5C22 10.5 19.5 8 16 8z" fill="#fff" />
                    <circle cx="16" cy="14" r="2" fill={PRIMARY} />
                  </svg>
                  <span className="font-semibold text-lg">{APP_NAME}</span>
                </div>
                <p className="text-sm text-white/70 leading-relaxed">
                  La référence santé pour les parents.<br />Pensée pour les enfants de 0 à 4 ans.
                </p>
              </div>
              <div>
                <p className="text-sm font-semibold mb-4">Application</p>
                <ul className="space-y-2 text-sm text-white/70">
                  <li><button onClick={() => navigate("/dashboard")} className="hover:text-white">Tableau de bord</button></li>
                  <li><button onClick={() => navigate("/assistant")} className="hover:text-white">Assistant</button></li>
                  <li><button onClick={() => navigate("/tracking")} className="hover:text-white">Suivi</button></li>
                  <li><button onClick={() => navigate("/documents")} className="hover:text-white">Documents</button></li>
                </ul>
              </div>
              <div>
                <p className="text-sm font-semibold mb-4">Légal</p>
                <ul className="space-y-2 text-sm text-white/70">
                  <li>CGU</li>
                  <li>Confidentialité</li>
                  <li>Mentions légales</li>
                  <li>Contact</li>
                </ul>
              </div>
              <div>
                <p className="text-sm font-semibold mb-4">Certifications</p>
                <ul className="space-y-3 text-sm text-white/70">
                  <li className="flex items-center gap-2"><Database className="w-4 h-4" /> Hébergement HDS</li>
                  <li className="flex items-center gap-2"><Lock className="w-4 h-4" /> Conformité RGPD</li>
                  <li className="flex items-center gap-2"><MapPin className="w-4 h-4" /> Made in France</li>
                </ul>
              </div>
            </div>
            <div className="border-t border-white/10 mt-10 pt-6 text-xs text-white/60 text-center sm:text-left">
              2026 {APP_NAME}. Tous droits réservés. Hébergé en France. Données de santé protégées.
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default Home;
