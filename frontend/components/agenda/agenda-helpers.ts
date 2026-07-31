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
  scheduled: 'bg-blue-500/20 text-blue-300',
  in_progress: 'bg-amber-500/20 text-amber-300',
  completed: 'bg-green-500/20 text-green-300',
  cancelled: 'bg-red-500/20 text-red-300',
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
