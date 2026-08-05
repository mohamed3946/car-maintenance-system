import { calculateQualityBonus } from "./bonusCalculator";
import { checkHungerEligibility } from "./eligibility";
import { calculateKmResult } from "./kmCalculator";
import { batchToLevel, RiderLevel } from "./levelCalculator";

export type HungerAnalyzeInput = {
  employeeId?: string | null;
  riderPlatformId: string;
  riderName: string;
  workingDays: number;
  batchNumber: number;
  completedDeliveries: number;
  attendanceRate: number;
  acceptanceRate: number;
  contactRate: number;
  noShowPercent: number;
  workingHours: number;

  totalKm?: number;
  freeKm?: number;
};

export type HungerAnalyzeOutput = {
  employeeId?: string | null;
  platform: "hunger";
  riderPlatformId: string;
  riderName: string;
  workingDays: number;
  orders: number;
  workingHours: number;
  attendanceRate: number;
  acceptanceRate: number;
  contactRate: number;
  noShowPercent: number;

  batchNumber: number;
  level: RiderLevel;

  totalKm: number;
  payableKm: number;
  avgKm: number;

  qualityBonus: number;
  eligible: boolean;
  status: "eligible" | "not_eligible";
  reasons: string[];
};

export function analyzeHungerRider(
  input: HungerAnalyzeInput
): HungerAnalyzeOutput {
  const level = batchToLevel(Number(input.batchNumber || 6));

  const km = calculateKmResult(
    Number(input.totalKm || 0),
    Number(input.completedDeliveries || 0),
    Number(input.freeKm || 0)
  );

  const qualityBonus = calculateQualityBonus(
    Number(input.completedDeliveries || 0),
    level
  );

  const eligibility = checkHungerEligibility({
    completedDeliveries: Number(input.completedDeliveries || 0),
    attendanceRate: Number(input.attendanceRate || 0),
    acceptanceRate: Number(input.acceptanceRate || 0),
    contactRate: Number(input.contactRate || 0),
    noShowPercent: Number(input.noShowPercent || 0),
    level,
  });

  return {
    employeeId: input.employeeId || null,
    platform: "hunger",
    riderPlatformId: String(input.riderPlatformId || ""),
    riderName: input.riderName || "",

    orders: Number(input.completedDeliveries || 0),
    workingDays: Number(input.workingDays || 0),
    workingHours: Number(input.workingHours || 0),
    attendanceRate: Number(input.attendanceRate || 0),
    acceptanceRate: Number(input.acceptanceRate || 0),
    contactRate: Number(input.contactRate || 0),
    noShowPercent: Number(input.noShowPercent || 0),

    batchNumber: Number(input.batchNumber || 6),
    level,

    totalKm: km.totalKm,
    payableKm: km.payableKm,
    avgKm: km.averageKmPerOrder,

    qualityBonus,
    eligible: eligibility.eligible,
    status: eligibility.status,
    reasons: eligibility.reasons,
  };
}