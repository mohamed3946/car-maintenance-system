import {
  BarChart3,
  Building2,
  FileText,
  Gauge,
  Settings,
  Truck,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";

export type NavigationChild = {
  key: string;
  labelAr: string;
  labelEn: string;
  route: string;
};

export type NavigationSection = {
  key: string;
  labelAr: string;
  labelEn: string;
  route: string;
  icon: LucideIcon;
  children: NavigationChild[];
};

export const navigationSections: NavigationSection[] = [
  {
    key: "dashboard",
    labelAr: "لوحة التحكم",
    labelEn: "Dashboard",
    route: "/v2/dashboard",
    icon: Gauge,
    children: [
      {
        key: "overview",
        labelAr: "نظرة عامة",
        labelEn: "Overview",
        route: "/v2/dashboard",
      },
      {
        key: "performance-indicators",
        labelAr: "مؤشرات الأداء",
        labelEn: "Performance Indicators",
        route: "/v2/dashboard/performance-indicators",
      },
      {
        key: "tasks",
        labelAr: "المهام",
        labelEn: "Tasks",
        route: "/v2/dashboard/tasks",
      },
      {
        key: "alerts",
        labelAr: "التنبيهات",
        labelEn: "Alerts",
        route: "/v2/dashboard/alerts",
      },
      {
        key: "calendar",
        labelAr: "التقويم",
        labelEn: "Calendar",
        route: "/v2/dashboard/calendar",
      },
    ],
  },

  {
  key: "operations",
  labelAr: "التشغيل",
  labelEn: "Operations",
  route: "/v2/operations",
  icon: BarChart3,
  children: [
    {
      key: "operations-dashboard",
      labelAr: "لوحة التشغيل",
      labelEn: "Operations Dashboard",
      route: "/v2/operations",
    },
    {
      key: "apps",
      labelAr: "التطبيقات",
      labelEn: "Applications",
      route: "/v2/operations/apps",
    },
    {
      key: "performance",
      labelAr: "الأداء",
      labelEn: "Performance",
      route: "/v2/operations/performance",
    },
    {
      key: "riders",
      labelAr: "المناديب",
      labelEn: "Riders",
      route: "/v2/operations/riders",
    },
    {
      key: "orders",
      labelAr: "الطلبات",
      labelEn: "Orders",
      route: "/v2/operations/orders",
    },
    {
      key: "cash-settlements",
      labelAr: "الكاش والتسويات",
      labelEn: "Cash & Settlements",
      route: "/v2/operations/cash-settlements",
    },
  ],
},

 {
  key: "hr",
  labelAr: "الموارد البشرية",
  labelEn: "Human Resources",
  route: "/v2/hr",
  icon: Users,
  children: [
    {
      key: "hr-dashboard",
      labelAr: "لوحة الموارد البشرية",
      labelEn: "HR Dashboard",
      route: "/v2/hr",
    },
    {
      key: "employees",
      labelAr: "الموظفون",
      labelEn: "Employees",
      route: "/v2/hr/employees",
    },
    {
      key: "attendance",
      labelAr: "الحضور والانصراف",
      labelEn: "Attendance",
      route: "/v2/hr/attendance",
    },
    {
      key: "payroll",
      labelAr: "الرواتب",
      labelEn: "Payroll",
      route: "/v2/hr/payroll",
    },
    {
      key: "legal-affairs",
      labelAr: "الشؤون القانونية",
      labelEn: "Legal Affairs",
      route: "/v2/hr/legal-affairs",
    },
    {
      key: "hr-reports",
      labelAr: "تقارير الموارد البشرية",
      labelEn: "HR Reports",
      route: "/v2/hr/reports",
    },
    {
      key: "hr-settings",
      labelAr: "إعدادات الموارد البشرية",
      labelEn: "HR Settings",
      route: "/v2/hr/settings",
    },
  ],
},

  {
    key: "fleet",
    labelAr: "الأسطول",
    labelEn: "Fleet",
    route: "/v2/fleet",
    icon: Truck,
    children: [
      {
        key: "vehicles",
        labelAr: "المركبات",
        labelEn: "Vehicles",
        route: "/v2/fleet/vehicles",
      },
      {
        key: "maintenance",
        labelAr: "الصيانة",
        labelEn: "Maintenance",
        route: "/v2/fleet/maintenance",
      },
      {
        key: "inspections",
        labelAr: "الفحص الدوري",
        labelEn: "Periodic Inspections",
        route: "/v2/fleet/inspections",
      },
      {
        key: "oil-changes",
        labelAr: "تغيير الزيوت",
        labelEn: "Oil Changes",
        route: "/v2/fleet/oil-changes",
      },
      {
        key: "accidents",
        labelAr: "الحوادث",
        labelEn: "Accidents",
        route: "/v2/fleet/accidents",
      },
      {
        key: "tires",
        labelAr: "الإطارات",
        labelEn: "Tires",
        route: "/v2/fleet/tires",
      },
      {
        key: "insurance",
        labelAr: "التأمين",
        labelEn: "Insurance",
        route: "/v2/fleet/insurance",
      },
      {
        key: "licenses",
        labelAr: "التراخيص",
        labelEn: "Licenses",
        route: "/v2/fleet/licenses",
      },
      {
        key: "spare-parts",
        labelAr: "قطع الغيار",
        labelEn: "Spare Parts",
        route: "/v2/fleet/spare-parts",
      },
      {
        key: "vehicle-record",
        labelAr: "سجل المركبة",
        labelEn: "Vehicle Record",
        route: "/v2/fleet/vehicle-record",
      },
    ],
  },

  {
    key: "finance",
    labelAr: "المالية",
    labelEn: "Finance",
    route: "/v2/finance",
    icon: Wallet,
    children: [
      {
        key: "revenues",
        labelAr: "الإيرادات",
        labelEn: "Revenues",
        route: "/v2/finance/revenues",
      },
      {
        key: "expenses",
        labelAr: "المصروفات",
        labelEn: "Expenses",
        route: "/v2/finance/expenses",
      },
      {
        key: "journal-entries",
        labelAr: "القيود اليومية",
        labelEn: "Journal Entries",
        route: "/v2/finance/journal-entries",
      },
      {
        key: "accounts",
        labelAr: "الحسابات",
        labelEn: "Accounts",
        route: "/v2/finance/accounts",
      },
      {
        key: "customers",
        labelAr: "العملاء",
        labelEn: "Customers",
        route: "/v2/finance/customers",
      },
      {
        key: "suppliers",
        labelAr: "الموردون",
        labelEn: "Suppliers",
        route: "/v2/finance/suppliers",
      },
      {
        key: "invoices",
        labelAr: "الفواتير",
        labelEn: "Invoices",
        route: "/v2/finance/invoices",
      },
      {
        key: "receivables",
        labelAr: "الذمم المدينة",
        labelEn: "Accounts Receivable",
        route: "/v2/finance/receivables",
      },
      {
        key: "payables",
        labelAr: "الذمم الدائنة",
        labelEn: "Accounts Payable",
        route: "/v2/finance/payables",
      },
      {
        key: "cashbox",
        labelAr: "الصندوق",
        labelEn: "Cashbox",
        route: "/v2/finance/cashbox",
      },
      {
        key: "banks",
        labelAr: "البنوك",
        labelEn: "Banks",
        route: "/v2/finance/banks",
      },
      {
        key: "assets",
        labelAr: "الأصول",
        labelEn: "Assets",
        route: "/v2/finance/assets",
      },
      {
        key: "balance-sheet",
        labelAr: "الميزانية",
        labelEn: "Balance Sheet",
        route: "/v2/finance/balance-sheet",
      },
    ],
  },

  {
    key: "reports",
    labelAr: "التقارير والتحليلات",
    labelEn: "Reports & Analytics",
    route: "/v2/reports",
    icon: FileText,
    children: [
      {
        key: "operations-reports",
        labelAr: "تقارير التشغيل",
        labelEn: "Operations Reports",
        route: "/v2/reports/operations",
      },
      {
        key: "riders-reports",
        labelAr: "تقارير المناديب",
        labelEn: "Riders Reports",
        route: "/v2/reports/riders",
      },
      {
        key: "employees-reports",
        labelAr: "تقارير الموظفين",
        labelEn: "Employees Reports",
        route: "/v2/reports/employees",
      },
      {
        key: "fleet-reports",
        labelAr: "تقارير الأسطول",
        labelEn: "Fleet Reports",
        route: "/v2/reports/fleet",
      },
      {
        key: "financial-reports",
        labelAr: "التقارير المالية",
        labelEn: "Financial Reports",
        route: "/v2/reports/finance",
      },
      {
        key: "kpis",
        labelAr: "مؤشرات الأداء",
        labelEn: "KPIs",
        route: "/v2/reports/kpis",
      },
      {
        key: "statistics",
        labelAr: "الإحصائيات",
        labelEn: "Statistics",
        route: "/v2/reports/statistics",
      },
      {
        key: "exports",
        labelAr: "تصدير البيانات",
        labelEn: "Data Export",
        route: "/v2/reports/exports",
      },
    ],
  },

  {
    key: "subscription",
    labelAr: "الاشتراك",
    labelEn: "Subscription",
    route: "/v2/subscription",
    icon: Building2,
    children: [
      {
        key: "subscription-details",
        labelAr: "بيانات الاشتراك",
        labelEn: "Subscription Details",
        route: "/v2/subscription/details",
      },
      {
        key: "current-plan",
        labelAr: "الباقة الحالية",
        labelEn: "Current Plan",
        route: "/v2/subscription/current-plan",
      },
      {
        key: "upgrade-plan",
        labelAr: "ترقية الباقة",
        labelEn: "Upgrade Plan",
        route: "/v2/subscription/upgrade",
      },
      {
        key: "subscription-invoices",
        labelAr: "الفواتير",
        labelEn: "Invoices",
        route: "/v2/subscription/invoices",
      },
      {
        key: "payments",
        labelAr: "المدفوعات",
        labelEn: "Payments",
        route: "/v2/subscription/payments",
      },
      {
        key: "billing-history",
        labelAr: "سجل الفواتير",
        labelEn: "Billing History",
        route: "/v2/subscription/billing-history",
      },
      {
        key: "system-usage",
        labelAr: "استهلاك النظام",
        labelEn: "System Usage",
        route: "/v2/subscription/usage",
      },
    ],
  },

  {
  key: "settings",
  labelAr: "الإعدادات",
  labelEn: "Settings",
  route: "/v2/settings",
  icon: Settings,
  children: [
    {
      key: "settings-home",
      labelAr: "مركز الإعدادات",
      labelEn: "Settings Center",
      route: "/v2/settings",
    },
  ],
},
];