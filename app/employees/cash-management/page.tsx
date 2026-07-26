"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";

import AppLayout, { useLanguage } from "../../../components/AppLayout";
import { supabase } from "../../lib/supabase";

import DashboardCards from "./components/DashboardCards";
import UploadReportCard from "./components/UploadReportCard";
import RidersTable from "./components/RidersTable";
import CashDialog from "./components/CashDialog";
import TransactionHistoryDialog from "./components/TransactionHistoryDialog";

import { CashRider, WalletReport } from "./types";
import {
  addCashTransaction,
  getLocalDate,
  loadLastWalletReport,
} from "./cashService";
import { uploadWalletReport } from "./reportService";

type HistoryTransaction = {
  id: string;
  transaction_type: "cash_receive" | "wallet_deposit";
  amount: number;
  notes: string | null;
  created_at: string;
};

export default function CashManagementPage() {
  return (
    <AppLayout
      system="employees"
      title="إدارة الكاش"
      subtitle="متابعة توريد الكاش وتعبئة محافظ المناديب"
    >
      <CashManagementContent />
    </AppLayout>
  );
}

function CashManagementContent() {
  const { lang } = useLanguage();
  const isArabic = lang === "ar";
  const today = getLocalDate();

  const [query, setQuery] = useState("");
  const [riders, setRiders] = useState<CashRider[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [lastReport, setLastReport] = useState<WalletReport | null>(null);
  const [selectedRider, setSelectedRider] = useState<CashRider | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyRiderName, setHistoryRiderName] = useState("");
  const [historyTransactions, setHistoryTransactions] = useState<HistoryTransaction[]>([]);

  const reportUploadedToday = lastReport?.reportDate === today;

  const totalCash = riders.reduce((sum, r) => sum + r.cashReceived, 0);
  const totalDeposit = riders.reduce((sum, r) => sum + r.walletDeposit, 0);
  const companyBalance = totalCash - totalDeposit;

  const dashboardText = {
    totalCash: isArabic ? "إجمالي الكاش المستلم اليوم" : "Today Cash Received",
    totalDeposit: isArabic ? "إجمالي المودع بالمحافظ اليوم" : "Today Wallet Deposits",
    companyBalance: isArabic ? "رصيد الكاش اليوم" : "Today Cash Balance",
    ridersCount: isArabic ? "عدد المناديب" : "Riders",
  };

  useEffect(() => {
    loadPageData();
  }, []);

  async function loadPageData() {
    setLoading(true);

    const start = `${today}T00:00:00`;
    const end = `${today}T23:59:59`;

    const { data: employees, error: employeesError } = await supabase
      .from("employees")
      .select("id, name, phone, platform_id, work_location, job_title")
      .or(
        "work_location.eq.HungerStation,job_title.eq.hungerCourier,job_title.eq.مندوب هنجرستيشن,job_title.eq.مندوب هنقرستيشن"
      )
      .order("name", { ascending: true });

    if (employeesError) {
      console.error("LOAD RIDERS ERROR:", employeesError);
      alert(isArabic ? "فشل تحميل مناديب هنجر" : "Failed to load HungerStation riders");
      setLoading(false);
      return;
    }

    const employeeIds = (employees || []).map((e: any) => e.id);

    const safeIds =
      employeeIds.length > 0
        ? employeeIds
        : ["00000000-0000-0000-0000-000000000000"];

    const { data: wallets } = await supabase
      .from("hunger_cash_wallets")
      .select("employee_id, wallet_balance, report_date")
      .in("employee_id", safeIds);

    const { data: transactions } = await supabase
      .from("hunger_cash_transactions")
      .select("employee_id, transaction_type, amount, created_at")
      .gte("created_at", start)
      .lte("created_at", end)
      .in("employee_id", safeIds);

    const { data: reportData } = await loadLastWalletReport();

    const ridersData: CashRider[] = (employees || []).map((item: any) => {
      const wallet = wallets?.find((w: any) => w.employee_id === item.id);
      const riderTransactions =
        transactions?.filter((t: any) => t.employee_id === item.id) || [];

      const cashReceived = riderTransactions
        .filter((t: any) => t.transaction_type === "cash_receive")
        .reduce((sum: number, t: any) => sum + Number(t.amount || 0), 0);

      const walletDeposit = riderTransactions
        .filter((t: any) => t.transaction_type === "wallet_deposit")
        .reduce((sum: number, t: any) => sum + Number(t.amount || 0), 0);

      return {
        id: item.id,
        name: item.name || "",
        hungerId: item.platform_id || "",
        phone: item.phone || "",
        walletBalance: Number(wallet?.wallet_balance || 0),
        cashReceived,
        walletDeposit,
        remaining: cashReceived - walletDeposit,
      };
    });

    setRiders(ridersData);

    const latestReport = reportData?.[0];

    setLastReport(
      latestReport
        ? {
            id: latestReport.id,
            reportDate: latestReport.report_date,
            fileName: latestReport.file_name,
            uploadedRows: latestReport.uploaded_rows || 0,
            matchedRows: latestReport.matched_rows || 0,
            uploadedBy: latestReport.uploaded_by,
            createdAt: latestReport.created_at,
          }
        : null
    );

    setLoading(false);
  }

  async function handleUploadReport(file: File) {
    setUploading(true);

    try {
      await uploadWalletReport(file);
      alert(isArabic ? "تم رفع التقرير بنجاح" : "Report uploaded successfully");
      await loadPageData();
    } catch (error: any) {
      console.error("UPLOAD REPORT ERROR:", error);

      if (error?.message === "EMPTY_FILE") {
        alert(isArabic ? "الملف فارغ أو غير صحيح" : "Empty or invalid file");
      } else if (error?.message === "MISSING_COLUMNS") {
        alert(
          isArabic
            ? "لم يتم العثور على أعمدة Rider Id و Current Wallet"
            : "Could not find Rider Id and Current Wallet columns"
        );
      } else {
        alert(isArabic ? "فشل رفع التقرير" : "Failed to upload report");
      }
    }

    setUploading(false);
  }

  function openCashDialog(rider: CashRider) {
    setSelectedRider(rider);
    setDialogOpen(true);
  }

  async function openTransactionHistory(rider: CashRider) {
    setHistoryOpen(true);
    setHistoryLoading(true);
    setHistoryRiderName(`${rider.name} - ${rider.hungerId || "-"}`);
    setSelectedRider(rider);
    setHistoryTransactions([]);

    const { data, error } = await supabase
      .from("hunger_cash_transactions")
      .select("id, transaction_type, amount, notes, created_at")
      .eq("employee_id", rider.id)
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      console.error("LOAD HISTORY ERROR:", error);
      alert(isArabic ? "فشل تحميل سجل العمليات" : "Failed to load transaction history");
      setHistoryLoading(false);
      return;
    }

    setHistoryTransactions((data || []) as HistoryTransaction[]);
    setHistoryLoading(false);
  }

  async function saveCashOperation(data: {
    cashAmount: number;
    depositAmount: number;
    notes: string;
  }) {
    if (!selectedRider) return;

    setSaving(true);

    try {
      if (data.cashAmount > 0) {
        const { error } = await addCashTransaction({
          employeeId: selectedRider.id,
          type: "cash_receive",
          amount: data.cashAmount,
          notes: data.notes,
        });

        if (error) throw error;
      }

      if (data.depositAmount > 0) {
        const { error } = await addCashTransaction({
          employeeId: selectedRider.id,
          type: "wallet_deposit",
          amount: data.depositAmount,
          notes: data.notes,
        });

        if (error) throw error;

        const newWalletBalance =
          Number(selectedRider.walletBalance || 0) + Number(data.depositAmount || 0);

        const { error: walletError } = await supabase
          .from("hunger_cash_wallets")
          .upsert(
            {
              employee_id: selectedRider.id,
              wallet_balance: newWalletBalance,
              report_date: today,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "employee_id" }
          );

        if (walletError) throw walletError;
      }

      setDialogOpen(false);
      setSelectedRider(null);

      alert(isArabic ? "تم حفظ العملية" : "Operation saved");
      await loadPageData();
    } catch (error) {
      console.error("SAVE CASH ERROR:", error);
      alert(isArabic ? "فشل حفظ العملية" : "Failed to save operation");
    }

    setSaving(false);
  }

  async function editTransaction(data: {
  id: string;
  oldAmount: number;
  newAmount: number;
  notes: string;
  transactionType: "cash_receive" | "wallet_deposit";
}) {
  if (!selectedRider) return;

  try {
    const { error } = await supabase
      .from("hunger_cash_transactions")
      .update({
        amount: data.newAmount,
        notes: data.notes || null,
      })
      .eq("id", data.id);

    if (error) throw error;

    // إذا كانت العملية تعبئة محفظة نعدل رصيد المحفظة بالفرق
    if (data.transactionType === "wallet_deposit") {
      const difference = data.newAmount - data.oldAmount;

      const { data: wallet } = await supabase
        .from("hunger_cash_wallets")
        .select("wallet_balance")
        .eq("employee_id", selectedRider.id)
        .single();

      const currentBalance = Number(wallet?.wallet_balance || 0);

      const { error: walletError } = await supabase
        .from("hunger_cash_wallets")
        .update({
          wallet_balance: currentBalance + difference,
          updated_at: new Date().toISOString(),
        })
        .eq("employee_id", selectedRider.id);

      if (walletError) throw walletError;
    }

    alert(isArabic ? "تم تعديل العملية بنجاح" : "Transaction updated successfully");

    await openTransactionHistory(selectedRider);
    await loadPageData();
  } catch (err) {
    console.error(err);
    alert(isArabic ? "فشل تعديل العملية" : "Failed to update transaction");
  }
}

  function exportCsv() {
    const filtered = riders.filter((rider) => {
      const searchText = `${rider.name} ${rider.hungerId}`.toLowerCase();
      return searchText.includes(query.toLowerCase());
    });

    const headers = isArabic
      ? ["المندوب", "رقم هنجر", "رصيد المحفظة", "ورد اليوم", "أودعت له", "رصيد الكاش"]
      : ["Rider", "Hunger ID", "Wallet Balance", "Cash Received", "Wallet Deposit", "Cash Balance"];

    const rows = filtered.map((rider) => [
      rider.name,
      rider.hungerId,
      rider.walletBalance,
      rider.cashReceived,
      rider.walletDeposit,
      rider.remaining,
    ]);

    const csv = [
      headers.join(";"),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(";")
      ),
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `cash-management-${today}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-[#0f2544]">
            {isArabic ? "إدارة الكاش" : "Cash Management"}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {isArabic
              ? "متابعة توريد الكاش وتعبئة محافظ المناديب"
              : "Track cash collection and rider wallet deposits"}
          </p>
        </div>

        <button
          onClick={exportCsv}
          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-extrabold text-slate-700 shadow-sm hover:bg-slate-50"
        >
          <Download className="h-5 w-5" />
          {isArabic ? "تصدير" : "Export"}
        </button>
      </div>

      <UploadReportCard
        isArabic={isArabic}
        reportUploadedToday={reportUploadedToday}
        uploading={uploading}
        lastReport={lastReport}
        onUpload={handleUploadReport}
      />

      <DashboardCards
        totalCash={totalCash}
        totalDeposit={totalDeposit}
        companyBalance={companyBalance}
        ridersCount={riders.length}
        text={dashboardText}
      />

      <RidersTable
        isArabic={isArabic}
        query={query}
        setQuery={setQuery}
        riders={riders}
        loading={loading}
        reportUploadedToday={reportUploadedToday}
        onManageCash={openCashDialog}
        onShowHistory={openTransactionHistory}
      />

      <CashDialog
        isArabic={isArabic}
        open={dialogOpen}
        rider={selectedRider}
        saving={saving}
        onClose={() => {
          if (!saving) {
            setDialogOpen(false);
            setSelectedRider(null);
          }
        }}
        onSave={saveCashOperation}
      />

     <TransactionHistoryDialog
      isArabic={isArabic}
      open={historyOpen}
      riderName={historyRiderName}
      transactions={historyTransactions}
      loading={historyLoading}
      canEdit={true}
      onEditTransaction={editTransaction}
      onClose={() => {
    setHistoryOpen(false);
    setHistoryTransactions([]);
    setHistoryRiderName("");
    setSelectedRider(null);
  }}
/>
    </>
  );
}