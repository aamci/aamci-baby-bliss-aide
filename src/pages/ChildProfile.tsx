import { ArrowLeft, Camera, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const ChildProfile = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: "Emma",
    birthDate: "2025-06-01",
    gender: "Fille",
    bloodType: "",
    allergies: [] as string[],
    doctor: "Dr. Sophie Martin",
    birthWeight: "3.3",
    birthHeight: "49",
  });
  const [allergyInput, setAllergyInput] = useState("");

  const addAllergy = () => {
    if (allergyInput.trim()) {
      setForm({ ...form, allergies: [...form.allergies, allergyInput.trim()] });
      setAllergyInput("");
    }
  };

  const removeAllergy = (i: number) => {
    setForm({ ...form, allergies: form.allergies.filter((_, idx) => idx !== i) });
  };

  return (
    <div className="min-h-screen bg-background max-w-lg mx-auto pb-8">
      <div className="px-4 pt-6 pb-4">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-muted flex items-center justify-center" aria-label="Retour">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-xl font-bold text-foreground">Profil enfant</h1>
        </div>

        {/* Photo */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-3xl font-bold text-primary">
              E
            </div>
            <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center" aria-label="Changer la photo">
              <Camera className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-foreground block mb-1.5">Prénom</label>
            <input
              value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              className="w-full bg-muted rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-foreground block mb-1.5">Date de naissance</label>
            <input
              type="date"
              value={form.birthDate}
              onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
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
              value={form.bloodType}
              onChange={(e) => setForm({ ...form, bloodType: e.target.value })}
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
              value={form.doctor}
              onChange={(e) => setForm({ ...form, doctor: e.target.value })}
              className="w-full bg-muted rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-semibold text-foreground block mb-1.5">Poids naissance (kg)</label>
              <input
                type="number"
                step="0.1"
                value={form.birthWeight}
                onChange={(e) => setForm({ ...form, birthWeight: e.target.value })}
                className="w-full bg-muted rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-foreground block mb-1.5">Taille naissance (cm)</label>
              <input
                type="number"
                value={form.birthHeight}
                onChange={(e) => setForm({ ...form, birthHeight: e.target.value })}
                className="w-full bg-muted rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <Button className="w-full h-14 text-base font-semibold rounded-xl mt-4" style={{ boxShadow: "var(--shadow-button)" }}>
            <Save className="w-5 h-5 mr-2" /> Enregistrer
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChildProfile;
