import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Baby, ShieldCheck, TrendingUp, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const slides = [
  {
    icon: Baby,
    title: "Votre allié santé 24h/24",
    description: "Un assistant intelligent dédié à la santé de votre enfant, disponible jour et nuit.",
    gradient: "from-medical-light-blue to-accent",
  },
  {
    icon: ShieldCheck,
    title: "Des contenus validés par les experts",
    description: "Tous nos contenus sont rédigés et vérifiés par des pédiatres, sage-femmes et nutritionnistes.",
    gradient: "from-medical-light-green to-accent",
  },
  {
    icon: TrendingUp,
    title: "Suivez le développement de votre enfant",
    description: "Courbes de croissance, calendrier vaccinal, visites médicales : tout est centralisé.",
    gradient: "from-medical-light-blue to-background",
  },
];

const Onboarding = () => {
  const [current, setCurrent] = useState(0);
  const navigate = useNavigate();

  const handleNext = () => {
    if (current === slides.length - 1) {
      navigate("/home");
    } else {
      setCurrent(current + 1);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background max-w-lg mx-auto">
      {/* Skip */}
      <div className="flex justify-end p-4">
        <button
          onClick={() => navigate("/home")}
          className="text-sm text-muted-foreground font-medium"
        >
          Passer
        </button>
      </div>

      {/* Slide content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8">
        <div
          className={`w-40 h-40 rounded-full bg-gradient-to-br ${slides[current].gradient} flex items-center justify-center mb-10 animate-scale-in`}
          key={current}
        >
          {(() => {
            const Icon = slides[current].icon;
            return <Icon className="w-16 h-16 text-primary" />;
          })()}
        </div>

        <h1 className="text-2xl font-bold text-foreground text-center mb-3 animate-fade-in" key={`t-${current}`}>
          {slides[current].title}
        </h1>
        <p className="text-base text-muted-foreground text-center leading-relaxed max-w-xs animate-fade-in" key={`d-${current}`}>
          {slides[current].description}
        </p>
      </div>

      {/* Pagination & action */}
      <div className="px-8 pb-12 flex flex-col items-center gap-8">
        {/* Dots */}
        <div className="flex gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === current ? "w-8 bg-primary" : "w-2 bg-border"
              }`}
            />
          ))}
        </div>

        <Button
          onClick={handleNext}
          className="w-full h-14 text-base font-semibold rounded-xl"
          style={{ boxShadow: "var(--shadow-button)" }}
        >
          {current === slides.length - 1 ? "Commencer" : "Suivant"}
          <ChevronRight className="w-5 h-5 ml-1" />
        </Button>
      </div>
    </div>
  );
};

export default Onboarding;
