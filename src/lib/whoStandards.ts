// WHO Child Growth Standards (simplified, monthly, unisex-averaged)
// Values: P3, P50, P97 for weight (kg), height (cm), head circumference (cm)
// Source: WHO Multicentre Growth Reference Study (2006), simplified for app UX

export type WhoPoint = { month: number; p3: number; p50: number; p97: number };

export const WHO_WEIGHT_BOY: WhoPoint[] = [
  { month: 0, p3: 2.5, p50: 3.3, p97: 4.4 },
  { month: 1, p3: 3.4, p50: 4.5, p97: 5.8 },
  { month: 2, p3: 4.4, p50: 5.6, p97: 7.1 },
  { month: 3, p3: 5.1, p50: 6.4, p97: 8.0 },
  { month: 4, p3: 5.6, p50: 7.0, p97: 8.7 },
  { month: 6, p3: 6.4, p50: 7.9, p97: 9.8 },
  { month: 9, p3: 7.1, p50: 8.9, p97: 10.9 },
  { month: 12, p3: 7.7, p50: 9.6, p97: 11.8 },
  { month: 18, p3: 8.8, p50: 10.9, p97: 13.5 },
  { month: 24, p3: 9.7, p50: 12.2, p97: 15.3 },
  { month: 36, p3: 11.3, p50: 14.3, p97: 18.3 },
  { month: 48, p3: 12.7, p50: 16.3, p97: 21.2 },
];

export const WHO_WEIGHT_GIRL: WhoPoint[] = [
  { month: 0, p3: 2.4, p50: 3.2, p97: 4.2 },
  { month: 1, p3: 3.2, p50: 4.2, p97: 5.5 },
  { month: 2, p3: 3.9, p50: 5.1, p97: 6.6 },
  { month: 3, p3: 4.5, p50: 5.8, p97: 7.5 },
  { month: 4, p3: 5.0, p50: 6.4, p97: 8.2 },
  { month: 6, p3: 5.7, p50: 7.3, p97: 9.3 },
  { month: 9, p3: 6.5, p50: 8.2, p97: 10.5 },
  { month: 12, p3: 7.0, p50: 8.9, p97: 11.5 },
  { month: 18, p3: 8.1, p50: 10.2, p97: 13.2 },
  { month: 24, p3: 9.0, p50: 11.5, p97: 14.8 },
  { month: 36, p3: 10.8, p50: 13.9, p97: 18.1 },
  { month: 48, p3: 12.3, p50: 16.1, p97: 21.5 },
];

export const WHO_HEIGHT_BOY: WhoPoint[] = [
  { month: 0, p3: 46.1, p50: 49.9, p97: 53.7 },
  { month: 3, p3: 57.6, p50: 61.4, p97: 65.3 },
  { month: 6, p3: 63.6, p50: 67.6, p97: 71.6 },
  { month: 12, p3: 71.3, p50: 75.7, p97: 80.2 },
  { month: 24, p3: 81.7, p50: 87.1, p97: 92.9 },
  { month: 36, p3: 88.7, p50: 95.1, p97: 102.0 },
  { month: 48, p3: 94.9, p50: 102.3, p97: 109.5 },
];

export const WHO_HEIGHT_GIRL: WhoPoint[] = [
  { month: 0, p3: 45.4, p50: 49.1, p97: 52.9 },
  { month: 3, p3: 55.6, p50: 59.8, p97: 64.0 },
  { month: 6, p3: 61.2, p50: 65.7, p97: 70.3 },
  { month: 12, p3: 68.9, p50: 74.0, p97: 79.2 },
  { month: 24, p3: 80.0, p50: 85.7, p97: 91.8 },
  { month: 36, p3: 87.4, p50: 94.2, p97: 101.4 },
  { month: 48, p3: 93.6, p50: 101.4, p97: 108.9 },
];

export function getWhoStandard(kind: "weight" | "height", gender: string | null): WhoPoint[] {
  const isGirl = gender === "female" || gender === "girl" || gender === "F";
  if (kind === "weight") return isGirl ? WHO_WEIGHT_GIRL : WHO_WEIGHT_BOY;
  return isGirl ? WHO_HEIGHT_GIRL : WHO_HEIGHT_BOY;
}

export function ageInMonths(birthDate: string, at: Date = new Date()): number {
  const b = new Date(birthDate);
  return (at.getFullYear() - b.getFullYear()) * 12 + (at.getMonth() - b.getMonth()) + (at.getDate() - b.getDate()) / 30.44;
}