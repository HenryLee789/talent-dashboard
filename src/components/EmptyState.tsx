interface EmptyStateProps {
  title: string;
  description: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="dashboard-card rounded-[10px] p-10 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-lg font-bold text-dashboard-blue">
        -
      </div>
      <h2 className="text-lg font-bold text-dashboard-ink">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-dashboard-muted">
        {description}
      </p>
    </div>
  );
}
