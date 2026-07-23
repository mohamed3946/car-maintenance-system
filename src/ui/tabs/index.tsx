"use client";

import { ReactNode } from "react";

export type TabItem = {
  id: string;
  label: string;
  icon?: ReactNode;
  count?: number;
  disabled?: boolean;
};

type TabsProps = {
  items: TabItem[];
  value: string;
  onChange: (value: string) => void;
};

export default function Tabs({
  items,
  value,
  onChange,
}: TabsProps) {
  return (
    <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white p-2 shadow-sm">
      <div className="flex min-w-max items-center gap-2">
        {items.map((item) => {
          const active = item.id === value;

          return (
            <button
              key={item.id}
              type="button"
              disabled={item.disabled}
              onClick={() => onChange(item.id)}
              className={[
                "inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl px-4 py-2.5",
                "text-sm font-black transition-all duration-200",
                "focus:outline-none focus:ring-4 focus:ring-blue-100",
                "disabled:cursor-not-allowed disabled:opacity-40",

                active
                  ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {item.icon && (
                <span className="flex shrink-0 items-center justify-center">
                  {item.icon}
                </span>
              )}

              <span>{item.label}</span>

              {typeof item.count === "number" && (
                <span
                  className={[
                    "rounded-full px-2 py-0.5 text-xs font-black",
                    active
                      ? "bg-white/20 text-white"
                      : "bg-slate-100 text-slate-600",
                  ].join(" ")}
                >
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}