import { ReactNode } from "react";

type StatCardTone =
  | "blue"
  | "green"
  | "amber"
  | "red"
  | "violet"
  | "slate";

type StatCardProps = {
  title: string;
  value: string | number;

  note?: string;
  icon?: ReactNode;
  trend?: string;
  tone?: StatCardTone;
  loading?: boolean;
};

export default function StatCard({
  title,
  value,
  note,
  icon,
  trend,
  tone = "blue",
  loading = false,
}: StatCardProps) {
  const toneStyles: Record<
    StatCardTone,
    {
      icon: string;
      value: string;
      trend: string;
    }
  > = {
    blue: {
      icon: "bg-blue-50 text-blue-600",
      value: "text-blue-700",
      trend: "bg-blue-50 text-blue-700",
    },
    green: {
      icon: "bg-emerald-50 text-emerald-600",
      value: "text-emerald-700",
      trend: "bg-emerald-50 text-emerald-700",
    },
    amber: {
      icon: "bg-amber-50 text-amber-600",
      value: "text-amber-700",
      trend: "bg-amber-50 text-amber-700",
    },
    red: {
      icon: "bg-red-50 text-red-600",
      value: "text-red-700",
      trend: "bg-red-50 text-red-700",
    },
    violet: {
      icon: "bg-violet-50 text-violet-600",
      value: "text-violet-700",
      trend: "bg-violet-50 text-violet-700",
    },
    slate: {
      icon: "bg-slate-100 text-slate-600",
      value: "text-slate-800",
      trend: "bg-slate-100 text-slate-700",
    },
  };

  const styles = toneStyles[tone];

  if (loading) {
    return (
      <div className="animate-pulse rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="h-4 w-28 rounded bg-slate-200" />
        <div className="mt-5 h-10 w-24 rounded bg-slate-200" />
        <div className="mt-4 h-3 w-36 rounded bg-slate-100" />
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-bold text-slate-500">
            {title}
          </p>

          <div className="mt-4 flex flex-wrap items-end gap-3">
            <h2 className={`text-4xl font-black ${styles.value}`}>
              {value}
            </h2>

            {trend && (
              <span
                className={`mb-1 rounded-full px-3 py-1 text-xs font-black ${styles.trend}`}
              >
                {trend}
              </span>
            )}
          </div>

          {note && (
            <p className="mt-3 text-xs font-bold text-slate-400">
              {note}
            </p>
          )}
        </div>

        {icon && (
          <div
            className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${styles.icon}`}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}