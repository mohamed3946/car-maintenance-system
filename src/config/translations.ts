export type Lang = "ar" | "en";

export const translations = {
  ar: {
    appName: "DeliveryOS",
    erpPlatform: "منصة إدارة التوصيل",
    dashboard: "لوحة التحكم",
    operations: "التشغيل",
    hr: "الموارد البشرية",
    fleet: "الأسطول",
    finance: "المالية",
    reports: "التقارير",
    settings: "الإعدادات",
    search: "بحث...",
    searchModules: "ابحث في الأقسام...",
    notifications: "مركز الإشعارات",
    logout: "تسجيل الخروج",
    generalManager: "المدير العام",
    systemManager: "مدير النظام",
  },
  en: {
    appName: "DeliveryOS",
    erpPlatform: "Delivery Management Platform",
    dashboard: "Dashboard",
    operations: "Operations",
    hr: "Human Resources",
    fleet: "Fleet",
    finance: "Finance",
    reports: "Reports",
    settings: "Settings",
    search: "Search...",
    searchModules: "Search modules...",
    notifications: "Notifications",
    logout: "Logout",
    generalManager: "General Manager",
    systemManager: "System Manager",
  },
};

export function getTranslation(lang: Lang) {
  return translations[lang];
}