import { ArrowLeft, Camera, Save, Plus, Baby } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useChildren, useCreateChild, useUpdateChild, useChildAge } from "@/hooks/useChildren";
import { toast } from "sonner";
import PageTransition from "@/components/PageTransition";

const ChildProfile = () => {
  const navigate = useNavigate();
  const { data: children, isLoading } = useChildren();
  const createChild = useCreateChild();
  const updateChild = useUpdateChild();
  const firstChild = children?.[0];
  const childAge = useChildAge(firstChild?.birth_date);

  const [isNew, setIsNew] = useState(false);
  const [form, setForm] = useState({
    first_name: "",
    birth_date: "",
    gender: "Fille" as string,
    blood_type: "",
    allergies: [] as string[],
    doctor_name: "",
    birth_weight: "",
    birth_height: "",
  });
  const [allergyInput, setAllergyInput] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (firstChild) {
      setForm({
        first_name: firstChild.first_name,
        birth_date: firstChild.birth_date,
        gender: firstChild.gender || "Fille",
        blood_type: firstChild.blood_type || "",
        allergies: firstChild.allergies || [],
        doctor_name: firstChild.doctor_name || "",
        birth_weight: firstChild.birth_weight?.toString() || "",
        birth_height: firstChild.birth_height?.toString() || "",
      });
      setIsNew(false);
    } else if (!isLoading) {
      setIsNew(true);
    }
  }, [firstChild, isLoading]);

  const addAllergy = () => {
    if (allergyInput.trim()) {
      setForm({ ...form, allergies: [...form.allergies, allergyInput.trim()] });
      setAllergyInput("");
    }
  };

  const removeAllergy = (i: number) => {
    setForm({ ...form, allergies: form.allergies.filter((_, idx) => idx !== i) });
  };

  const handleSave = async () => {
    if (!form.first_name || !form.birth_date) {
      toast.error("Le prénom et la date de naissance sont obligatoires");
      return;
    }
    setSaving(true);

    const payload = {
      first_name: form.first_name,
      birth_date: form.birth_date,
      gender: form.gender,
      blood_type: form.blood_type || null,
      allergies: form.allergies,
      doctor_name: form.doctor_name || null,
      birth_weight: form.birth_weight ? parseFloat(form.birth_weight) : null,
      birth_height: form.birth_height ? parseFloat(form.birth_height) : null,
    };

    try {
      if (isNew) {
        await createChild.mutateAsync(payload as any);
        toast.success("Profil enfant créé !");
      } else {
        await updateChild.mutateAsync({ id: firstChild!.id, ...payload });
        toast.success("Profil enfant mis à jour !");
      }
    } catch (e: any) {
      toast.error(e.message || "Erreur lors de la sauvegarde");
    }
    setSaving(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 rounded-full border-3 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-background max-w-lg mx-auto pb-8">
        <div className="px-4 pt-6 pb-4">
          <div className="flex items-center gap-3 mb-6">
            <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-muted flex items-center justify-center" aria-label="Retour">
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-foreground">{isNew ? "Ajouter un enfant" : "Profil enfant"}</h1>
              {!isNew && childAge && <p className="text-xs text-muted-foreground">{childAge}</p>}
            </div>
          </div>

          {/* Photo */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-3xl font-bold text-primary">
                {form.first_name?.[0]?.toUpperCase() || <Baby className="w-10 h-10" />}
              </div>
              <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center" aria-label="Changer la photo">
                <Camera className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-foreground block mb-1.5">Prénom *</label>
              <input
                value={form.first_name}
                onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                placeholder="Ex: Emma"
                className="w-full bg-muted rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-foreground block mb-1.5">Date de naissance *</label>
              <input
                type="date"
                value={form.birth_date}
                onChange={(e) => setForm({ ...form, birth_date: e.target.value })}
                className="w-full bg-muted rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-foreground block mb-1.5">Sexe</label>
              <div className="flex gap-2">
                {["Garçon", "Fille", "Non précisé"].map((g) => (
                  <button
                    key={g}
                    onClick={() => setForm({ ...form, gender: g })}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      form.gender === g ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-foreground block mb-1.5">Groupe sanguin</label>
              <select
                value={form.blood_type}
                onChange={(e) => setForm({ ...form, blood_type: e.target.value })}
                className="w-full bg-muted rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Non renseigné</option>
                {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold text-foreground block mb-1.5">Allergies connues</label>
              <div className="flex gap-2 mb-2">
                <input
                  value={allergyInput}
                  onChange={(e) => setAllergyInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addAllergy()}
                  placeholder="Ex: Lait de vache"
                  className="flex-1 bg-muted rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <Button onClick={addAllergy} size="sm" className="rounded-xl">Ajouter</Button>
              </div>
              {form.allergies.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {form.allergies.map((a, i) => (
                    <span key={i} className="text-xs bg-medical-light-red text-medical-red px-3 py-1.5 rounded-full flex items-center gap-1">
                      {a}
                      <button onClick={() => removeAllergy(i)} className="ml-1 font-bold">×</button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="text-sm font-semibold text-foreground block mb-1.5">Médecin traitant</label>
              <input
                value={form.doctor_name}
                onChange={(e) => setForm({ ...form, doctor_name: e.target.value })}
                placeholder="Dr. Sophie Martin"
                className="w-full bg-muted rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-semibold text-foreground block mb-1.5">Poids naissance (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={form.birth_weight}
                  onChange={(e) => setForm({ ...form, birth_weight: e.target.value })}
                  placeholder="3.3"
                  className="w-full bg-muted rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-foreground block mb-1.5">Taille naissance (cm)</label>
                <input
                  type="number"
                  value={form.birth_height}
                  onChange={(e) => setForm({ ...form, birth_height: e.target.value })}
                  placeholder="49"
                  className="w-full bg-muted rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            <Button
              onClick={handleSave}
              disabled={saving}
              className="w-full h-14 text-base font-semibold rounded-xl mt-4"
              style={{ boxShadow: "var(--shadow-button)" }}
            >
              <Save className="w-5 h-5 mr-2" />
              {saving ? "Enregistrement..." : isNew ? "Créer le profil" : "Enregistrer"}
            </Button>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default ChildProfile;
