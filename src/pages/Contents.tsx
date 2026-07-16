import { Heart, Moon, Apple, Brain, Baby, Shield, BookOpen, Search, Play, Video } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useChildren, useChildAge } from "@/hooks/useChildren";
import { useVideoCapsules, type VideoCapsule } from "@/hooks/useVideoCapsules";
import { ageInMonths } from "@/lib/whoStandards";
import VideoPlayer from "@/components/VideoPlayer";
import PageTransition from "@/components/PageTransition";

const categories = [
  { label: "Tous", icon: BookOpen },
  { label: "Santé", icon: Heart },
  { label: "Éveil", icon: Brain },
  { label: "Nutrition", icon: Apple },
  { label: "Sommeil", icon: Moon },
  { label: "Développement", icon: Baby },
  { label: "Urgences", icon: Shield },
];

const articles = [
  { title: "La diversification alimentaire mois par mois", category: "Nutrition", readTime: "5 min", author: "Dr. Sophie Martin, Pédiatre", isNew: true, slug: "diversification-alimentaire" },
  { title: "Le sommeil de bébé à 8 mois : ce qui change", category: "Sommeil", readTime: "4 min", author: "Claire Dubois, Sage-femme", isNew: true, slug: "sommeil-bebe" },
  { title: "Quand bébé se met debout : les étapes clés", category: "Développement", readTime: "3 min", author: "Dr. Pierre Leroy, Pédiatre", isNew: false, slug: "diversification-alimentaire" },
  { title: "Les bons réflexes en cas de fièvre", category: "Santé", readTime: "6 min", author: "Dr. Nathalie Vidal, Urgentiste", isNew: false, slug: "diversification-alimentaire" },
  { title: "Stimuler le langage de votre enfant", category: "Éveil", readTime: "4 min", author: "Marie Fabre, Orthophoniste", isNew: false, slug: "diversification-alimentaire" },
  { title: "Allergie alimentaire : signes d'alerte", category: "Santé", readTime: "5 min", author: "Dr. Sophie Martin, Pédiatre", isNew: true, slug: "diversification-alimentaire" },
];

const categoryColors: Record<string, string> = {
  Nutrition: "bg-medical-light-green text-medical-green",
  Sommeil: "bg-medical-light-blue text-primary",
  Développement: "bg-medical-light-orange text-medical-orange",
  Santé: "bg-medical-light-red text-medical-red",
  Éveil: "bg-accent text-accent-foreground",
  Urgences: "bg-medical-light-red text-medical-red",
};

const Contents = () => {
  const navigate = useNavigate();
  const [active, setActive] = useState("Tous");
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"articles" | "videos">("articles");
  const [playing, setPlaying] = useState<VideoCapsule | null>(null);
  const { data: children } = useChildren();
  const firstChild = children?.[0];
  const childAge = useChildAge(firstChild?.birth_date);
  const ageM = firstChild ? Math.floor(ageInMonths(firstChild.birth_date)) : undefined;
  const { data: capsules = [] } = useVideoCapsules(ageM, active === "Tous" ? undefined : active);

  const filtered = articles
    .filter((a) => active === "Tous" || a.category === active)
    .filter((a) => a.title.toLowerCase().includes(search.toLowerCase()) || a.author.toLowerCase().includes(search.toLowerCase()));

  const filteredVideos = capsules.filter((v) => v.title.toLowerCase().includes(search.toLowerCase()) || (v.author || "").toLowerCase().includes(search.toLowerCase()));

  return (
    <PageTransition>
      <div className="px-4 pt-6 pb-4 space-y-5">
        <div>
          <h1 className="text-xl font-bold text-foreground truncate">Contenus santé</h1>
          <p className="text-sm text-muted-foreground truncate">
            {firstChild ? `Personnalisés pour ${firstChild.first_name}, ${childAge}` : "Personnalisés selon l'âge"}
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher..." className="w-full bg-muted rounded-xl pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>

        {/* Segmented */}
        <div className="flex gap-1 bg-muted rounded-xl p-1">
          <button onClick={() => setTab("articles")} className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1 ${tab === "articles" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}><BookOpen className="w-3.5 h-3.5" /> Articles</button>
          <button onClick={() => setTab("videos")} className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1 ${tab === "videos" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}><Video className="w-3.5 h-3.5" /> Capsules vidéo</button>
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4">
          {categories.map((cat) => (
            <button key={cat.label} onClick={() => setActive(cat.label)} className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${active === cat.label ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground border border-border"}`}>
              <cat.icon className="w-3.5 h-3.5" /> {cat.label}
            </button>
          ))}
        </div>

        {tab === "articles" ? (
          <div className="space-y-3">
            {filtered.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Aucun article trouvé</p>
                <button onClick={() => { setSearch(""); setActive("Tous"); }} className="text-xs text-primary font-semibold mt-2">Réinitialiser</button>
              </div>
            ) : filtered.map((article, i) => (
              <div key={i} className="medical-card space-y-2 cursor-pointer hover:scale-[1.01] active:scale-[0.98] transition-transform animate-fade-in" style={{ animationDelay: `${i * 50}ms` }} onClick={() => navigate(`/article/${article.slug}`)}>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-sm text-foreground leading-tight flex-1 min-w-0">{article.title}</h3>
                  {article.isNew && <span className="text-[10px] font-bold text-primary-foreground bg-primary px-2 py-0.5 rounded-full shrink-0">Nouveau</span>}
                </div>
                <p className="text-xs text-muted-foreground truncate">{article.author}</p>
                <div className="flex items-center gap-2">
                  <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${categoryColors[article.category] || "bg-muted text-muted-foreground"}`}>{article.category}</span>
                  <span className="text-[11px] text-muted-foreground">⏱ {article.readTime}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredVideos.length === 0 ? (
              <div className="text-center py-12">
                <Video className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Aucune capsule pour ces filtres</p>
              </div>
            ) : filteredVideos.map((v, i) => (
              <button key={v.id} onClick={() => setPlaying(v)} className="medical-card w-full flex items-start gap-3 text-left cursor-pointer hover:scale-[1.01] active:scale-[0.98] transition-transform animate-fade-in" style={{ animationDelay: `${i * 40}ms` }}>
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 relative overflow-hidden">
                  {v.thumbnail_url ? <img src={v.thumbnail_url} alt="" className="absolute inset-0 w-full h-full object-cover" /> : null}
                  <Play className="w-5 h-5 text-primary relative z-10 fill-current" />
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <h3 className="font-semibold text-sm text-foreground leading-tight">{v.title}</h3>
                  {v.author && <p className="text-[11px] text-muted-foreground truncate">{v.author}</p>}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${categoryColors[v.category] || "bg-muted text-muted-foreground"}`}>{v.category}</span>
                    {v.duration_sec ? <span className="text-[10px] text-muted-foreground">⏱ {Math.round(v.duration_sec / 60)} min</span> : null}
                    <span className="text-[10px] text-muted-foreground">{v.age_min_months}-{v.age_max_months} mois</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {playing && <VideoPlayer capsule={playing} onClose={() => setPlaying(null)} />}
      </div>
    </PageTransition>
  );
};

export default Contents;
