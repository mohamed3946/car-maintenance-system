import { supabase } from "../../../lib/supabase";
type PlatformType = "hunger" | "keeta";

export type EmployeeResolveResult = {
  found: boolean;
  employeeId?: string;
  employeeName?: string;
  platformId: string;
};

export async function resolveEmployeeByPlatformId(
  platform: PlatformType,
  platformId: string
): Promise<EmployeeResolveResult> {
  const cleanId = String(platformId || "").trim();

  if (!cleanId) {
    return {
      found: false,
      platformId: "",
    };
  }

  const { data, error } = await supabase
    .from("employees")
    .select("id, name, platform_id, work_location, job_title")
    .eq("platform_id", cleanId)
    .limit(1);

  if (error || !data || data.length === 0) {
    return {
      found: false,
      platformId: cleanId,
    };
  }

  return {
    found: true,
    employeeId: data[0].id,
    employeeName: data[0].name,
    platformId: cleanId,
  };
}