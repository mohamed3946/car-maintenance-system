import { ReactNode } from "react";

type EmptyStateProps = {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
};

export default function EmptyState({
  title,
  description,
  icon,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
      {icon && (
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-100 text-slate-500">
          {icon}
        </div>
      )}

      <h3 className="mt-5 text-xl font-black text-slate-900">
        {title}
      </h3>

      {description && (
        <p className="mt-3 max-w-xl text-sm font-medium leading-7 text-slate-500">
          {description}
        </p>
      )}

      {action && (
        <div className="mt-6">
          {action}
        </div>
      )}
    </div>
  );
}