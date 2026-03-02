import { ArrowLeft, Heart, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PageTransition from "@/components/PageTransition";

const savedArticles = [
  { title: "La diversification alimentaire mois par mois", category: "Nutrition", author: "Dr. Sophie Martin", readTime: "5 min", slug: "diversification-alimentaire" },
  { title: "Le sommeil de bébé à 8 mois", category: "Sommeil", author: "Claire Dubois", readTime: "4 min", slug: "sommeil-bebe" },
];

const categoryColors: Record<string, string> = {
  Nutrition: "bg-medical-light-green text-medical-green",
  Sommeil: "bg-medical-light-blue text-primary",
  Santé: "bg-medical-light-red text-medical-red",
};

const SavedContents = () => {
  const navigate = useNavigate();

  return (
    <PageTransition>
      <div className="min-h-screen bg-background max-w-lg mx-auto pb-8">
        <div className="px-4 pt-6 pb-4">
          <div className="flex items-center gap-3 mb-6">
            <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-muted flex items-center justify-center" aria-label="Retour">
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
            <h1 className="text-xl font-bold text-foreground">Mes favoris</h1>
          </div>

          {savedArticles.length === 0 ? (
            <div className="text-center py-20">
              <BookOpen className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
              <p className="text-sm text-muted-foreground">Aucun contenu sauvegardé</p>
              <button onClick={() => navigate("/contents")} className="text-xs text-primary font-semibold mt-2">
                Découvrir les contenus
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {savedArticles.map((article, i) => (
                <div
                  key={i}
                  className="medical-card flex items-center gap-3 cursor-pointer hover:scale-[1.01] active:scale-[0.98] transition-transform"
                  onClick={() => navigate(`/article/${article.slug}`)}
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm text-foreground leading-tight">{article.title}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{article.author} · {article.readTime}</p>
                    <span className={`inline-block text-[10px] font-medium px-2 py-0.5 rounded-full mt-1 ${categoryColors[article.category] || "bg-muted text-muted-foreground"}`}>
                      {article.category}
                    </span>
                  </div>
                  <Heart className="w-5 h-5 text-destructive fill-current shrink-0" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
};

export default SavedContents;
