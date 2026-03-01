import { ArrowLeft, Plus, FileText, Syringe, ClipboardList, TestTube, Image, Folder, Search, Share2, Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const categories = [
  { label: "Tous", icon: Folder, count: 8 },
  { label: "Ordonnances", icon: FileText, count: 3 },
  { label: "Consultations", icon: ClipboardList, count: 2 },
  { label: "Examens", icon: TestTube, count: 1 },
  { label: "Vaccinations", icon: Syringe, count: 1 },
  { label: "Imagerie", icon: Image, count: 1 },
];

const documents = [
  { id: 1, name: "Ordonnance - Dr. Martin", category: "Ordonnances", date: "15/02/2026", size: "1.2 Mo", doctor: "Dr. Sophie Martin" },
  { id: 2, name: "CR consultation 8 mois", category: "Consultations", date: "10/02/2026", size: "850 Ko", doctor: "Dr. Sophie Martin" },
  { id: 3, name: "Bilan sanguin Emma", category: "Examens", date: "05/02/2026", size: "2.1 Mo", doctor: "Laboratoire BioSanté" },
  { id: 4, name: "Certificat vaccin Hexavalent", category: "Vaccinations", date: "10/10/2025", size: "500 Ko", doctor: "Dr. Pierre Leroy" },
  { id: 5, name: "Échographie hanche", category: "Imagerie", date: "01/09/2025", size: "3.5 Mo", doctor: "Centre d'imagerie Necker" },
  { id: 6, name: "Ordonnance vitamine D", category: "Ordonnances", date: "01/08/2025", size: "400 Ko", doctor: "Dr. Sophie Martin" },
  { id: 7, name: "CR consultation 4 mois", category: "Consultations", date: "01/10/2025", size: "700 Ko", doctor: "Dr. Sophie Martin" },
  { id: 8, name: "Ordonnance lait AR", category: "Ordonnances", date: "15/07/2025", size: "350 Ko", doctor: "Dr. Sophie Martin" },
];

const catColors: Record<string, string> = {
  Ordonnances: "bg-medical-light-blue text-primary",
  Consultations: "bg-medical-light-green text-medical-green",
  Examens: "bg-medical-light-orange text-medical-orange",
  Vaccinations: "bg-medical-light-red text-medical-red",
  Imagerie: "bg-accent text-accent-foreground",
};

const Documents = () => {
  const navigate = useNavigate();
  const [activeCat, setActiveCat] = useState("Tous");
  const [search, setSearch] = useState("");

  const filtered = documents
    .filter((d) => activeCat === "Tous" || d.category === activeCat)
    .filter((d) => d.name.toLowerCase().includes(search.toLowerCase()) || d.doctor.toLowerCase().includes(search.toLowerCase()));

  const usedStorage = "12.5 Mo";
  const totalStorage = "500 Mo";

  return (
    <div className="min-h-screen bg-background max-w-lg mx-auto">
      {/* Header */}
      <div className="px-4 pt-6 pb-3">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-muted flex items-center justify-center" aria-label="Retour">
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-foreground">Documents</h1>
              <p className="text-xs text-muted-foreground">Coffre-fort médical d'Emma</p>
            </div>
          </div>
          <button className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground" aria-label="Ajouter un document">
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Storage bar */}
        <div className="medical-card space-y-2 mb-4">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Espace utilisé</span>
            <span className="font-semibold text-foreground">{usedStorage} / {totalStorage}</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full" style={{ width: "2.5%" }} />
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un document..."
            className="w-full bg-muted rounded-xl pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4 mb-4">
          {categories.map((cat) => (
            <button
              key={cat.label}
              onClick={() => setActiveCat(cat.label)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                activeCat === cat.label
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-muted-foreground border border-border"
              }`}
            >
              <cat.icon className="w-3.5 h-3.5" />
              {cat.label} ({cat.count})
            </button>
          ))}
        </div>
      </div>

      {/* Documents list */}
      <div className="px-4 space-y-2 pb-8">
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Aucun document trouvé</p>
          </div>
        ) : (
          filtered.map((doc) => (
            <div key={doc.id} className="medical-card flex items-center gap-3 cursor-pointer hover:scale-[1.01] transition-transform">
              <div className={`w-10 h-10 rounded-xl ${catColors[doc.category] || "bg-muted text-muted-foreground"} flex items-center justify-center shrink-0`}>
                <FileText className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-foreground truncate">{doc.name}</p>
                <p className="text-[11px] text-muted-foreground">{doc.doctor} · {doc.date}</p>
                <p className="text-[10px] text-muted-foreground">{doc.size}</p>
              </div>
              <button className="p-2 text-muted-foreground hover:text-primary" aria-label="Partager">
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Upload FAB */}
      <button
        className="fixed bottom-24 right-4 max-w-lg w-14 h-14 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg"
        style={{ boxShadow: "var(--shadow-button)" }}
        aria-label="Importer un document"
      >
        <Upload className="w-6 h-6" />
      </button>
    </div>
  );
};

export default Documents;
