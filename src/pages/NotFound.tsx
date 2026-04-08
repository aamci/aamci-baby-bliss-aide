import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background max-w-lg mx-auto px-6">
      <div className="text-center space-y-4">
        <div className="w-20 h-20 rounded-full bg-accent flex items-center justify-center mx-auto">
          <span className="text-4xl">🔍</span>
        </div>
        <h1 className="text-2xl font-bold text-foreground">Page introuvable</h1>
        <p className="text-sm text-muted-foreground">La page que vous recherchez n'existe pas ou a été déplacée.</p>
        <button
          onClick={() => navigate("/home")}
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold text-sm px-6 py-3 rounded-xl"
        >
          <ArrowLeft className="w-4 h-4" /> Retour à l'accueil
        </button>
      </div>
    </div>
  );
};

export default NotFound;
