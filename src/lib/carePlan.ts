/**
 * Parcours de soins officiel français (0-6 ans).
 *
 * Sources :
 * - Examens médicaux obligatoires : Arrêté du 26 février 2019 (20 examens de 0 à 16 ans)
 *   https://www.service-public.fr/particuliers/vosdroits/F967
 * - Calendrier vaccinal simplifié 2025/2026, Santé publique France / ministère de la Santé
 *   https://sante.gouv.fr/prevention-en-sante/preserver-sa-sante/vaccination/calendrier-vaccinal
 *
 * Philosophie des rappels : jamais de deadline anxiogène. Chaque étape ouvre une
 * FENÊTRE souple (plusieurs semaines) avec une date idéale au milieu. On prévient
 * en amont, on rappelle doucement pendant, et on n'écrit jamais « en retard » :
 * on écrit « encore possible ».
 */

export type CareType = "exam" | "vaccine" | "screening";

export interface CareStep {
  /** clé stable, sert de reminder_key en base */
  key: string;
  type: CareType;
  /** Titre court, langage simple */
  title: string;
  /** Age idéal en mois depuis la naissance */
  idealMonths: number;
  /** Nombre de jours avant l'âge idéal où la fenêtre s'ouvre */
  windowBeforeDays: number;
  /** Nombre de jours après l'âge idéal où la fenêtre reste confortable */
  windowAfterDays: number;
  /** Obligatoire au sens légal */
  mandatory: boolean;
  /** Explication « pourquoi », sans jargon, lisible à voix haute */
  why: string;
  /** Ce qu'il faut préparer / apporter */
  prepare?: string;
  /** Emoji-pictogramme pour les parents peu à l'aise avec la lecture */
  pictogram: string;
}

const WEEK = 7;

