import { ArrowLeft, Heart, Share2, Clock, BookmarkPlus, Send } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import ListenButton from "@/components/ListenButton";

const articlesData: Record<string, {
  title: string;
  category: string;
  author: string;
  authorRole: string;
  readTime: string;
  updatedAt: string;
  content: string[];
  takeaway: string;
  sources: string[];
  related: { title: string; category: string }[];
}> = {
  "diversification-alimentaire": {
    title: "La diversification alimentaire mois par mois",
    category: "Nutrition",
    author: "Dr. Sophie Martin",
    authorRole: "Pédiatre · Hôpital Necker-Enfants Malades",
    readTime: "5 min",
    updatedAt: "Mis à jour le 15 février 2026",
    content: [
      "La diversification alimentaire est une étape clé dans le développement de votre enfant. Elle commence généralement entre 4 et 6 mois, selon les recommandations de votre pédiatre.",
      "À 8 mois, votre bébé peut découvrir de nouvelles textures et saveurs. Voici les aliments à introduire progressivement :",
      "• Légumes cuits et écrasés : courgette, carotte, patate douce, brocoli\n• Fruits cuits : pomme, poire, banane écrasée\n• Protéines : 10g/jour de viande, poisson ou œuf\n• Féculents : semoule, pâtes fines, riz bien cuit\n• Produits laitiers : yaourts nature, fromage blanc",
      "Chaque enfant a son propre rythme. Ne forcez jamais votre enfant à manger. Proposez, et laissez-le découvrir les saveurs à son rythme.",
      "Si votre enfant refuse un aliment, reproposez-le quelques jours plus tard. Il faut parfois 10 à 15 présentations avant qu'un aliment soit accepté.",
    ],
    takeaway: "Introduisez un seul nouvel aliment à la fois, pendant 3 jours consécutifs, pour détecter d'éventuelles allergies. En cas de réaction, consultez votre pédiatre.",
    sources: [
      "AFPA - Guide de diversification alimentaire, 2024",
      "SFP - Recommandations nutritionnelles du nourrisson, 2024",
      "HAS - Alimentation du nourrisson de 0 à 3 ans, 2023",
    ],
    related: [
      { title: "Allergie alimentaire : signes d'alerte", category: "Santé" },
      { title: "Les bons réflexes en cas de refus alimentaire", category: "Nutrition" },
    ],
  },
  "sommeil-bebe": {
    title: "Le sommeil de bébé à 8 mois : ce qui change",
    category: "Sommeil",
    author: "Claire Dubois",
    authorRole: "Sage-femme · Maternité Saint-Vincent de Paul",
    readTime: "4 min",
    updatedAt: "Mis à jour le 10 février 2026",
    content: [
      "À 8 mois, le sommeil de votre bébé évolue considérablement. Il commence à faire ses nuits de façon plus régulière, mais peut traverser des phases de régression.",
      "La régression du sommeil à 8 mois est fréquente et liée au développement cognitif intense de cette période : permanence de l'objet, angoisse de la séparation.",
      "• Durée de sommeil recommandée : 12 à 15 heures par 24h\n• Siestes : 2 siestes par jour (matin et après-midi)\n• Coucher : entre 19h et 20h30 idéalement\n• Rituel : 15 à 20 minutes (bain, histoire, berceuse)",
      "Conseil important : maintenez un rituel du coucher constant et rassurant. Votre bébé a besoin de repères pour s'endormir sereinement.",
    ],
    takeaway: "L'angoisse de la séparation est normale à cet âge. Rassurez votre enfant sans le reprendre systématiquement dans vos bras.",
    sources: [
      "SFP - Le sommeil du nourrisson, 2024",
      "INSV - Recommandations sur le sommeil de l'enfant, 2023",
    ],
    related: [
      { title: "Mon enfant ne dort pas bien : que faire ?", category: "Sommeil" },
      { title: "Les signes de fatigue chez le bébé", category: "Santé" },
    ],
  },
};

