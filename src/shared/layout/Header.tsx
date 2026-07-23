"use client";

import {
  Bell,
  CalendarDays,
  Menu,
  Search,
  User,
} from "lucide-react";

import { useSystem } from "@/providers/SystemProvider";

type HeaderProps = {
  title?: string;
  subtitle?: string;
  onMenuClick?: () => void;
};

export default function Header({
  title,
  subtitle,
  onMenuClick,
}: HeaderProps) {
  const { lang, dir, t, toggleLanguage } = useSystem();

  const isArabic = lang === "ar";

  return (
    <header
      dir={dir}
      className="mb-5 rounded-[20px] border border-slate-200 bg-white px-4 py-3 shadow-sm lg:px-5"
    >
      <div className="flex min-h-[58px] items-center justify-between gap-4">
        {/* Page title */}
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            aria-label={isArabic ? "فتح القائمة" : "Open menu"}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition hover:bg-slate-200 lg:hidden"
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="min-w-0">
            <h1 className="truncate text-[20px] font-black text-slate-950 lg:text-[22px]">
              {title || t.dashboard}
            </h1>

            {subtitle && (
              <p className="mt-1 truncate text-[13px] font-medium text-slate-500 lg:text-[14px]">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Header actions */}
        <div className="flex shrink-0 items-center gap-2 lg:gap-3">
          <button
            type="button"
            onClick={toggleLanguage}
            className="flex h-11 min-w-[50px] items-center justify-center rounded-xl border border-slate-200 bg-white px-3 text-[14px] font-black text-slate-800 shadow-sm transition hover:bg-slate-50"
          >
            {isArabic ? "EN" : "AR"}
          </button>

          <button
            type="button"
            aria-label={t.search}
            className="hidden h-11 w-11 items-center justify-center rounded-xl text-slate-600 transition hover:bg-slate-100 sm:flex"
          >
            <Search className="h-[21px] w-[21px]" />
          </button>

          <button
            type="button"
            aria-label={isArabic ? "التقويم" : "Calendar"}
            className="hidden h-11 w-11 items-center justify-center rounded-xl text-slate-600 transition hover:bg-slate-100 md:flex"
          >
            <CalendarDays className="h-[21px] w-[21px]" />
          </button>

          <button
            type="button"
            aria-label={t.notifications}
            className="relative flex h-11 w-11 items-center justify-center rounded-xl text-slate-600 transition hover:bg-slate-100"
          >
            <Bell className="h-[21px] w-[21px]" />

            <span
              className={`absolute top-0 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-black text-white ${
                isArabic ? "left-0" : "right-0"
              }`}
            >
              3
            </span>
          </button>

          <div className="hidden items-center gap-3 border-slate-200 ps-3 sm:flex sm:border-s">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-700">
              <User className="h-[22px] w-[22px]" />
            </div>

            <div className="hidden min-w-0 xl:block">
              <p className="truncate text-[14px] font-black text-slate-900">
                {t.generalManager}
              </p>

              <p className="truncate text-[12px] font-medium text-slate-500">
                {t.systemManager}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}