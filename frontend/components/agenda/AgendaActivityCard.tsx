import { CalendarDays, User } from 'lucide-react';
import type { ScientificActivity } from '@/lib/api';
import {
  activityTypeLabels,
  activityStatusLabels,
  activityStatusClasses,
  formatDateRange,
} from './agenda-helpers';

interface AgendaActivityCardProps {
  activity: ScientificActivity;
}

export default function AgendaActivityCard({ activity }: AgendaActivityCardProps) {
  const statusClass =
    activityStatusClasses[activity.status] ?? 'bg-muted text-muted-foreground';

  return (
    <article className="bg-surface text-foreground border border-border shadow-sm p-4 rounded-xl flex flex-col gap-3 transition-colors hover:border-primary/30">
      <div className="flex items-start justify-between gap-3">
        <h4 className="font-medium text-foreground leading-snug">{activity.title}</h4>
        <span className="bg-primary/15 text-primary px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap">
          {activityTypeLabels[activity.activity_type] ?? activity.activity_type}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <User className="w-4 h-4 text-muted-foreground" />
          <span>{activity.responsible_name}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <CalendarDays className="w-4 h-4 text-muted-foreground" />
          <span>{formatDateRange(activity.start_date, activity.end_date)}</span>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 mt-auto pt-2 border-t border-border">
        <span className={`px-2 py-0.5 rounded text-xs font-medium border ${statusClass}`}>
          {activityStatusLabels[activity.status] ?? activity.status}
        </span>
        {activity.notes ? (
          <p className="text-xs text-muted-foreground truncate flex-1 text-right" title={activity.notes}>
            {activity.notes}
          </p>
        ) : null}
      </div>
    </article>
  );
}
