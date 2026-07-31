import type { ScientificActivity } from '@/lib/api';
import AgendaActivityCard from './AgendaActivityCard';
import { formatMonthLabel } from './agenda-helpers';

interface AgendaMonthGroupProps {
  monthKey: string;
  activities: ScientificActivity[];
}

export default function AgendaMonthGroup({
  monthKey,
  activities,
}: AgendaMonthGroupProps) {
  return (
    <section className="space-y-4">
      <h3 className="text-xl font-semibold text-white capitalize">
        {formatMonthLabel(monthKey)}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {activities.map((activity) => (
          <AgendaActivityCard key={activity.id} activity={activity} />
        ))}
      </div>
    </section>
  );
}
