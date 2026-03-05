import { ArrowLeft, Plus, FileText, Syringe, ClipboardList, TestTube, Image, Folder, Search, Share2, Upload, Trash2, X, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useChildren } from "@/hooks/useChildren";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import PageTransition from "@/components/PageTransition";

const categoryOptions = [
  { label: "Tous", icon: Folder },
  { label: "Ordonnances", icon: FileText },
  { label: "Consultations", icon: ClipboardList },
  { label: "Examens", icon: TestTube },
  { label: "Vaccinations", icon: Syringe },
  { label: "Imagerie", icon: Image },
];

const catColors: Record<string, string> = {
  Ordonnances: "bg-medical-light-blue text-primary",
  Consultations: "bg-medical-light-green text-medical-green",
  Examens: "bg-medical-light-orange text-medical-orange",
  Vaccinations: "bg-medical-light-red text-medical-red",
  Imagerie: "bg-accent text-accent-foreground",
  Autres: "bg-muted text-muted-foreground",
};

type Doc = {
  id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  category: string;
  doctor_name: string | null;
  created_at: string;
  child_id: string;
};

const formatSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
};

const Documents = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: children } = useChildren();
  const firstChild = children?.[0];
  const [activeCat, setActiveCat] = useState("Tous");
  const [search, setSearch] = useState("");
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadCat, setUploadCat] = useState("Ordonnances");
  const [uploadDoctor, setUploadDoctor] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const fetchDocs = async () => {
    if (!firstChild) return;
    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .eq("child_id", firstChild.id)
      .order("created_at", { ascending: false });
    if (!error && data) setDocs(data as Doc[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchDocs();
  }, [firstChild]);

  const handleUpload = async () => {
    if (!selectedFile || !firstChild || !user) return;
    setUploading(true);
    const ext = selectedFile.name.split(".").pop();
    const path = `${user.id}/${firstChild.id}/${Date.now()}.${ext}`;

    const { error: storageErr } = await supabase.storage
      .from("medical-documents")
      .upload(path, selectedFile);

    if (storageErr) {
      toast.error("Erreur d'upload : " + storageErr.message);
      setUploading(false);
      return;
    }

    const { error: dbErr } = await supabase.from("documents").insert({
      child_id: firstChild.id,
      uploaded_by: user.id,
      file_name: selectedFile.name,
      file_path: path,
      file_size: selectedFile.size,
      category: uploadCat,
      doctor_name: uploadDoctor || null,
    });

    if (dbErr) {
      toast.error("Erreur : " + dbErr.message);
    } else {
      toast.success("Document ajouté !");
      setShowUpload(false);
      setSelectedFile(null);
      setUploadDoctor("");
      fetchDocs();
    }
    setUploading(false);
  };

  const handleDelete = async (doc: Doc) => {
    await supabase.storage.from("medical-documents").remove([doc.file_path]);
    await supabase.from("documents").delete().eq("id", doc.id);
    toast.success("Document supprimé");
    fetchDocs();
  };

  const handleDownload = async (doc: Doc) => {
    const { data } = await supabase.storage
      .from("medical-documents")
      .createSignedUrl(doc.file_path, 60);
    if (data?.signedUrl) {
      window.open(data.signedUrl, "_blank");
    }
  };

  const filtered = docs
    .filter((d) => activeCat === "Tous" || d.category === activeCat)
    .filter((d) => d.file_name.toLowerCase().includes(search.toLowerCase()) || (d.doctor_name || "").toLowerCase().includes(search.toLowerCase()));

  const catCounts = categoryOptions.map((c) => ({
    ...c,
    count: c.label === "Tous" ? docs.length : docs.filter((d) => d.category === c.label).length,
  }));

  const totalSize = docs.reduce((acc, d) => acc + d.file_size, 0);

  return (
    <PageTransition>
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
                <p className="text-xs text-muted-foreground">
                  Coffre-fort médical {firstChild ? `de ${firstChild.first_name}` : ""}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowUpload(true)}
              className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground"
              aria-label="Ajouter un document"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          {/* Storage bar */}
          <div className="medical-card space-y-2 mb-4">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Espace utilisé</span>
              <span className="font-semibold text-foreground">{formatSize(totalSize)} / 500 Mo</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${Math.min((totalSize / (500 * 1024 * 1024)) * 100, 100)}%` }} />
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
            {catCounts.map((cat) => (
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
        <div className="px-4 space-y-2 pb-24">
          {loading ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Chargement...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                {docs.length === 0 ? "Aucun document. Ajoutez votre premier document !" : "Aucun document trouvé"}
              </p>
            </div>
          ) : (
            filtered.map((doc) => (
              <div key={doc.id} className="medical-card flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${catColors[doc.category] || catColors.Autres} flex items-center justify-center shrink-0`}>
                  <FileText className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => handleDownload(doc)}>
                  <p className="font-semibold text-sm text-foreground truncate">{doc.file_name}</p>
                  <p className="text-[11px] text-muted-foreground">{doc.doctor_name || doc.category} · {new Date(doc.created_at).toLocaleDateString("fr-FR")}</p>
                  <p className="text-[10px] text-muted-foreground">{formatSize(doc.file_size)}</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => handleDownload(doc)} className="p-2 text-muted-foreground hover:text-primary" aria-label="Télécharger">
                    <Download className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(doc)} className="p-2 text-muted-foreground hover:text-destructive" aria-label="Supprimer">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Upload FAB */}
        <button
          onClick={() => setShowUpload(true)}
          className="fixed bottom-24 right-4 w-14 h-14 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg z-40"
          style={{ boxShadow: "var(--shadow-button)" }}
          aria-label="Importer un document"
        >
          <Upload className="w-6 h-6" />
        </button>

        {/* Upload modal */}
        {showUpload && (
          <div className="fixed inset-0 bg-foreground/30 backdrop-blur-sm z-50 flex items-end justify-center" onClick={() => setShowUpload(false)}>
            <div className="bg-card rounded-t-3xl w-full max-w-lg p-6 space-y-4 animate-slide-up" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-foreground">Ajouter un document</h2>
                <button onClick={() => setShowUpload(false)} className="p-2 text-muted-foreground"><X className="w-5 h-5" /></button>
              </div>

              <input type="file" ref={fileRef} className="hidden" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />

              <button
                onClick={() => fileRef.current?.click()}
                className="w-full border-2 border-dashed border-border rounded-xl py-8 flex flex-col items-center gap-2 text-muted-foreground hover:border-primary hover:text-primary transition-colors"
              >
                <Upload className="w-8 h-8" />
                <span className="text-sm font-medium">{selectedFile ? selectedFile.name : "Choisir un fichier"}</span>
                {selectedFile && <span className="text-xs">{formatSize(selectedFile.size)}</span>}
              </button>

              <div>
                <label className="text-sm font-semibold text-foreground block mb-1.5">Catégorie</label>
                <div className="flex gap-2 flex-wrap">
                  {["Ordonnances", "Consultations", "Examens", "Vaccinations", "Imagerie"].map((c) => (
                    <button
                      key={c}
                      onClick={() => setUploadCat(c)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                        uploadCat === c ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-foreground block mb-1.5">Médecin (optionnel)</label>
                <input
                  value={uploadDoctor}
                  onChange={(e) => setUploadDoctor(e.target.value)}
                  placeholder="Dr. Martin"
                  className="w-full bg-muted rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <Button
                onClick={handleUpload}
                disabled={!selectedFile || uploading || !firstChild}
                className="w-full h-12 text-sm font-semibold rounded-xl"
                style={{ boxShadow: "var(--shadow-button)" }}
              >
                {uploading ? "Upload en cours..." : "Enregistrer le document"}
              </Button>

              {!firstChild && (
                <p className="text-xs text-destructive text-center">Ajoutez d'abord un enfant pour stocker des documents.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
};

export default Documents;
