import { describe, it, expect } from "vitest";
import { computeReminders, type ReminderState } from "@/hooks/useReminders";
import type { Child } from "@/hooks/useChildren";

const child = (birth: string): Child => ({
  id: "c1",
  first_name: "Léa",
  birth_date: birth,
  gender: "female",
  blood_type: null,
  allergies: [],
  doctor_name: null,
  birth_weight: null,
  birth_height: null,
  avatar_url: null,
});

const NOW = new Date("2026-08-13T10:00:00Z");

describe("moteur de rappels du parcours de soins", () => {
  it("propose la visite du 9e mois pour un bébé de ~8,5 mois", () => {
    // né le 25 novembre 2025 → ~8,6 mois au 13 août 2026
    const rems = computeReminders([child("2025-11-25")], [], NOW);
    const exam9 = rems.find((r) => r.step.key === "exam-9m");
    expect(exam9).toBeDefined();
    expect(["soon", "open"]).toContain(exam9!.phase);
    expect(exam9!.isActionable).toBe(true);
  });

  it("n'affiche jamais de formulation culpabilisante", () => {
    const rems = computeReminders([child("2024-01-10")], [], NOW);
    const texts = rems.map((r) => r.message.toLowerCase()).join(" ");
    expect(texts).not.toContain("en retard");
    expect(texts).not.toContain("urgent");
    expect(texts).not.toContain("oubli");
  });

  it("garde les étapes passées comme « encore possible » et non manquées", () => {
    const rems = computeReminders([child("2025-11-25")], [], NOW);
    const vac2m = rems.find((r) => r.step.key === "vac-2m");
    expect(vac2m?.phase).toBe("still-possible");
    expect(vac2m?.message).toContain("encore tout à fait possible");
  });

  it("retire un rappel marqué comme fait de la liste active", () => {
    const states: ReminderState[] = [
      { id: "s1", child_id: "c1", reminder_key: "exam-9m", status: "done", snoozed_until: null, completed_at: "2026-08-01" },
    ];
    const rems = computeReminders([child("2025-11-25")], states, NOW);
    const exam9 = rems.find((r) => r.step.key === "exam-9m")!;
    expect(exam9.phase).toBe("done");
    expect(exam9.isActionable).toBe(false);
  });

  it("respecte un report de 2 semaines", () => {
    const states: ReminderState[] = [
      { id: "s2", child_id: "c1", reminder_key: "exam-9m", status: "snoozed", snoozed_until: "2026-08-27", completed_at: null },
    ];
    const rems = computeReminders([child("2025-11-25")], states, NOW);
    const exam9 = rems.find((r) => r.step.key === "exam-9m")!;
    expect(exam9.status).toBe("snoozed");
    expect(exam9.isActionable).toBe(false);
  });

  it("cesse d'insister au-delà de 18 mois après la fenêtre", () => {
    const rems = computeReminders([child("2020-01-01")], [], NOW);
    expect(rems.find((r) => r.step.key === "vac-2m")).toBeUndefined();
  });

  it("couvre les examens obligatoires et le calendrier vaccinal", () => {
    const rems = computeReminders([child("2026-08-01")], [], NOW);
    expect(rems.filter((r) => r.step.type === "exam").length).toBeGreaterThanOrEqual(15);
    expect(rems.filter((r) => r.step.type === "vaccine").length).toBeGreaterThanOrEqual(8);
  });
});