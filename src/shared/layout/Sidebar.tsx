"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  Building2,
  ChevronDown,
  LogOut,
  Search,
  X,
} from "lucide-react";

import { navigationSections } from "@/config/navigation";
import { systemConfig } from "@/config/systemConfig";
import { useCompany } from "@/core/companies";
import { useSystem } from "@/providers/SystemProvider";

type SidebarProps =
  | {
      mode: "desktop";
    }
  | {
      mode: "mobile";
      onClose: () => void;
    };

export default function Sidebar(props: SidebarProps) {
  const pathname = usePathname();
  const { company } = useCompany();
  const { lang, dir, t } = useSystem();

  const isArabic = lang === "ar";

  const companyName =
    company?.company_name?.trim() || systemConfig.app.name;

  const [searchValue, setSearchValue] = useState("");

  const activeSectionKey =
    navigationSections.find(
      (section) =>
        pathname === section.route ||
        pathname.startsWith(`${section.route}/`)
    )?.key || "dashboard";

  const [openSections, setOpenSections] = useState<string[]>([
    activeSectionKey,
  ]);

  const filteredSections = useMemo(() => {
    const query = searchValue.trim().toLowerCase();

    if (!query) {
      return navigationSections;
    }

    return navigationSections
      .map((section) => {
        const sectionLabel = isArabic
          ? section.labelAr
          : section.labelEn;

        const sectionMatches = sectionLabel
          .toLowerCase()
          .includes(query);

        const matchingChildren = section.children.filter((child) => {
          const childLabel = isArabic
            ? child.labelAr
            : child.labelEn;

          return childLabel.toLowerCase().includes(query);
        });

        if (sectionMatches) {
          return section;
        }

        if (matchingChildren.length > 0) {
          return {
            ...section,
            children: matchingChildren,
          };
        }

        return null;
      })
      .filter(
        (
          section
        ): section is (typeof navigationSections)[number] =>
          section !== null
      );
  }, [searchValue, isArabic]);

  function toggleSection(sectionKey: string) {
    setOpenSections((current) =>
      current.includes(sectionKey)
        ? current.filter((key) => key !== sectionKey)
        : [...current, sectionKey]
    );
  }

  function closeMobileSidebar() {
    if (props.mode === "mobile") {
      props.onClose();
    }
  }

  const sidebarContent = (
    <aside
      dir={dir}
      className="relative flex h-full w-full flex-col overflow-hidden bg-gradient-to-b from-[#082a52] via-[#061f3d] to-[#031426] px-5 py-5 text-white"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_5%,rgba(37,99,235,0.14),transparent_30%),radial-gradient(circle_at_85%_75%,rgba(14,165,233,0.08),transparent_32%)]" />

      <div className="relative z-10 flex min-h-0 flex-1 flex-col">
        {props.mode === "mobile" && (
          <button
            type="button"
            onClick={props.onClose}
            aria-label={isArabic ? "إغلاق القائمة" : "Close menu"}
            className={`absolute top-0 rounded-xl bg-white/10 p-2 transition hover:bg-white/20 ${
              isArabic ? "left-0" : "right-0"
            }`}
          >
            <X className="h-6 w-6" />
          </button>
        )}

        <div className="text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl border border-white/10 bg-white/10 shadow-xl">
            <Building2 className="h-10 w-10 text-sky-300" />
          </div>

          <h2 className="mt-4 truncate text-[30px] font-black leading-tight">
            {companyName}
          </h2>

          <div className="mt-2 flex items-center justify-center gap-3 text-[14px] font-bold text-white/80">
            <span className="h-px w-8 bg-white/30" />

            <span>
              {isArabic
                ? "منصة إدارة التوصيل"
                : "Delivery Management Platform"}
            </span>

            <span className="h-px w-8 bg-white/30" />
          </div>
        </div>

        <div className="mt-6 flex min-h-[54px] items-center gap-3 rounded-2xl border border-white/20 bg-white/[0.07] px-4">
          <Search className="h-6 w-6 shrink-0 text-white/80" />

          <input
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            placeholder={t.searchModules}
            className="min-w-0 flex-1 bg-transparent text-[16px] font-bold text-white outline-none placeholder:text-white/65"
          />
        </div>

        <nav className="mt-5 min-h-0 flex-1 space-y-2 overflow-y-auto pe-1">
          {filteredSections.map((section) => {
            const Icon = section.icon;

            const sectionActive =
              pathname === section.route ||
              pathname.startsWith(`${section.route}/`);

            const expanded =
              openSections.includes(section.key) ||
              searchValue.trim().length > 0;

            const sectionLabel = isArabic
              ? section.labelAr
              : section.labelEn;

            return (
              <div key={section.key}>
                <button
                  type="button"
                  onClick={() => toggleSection(section.key)}
                  className={`flex min-h-[56px] w-full items-center justify-between gap-3 rounded-2xl px-4 text-[18px] font-extrabold transition ${
                    sectionActive
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-950/30"
                      : "text-white/95 hover:bg-white/10"
                  }`}
                >
                  <span className="flex min-w-0 items-center gap-4">
                    <Icon className="h-6 w-6 shrink-0" />

                    <span className="truncate">
                      {sectionLabel}
                    </span>
                  </span>

                  <ChevronDown
                    className={`h-5 w-5 shrink-0 transition-transform duration-200 ${
                      expanded ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {expanded && (
                  <div
                    className={`mt-2 space-y-1.5 border-white/15 ${
                      isArabic
                        ? "mr-6 border-r pr-4"
                        : "ml-6 border-l pl-4"
                    }`}
                  >
                    {section.children.map((child) => {
                      const childActive = pathname === child.route;

                      const childLabel = isArabic
                        ? child.labelAr
                        : child.labelEn;

                      return (
                        <Link
                          key={child.key}
                          href={child.route}
                          onClick={closeMobileSidebar}
                          className={`block min-h-[44px] rounded-xl px-4 py-2.5 text-[16px] font-semibold leading-6 transition ${
                            childActive
                              ? "bg-white/15 text-cyan-200"
                              : "text-white/80 hover:bg-white/10 hover:text-white"
                          }`}
                        >
                          {childLabel}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          {filteredSections.length === 0 && (
            <div className="rounded-xl bg-white/[0.07] px-4 py-5 text-center text-[16px] font-bold text-white/70">
              {isArabic
                ? "لا توجد نتائج"
                : "No results found"}
            </div>
          )}
        </nav>

        <div className="mt-4 space-y-3">
          <button
            type="button"
            className="flex min-h-[52px] w-full items-center gap-4 rounded-2xl border border-white/20 bg-white/[0.07] px-4 text-[16px] font-extrabold transition hover:bg-white/15"
          >
            <Bell className="h-6 w-6 shrink-0" />
            <span>{t.notifications}</span>
          </button>

          <button
            type="button"
            className="flex min-h-[54px] w-full items-center justify-center gap-4 rounded-2xl border border-white/20 bg-white/[0.07] px-4 text-[16px] font-extrabold transition hover:border-red-500 hover:bg-red-600"
          >
            <LogOut className="h-6 w-6 shrink-0" />
            <span>{t.logout}</span>
          </button>
        </div>
      </div>
    </aside>
  );

  if (props.mode === "desktop") {
    return (
      <div className="sticky top-0 h-screen">
        {sidebarContent}
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={props.onClose}
        aria-label={isArabic ? "إغلاق القائمة" : "Close menu"}
        className="fixed inset-0 z-40 bg-black/45 lg:hidden"
      />

      <div
        className={`fixed top-0 z-50 h-screen w-[350px] max-w-[92vw] lg:hidden ${
          isArabic ? "right-0" : "left-0"
        }`}
      >
        {sidebarContent}
      </div>
    </>
  );
}