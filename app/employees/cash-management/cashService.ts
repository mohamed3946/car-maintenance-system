import { supabase } from "../../lib/supabase";
import { CashTransactionType } from "./types";

export function getLocalDate() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export async function addCashTransaction({
  employeeId,
  type,
  amount,
  notes,
}: {
  employeeId: string;
  type: CashTransactionType;
  amount: number;
  notes?: string;
}) {
  return supabase.from("hunger_cash_transactions").insert({
    employee_id: employeeId,
    transaction_type: type,
    amount,
    notes: notes || null,
  });
}

export async function loadLastWalletReport() {
  return supabase
    .from("hunger_wallet_reports")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1);
}