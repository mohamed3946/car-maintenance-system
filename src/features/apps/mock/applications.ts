import type {
  ApplicationCardData,
} from "../components/ApplicationCard";

export const applications: ApplicationCardData[] = [
  {
    id: "hungerstation",
    nameAr: "هنجرستيشن",
    nameEn: "HungerStation",
    shortName: "HS",
    descriptionAr:
      "إدارة قواعد العمل والأداء والتقييم الخاصة بمناديب هنجرستيشن.",
    descriptionEn:
      "Manage work rules, performance rules, and rider evaluations for HungerStation.",
    primaryColor: "#f59e0b",
    status: "active",
    ridersCount: 42,
    workRulesCount: 10,
    performanceRulesCount: 9,
    evaluationLevelsCount: 6,
  },
  {
    id: "keeta",
    nameAr: "كيتا",
    nameEn: "Keeta",
    shortName: "K",
    descriptionAr:
      "إدارة متطلبات التشغيل ومؤشرات الأداء ومستويات تقييم مناديب كيتا.",
    descriptionEn:
      "Manage operating requirements, performance indicators, and rider evaluation levels for Keeta.",
    primaryColor: "#facc15",
    status: "active",
    ridersCount: 18,
    workRulesCount: 9,
    performanceRulesCount: 8,
    evaluationLevelsCount: 6,
  },
  {
    id: "jahez",
    nameAr: "جاهز",
    nameEn: "Jahez",
    shortName: "J",
    descriptionAr:
      "تطبيق مضاف كمسودة لتجهيز قواعد العمل والأداء قبل التفعيل.",
    descriptionEn:
      "A draft application awaiting work and performance rule configuration.",
    primaryColor: "#dc2626",
    status: "draft",
    ridersCount: 0,
    workRulesCount: 0,
    performanceRulesCount: 0,
    evaluationLevelsCount: 0,
  },
];