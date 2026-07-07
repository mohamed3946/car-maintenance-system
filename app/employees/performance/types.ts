export type Platform = "keeta" | "hunger";

export type HungerRow = {
  id: number;
  name: string;
  batchNumber: number;
  completedDeliveries: number;
  attendanceRate: number;
  acceptanceRate: number;
  contactRate: number;
  noShowPercent: number;
  workingHours: number;
  totalKm: number;
  payableKm: number;
  avgKm: number;
};

export type KeetaRow = {
  id: number;
  name: string;
  orders: number;
  validDays: number;
  onTime: number;
  acceptance: number;
  status: "valid" | "invalid";
};
export type PerformanceRecord = {
  id: string;
  employee_id: string | null;
  platform: "hunger" | "keeta";
  report_month: string;
  report_date: string;

  rider_platform_id: string | null;
  rider_name: string | null;

  orders: number;
  working_hours: number;
  attendance_rate: number;
  acceptance_rate: number;
  contact_rate: number;
  no_show_percent: number;

  batch_number: number | null;
  level: string | null;

  total_km: number;
  payable_km: number;
  avg_km: number;

  valid_days: number;
  on_time_rate: number;

  quality_bonus: number;
  eligible: boolean;
  status: string;
  eligibility_reasons: string[] | null;
};