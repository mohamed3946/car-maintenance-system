"use client";

import { useMemo, useState } from "react";
import { Edit, Printer, Save, X } from "lucide-react";

type TransactionItem = {
  id: string;
  transaction_type: "cash_receive" | "wallet_deposit";
  amount: number;
  notes: string | null;
  created_at: string;
};

type Props = {
  isArabic: boolean;
  open: boolean;
  riderName: string;
  transactions: TransactionItem[];
  loading: boolean;
  canEdit?: boolean;
  onClose: () => void;
  onEditTransaction?: (data: {
    id: string;
    oldAmount: number;
    newAmount: number;
    notes: string;
    transactionType: "cash_receive" | "wallet_deposit";
  }) => void;
};

type FilterType = "today" | "yesterday" | "week" | "month" | "all";

export default function TransactionHistoryDialog({
  isArabic,
  open,
  riderName,
  transactions,
  loading,
  canEdit = false,
  onClose,
  onEditTransaction,
}: Props) {
  const [filter, setFilter] = useState<FilterType>("today");
  const [editing, setEditing] = useState<TransactionItem | null>(null);
  const [editAmount, setEditAmount] = useState("");
  const [editNotes, setEditNotes] = useState("");

  const filteredTransactions = useMemo(() => {
    return transactions.filter((item) => {
      const date = new Date(item.created_at);
      const now = new Date();

      const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const startYesterday = new Date(startToday);
      startYesterday.setDate(startYesterday.getDate() - 1);

      const startWeek = new Date(startToday);
      startWeek.setDate(startWeek.getDate() - 7);

      const startMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      if (filter === "today") return date >= startToday;
      if (filter === "yesterday") return date >= startYesterday && date < startToday;
      if (filter === "week") return date >= startWeek;
      if (filter === "month") return date >= startMonth;

      return true;
    });
  }, [transactions, filter]);

  const totalCash = filteredTransactions
    .filter((t) => t.transaction_type === "cash_receive")
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const totalDeposit = filteredTransactions
    .filter((t) => t.transaction_type === "wallet_deposit")
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const cashBalance = totalCash - totalDeposit;

  if (!open) return null;

  function startEdit(item: TransactionItem) {
    setEditing(item);
    setEditAmount(String(item.amount || ""));
    setEditNotes(item.notes || "");
  }

  function cancelEdit() {
    setEditing(null);
    setEditAmount("");
    setEditNotes("");
  }

  function saveEdit() {
    if (!editing || !onEditTransaction) return;

    const amount = Number(editAmount);

    if (!amount || amount <= 0) {
      alert(isArabic ? "اكتب مبلغ صحيح" : "Enter a valid amount");
      return;
    }

    onEditTransaction({
      id: editing.id,
      oldAmount: Number(editing.amount || 0),
      newAmount: amount,
      notes: editNotes,
      transactionType: editing.transaction_type,
    });

    cancelEdit();
  }

  function printStatement() {
    const html = `
      <html dir="${isArabic ? "rtl" : "ltr"}">
        <head>
          <title>${isArabic ? "كشف حساب المندوب" : "Rider Statement"}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 30px; color: #0f2544; }
            h1, h2, h3 { margin: 0; }
            .header { text-align: center; margin-bottom: 25px; border-bottom: 2px solid #0f2544; padding-bottom: 15px; }
            .info { margin-bottom: 20px; line-height: 1.8; font-weight: bold; }
            .cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 25px; }
            .card { border: 1px solid #ddd; border-radius: 10px; padding: 15px; text-align: center; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            th, td { border: 1px solid #ddd; padding: 10px; text-align: center; font-size: 13px; }
            th { background: #f1f5f9; }
            .green { color: #15803d; font-weight: bold; }
            .blue { color: #1d4ed8; font-weight: bold; }
            .red { color: #dc2626; font-weight: bold; }
            .footer { margin-top: 40px; display: flex; justify-content: space-between; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${isArabic ? "كشف حساب المندوب" : "Rider Statement"}</h1>
            <p>${isArabic ? "إدارة الكاش - مؤسسة نمو التوصيل" : "Cash Management - Nmo Delivery"}</p>
          </div>

          <div class="info">
            <div>${isArabic ? "اسم المندوب:" : "Rider:"} ${riderName}</div>
            <div>${isArabic ? "الفترة:" : "Period:"} ${filterLabel(filter, isArabic)}</div>
            <div>${isArabic ? "تاريخ الطباعة:" : "Print Date:"} ${new Date().toLocaleString()}</div>
          </div>

          <div class="cards">
            <div class="card">
              <div>${isArabic ? "إجمالي الكاش المستلم" : "Total Cash Received"}</div>
              <h2 class="green">SAR ${totalCash}</h2>
            </div>
            <div class="card">
              <div>${isArabic ? "إجمالي تعبئة المحفظة" : "Total Wallet Deposit"}</div>
              <h2 class="blue">SAR ${totalDeposit}</h2>
            </div>
            <div class="card">
              <div>${isArabic ? "رصيد الكاش" : "Cash Balance"}</div>
              <h2 class="${cashBalance < 0 ? "red" : cashBalance > 0 ? "blue" : "green"}">SAR ${cashBalance}</h2>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>${isArabic ? "التاريخ" : "Date"}</th>
                <th>${isArabic ? "العملية" : "Type"}</th>
                <th>${isArabic ? "المبلغ" : "Amount"}</th>
                <th>${isArabic ? "ملاحظات" : "Notes"}</th>
              </tr>
            </thead>
            <tbody>
              ${filteredTransactions
                .map(
                  (item) => `
                    <tr>
                      <td>${formatDate(item.created_at)}</td>
                      <td>${
                        item.transaction_type === "cash_receive"
                          ? isArabic
                            ? "استلام كاش"
                            : "Cash Received"
                          : isArabic
                            ? "تعبئة محفظة"
                            : "Wallet Deposit"
                      }</td>
                      <td>SAR ${Number(item.amount || 0)}</td>
                      <td>${item.notes || (isArabic ? "لا توجد" : "No notes")}</td>
                    </tr>
                  `
                )
                .join("")}
            </tbody>
          </table>

          <div class="footer">
            <div>${isArabic ? "توقيع المحاسب:" : "Accountant Signature:"} ____________</div>
            <div>${isArabic ? "توقيع المندوب:" : "Rider Signature:"} ____________</div>
          </div>

          <script>window.print();</script>
        </body>
      </html>
    `;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(html);
    printWindow.document.close();
  }

  return (
    <>
      <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 p-4">
        <div
          dir={isArabic ? "rtl" : "ltr"}
          className="w-full max-w-4xl overflow-hidden rounded-3xl bg-white shadow-2xl"
        >
          <div className="flex items-center justify-between border-b border-slate-100 p-5">
            <div>
              <h2 className="text-2xl font-extrabold text-[#0f2544]">
                {isArabic ? "سجل العمليات" : "Transaction History"}
              </h2>
              <p className="mt-1 text-sm font-bold text-slate-500">{riderName}</p>
            </div>

            <button
              onClick={onClose}
              className="rounded-2xl bg-slate-100 p-3 text-slate-600 hover:bg-slate-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="border-b border-slate-100 p-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex flex-wrap gap-2">
                {(["today", "yesterday", "week", "month", "all"] as FilterType[]).map(
                  (item) => (
                    <button
                      key={item}
                      onClick={() => setFilter(item)}
                      className={`rounded-xl px-4 py-2 text-xs font-extrabold ${
                        filter === item
                          ? "bg-blue-600 text-white"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      {filterLabel(item, isArabic)}
                    </button>
                  )
                )}
              </div>

              <button
                onClick={printStatement}
                className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-5 py-2 text-sm font-extrabold text-white hover:bg-green-700"
              >
                <Printer className="h-5 w-5" />
                {isArabic ? "طباعة كشف الحساب" : "Print Statement"}
              </button>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
              <SummaryCard
                title={isArabic ? "إجمالي الكاش المستلم" : "Total Cash"}
                value={totalCash}
                color="green"
              />
              <SummaryCard
                title={isArabic ? "إجمالي تعبئة المحفظة" : "Total Deposit"}
                value={totalDeposit}
                color="blue"
              />
              <SummaryCard
                title={isArabic ? "رصيد الكاش" : "Cash Balance"}
                value={cashBalance}
                color={cashBalance < 0 ? "red" : cashBalance > 0 ? "blue" : "green"}
              />
            </div>
          </div>

          <div className="max-h-[60vh] overflow-auto p-5">
            {loading ? (
              <div className="p-8 text-center font-bold text-slate-500">
                {isArabic ? "جاري تحميل السجل..." : "Loading history..."}
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div className="p-8 text-center font-bold text-slate-500">
                {isArabic ? "لا توجد عمليات في هذه الفترة" : "No transactions in this period"}
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="p-4 text-start">{isArabic ? "التاريخ" : "Date"}</th>
                    <th className="p-4 text-start">{isArabic ? "العملية" : "Type"}</th>
                    <th className="p-4 text-start">{isArabic ? "المبلغ" : "Amount"}</th>
                    <th className="p-4 text-start">{isArabic ? "ملاحظات" : "Notes"}</th>
                    {canEdit && (
                      <th className="p-4 text-start">{isArabic ? "تعديل" : "Edit"}</th>
                    )}
                  </tr>
                </thead>

                <tbody>
                  {filteredTransactions.map((item) => (
                    <tr
                      key={item.id}
                      className="border-t border-slate-100 hover:bg-slate-50"
                    >
                      <td className="p-4 font-bold text-slate-600">
                        {formatDate(item.created_at)}
                      </td>

                      <td className="p-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-extrabold ${
                            item.transaction_type === "cash_receive"
                              ? "bg-green-50 text-green-700"
                              : "bg-blue-50 text-blue-700"
                          }`}
                        >
                          {item.transaction_type === "cash_receive"
                            ? isArabic
                              ? "استلام كاش"
                              : "Cash Received"
                            : isArabic
                              ? "تعبئة محفظة"
                              : "Wallet Deposit"}
                        </span>
                      </td>

                      <td className="p-4 font-extrabold text-[#0f2544]">
                        SAR {Number(item.amount || 0).toLocaleString()}
                      </td>

                      <td className="p-4 font-bold text-slate-600">
                        {item.notes || (isArabic ? "لا توجد" : "No notes")}
                      </td>

                      {canEdit && (
                        <td className="p-4">
                          <button
                            onClick={() => startEdit(item)}
                            className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2 text-xs font-extrabold text-white hover:bg-orange-600"
                          >
                            <Edit className="h-4 w-4" />
                            {isArabic ? "تعديل" : "Edit"}
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {editing && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 p-4">
          <div
            dir={isArabic ? "rtl" : "ltr"}
            className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"
          >
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-xl font-extrabold text-[#0f2544]">
                {isArabic ? "تعديل العملية" : "Edit Transaction"}
              </h3>

              <button
                onClick={cancelEdit}
                className="rounded-xl bg-slate-100 p-2 text-slate-600 hover:bg-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <label className="mb-4 block">
              <span className="mb-2 block text-sm font-extrabold text-slate-700">
                {isArabic ? "المبلغ" : "Amount"}
              </span>
              <input
                type="number"
                value={editAmount}
                onChange={(e) => setEditAmount(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-blue-500"
              />
            </label>

            <label className="mb-5 block">
              <span className="mb-2 block text-sm font-extrabold text-slate-700">
                {isArabic ? "ملاحظات" : "Notes"}
              </span>
              <textarea
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                rows={3}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-blue-500"
              />
            </label>

            <button
              onClick={saveEdit}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-extrabold text-white hover:bg-blue-700"
            >
              <Save className="h-5 w-5" />
              {isArabic ? "حفظ التعديل" : "Save Changes"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function SummaryCard({
  title,
  value,
  color,
}: {
  title: string;
  value: number;
  color: "green" | "blue" | "red";
}) {
  const colors = {
    green: "bg-green-50 text-green-700",
    blue: "bg-blue-50 text-blue-700",
    red: "bg-red-50 text-red-700",
  };

  return (
    <div className={`rounded-2xl p-4 ${colors[color]}`}>
      <p className="text-sm font-bold opacity-80">{title}</p>
      <h3 className="mt-2 text-2xl font-extrabold">SAR {value}</h3>
    </div>
  );
}

function filterLabel(filter: FilterType, isArabic: boolean) {
  const labels = {
    today: isArabic ? "اليوم" : "Today",
    yesterday: isArabic ? "أمس" : "Yesterday",
    week: isArabic ? "آخر 7 أيام" : "Last 7 Days",
    month: isArabic ? "هذا الشهر" : "This Month",
    all: isArabic ? "الكل" : "All",
  };

  return labels[filter];
}

function formatDate(value: string) {
  const d = new Date(value);
  return d.toLocaleString();
}