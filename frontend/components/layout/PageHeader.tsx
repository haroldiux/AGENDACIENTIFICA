import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
}

export default function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6 pb-5 border-b border-border dark:border-white/5">
      <div className="min-w-0 flex-1">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight break-words">{title}</h2>
        {description && (
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 max-w-2xl">{description}</p>
        )}
      </div>
      {actions && (
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto shrink-0 justify-start sm:justify-end">
          {actions}
        </div>
      )}
    </div>
  );
}
