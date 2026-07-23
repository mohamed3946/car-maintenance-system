"use client";

import { ReactNode, useState } from "react";

import { useSystem } from "@/providers/SystemProvider";

import Header from "./Header";
import Sidebar from "./Sidebar";

type MainLayoutProps = {
  children: ReactNode;
  title?: string;
  subtitle?: string;
};

export default function MainLayout({
  children,
  title,
  subtitle,
}: MainLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { dir } = useSystem();

  const isArabic = dir === "rtl";

  return (
    <main className="min-h-screen bg-[#f4f7fc] text-[#0f2544]">
      <div
        dir="ltr"
        className={`flex min-h-screen w-full ${
          isArabic ? "flex-row-reverse" : "flex-row"
        }`}
      >
        <div className="hidden w-[350px] shrink-0 lg:block">
          <Sidebar mode="desktop" />
        </div>

        <section dir={dir} className="min-w-0 flex-1">
          <div className="p-4 lg:p-5 xl:p-6">
            <Header
              title={title}
              subtitle={subtitle}
              onMenuClick={() => setMobileMenuOpen(true)}
            />

            <div className="mx-auto w-full max-w-[1600px]">
              {children}
            </div>
          </div>
        </section>
      </div>

      {mobileMenuOpen && (
        <Sidebar
          mode="mobile"
          onClose={() => setMobileMenuOpen(false)}
        />
      )}
    </main>
  );
}