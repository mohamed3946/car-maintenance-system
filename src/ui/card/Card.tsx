import {
  HTMLAttributes,
  ReactNode,
} from "react";

type CardPadding = "none" | "small" | "medium" | "large";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;

  title?: string;
  description?: string;

  icon?: ReactNode;
  actions?: ReactNode;
  footer?: ReactNode;

  padding?: CardPadding;

  hoverable?: boolean;
  clickable?: boolean;
};

export default function Card({
  children,

  title,
  description,

  icon,
  actions,
  footer,

  padding = "medium",

  hoverable = false,
  clickable = false,

  className = "",
  ...props
}: CardProps) {
  const paddingStyles: Record<CardPadding, string> = {
    none: "",
    small: "p-4",
    medium: "p-6",
    large: "p-8",
  };

  return (
    <div
      className={[
        "overflow-hidden rounded-3xl border border-slate-200",
        "bg-white shadow-sm",
        "transition-all duration-200",

        hoverable
          ? "hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg"
          : "",

        clickable
          ? "cursor-pointer focus:outline-none focus:ring-4 focus:ring-blue-100"
          : "",

        className,
      ]
        .filter(Boolean)
        .join(" ")}
      tabIndex={clickable ? 0 : undefined}
      {...props}
    >
      {(title || description || icon || actions) && (
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
          <div className="flex min-w-0 items-start gap-4">
            {icon && (
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                {icon}
              </div>
            )}

            <div className="min-w-0">
              {title && (
                <h3 className="truncate text-lg font-black text-slate-900">
                  {title}
                </h3>
              )}

              {description && (
                <p className="mt-1 text-sm font-medium leading-6 text-slate-500">
                  {description}
                </p>
              )}
            </div>
          </div>

          {actions && (
            <div className="flex shrink-0 items-center gap-2">
              {actions}
            </div>
          )}
        </div>
      )}

      <div className={paddingStyles[padding]}>
        {children}
      </div>

      {footer && (
        <div className="border-t border-slate-100 bg-slate-50/70 px-6 py-4">
          {footer}
        </div>
      )}
    </div>
  );
}