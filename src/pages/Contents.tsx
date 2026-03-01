import { Heart, Moon, Apple, Brain, Baby, Shield, BookOpen, Search } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

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
  
  const filtered = articles
    .filter((a) => active === "Tous" || a.category === active)
    .filter((a) => a.title.toLowerCase().includes(search.toLowerCase()) || a.author.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="px-4 pt-6 pb-4 space-y-5">
      <div>
        <h1 className="text-xl font-bold text-foreground">Contenus santé</h1>
        <p className="text-sm text-muted-foreground">Personnalisés pour Emma, 8 mois</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher un article..."
          className="w-full bg-muted rounded-xl pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4">
        {categories.map((cat) => (
          <button
            key={cat.label}
            onClick={() => setActive(cat.label)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              active === cat.label
                ? "bg-primary text-primary-foreground"
                : "bg-card text-muted-foreground border border-border"
            }`}
          >
            <cat.icon className="w-3.5 h-3.5" />
            {cat.label}
          </button>
        ))}
      </div>

      {/* Articles */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Aucun article trouvé</p>
            <button onClick={() => { setSearch(""); setActive("Tous"); }} className="text-xs text-primary font-semibold mt-2">
              Réinitialiser les filtres
            </button>
          </div>
        ) : (
          filtered.map((article, i) => (
            <div
              key={i}
              className="medical-card space-y-2 cursor-pointer hover:scale-[1.01] active:scale-[0.98] transition-transform animate-fade-in"
              style={{ animationDelay: `${i * 50}ms` }}
              onClick={() => navigate(`/article/${article.slug}`)}
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-sm text-foreground leading-tight flex-1">{article.title}</h3>
                {article.isNew && (
                  <span className="text-[10px] font-bold text-primary-foreground bg-primary px-2 py-0.5 rounded-full shrink-0">
                    Nouveau
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">{article.author}</p>
              <div className="flex items-center gap-2">
                <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${categoryColors[article.category] || "bg-muted text-muted-foreground"}`}>
                  {article.category}
                </span>
                <span className="text-[11px] text-muted-foreground">⏱ {article.readTime}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Contents;
