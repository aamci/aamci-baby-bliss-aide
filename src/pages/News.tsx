import { useState, useMemo } from "react";
import { ArrowLeft, Newspaper, Clock, ExternalLink, BookOpen, CheckCheck, Baby } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PageTransition from "@/components/PageTransition";
import ListenButton from "@/components/ListenButton";
import { useNewsHistory, useTrackNewsAction } from "@/hooks/useNewsHistory";
import { useChildren } from "@/hooks/useChildren";
import { MEDICAL_NEWS, NEWS_CATEGORIES, filterNewsByAge, type MedicalNewsItem } from "@/data/medicalNews";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";

function childAgeMonths(birthDate?: string | null): number | null {
  if (!birthDate) return null;
  const birth = new Date(birthDate);
  const now = new Date();
  return (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
}

const News = () => {
  const navigate = useNavigate();
  const { data: children } = useChildren();
  const firstChild = children?.[0];
  const ageMonths = childAgeMonths(firstChild?.birth_date);
  const [category, setCategory] = useState<string>("all");
  const [ageFilter, setAgeFilter] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const { data: history = [] } = useNewsHistory();
  const track = useTrackNewsAction();

  const readSlugs = useMemo(() => new Set(history.filter((h) => h.action === "read").map((h) => h.news_slug)), [history]);

  const filtered = useMemo(() => {
    let list = MEDICAL_NEWS;
    if (ageFilter && ageMonths != null) list = filterNewsByAge(list, ageMonths);
    if (category !== "all") list = list.filter((n) => n.category === category);
    return [...list].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  }, [category, ageFilter, ageMonths]);

  const openArticle = (item: MedicalNewsItem) => {
    setExpanded(expanded === item.slug ? null : item.slug);
    if (expanded !== item.slug && !readSlugs.has(item.slug)) {
      track.mutate({ news_slug: item.slug, action: "read" });
    }
  };

  const categoryLabel = (v: string) => NEWS_CATEGORIES.find((c) => c.value === v)?.label ?? v;

  return (
    <PageTransition>
      <div className="px-4 pt-6 pb-8 space-y-4 max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0" aria-label="Retour">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-foreground">Actualités santé</h1>
            <p className="text-xs text-muted-foreground">Sources officielles françaises</p>
          </div>
          <Newspaper className="w-5 h-5 text-primary shrink-0" aria-hidden="true" />
        </div>

        {/* Age filter toggle */}
        {firstChild && ageMonths != null && (
          <button
            onClick={() => setAgeFilter(!ageFilter)}
            aria-pressed={ageFilter}
            className={`w-full medical-card flex items-center gap-3 text-left transition-colors ${ageFilter ? "bg-accent" : ""}`}
          >
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Baby className="w-4 h-4 text-primary" aria-hidden="true" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">Filtré pour {firstChild.first_name}</p>
              <p className="text-[11px] text-muted-foreground">
                {ageFilter ? `Âge : ${ageMonths} mois — affichage personnalisé actif` : "Affichage de toutes les actualités"}
              </p>
            </div>
            <div className={`w-11 h-6 rounded-full p-0.5 transition-colors shrink-0 ${ageFilter ? "bg-primary" : "bg-muted"}`} aria-hidden="true">
              <div className={`w-5 h-5 rounded-full bg-card shadow transition-transform ${ageFilter ? "translate-x-5" : ""}`} />
            </div>
          </button>
        )}

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-none" role="tablist" aria-label="Catégories d'actualités">
          {NEWS_CATEGORIES.map((c) => (
            <button
              key={c.value}
              role="tab"
              aria-selected={category === c.value}
              onClick={() => setCategory(c.value)}
              className={`px-3.5 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-colors shrink-0 min-h-11 ${
                category === c.value ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* List */}
        {filtered.length === 0 ? (
          <div className="medical-card text-center py-8 space-y-2">
            <Newspaper className="w-8 h-8 text-muted-foreground mx-auto" aria-hidden="true" />
            <p className="text-sm text-muted-foreground">Aucune actualité dans cette catégorie pour cet âge.</p>
            <button onClick={() => { setCategory("all"); setAgeFilter(false); }} className="text-xs font-semibold text-primary">
              Voir toutes les actualités
            </button>
          </div>
        ) : (
          <div className="space-y-3" role="feed" aria-label="Liste des actualités médicales">
            {filtered.map((item) => {
              const isOpen = expanded === item.slug;
              const isRead = readSlugs.has(item.slug);
              return (
                <article key={item.slug} className="medical-card space-y-2" aria-label={item.title}>
                  <button
                    onClick={() => openArticle(item)}
                    className="w-full text-left space-y-1.5"
                    aria-expanded={isOpen}
                    aria-controls={`news-body-${item.slug}`}
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-bold uppercase tracking-wide text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                        {categoryLabel(item.category)}
                      </span>
                      {isRead && (
                        <span className="text-[10px] font-semibold text-success flex items-center gap-1">
                          <CheckCheck className="w-3 h-3" aria-hidden="true" /> Lu
                        </span>
                      )}
                      <span className="text-[10px] text-muted-foreground ml-auto flex items-center gap-1">
                        <Clock className="w-3 h-3" aria-hidden="true" /> {item.readingMin} min
                      </span>
                    </div>
                    <h2 className="text-sm font-bold text-foreground leading-snug">{item.title}</h2>
                    <p className="text-xs text-muted-foreground leading-relaxed">{item.summary}</p>
                    <div className="flex items-center gap-2 pt-0.5">
                      <span className="text-[10px] text-muted-foreground">{item.source}</span>
                      <span className="text-[10px] text-muted-foreground">·</span>
                      <time className="text-[10px] text-muted-foreground" dateTime={item.publishedAt}>
                        {format(parseISO(item.publishedAt), "d MMMM yyyy", { locale: fr })}
                      </time>
                    </div>
                  </button>

                  {isOpen && (
                    <div id={`news-body-${item.slug}`} className="pt-2 border-t border-border space-y-3">
                      {item.body.split("\n\n").map((p, i) => (
                        <p key={i} className="text-xs text-foreground leading-relaxed whitespace-pre-line">{p}</p>
                      ))}
                      <div className="flex items-center justify-between gap-2 flex-wrap pt-1">
                        <ListenButton text={`${item.title}. ${item.body}`} label="Écouter l'article" size="sm" />
                        <a
                          href={item.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] font-semibold text-primary flex items-center gap-1 min-h-11"
                        >
                          <BookOpen className="w-3 h-3" aria-hidden="true" /> {item.source}
                          <ExternalLink className="w-3 h-3" aria-hidden="true" />
                        </a>
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}

        {/* History summary */}
        {history.length > 0 && (
          <div className="medical-card bg-muted/50">
            <p className="text-xs text-muted-foreground text-center">
              {new Set(history.map((h) => h.news_slug)).size} actualité(s) consultée(s) · votre historique est privé
            </p>
          </div>
        )}
      </div>
    </PageTransition>
  );
};

export default News;