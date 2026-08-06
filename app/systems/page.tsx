
"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SystemsPage() {
  const router = useRouter();
  const [lang, setLang] = useState<"ar" | "en">("ar");

  const t = {
    ar: {
      logout: "تسجيل الخروج",
      welcome: "مرحبًا بك",
      choose: "اختر النظام الذي ترغب بالعمل عليه",
      maintenance: "إدارة الصيانة",
      employees: "إدارة الموظفين",
      accounting: "الحسابات",
      enter: "دخول النظام",
      soon: "قريبًا",
      safe: "نظام آمن وموثوق لحماية بياناتك",
    },
    en: {
      logout: "Logout",
      welcome: "Welcome",
      choose: "Choose the system you want to use",
      maintenance: "Maintenance",
      employees: "Employees",
      accounting: "Accounting",
      enter: "Enter System",
      soon: "Soon",
      safe: "Secure and trusted system to protect your data",
    },
  }[lang];

  const systems = [
    {
      title: t.accounting,
      desc:
        lang === "ar"
          ? "إدارة الحسابات المالية والمصروفات، الإيرادات، السلف، والتقارير المالية"
          : "Manage expenses, revenues, advances, and financial reports",
      icon: "💼",
      active: false,
      path: "/accounting",
      color: "from-[#0b3b8f]/78 via-[#07306f]/65 to-[#031b44]/88",
      border: "border-blue-300/35",
    },
    {
      title: t.employees,
      desc:
        lang === "ar"
          ? "إدارة الموظفين، العقود، الإجازات، الحضور والغياب، الرواتب والتركيبات"
          : "Manage employees, contracts, attendance, vacations, and payroll",
      icon: "👥",
      active: true,
      path: "/employees",
      color: "from-[#08796f]/72 via-[#075f62]/62 to-[#042f42]/88",
      border: "border-cyan-300/35",
    },
    {
      title: t.maintenance,
      desc:
        lang === "ar"
          ? "الأعطال، الحوادث، تغيير الزيوت، سجل المركبات والصيانة الدورية"
          : "Incidents, accidents, oil changes, vehicles, and periodic maintenance",
      icon: "🛠️",
      active: true,
      path: "/dashboard",
      color: "from-[#124fb9]/78 via-[#0b3c91]/65 to-[#051d4b]/88",
      border: "border-blue-300/45",
    },
  ];

  return (
    <main
      dir={lang === "ar" ? "rtl" : "ltr"}
      className="relative min-h-screen overflow-x-hidden overflow-y-auto bg-[#03142d] text-white"
    >
      <Image
        src="/login-banner.png"
        alt="background"
        fill
        priority
        className="fixed inset-0 object-cover object-center"
      />

      <div className="fixed inset-0 bg-[#03142d]/64" />
      <div className="fixed inset-0 bg-gradient-to-b from-[#082f66]/40 via-[#061b35]/52 to-[#020617]/94" />

      <div className="pointer-events-none fixed bottom-0 left-0 h-[480px] w-[480px] rounded-full border border-sky-400/18" />
      <div className="pointer-events-none fixed -bottom-36 -left-40 h-[700px] w-[700px] rounded-full border border-sky-400/12" />

      <header className="relative z-10 flex items-start justify-between px-8 pt-6 md:px-12">
        <Image
          src="/logo.png"
          alt="logo"
          width={260}
          height={140}
          priority
          className="h-auto w-[210px] object-contain brightness-0 invert drop-shadow-2xl md:w-[260px]"
        />

        <div className="flex gap-3">
          <button
            onClick={() => setLang(lang === "ar" ? "en" : "ar")}
            className="rounded-2xl border border-white/25 bg-white/10 px-5 py-3 text-sm font-bold text-white shadow-xl backdrop-blur-md transition hover:bg-white/15"
          >
            {lang === "ar" ? "English" : "العربية"}
          </button>

          <button
            onClick={() => router.push("/login")}
            className="rounded-2xl border border-white/25 bg-white/10 px-5 py-3 text-sm font-bold text-white shadow-xl backdrop-blur-md transition hover:bg-white/15"
          >
            {t.logout}
          </button>
        </div>
      </header>

      <section className="relative z-10 mx-auto flex max-w-[1320px] flex-col items-center px-6 pb-10 pt-0">
        <div className="mb-6 text-center">
          <h1 className="text-[42px] font-black leading-tight text-white drop-shadow-xl md:text-[52px]">
            {t.welcome}
          </h1>
          <div className="mx-auto mt-3 h-1 w-20 rounded-full bg-sky-400 shadow-lg shadow-sky-400/60" />
          <p className="mt-4 text-[20px] font-medium text-white/90 md:text-[24px]">
            {t.choose}
          </p>
        </div>

        <div dir="ltr" className="grid w-full max-w-[1100px] gap-6 md:grid-cols-3">
          {systems.map((system) => (
            <article
              key={system.title}
              dir={lang === "ar" ? "rtl" : "ltr"}
              className={`group relative min-h-[420px] overflow-hidden rounded-[30px] border ${system.border} bg-white/10 shadow-2xl backdrop-blur-xl transition duration-300 hover:-translate-y-2 hover:bg-white/15`}
            >
              <Image
                src="/login-banner.png"
                alt={system.title}
                fill
                className="object-cover opacity-[0.17]"
              />

              <div className={`absolute inset-0 bg-gradient-to-b ${system.color}`} />
              <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-black/35" />

              <div className="relative z-10 flex h-full min-h-[420px] flex-col items-center justify-between px-7 py-7 text-center">
                <div>
                  <div className="mx-auto flex h-[92px] w-[92px] items-center justify-center rounded-full border border-sky-300/25 bg-white/10 text-[46px] shadow-2xl backdrop-blur-md">
                    {system.icon}
                  </div>

                  <h2 className="mt-6 text-[28px] font-black leading-tight text-white">
                    {system.title}
                  </h2>

                  <div className="mx-auto mt-3 h-1 w-14 rounded-full bg-sky-400" />

                  <p className="mt-5 text-[17px] font-medium leading-[1.9] text-white/90">
                    {system.desc}
                  </p>
                </div>

                <button
                  onClick={() =>
                    system.active
                      ? router.push(system.path)
                      : alert(
                          lang === "ar"
                            ? "هذا النظام تحت التطوير حاليًا"
                            : "This system is under development"
                        )
                  }
                  className={`mt-6 flex h-[52px] w-[190px] items-center justify-center gap-3 rounded-full text-[16px] font-black shadow-xl transition active:scale-[0.98] ${
                    system.active
                      ? "bg-[#2f7df6] text-white hover:bg-[#1d6ff2]"
                      : "bg-white/15 text-white/75 hover:bg-white/20"
                  }`}
                >
                  <span>{system.active ? t.enter : t.soon}</span>
                  <span className="text-2xl">←</span>
                </button>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-center gap-4 text-base font-bold text-white/95 md:text-lg">
          <div className="h-px w-20 bg-sky-400/50 md:w-28" />
          <span className="text-2xl">🛡️</span>
          <span>{t.safe}</span>
          <div className="h-px w-20 bg-sky-400/50 md:w-28" />
        </div>
      </section>
    </main>
  );
}
