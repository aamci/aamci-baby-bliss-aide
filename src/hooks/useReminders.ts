import { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useChildren, type Child } from "@/hooks/useChildren";
import { CARE_PLAN, type CareStep } from "@/lib/carePlan";
import { addDays, differenceInCalendarDays, format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";

export type ReminderStatus = "pending" | "done" | "snoozed" | "dismissed";
/** Urgence perçue — jamais "en retard", on reste bienveillant. */
export type ReminderPhase = "soon" | "open" | "still-possible" | "future" | "done";

export interface ReminderState {
  id: string;
  child_id: string;
  reminder_key: string;
  status: ReminderStatus;
  snoozed_until: string | null;
  completed_at: string | null;
}

export interface Reminder {
  key: string;
  step: CareStep;
  child: Child;
  /** Date idéale */
  idealDate: Date;
  /** Début et fin de la fenêtre confortable */
  opensAt: Date;
  closesAt: Date;
  phase: ReminderPhase;
  status: ReminderStatus;
  snoozedUntil: Date | null;
  /** Phrase principale affichée au parent, sans jargon ni stress */
  message: string;
  /** Fenêtre lisible : "entre le 3 et le 24 mars" */
  windowLabel: string;
  /** Priorité de tri (plus petit = plus urgent) */
  sortWeight: number;
  /** À faire remonter dans le badge de la cloche */
  isActionable: boolean;
}

const addMonthsFloat = (date: Date, months: number) => addDays(date, Math.round(months * 30.4375));
const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

export const useReminderStates = (childIds: string[]) => {
  const key = [...childIds].sort().join(",");
  return useQuery({
    queryKey: ["reminder-states", key],
    queryFn: async () => {
      if (!childIds.length) return [] as ReminderState[];
      const { data, error } = await supabase
        .from("reminder_states")
        .select("*")
        .in("child_id", childIds);
      if (error) throw error;
      return (data ?? []) as ReminderState[];
    },
    enabled: childIds.length > 0,
  });
};

export const useSetReminderState = () => {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (input: {
      child_id: string;
      reminder_key: string;
      status: ReminderStatus;
      snoozed_until?: string | null;
      completed_at?: string | null;
    }) => {
      const { error } = await supabase.from("reminder_states").upsert(
        {
          child_id: input.child_id,
          reminder_key: input.reminder_key,
          status: input.status,
          snoozed_until: input.snoozed_until ?? null,
          completed_at: input.completed_at ?? null,
          updated_by: user?.id ?? null,
        },
        { onConflict: "child_id,reminder_key" }
      );
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["reminder-states"] }),
  });
};

const buildMessage = (step: CareStep, childName: string, phase: ReminderPhase, opensAt: Date, closesAt: Date, days: number) => {
  const from = format(opensAt, "d MMMM", { locale: fr });
  const to = format(closesAt, "d MMMM", { locale: fr });
  switch (phase) {
    case "soon":
      return `Dans environ ${days} jour${days > 1 ? "s" : ""}, ce sera le moment pour ${childName}. Vous pouvez déjà prendre rendez-vous, sans urgence.`;
    case "open":
      return `C'est la bonne période pour ${childName} : entre le ${from} et le ${to}. Prenez le temps qu'il vous faut.`;
    case "still-possible":
      return `La période idéale est passée, mais c'est encore tout à fait possible pour ${childName}. Il n'est jamais trop tard, parlez-en à votre médecin.`;
    case "done":
      return `Fait pour ${childName}. Bravo, une étape de plus.`;
    default:
      return `Prévu pour ${childName} à partir du ${from}.`;
  }
};

/**
 * Calcule les rappels du parcours de soins pour un enfant (ou tous les enfants).
 * Les fenêtres sont volontairement larges et le ton non culpabilisant.
 */
export const useReminders = (childId?: string) => {
  const { data: children = [] } = useChildren();
  const scoped = useMemo(
    () => (childId ? children.filter((c) => c.id === childId) : children),
    [children, childId]
  );
  const childIds = useMemo(() => scoped.map((c) => c.id), [scoped]);
  const { data: states = [], isLoading } = useReminderStates(childIds);

  const reminders = useMemo<Reminder[]>(() => {
    const today = startOfToday();
    const list: Reminder[] = [];

    for (const child of scoped) {
      const birth = parseISO(child.birth_date);
      for (const step of CARE_PLAN) {
        const idealDate = addMonthsFloat(birth, step.idealMonths);
        const opensAt = addDays(idealDate, -step.windowBeforeDays);
        const closesAt = addDays(idealDate, step.windowAfterDays);
        const state = states.find((s) => s.child_id === child.id && s.reminder_key === step.key);
        const status: ReminderStatus = (state?.status as ReminderStatus) ?? "pending";
        if (status === "dismissed") continue;

        const daysToOpen = differenceInCalendarDays(opensAt, today);
        const daysAfterClose = differenceInCalendarDays(today, closesAt);

        let phase: ReminderPhase;
        if (status === "done") phase = "done";
        else if (daysToOpen > 30) phase = "future";
        else if (daysToOpen > 0) phase = "soon";
        else if (daysAfterClose <= 0) phase = "open";
        else phase = "still-possible";

        // On n'insiste plus au-delà de 18 mois après la fin de fenêtre
        if (phase === "still-possible" && daysAfterClose > 550) continue;

        const snoozedUntil = state?.snoozed_until ? parseISO(state.snoozed_until) : null;
        const isSnoozed = status === "snoozed" && !!snoozedUntil && snoozedUntil > today;

        const isActionable =
          !isSnoozed && (phase === "open" || phase === "still-possible" || (phase === "soon" && daysToOpen <= 14));

        const sortWeight =
          phase === "open" ? 0 : phase === "still-possible" ? 1 : phase === "soon" ? 2 : phase === "future" ? 3 : 4;

        list.push({
          key: `${child.id}:${step.key}`,
          step,
          child,
          idealDate,
          opensAt,
          closesAt,
          phase,
          status: isSnoozed ? "snoozed" : status,
          snoozedUntil: isSnoozed ? snoozedUntil : null,
          message: buildMessage(step, child.first_name, phase, opensAt, closesAt, Math.max(daysToOpen, 0)),
          windowLabel: `Du ${format(opensAt, "d MMM", { locale: fr })} au ${format(closesAt, "d MMM yyyy", { locale: fr })}`,
          sortWeight: sortWeight * 100000 + Math.abs(differenceInCalendarDays(idealDate, today)),
          isActionable,
        });
      }
    }

    return list.sort((a, b) => a.sortWeight - b.sortWeight);
  }, [scoped, states]);

  const active = reminders.filter((r) => r.isActionable);
  const upcoming = reminders.filter((r) => !r.isActionable && r.phase !== "done");
  const done = reminders.filter((r) => r.phase === "done");

  return { reminders, active, upcoming, done, isLoading, hasChild: scoped.length > 0 };
};