import {
  ButtonHTMLAttributes,
  ReactNode,
} from "react";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "danger"
  | "success"
  | "outline";

type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;

  variant?: ButtonVariant;
  size?: ButtonSize;

  iconStart?: ReactNode;
  iconEnd?: ReactNode;

  loading?: boolean;
  fullWidth?: boolean;
};

export default function Button({
  children,

  variant = "primary",
  size = "md",

  iconStart,
  iconEnd,

  loading = false,
  fullWidth = false,

  disabled,
  className = "",

  type = "button",
  ...props
}: ButtonProps) {
  const variantStyles: Record<ButtonVariant, string> = {
    primary:
      "bg-blue-600 text-white shadow-sm hover:bg-blue-700 focus:ring-blue-200",

    secondary:
      "bg-slate-100 text-slate-700 hover:bg-slate-200 focus:ring-slate-200",

    ghost:
      "bg-transparent text-slate-700 hover:bg-slate-100 focus:ring-slate-200",

    danger:
      "bg-red-600 text-white shadow-sm hover:bg-red-700 focus:ring-red-200",

    success:
      "bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 focus:ring-emerald-200",

    outline:
      "border border-slate-300 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 focus:ring-blue-100",
  };

  const sizeStyles: Record<ButtonSize, string> = {
    sm: "min-h-9 rounded-xl px-3 py-2 text-xs",
    md: "min-h-11 rounded-2xl px-4 py-2.5 text-sm",
    lg: "min-h-13 rounded-2xl px-6 py-3 text-base",
  };

  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      disabled={isDisabled}
      aria-busy={loading}
      className={[
        "inline-flex items-center justify-center gap-2",
        "font-black transition-all duration-200",
        "focus:outline-none focus:ring-4",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "active:scale-[0.98]",

        variantStyles[variant],
        sizeStyles[size],

        fullWidth ? "w-full" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {loading ? (
        <>
          <span
            className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
            aria-hidden="true"
          />

          <span>جاري التنفيذ...</span>
        </>
      ) : (
        <>
          {iconStart && (
            <span className="flex shrink-0 items-center justify-center">
              {iconStart}
            </span>
          )}

          <span>{children}</span>

          {iconEnd && (
            <span className="flex shrink-0 items-center justify-center">
              {iconEnd}
            </span>
          )}
        </>
      )}
    </button>
  );
}