import { supabase } from "../../lib/supabase";
import { getLocalDate } from "./cashService";

export function cleanNumber(value: any) {
  return Number(String(value || "0").replace(/[^\d.-]/g, "")) || 0;
}

export function parseCsv(text: string) {
  const lines = text.split(/\r?\n/).filter((line) => line.trim());
  if (lines.length < 2) return [];

  const headers = splitCsvLine(lines[0]).map((h) => h.trim());

  return lines.slice(1).map((line) => {
    const values = splitCsvLine(line);
    const row: Record<string, string> = {};

    headers.forEach((header, index) => {
      row[header] = values[index]?.trim() || "";
    });

    return row;
  });
}

function splitCsvLine(line: string) {
  const result: string[] = [];
  let current = "";
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      insideQuotes = !insideQuotes;
    } else if (char === "," && !insideQuotes) {
      result.push(current.replace(/^"|"$/g, ""));
      current = "";
    } else {
      current += char;
    }
  }

  result.push(current.replace(/^"|"$/g, ""));
  return result;
}

export function findColumn(row: Record<string, string>, names: string[]) {
  const keys = Object.keys(row);

  return keys.find((key) =>
    names.some(
      (name) => key.toLowerCase().trim() === name.toLowerCase().trim()
    )
  );
}

export async function uploadWalletReport(file: File) {
  const today = getLocalDate();
  const content = await file.text();
  const rows = parseCsv(content);

  if (!rows.length) {
    throw new Error("EMPTY_FILE");
  }

  const riderIdKey = findColumn(rows[0], [
    "Rider Id",
    "Rider ID",
    "rider_id",
    "Rider",
  ]);

  const walletKey = findColumn(rows[0], [
    "Current Wallet",
    "Wallet Balance",
    "current_wallet",
  ]);

  if (!riderIdKey || !walletKey) {
    throw new Error("MISSING_COLUMNS");
  }

  const { data: employees, error: employeesError } = await supabase
    .from("employees")
    .select("id, platform_id")
    .not("platform_id", "is", null);

  if (employeesError) {
    throw employeesError;
  }

  let matched = 0;

  for (const row of rows) {
    const riderId = String(row[riderIdKey] || "").trim();
    const walletValue = cleanNumber(row[walletKey]);

    if (!riderId) continue;

    const employee = employees?.find(
      (e: any) => String(e.platform_id || "").trim() === riderId
    );

    if (!employee) continue;

    matched++;

    const { error } = await supabase.from("hunger_cash_wallets").upsert(
      {
        employee_id: employee.id,
        wallet_balance: walletValue,
        report_date: today,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "employee_id" }
    );

    if (error) throw error;
  }

  const { error: reportError } = await supabase
    .from("hunger_wallet_reports")
    .insert({
      report_date: today,
      file_name: file.name,
      uploaded_rows: rows.length,
      matched_rows: matched,
      uploaded_by: "system",
    });

  if (reportError) throw reportError;

  return {
    uploadedRows: rows.length,
    matchedRows: matched,
    reportDate: today,
  };
}