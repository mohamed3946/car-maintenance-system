import { ReactNode } from "react";

type BadgeVariant =
  | "primary"
  | "secondary"
  | "success"
  | "warning"
  | "danger";

type BadgeProps = {
  children: ReactNode;
  variant?: BadgeVariant;
};

export default function Badge({
  children,
  variant = "primary",
}: BadgeProps) {
  const styles: Record<BadgeVariant, string> = {
    primary:
      "bg-blue-50 text-blue-700",

    secondary:
      "bg-slate-100 text-slate-700",

    success:
      "bg-emerald-50 text-emerald-700",

    warning:
      "bg-amber-50 text-amber-700",

    danger:
      "bg-red-50 text-red-700",
  };

  return (
    <span
      className={[
        "inline-flex items-center rounded-full",
        "px-3 py-1",
        "text-xs font-black",
        styles[variant],
      ].join(" ")}
    >
      {children}
    </span>
  );
}