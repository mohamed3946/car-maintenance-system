import { checkKeetaEligibility } from "./eligibility";

export type KeetaAnalyzeInput = {
  employeeId?: string | null;

  riderPlatformId: string;
  riderName: string;

  orders: number;
  validDays: number;
  onTime: number;
  acceptance: number;
};

export type KeetaAnalyzeOutput = {
  employeeId?: string | null;

  platform: "keeta";

  riderPlatformId: string;
  riderName: string;

  orders: number;
  validDays: number;
  onTime: number;
  acceptance: number;

  eligible: boolean;
  status: "eligible" | "not_eligible";

  reasons: string[];
};

export function analyzeKeetaRider(
  input: KeetaAnalyzeInput
): KeetaAnalyzeOutput {

  const eligibility = checkKeetaEligibility({

    orders: Number(input.orders || 0),

    validDays: Number(input.validDays || 0),

    onTime: Number(input.onTime || 0),

    acceptance: Number(input.acceptance || 0),

  });

  return {

    employeeId: input.employeeId || null,

    platform: "keeta",

    riderPlatformId: String(input.riderPlatformId || ""),

    riderName: input.riderName || "",

    orders: Number(input.orders || 0),

    validDays: Number(input.validDays || 0),

    onTime: Number(input.onTime || 0),

    acceptance: Number(input.acceptance || 0),

    eligible: eligibility.eligible,

    status: eligibility.status,

    reasons: eligibility.reasons,

  };
}