/** Les 16 examens obligatoires de 0 à 6 ans (Arrêté du 26 février 2019). */
export const MANDATORY_EXAMS: CareStep[] = [
  {
    key: "exam-8j",
    type: "exam",
    title: "Examen des 8 premiers jours",
    idealMonths: 0.25,
    windowBeforeDays: 3,
    windowAfterDays: 4,
    mandatory: true,
    why: "Le médecin vérifie que tout va bien après la naissance : le poids, le cœur, les hanches et les yeux. Un certificat de santé est établi.",
    prepare: "Apportez le carnet de santé et la carte Vitale.",
    pictogram: "👶",
  },
  { key: "exam-1m", type: "exam", title: "Visite du 1er mois", idealMonths: 1, windowBeforeDays: WEEK, windowAfterDays: 2 * WEEK, mandatory: true, why: "On contrôle la prise de poids, l'alimentation et le sommeil de votre bébé. C'est aussi le moment de poser toutes vos questions.", prepare: "Notez vos questions à l'avance, même les plus simples.", pictogram: "🩺" },
  { key: "exam-2m", type: "exam", title: "Visite du 2e mois", idealMonths: 2, windowBeforeDays: WEEK, windowAfterDays: 2 * WEEK, mandatory: true, why: "Visite importante : elle est souvent couplée aux premiers vaccins de votre bébé.", prepare: "Prévoyez un vêtement facile à enlever pour la piqûre.", pictogram: "🩺" },
  { key: "exam-3m", type: "exam", title: "Visite du 3e mois", idealMonths: 3, windowBeforeDays: WEEK, windowAfterDays: 2 * WEEK, mandatory: true, why: "On suit la croissance et l'éveil : est-ce que bébé sourit, suit du regard, tient sa tête ?", pictogram: "🩺" },
  { key: "exam-4m", type: "exam", title: "Visite du 4e mois", idealMonths: 4, windowBeforeDays: WEEK, windowAfterDays: 2 * WEEK, mandatory: true, why: "Contrôle de la croissance et deuxième série de vaccins.", pictogram: "🩺" },
  { key: "exam-5m", type: "exam", title: "Visite du 5e mois", idealMonths: 5, windowBeforeDays: WEEK, windowAfterDays: 2 * WEEK, mandatory: true, why: "On vérifie l'audition, la vision et les progrès de votre bébé.", pictogram: "🩺" },
  { key: "exam-6m", type: "exam", title: "Visite du 6e mois", idealMonths: 6, windowBeforeDays: WEEK, windowAfterDays: 3 * WEEK, mandatory: true, why: "Le médecin parle avec vous de la diversification alimentaire : quand et comment donner autre chose que du lait.", prepare: "Demandez la liste des premiers aliments à essayer.", pictogram: "🥣" },
  { key: "exam-9m", type: "exam", title: "Visite du 9e mois", idealMonths: 9, windowBeforeDays: 2 * WEEK, windowAfterDays: 3 * WEEK, mandatory: true, why: "Examen important : un certificat de santé est envoyé à la PMI. On vérifie la vue, l'audition et si bébé se tient assis.", prepare: "Apportez le carnet de santé, il sera rempli par le médecin.", pictogram: "⭐" },
  { key: "exam-12m", type: "exam", title: "Visite des 12 mois", idealMonths: 12, windowBeforeDays: 2 * WEEK, windowAfterDays: 4 * WEEK, mandatory: true, why: "Premier anniversaire : on fait le point sur la marche, les premiers mots et les vaccins de l'année.", pictogram: "🎂" },
  { key: "exam-17m", type: "exam", title: "Visite des 16-18 mois", idealMonths: 17, windowBeforeDays: 4 * WEEK, windowAfterDays: 4 * WEEK, mandatory: true, why: "On regarde comment votre enfant marche, comprend et communique. Un rappel de vaccin est souvent prévu.", pictogram: "🚶" },
  { key: "exam-24m", type: "exam", title: "Visite des 2 ans", idealMonths: 24, windowBeforeDays: 4 * WEEK, windowAfterDays: 6 * WEEK, mandatory: true, why: "Examen important : un certificat de santé est envoyé à la PMI. On évalue le langage et l'autonomie.", prepare: "Apportez le carnet de santé.", pictogram: "⭐" },
  { key: "exam-36m", type: "exam", title: "Visite des 3 ans", idealMonths: 36, windowBeforeDays: 4 * WEEK, windowAfterDays: 8 * WEEK, mandatory: true, why: "Bilan avant ou pendant l'entrée à l'école : langage, propreté, vue et audition.", pictogram: "🎒" },
  { key: "exam-48m", type: "exam", title: "Visite des 4 ans", idealMonths: 48, windowBeforeDays: 4 * WEEK, windowAfterDays: 8 * WEEK, mandatory: true, why: "On vérifie surtout la vue et l'audition, essentielles pour bien apprendre à l'école.", pictogram: "👀" },
  { key: "exam-60m", type: "exam", title: "Visite des 5 ans", idealMonths: 60, windowBeforeDays: 4 * WEEK, windowAfterDays: 8 * WEEK, mandatory: true, why: "Bilan du développement et du langage avant le CP.", pictogram: "🩺" },
  { key: "exam-72m", type: "exam", title: "Visite des 6 ans", idealMonths: 72, windowBeforeDays: 4 * WEEK, windowAfterDays: 8 * WEEK, mandatory: true, why: "Dernier examen obligatoire de la petite enfance, avec un rappel de vaccin.", pictogram: "🩺" },
];

