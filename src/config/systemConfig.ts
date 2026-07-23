import {
  BarChart3,
  Car,
  FileText,
  Home,
  Settings,
  Users,
  Wallet,
} from "lucide-react";

export type AppLanguage = "ar" | "en";

export const systemConfig = {
  app: {
    name: "DeliveryOS",
    version: "2.0 Commercial",
    defaultLanguage: "ar" as AppLanguage,
  },

  layout: {
    sidebarWidth: 290,
    laptopSidebarWidth: 260,
    maxContentWidth: 1600,
    headerHeight: 78,
  },

  theme: {
    colors: {
      primary: "#2563EB",
      primaryHover: "#1D4ED8",

      sidebarFrom: "#062B4F",
      sidebarVia: "#042644",
      sidebarTo: "#02182E",

      background: "#F4F7FC",
      card: "#FFFFFF",
      border: "#E4EAF2",

      text: "#0F2544",
      mutedText: "#64748B",

      success: "#16A34A",
      warning: "#F97316",
      danger: "#DC2626",
      info: "#0891B2",
    },

    radius: {
      button: "14px",
      input: "14px",
      card: "22px",
      panel: "28px",
    },

    shadow: {
      card: "0 4px 18px rgba(15, 37, 68, 0.06)",
      hover: "0 12px 32px rgba(15, 37, 68, 0.12)",
      sidebar: "0 20px 50px rgba(2, 24, 46, 0.25)",
    },
  },

  translations: {
    ar: {
      direction: "rtl",

      dashboard: "لوحة التحكم",
      operations: "التشغيل",
      humanResources: "الموارد البشرية",
      fleet: "إدارة الأسطول",
      finance: "المالية",
      reports: "التقارير",
      settings: "الإعدادات",

      search: "ابحث عن طلب، مندوب أو مركبة...",
      searchModules: "ابحث في الأقسام...",

      notifications: "مركز الإشعارات",
      logout: "تسجيل الخروج",

      generalManager: "المدير العام",
      systemManager: "مدير النظام",

      totalRevenue: "إجمالي الإيرادات",
      totalOrders: "إجمالي الطلبات",
      totalRiders: "إجمالي المناديب",
      totalVehicles: "إجمالي المركبات",
      openMaintenance: "الصيانة المفتوحة",
      performanceIndex: "مؤشر الأداء",

      quickActions: "إجراءات سريعة",
      recentActivity: "النشاطات الأخيرة",
      fleetStatus: "حالة الأسطول",
      revenueChart: "الإيرادات خلال آخر 6 أشهر",
      ordersChart: "الطلبات خلال آخر 6 أشهر",
    },

    en: {
      direction: "ltr",

      dashboard: "Dashboard",
      operations: "Operations",
      humanResources: "Human Resources",
      fleet: "Fleet Management",
      finance: "Finance",
      reports: "Reports",
      settings: "Settings",

      search: "Search orders, riders or vehicles...",
      searchModules: "Search modules...",

      notifications: "Notification Center",
      logout: "Logout",

      generalManager: "General Manager",
      systemManager: "System Manager",

      totalRevenue: "Total Revenue",
      totalOrders: "Total Orders",
      totalRiders: "Total Riders",
      totalVehicles: "Total Vehicles",
      openMaintenance: "Open Maintenance",
      performanceIndex: "Performance Index",

      quickActions: "Quick Actions",
      recentActivity: "Recent Activity",
      fleetStatus: "Fleet Status",
      revenueChart: "Revenue During Last 6 Months",
      ordersChart: "Orders During Last 6 Months",
    },
  },

  navigation: [
    {
      code: "dashboard",
      route: "/v2/dashboard",
      translationKey: "dashboard",
      icon: Home,
      alwaysVisible: true,
    },
    {
      code: "operations",
      route: "/v2/operations",
      translationKey: "operations",
      icon: BarChart3,
      alwaysVisible: false,
    },
    {
      code: "hr",
      route: "/v2/hr",
      translationKey: "humanResources",
      icon: Users,
      alwaysVisible: false,
    },
    {
      code: "fleet",
      route: "/v2/fleet",
      translationKey: "fleet",
      icon: Car,
      alwaysVisible: false,
    },
    {
      code: "finance",
      route: "/v2/finance",
      translationKey: "finance",
      icon: Wallet,
      alwaysVisible: false,
    },
    {
      code: "reports",
      route: "/v2/reports",
      translationKey: "reports",
      icon: FileText,
      alwaysVisible: false,
    },
    {
      code: "settings",
      route: "/v2/settings",
      translationKey: "settings",
      icon: Settings,
      alwaysVisible: true,
    },
  ],
} as const;

export function getSystemTranslation(language: AppLanguage) {
  return systemConfig.translations[language];
}