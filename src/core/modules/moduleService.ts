import { db } from "@/core/database";
import { AppModule } from "./types";

export async function getCompanyModules(companyId: string) {
  const { data, error } = await db
    .from("company_modules")
    .select(`
      enabled,
      modules (
        *
      )
    `)
    .eq("company_id", companyId)
    .eq("enabled", true);

  if (error) throw error;

  return data as any;
}