"use client";

import { ReactNode } from "react";
import { useCompany } from "@/core/companies";

type AppShellProps = {
  children: ReactNode;
  title?: string;
  subtitle?: string;
};

export default function AppShell({ children, title, subtitle }: AppShellProps) {
  const { company, loading } = useCompany();

  const companyName = company?.company_name || "DeliveryOS";
  const primaryColor = company?.primary_color || "#2563eb";

  return (
    <div dir="rtl" className="min-h-screen bg-slate-50">
      <aside className="fixed right-0 top-0 h-screen w-72 border-l border-slate-200 bg-white p-5">
        <div className="mb-8 flex items-center gap-3">
          <div
            className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl text-lg font-black text-white"
            style={{ backgroundColor: primaryColor }}
          >
            {company?.logo_url ? (
              <img
                src={company.logo_url}
                alt={companyName}
                className="h-full w-full object-cover"
              />
            ) : (
              companyName.charAt(0)
            )}
          </div>

          <div>
            <h2 className="text-lg font-black text-[#0f2544]">
              {loading ? "..." : companyName}
            </h2>
            <p className="text-xs font-bold text-slate-500">ERP Platform</p>
          </div>
        </div>

        <nav className="space-y-2 text-sm font-bold text-slate-700">
          <NavItem labelAr="لوحة التحكم" labelEn="Dashboard" />
          <NavItem labelAr="التشغيل" labelEn="Operations" />
          <NavItem labelAr="الموارد البشرية" labelEn="HR" />
          <NavItem labelAr="الأسطول" labelEn="Fleet" />
          <NavItem labelAr="المالية" labelEn="Finance" />
          <NavItem labelAr="الإعدادات" labelEn="Settings" />
        </nav>
      </aside>

      <main className="mr-72 min-h-screen p-6">
        {(title || subtitle) && (
          <div className="mb-6">
            {title && (
              <h1 className="text-3xl font-black text-[#0f2544]">{title}</h1>
            )}

            {subtitle && (
              <p className="mt-1 text-sm font-bold text-slate-500">
                {subtitle}
              </p>
            )}
          </div>
        )}

        {children}
      </main>
    </div>
  );
}

function NavItem({
  labelAr,
  labelEn,
}: {
  labelAr: string;
  labelEn: string;
}) {
  return (
    <button className="w-full rounded-2xl px-4 py-3 text-start hover:bg-slate-50">
      <span className="block">{labelAr}</span>
      <span className="block text-xs text-slate-400">{labelEn}</span>
    </button>
  );
}