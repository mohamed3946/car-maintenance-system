import { db } from "@/core/database";
import { Company } from "./types";

export async function getCompanyById(companyId: string) {
  return db
    .from("companies")
    .select("*")
    .eq("id", companyId)
    .single();
}

export async function createCompany(values: Partial<Company>) {
  return db
    .from("companies")
    .insert(values)
    .select()
    .single();
}

export async function updateCompany(
  companyId: string,
  values: Partial<Company>
) {
  return db
    .from("companies")
    .update(values)
    .eq("id", companyId)
    .select()
    .single();
}