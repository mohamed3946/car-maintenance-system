import { ReactNode } from "react";

type PageHeaderProps = {
  title: string;
  subtitle?: string;

  icon?: ReactNode;
  actions?: ReactNode;

  badge?: ReactNode;
};

export default function PageHeader({
  title,
  subtitle,
  icon,
  actions,
  badge,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:flex-row lg:items-center lg:justify-between">
      <div className="flex min-w-0 items-start gap-4">
        {icon && (
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            {icon}
          </div>
        )}

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-black text-slate-900 lg:text-3xl">
              {title}
            </h1>

            {badge}
          </div>

          {subtitle && (
            <p className="mt-2 max-w-3xl text-sm font-medium leading-7 text-slate-500">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {actions && (
        <div className="flex shrink-0 flex-wrap items-center gap-3">
          {actions}
        </div>
      )}
    </div>
  );
}