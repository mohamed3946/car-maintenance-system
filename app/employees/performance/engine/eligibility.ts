export type PlatformType = "hunger" | "keeta";

export type EligibilityReason =
  | "LOW_ATTENDANCE"
  | "LOW_ACCEPTANCE"
  | "LOW_CONTACT"
  | "HIGH_NO_SHOW"
  | "LOW_ORDERS"
  | "LOW_VALID_DAYS"
  | "LOW_ON_TIME"
  | "LEVEL_F";

export type EligibilityResult = {
  eligible: boolean;
  reasons: EligibilityReason[];
  status: "eligible" | "not_eligible";
};

export type HungerEligibilityInput = {
  completedDeliveries: number;
  attendanceRate: number;
  acceptanceRate: number;
  contactRate: number;
  noShowPercent: number;
  level: string;
};

export type KeetaEligibilityInput = {
  orders: number;
  validDays: number;
  onTime: number;
  acceptance: number;
};

export function checkHungerEligibility(
  input: HungerEligibilityInput
): EligibilityResult {
  const reasons: EligibilityReason[] = [];

  if (input.completedDeliveries < 300) {
    reasons.push("LOW_ORDERS");
  }

  if (input.attendanceRate < 90) {
    reasons.push("LOW_ATTENDANCE");
  }

  if (input.acceptanceRate < 85) {
    reasons.push("LOW_ACCEPTANCE");
  }

  if (input.contactRate < 90) {
    reasons.push("LOW_CONTACT");
  }

  if (input.noShowPercent >= 10) {
    reasons.push("HIGH_NO_SHOW");
  }

  if (input.level === "F") {
    reasons.push("LEVEL_F");
  }

  return {
    eligible: reasons.length === 0,
    reasons,
    status: reasons.length === 0 ? "eligible" : "not_eligible",
  };
}

export function checkKeetaEligibility(
  input: KeetaEligibilityInput
): EligibilityResult {
  const reasons: EligibilityReason[] = [];

  if (input.orders < 300) {
    reasons.push("LOW_ORDERS");
  }

  if (input.validDays < 26) {
    reasons.push("LOW_VALID_DAYS");
  }

  if (input.onTime < 90) {
    reasons.push("LOW_ON_TIME");
  }

  if (input.acceptance < 90) {
    reasons.push("LOW_ACCEPTANCE");
  }

  return {
    eligible: reasons.length === 0,
    reasons,
    status: reasons.length === 0 ? "eligible" : "not_eligible",
  };
}

export function eligibilityReasonLabel(
  reason: EligibilityReason,
  isArabic: boolean
) {
  const labels: Record<EligibilityReason, { ar: string; en: string }> = {
    LOW_ATTENDANCE: {
      ar: "الحضور أقل من المطلوب",
      en: "Low attendance",
    },
    LOW_ACCEPTANCE: {
      ar: "القبول أقل من المطلوب",
      en: "Low acceptance",
    },
    LOW_CONTACT: {
      ar: "التواصل أقل من المطلوب",
      en: "Low contact rate",
    },
    HIGH_NO_SHOW: {
      ar: "نسبة No Show مرتفعة",
      en: "High No Show",
    },
    LOW_ORDERS: {
      ar: "عدد الطلبات أقل من المطلوب",
      en: "Low orders",
    },
    LOW_VALID_DAYS: {
      ar: "الأيام الصالحة أقل من المطلوب",
      en: "Low valid days",
    },
    LOW_ON_TIME: {
      ar: "التسليم في الوقت أقل من المطلوب",
      en: "Low on-time rate",
    },
    LEVEL_F: {
      ar: "المستوى F",
      en: "Level F",
    },
  };

  return isArabic ? labels[reason].ar : labels[reason].en;
}