/** Calendrier vaccinal simplifié 2025/2026 (vaccins de la petite enfance). */
export const VACCINE_PLAN: CareStep[] = [
  { key: "vac-2m", type: "vaccine", title: "1re série de vaccins (2 mois)", idealMonths: 2, windowBeforeDays: WEEK, windowAfterDays: 3 * WEEK, mandatory: true, why: "Vaccin hexavalent (diphtérie, tétanos, poliomyélite, coqueluche, Hib, hépatite B) et pneumocoque. Ces maladies sont graves chez les tout-petits : le vaccin les protège dès maintenant.", prepare: "Un peu de fièvre pendant 1 à 2 jours est normal après la piqûre.", pictogram: "💉" },
  { key: "vac-3m", type: "vaccine", title: "Méningocoque B (3 mois)", idealMonths: 3, windowBeforeDays: WEEK, windowAfterDays: 3 * WEEK, mandatory: true, why: "Protège contre une méningite rare mais très dangereuse chez le nourrisson.", pictogram: "💉" },
  { key: "vac-4m", type: "vaccine", title: "2e série de vaccins (4 mois)", idealMonths: 4, windowBeforeDays: WEEK, windowAfterDays: 3 * WEEK, mandatory: true, why: "Deuxième dose du vaccin hexavalent et du pneumocoque. Elle renforce la protection commencée à 2 mois.", pictogram: "💉" },
  { key: "vac-5m", type: "vaccine", title: "Méningocoque B (5 mois)", idealMonths: 5, windowBeforeDays: WEEK, windowAfterDays: 3 * WEEK, mandatory: true, why: "Deuxième dose contre la méningite à méningocoque B.", pictogram: "💉" },
  { key: "vac-11m", type: "vaccine", title: "Rappels des 11 mois", idealMonths: 11, windowBeforeDays: 2 * WEEK, windowAfterDays: 4 * WEEK, mandatory: true, why: "Rappel du vaccin hexavalent, du pneumocoque et du méningocoque B, plus le méningocoque ACWY. C'est ce rappel qui rend la protection durable.", pictogram: "💉" },
  { key: "vac-12m", type: "vaccine", title: "ROR – 1re dose (12 mois)", idealMonths: 12, windowBeforeDays: 2 * WEEK, windowAfterDays: 4 * WEEK, mandatory: true, why: "Protège contre la rougeole, les oreillons et la rubéole. La rougeole circule encore en France et peut être grave.", pictogram: "💉" },
  { key: "vac-17m", type: "vaccine", title: "ROR – 2e dose (16-18 mois)", idealMonths: 17, windowBeforeDays: 4 * WEEK, windowAfterDays: 6 * WEEK, mandatory: true, why: "La deuxième dose complète la protection contre la rougeole. Les deux doses sont nécessaires.", pictogram: "💉" },
  { key: "vac-72m", type: "vaccine", title: "Rappel des 6 ans", idealMonths: 72, windowBeforeDays: 4 * WEEK, windowAfterDays: 12 * WEEK, mandatory: true, why: "Rappel diphtérie, tétanos, poliomyélite et coqueluche avant l'école élémentaire.", pictogram: "💉" },
];

/** Repères de développement : douce invitation à observer, jamais un diagnostic. */
export const DEVELOPMENT_CHECKS: CareStep[] = [
  { key: "dev-4m", type: "screening", title: "Repères des 4 mois", idealMonths: 4, windowBeforeDays: 2 * WEEK, windowAfterDays: 6 * WEEK, mandatory: false, why: "À cet âge, la plupart des bébés sourient, suivent un objet des yeux et tiennent leur tête. Chaque enfant va à son rythme : parlez-en simplement au médecin.", pictogram: "🌱" },
  { key: "dev-9m", type: "screening", title: "Repères des 9 mois", idealMonths: 9, windowBeforeDays: 2 * WEEK, windowAfterDays: 6 * WEEK, mandatory: false, why: "Vers 9 mois, beaucoup de bébés se tiennent assis seuls, babillent et réagissent à leur prénom.", pictogram: "🌱" },
  { key: "dev-18m", type: "screening", title: "Repères des 18 mois", idealMonths: 18, windowBeforeDays: 4 * WEEK, windowAfterDays: 8 * WEEK, mandatory: false, why: "Vers 18 mois, l'enfant marche seul, dit quelques mots et montre du doigt ce qu'il veut.", pictogram: "🌱" },
  { key: "dev-24m", type: "screening", title: "Repères des 2 ans", idealMonths: 24, windowBeforeDays: 4 * WEEK, windowAfterDays: 8 * WEEK, mandatory: false, why: "Vers 2 ans, l'enfant associe deux mots, court et monte les escaliers avec aide.", pictogram: "🌱" },
  { key: "dev-36m", type: "screening", title: "Repères des 3 ans", idealMonths: 36, windowBeforeDays: 4 * WEEK, windowAfterDays: 8 * WEEK, mandatory: false, why: "Vers 3 ans, l'enfant fait des phrases, joue avec d'autres enfants et se fait comprendre des adultes.", pictogram: "🌱" },
];

export const CARE_PLAN: CareStep[] = [...MANDATORY_EXAMS, ...VACCINE_PLAN, ...DEVELOPMENT_CHECKS].sort(
  (a, b) => a.idealMonths - b.idealMonths
);

export const CARE_TYPE_LABEL: Record<CareType, string> = {
  exam: "Visite obligatoire",
  vaccine: "Vaccin",
  screening: "Repère de développement",
};