const ArticleDetail = () => {
  const navigate = useNavigate();
  const { slug } = useParams();
  const [saved, setSaved] = useState(false);
  const [showSources, setShowSources] = useState(false);

  const article = articlesData[slug || ""] || articlesData["diversification-alimentaire"];
  const spokenText = [article.title, ...article.content, `À retenir. ${article.takeaway}`].join(". ");

  const categoryColors: Record<string, string> = {
    Nutrition: "bg-medical-light-green text-medical-green",
    Sommeil: "bg-medical-light-blue text-primary",
    Santé: "bg-medical-light-red text-medical-red",
    Développement: "bg-medical-light-orange text-medical-orange",
  };

  return (
    <div className="pb-4 animate-fade-in">
      {/* Header image area */}
      <div className="relative h-48 bg-gradient-to-br from-accent to-medical-light-blue">
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 w-10 h-10 rounded-full bg-card/80 backdrop-blur flex items-center justify-center z-10"
          aria-label="Retour"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div className="absolute top-4 right-4 flex gap-2">
          <button
            onClick={() => setSaved(!saved)}
            className={`w-10 h-10 rounded-full backdrop-blur flex items-center justify-center ${saved ? "bg-primary text-primary-foreground" : "bg-card/80"}`}
            aria-label={saved ? "Retirer des favoris" : "Sauvegarder"}
          >
            <Heart className={`w-5 h-5 ${saved ? "fill-current" : ""}`} />
          </button>
          <button className="w-10 h-10 rounded-full bg-card/80 backdrop-blur flex items-center justify-center" aria-label="Partager">
            <Share2 className="w-5 h-5 text-foreground" />
          </button>
        </div>
      </div>

      <div className="px-4 -mt-6 relative z-10">
        {/* Title card */}
        <div className="medical-card-elevated space-y-3">
          <span className={`inline-block text-[11px] font-semibold px-2.5 py-1 rounded-full ${categoryColors[article.category] || "bg-muted text-muted-foreground"}`}>
            {article.category}
          </span>
          <h1 className="text-xl font-bold text-foreground leading-tight">{article.title}</h1>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
              {article.author[0]}
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{article.author}</p>
              <p className="text-[11px] text-muted-foreground">{article.authorRole}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {article.readTime} de lecture</span>
            <span>· {article.updatedAt}</span>
          </div>
        </div>

        {/* Content */}
        <div className="mt-6 space-y-4">
          <div className="flex justify-start">
            <ListenButton text={spokenText} label="Écouter l'article" />
          </div>
          {article.content.map((p, i) => (
            <p key={i} className="text-sm text-foreground leading-relaxed whitespace-pre-line">{p}</p>
          ))}
        </div>

        {/* Takeaway */}
        <div className="mt-6 p-4 rounded-2xl bg-accent border-l-4 border-primary">
          <p className="text-sm font-semibold text-foreground mb-1">📌 À retenir</p>
          <p className="text-sm text-foreground/80 leading-relaxed">{article.takeaway}</p>
        </div>

        {/* Sources */}
        <div className="mt-6">
          <button
            onClick={() => setShowSources(!showSources)}
            className="text-sm font-semibold text-primary flex items-center gap-1"
          >
            📎 Sources ({article.sources.length}) {showSources ? "▲" : "▼"}
          </button>
          {showSources && (
            <div className="mt-2 space-y-1 animate-fade-in">
              {article.sources.map((s, i) => (
                <p key={i} className="text-xs text-muted-foreground">• {s}</p>
              ))}
            </div>
          )}
        </div>

        {/* Related */}
        <div className="mt-8 space-y-3">
          <h2 className="text-base font-bold text-foreground">Articles similaires</h2>
          {article.related.map((r, i) => (
            <div key={i} className="medical-card flex items-center gap-3 cursor-pointer hover:scale-[1.01] transition-transform">
              <div className={`w-10 h-10 rounded-xl ${categoryColors[r.category] || "bg-muted"} flex items-center justify-center`}>
                <BookmarkPlus className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm text-foreground">{r.title}</p>
                <p className="text-xs text-muted-foreground">{r.category}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Fixed bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto p-4 bg-background/80 backdrop-blur border-t border-border">
        <button className="w-full bg-primary text-primary-foreground font-semibold text-sm py-3.5 rounded-xl flex items-center justify-center gap-2">
          <Send className="w-4 h-4" /> Partager avec mon soignant
        </button>
      </div>
    </div>
  );
};

export default ArticleDetail;
