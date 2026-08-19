/** Copie serveur allégée de src/lib/carePlan.ts (clés identiques). */
export interface ServerStep {
  key: string;
  type: "exam" | "vaccine" | "screening";
  title: string;
  idealMonths: number;
  before: number;
  after: number;
}
const W = 7;
export const CARE_PLAN: ServerStep[] = [
  { key: "exam-8j", type: "exam", title: "Examen des 8 premiers jours", idealMonths: 0.25, before: 3, after: 4 },
  { key: "exam-1m", type: "exam", title: "Visite du 1er mois", idealMonths: 1, before: W, after: 2 * W },
  { key: "exam-2m", type: "exam", title: "Visite du 2e mois", idealMonths: 2, before: W, after: 2 * W },
  { key: "exam-3m", type: "exam", title: "Visite du 3e mois", idealMonths: 3, before: W, after: 2 * W },
  { key: "exam-4m", type: "exam", title: "Visite du 4e mois", idealMonths: 4, before: W, after: 2 * W },
  { key: "exam-5m", type: "exam", title: "Visite du 5e mois", idealMonths: 5, before: W, after: 2 * W },
  { key: "exam-6m", type: "exam", title: "Visite du 6e mois", idealMonths: 6, before: W, after: 3 * W },
  { key: "exam-9m", type: "exam", title: "Visite du 9e mois", idealMonths: 9, before: 2 * W, after: 3 * W },
  { key: "exam-12m", type: "exam", title: "Visite des 12 mois", idealMonths: 12, before: 2 * W, after: 4 * W },
  { key: "exam-17m", type: "exam", title: "Visite des 16-18 mois", idealMonths: 17, before: 4 * W, after: 4 * W },
  { key: "exam-24m", type: "exam", title: "Visite des 2 ans", idealMonths: 24, before: 4 * W, after: 6 * W },
  { key: "exam-36m", type: "exam", title: "Visite des 3 ans", idealMonths: 36, before: 4 * W, after: 8 * W },
  { key: "exam-48m", type: "exam", title: "Visite des 4 ans", idealMonths: 48, before: 4 * W, after: 8 * W },
  { key: "exam-60m", type: "exam", title: "Visite des 5 ans", idealMonths: 60, before: 4 * W, after: 8 * W },
  { key: "exam-72m", type: "exam", title: "Visite des 6 ans", idealMonths: 72, before: 4 * W, after: 8 * W },
  { key: "vac-2m", type: "vaccine", title: "1re série de vaccins (2 mois)", idealMonths: 2, before: W, after: 3 * W },
  { key: "vac-3m", type: "vaccine", title: "Méningocoque B (3 mois)", idealMonths: 3, before: W, after: 3 * W },
  { key: "vac-4m", type: "vaccine", title: "2e série de vaccins (4 mois)", idealMonths: 4, before: W, after: 3 * W },
  { key: "vac-5m", type: "vaccine", title: "Méningocoque B (5 mois)", idealMonths: 5, before: W, after: 3 * W },
  { key: "vac-11m", type: "vaccine", title: "Rappels des 11 mois", idealMonths: 11, before: 2 * W, after: 4 * W },
  { key: "vac-12m", type: "vaccine", title: "ROR – 1re dose (12 mois)", idealMonths: 12, before: 2 * W, after: 4 * W },
  { key: "vac-17m", type: "vaccine", title: "ROR – 2e dose (16-18 mois)", idealMonths: 17, before: 4 * W, after: 6 * W },
  { key: "vac-72m", type: "vaccine", title: "Rappel des 6 ans", idealMonths: 72, before: 4 * W, after: 12 * W },
  { key: "dev-4m", type: "screening", title: "Repères des 4 mois", idealMonths: 4, before: 2 * W, after: 6 * W },
  { key: "dev-9m", type: "screening", title: "Repères des 9 mois", idealMonths: 9, before: 2 * W, after: 6 * W },
  { key: "dev-18m", type: "screening", title: "Repères des 18 mois", idealMonths: 18, before: 4 * W, after: 8 * W },
  { key: "dev-24m", type: "screening", title: "Repères des 2 ans", idealMonths: 24, before: 4 * W, after: 8 * W },
  { key: "dev-36m", type: "screening", title: "Repères des 3 ans", idealMonths: 36, before: 4 * W, after: 8 * W },
];
