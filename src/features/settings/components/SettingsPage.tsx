"use client";

import Link from "next/link";
import {
  AppWindow,
  Bell,
  Building2,
  DatabaseBackup,
  FileText,
  Globe2,
  Languages,
  Network,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Users,
} from "lucide-react";

import { useSystem } from "@/providers/SystemProvider";

type SettingsItem = {
  key: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  route: string;
  icon: React.ElementType;
  iconClass: string;
  iconBackground: string;
};

const settingsItems: SettingsItem[] = [
  {
    key: "company-profile",
    titleAr: "بيانات المؤسسة",
    titleEn: "Company Profile",
    descriptionAr:
      "تعديل اسم المؤسسة والشعار وبيانات التواصل والمعلومات الأساسية.",
    descriptionEn:
      "Manage company name, logo, contact details, and general information.",
    route: "/v2/settings/company-profile",
    icon: Building2,
    iconClass: "text-blue-700",
    iconBackground: "bg-blue-50",
  },
  {
    key: "applications",
    titleAr: "إعدادات التطبيقات",
    titleEn: "Application Settings",
    descriptionAr:
      "إضافة تطبيقات التوصيل وإدارة الشعارات وقواعد العمل والأداء والتقييم.",
    descriptionEn:
      "Add delivery applications and manage logos, work rules, performance, and evaluations.",
    route: "/v2/settings/apps",
    icon: AppWindow,
    iconClass: "text-violet-700",
    iconBackground: "bg-violet-50",
  },
  {
    key: "branches",
    titleAr: "الفروع",
    titleEn: "Branches",
    descriptionAr:
      "إدارة فروع المؤسسة والمدن ومواقع العمل التابعة لكل فرع.",
    descriptionEn:
      "Manage branches, cities, and work locations.",
    route: "/v2/settings/branches",
    icon: Network,
    iconClass: "text-cyan-700",
    iconBackground: "bg-cyan-50",
  },
  {
    key: "users",
    titleAr: "المستخدمون",
    titleEn: "Users",
    descriptionAr:
      "إضافة مستخدمي النظام وإدارة الحسابات والحالة الوظيفية.",
    descriptionEn:
      "Add system users and manage accounts and user status.",
    route: "/v2/settings/users",
    icon: Users,
    iconClass: "text-emerald-700",
    iconBackground: "bg-emerald-50",
  },
  {
    key: "roles",
    titleAr: "الصلاحيات",
    titleEn: "Roles & Permissions",
    descriptionAr:
      "إنشاء الأدوار وتحديد صلاحيات الوصول لكل مستخدم.",
    descriptionEn:
      "Create roles and control access permissions for each user.",
    route: "/v2/settings/roles",
    icon: ShieldCheck,
    iconClass: "text-amber-700",
    iconBackground: "bg-amber-50",
  },
  {
    key: "templates",
    titleAr: "القوالب",
    titleEn: "Templates",
    descriptionAr:
      "إدارة قوالب الإنذارات والرسائل والتقارير والطباعة.",
    descriptionEn:
      "Manage warning, message, report, and print templates.",
    route: "/v2/settings/templates",
    icon: FileText,
    iconClass: "text-orange-700",
    iconBackground: "bg-orange-50",
  },
  {
    key: "notifications",
    titleAr: "الإشعارات",
    titleEn: "Notifications",
    descriptionAr:
      "ضبط قنوات الإشعارات والتنبيهات وشروط إرسالها.",
    descriptionEn:
      "Configure notification channels, alerts, and delivery rules.",
    route: "/v2/settings/notifications",
    icon: Bell,
    iconClass: "text-red-700",
    iconBackground: "bg-red-50",
  },
  {
    key: "integrations",
    titleAr: "التكاملات",
    titleEn: "Integrations",
    descriptionAr:
      "ربط النظام بالخدمات الخارجية وواجهات البرمجة.",
    descriptionEn:
      "Connect the system with external services and APIs.",
    route: "/v2/settings/integrations",
    icon: Globe2,
    iconClass: "text-indigo-700",
    iconBackground: "bg-indigo-50",
  },
  {
    key: "languages",
    titleAr: "اللغات",
    titleEn: "Languages",
    descriptionAr:
      "إدارة اللغات والترجمات واتجاه العرض داخل النظام.",
    descriptionEn:
      "Manage languages, translations, and interface direction.",
    route: "/v2/settings/languages",
    icon: Languages,
    iconClass: "text-sky-700",
    iconBackground: "bg-sky-50",
  },
  {
    key: "backup",
    titleAr: "النسخ الاحتياطي",
    titleEn: "Backup",
    descriptionAr:
      "إدارة النسخ الاحتياطية واستعادة بيانات النظام.",
    descriptionEn:
      "Manage system backups and data restoration.",
    route: "/v2/settings/backup",
    icon: DatabaseBackup,
    iconClass: "text-teal-700",
    iconBackground: "bg-teal-50",
  },
  {
    key: "audit-log",
    titleAr: "سجل العمليات",
    titleEn: "Audit Log",
    descriptionAr:
      "متابعة التعديلات والإجراءات التي نفذها مستخدمو النظام.",
    descriptionEn:
      "Track system changes and actions performed by users.",
    route: "/v2/settings/audit-log",
    icon: Settings,
    iconClass: "text-slate-700",
    iconBackground: "bg-slate-100",
  },
  {
    key: "preferences",
    titleAr: "التفضيلات",
    titleEn: "Preferences",
    descriptionAr:
      "تخصيص إعدادات العرض والسلوك الافتراضي للنظام.",
    descriptionEn:
      "Customize display settings and default system behavior.",
    route: "/v2/settings/preferences",
    icon: SlidersHorizontal,
    iconClass: "text-fuchsia-700",
    iconBackground: "bg-fuchsia-50",
  },
];

export default function SettingsPage() {
  const { lang } = useSystem();
  const isArabic = lang === "ar";

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
            <Settings className="h-6 w-6" />
          </div>

          <div>
            <h1 className="text-2xl font-black text-slate-900">
              {isArabic ? "مركز الإعدادات" : "Settings Center"}
            </h1>

            <p className="mt-1 text-sm font-medium text-slate-500">
              {isArabic
                ? "إدارة إعدادات المؤسسة والتطبيقات والمستخدمين والتكاملات."
                : "Manage company, application, user, and integration settings."}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {settingsItems.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.key}
              href={item.route}
              className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
            >
              <div className="flex items-start gap-4">
                <div
                  className={[
                    "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl",
                    item.iconBackground,
                    item.iconClass,
                  ].join(" ")}
                >
                  <Icon className="h-6 w-6" />
                </div>

                <div className="min-w-0">
                  <h2 className="text-base font-black text-slate-900 transition group-hover:text-blue-700">
                    {isArabic ? item.titleAr : item.titleEn}
                  </h2>

                  <p className="mt-2 line-clamp-2 text-sm font-medium leading-6 text-slate-500">
                    {isArabic
                      ? item.descriptionAr
                      : item.descriptionEn}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}