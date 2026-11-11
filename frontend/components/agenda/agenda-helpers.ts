import type { ScientificActivity } from '@/lib/api';

export const activityTypeLabels: Record<string, string> = {
  congreso: 'Congreso',
  webinar: 'Webinar',
  defensa: 'Defensa',
  feria: 'Feria',
  olimpiada: 'Olimpiada',
  master_class: 'Master Class',
};

export const activityStatusLabels: Record<string, string> = {
  scheduled: 'Programada',
  in_progress: 'En progreso',
  completed: 'Completada',
  cancelled: 'Cancelada',
};

export const activityStatusClasses: Record<string, string> = {
  scheduled: 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500/30',
  in_progress: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/30',
  completed: 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-green-500/20 dark:text-green-300 dark:border-green-500/30',
  cancelled: 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-red-500/20 dark:text-red-300 dark:border-red-500/30',
};

function parseLocalDate(dateStr: string): Date {
  return new Date(`${dateStr}T12:00:00`);
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function formatShortDate(dateStr: string): string {
  const date = parseLocalDate(dateStr);
  return capitalize(
    date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  );
}

export function formatDateRange(startDate: string, endDate: string): string {
  if (startDate === endDate) {
    return formatShortDate(startDate);
  }
  return `${formatShortDate(startDate)} – ${formatShortDate(endDate)}`;
}

export function formatMonthLabel(monthKey: string): string {
  const date = parseLocalDate(`${monthKey}-01`);
  return capitalize(
    date.toLocaleDateString('es-ES', {
      month: 'long',
      year: 'numeric',
    })
  );
}

export function groupActivitiesByMonth(
  activities: ScientificActivity[]
): { monthKey: string; activities: ScientificActivity[] }[] {
  const sorted = [...activities].sort(
    (a, b) =>
      parseLocalDate(a.start_date).getTime() - parseLocalDate(b.start_date).getTime()
  );

  const monthMap = new Map<string, ScientificActivity[]>();
  sorted.forEach((activity) => {
    const monthKey = activity.start_date.slice(0, 7);
    const group = monthMap.get(monthKey) ?? [];
    group.push(activity);
    monthMap.set(monthKey, group);
  });

  return Array.from(monthMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([monthKey, groupActivities]) => ({
      monthKey,
      activities: groupActivities,
    }));
}
