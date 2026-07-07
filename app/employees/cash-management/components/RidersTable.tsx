"use client";

import {
  AlertTriangle,
  FileText,
  MessageCircle,
  Search,
  Settings,
} from "lucide-react";
import { CashRider } from "../types";

type Props = {
  isArabic: boolean;
  query: string;
  setQuery: (value: string) => void;
  riders: CashRider[];
  loading: boolean;
  reportUploadedToday: boolean;
  onManageCash: (rider: CashRider) => void;
  onShowHistory: (rider: CashRider) => void;
};

export default function RidersTable({
  isArabic,
  query,
  setQuery,
  riders,
  loading,
  reportUploadedToday,
  onManageCash,
  onShowHistory,
}: Props) {
  const filtered = riders.filter((rider) => {
    const searchText = `${rider.name} ${rider.hungerId} ${rider.phone || ""}`.toLowerCase();
    return searchText.includes(query.toLowerCase());
  });

  return (
    <>
      <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="relative max-w-xl">
          <Search className="absolute right-4 top-3.5 h-5 w-5 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              isArabic
                ? "ابحث باسم المندوب أو رقم هنجر..."
                : "Search rider or Hunger ID..."
            }
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pr-12 text-sm font-bold outline-none focus:border-blue-500"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <table dir={isArabic ? "rtl" : "ltr"} className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="p-4 text-start">{isArabic ? "المندوب" : "Rider"}</th>
              <th className="p-4 text-start">{isArabic ? "رقم هنجر" : "Hunger ID"}</th>
              <th className="p-4 text-start">{isArabic ? "رصيد المحفظة" : "Wallet Balance"}</th>
              <th className="p-4 text-start">{isArabic ? "ورد اليوم" : "Cash Received"}</th>
              <th className="p-4 text-start">{isArabic ? "أودعت له" : "Wallet Deposit"}</th>
              <th className="p-4 text-start">{isArabic ? "رصيد الكاش" : "Cash Balance"}</th>
              <th className="p-4 text-start">{isArabic ? "الحالة" : "Status"}</th>
              <th className="p-4 text-start">{isArabic ? "الإجراءات" : "Actions"}</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="p-8 text-center font-bold text-slate-500">
                  {isArabic ? "جاري تحميل البيانات..." : "Loading data..."}
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center font-bold text-slate-500">
                  {isArabic ? "لا توجد بيانات" : "No data found"}
                </td>
              </tr>
            ) : (
              filtered.map((rider) => {
                const status = getWalletStatus(rider.walletBalance, isArabic);
                const showReminder = rider.walletBalance < 0 || rider.remaining < 0;

                return (
                  <tr key={rider.id} className="border-t border-slate-100 hover:bg-slate-50">
                    <td className="p-4 font-extrabold text-[#0f2544]">
                      {rider.name || "-"}
                    </td>

                    <td className="p-4 font-bold text-slate-600">
                      {rider.hungerId || "-"}
                    </td>

                    <td className={`p-4 font-extrabold ${walletBalanceColor(rider.walletBalance)}`}>
                      SAR {rider.walletBalance}
                    </td>

                    <td className="p-4 font-extrabold text-green-700">
                      SAR {rider.cashReceived}
                    </td>

                    <td className="p-4 font-extrabold text-blue-700">
                      SAR {rider.walletDeposit}
                    </td>

                    <td className={`p-4 font-extrabold ${cashBalanceColor(rider.remaining)}`}>
                      SAR {rider.remaining}
                    </td>

                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold ${status.className}`}
                      >
                        {status.type === "danger" && (
                          <AlertTriangle className="h-4 w-4" />
                        )}
                        {status.label}
                      </span>
                    </td>

                    <td className="p-4">
                      <div className="flex flex-wrap gap-2">
                        <button
                          disabled={!reportUploadedToday}
                          onClick={() => onManageCash(rider)}
                          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-extrabold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                        >
                          <Settings className="h-4 w-4" />
                          {isArabic ? "إدارة" : "Manage"}
                        </button>

                        <button
                          onClick={() => onShowHistory(rider)}
                          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-extrabold text-slate-700 hover:bg-slate-50"
                        >
                          <FileText className="h-4 w-4" />
                          {isArabic ? "السجل" : "History"}
                        </button>

                        {showReminder && (
                          <button
                            onClick={() => sendWhatsAppReminder(rider, isArabic)}
                            className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2 text-xs font-extrabold text-white hover:bg-green-700"
                          >
                            <MessageCircle className="h-4 w-4" />
                            {isArabic ? "تذكير" : "Reminder"}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {!reportUploadedToday && !loading && (
          <div className="border-t border-red-100 bg-red-50 p-4 text-sm font-extrabold text-red-700">
            {isArabic
              ? "تنبيه: أزرار إدارة الكاش معطلة حتى يتم رفع تقرير اليوم."
              : "Warning: cash actions are disabled until today's report is uploaded."}
          </div>
        )}
      </div>
    </>
  );
}

function sendWhatsAppReminder(rider: CashRider, isArabic: boolean) {
  if (!rider.phone) {
    alert(
      isArabic
        ? "لا يوجد رقم جوال محفوظ للمندوب"
        : "No phone number saved for this rider"
    );
    return;
  }

  const phone = normalizeSaudiPhone(rider.phone);

  if (!phone) {
    alert(isArabic ? "رقم الجوال غير صحيح" : "Invalid phone number");
    return;
  }

  let message = "";

  if (rider.walletBalance < 0 && rider.remaining < 0) {
    message = isArabic
      ? `السلام عليكم ${rider.name}

رصيد محفظة هنجرستيشن لديك بالسالب (${rider.walletBalance} ريال)، كما أن المؤسسة قامت بتعبئة المحفظة من حسابها بمبلغ (${Math.abs(
          rider.remaining
        )} ريال).

يرجى سرعة توريد الكاش للمؤسسة أو تعبئة المحفظة حتى لا تتأثر الطلبات.

شكراً.`
      : `Hello ${rider.name}

Your HungerStation wallet balance is negative (${rider.walletBalance} SAR), and the company has paid on your behalf (${Math.abs(
          rider.remaining
        )} SAR).

Please deposit the cash to the company or top up your wallet as soon as possible.

Thank you.`;
  } else if (rider.walletBalance < 0) {
    message = isArabic
      ? `السلام عليكم ${rider.name}

رصيد محفظة هنجرستيشن لديك بالسالب (${rider.walletBalance} ريال).

يرجى توريد الكاش للمحاسب أو تعبئة المحفظة في أقرب وقت حتى لا تتأثر الطلبات.

شكراً.`
      : `Hello ${rider.name}

Your HungerStation wallet balance is negative (${rider.walletBalance} SAR).

Please deposit the cash with the accountant or top up your wallet as soon as possible to avoid order reduction.

Thank you.`;
  } else if (rider.remaining < 0) {
    message = isArabic
      ? `السلام عليكم ${rider.name}

نود إفادتك بأن المؤسسة قامت بتعبئة محفظتك من حسابها بمبلغ (${Math.abs(
          rider.remaining
        )} ريال).

يرجى سرعة توريد المبلغ للمؤسسة.

شكراً.`
      : `Hello ${rider.name}

The company has topped up your wallet on your behalf with (${Math.abs(
          rider.remaining
        )} SAR).

Please deposit the amount to the company as soon as possible.

Thank you.`;
  }

  window.open(
    `https://wa.me/${phone}?text=${encodeURIComponent(message)}`,
    "_blank"
  );
}

function normalizeSaudiPhone(phone: string) {
  const digits = String(phone || "").replace(/[^\d]/g, "");

  if (!digits) return "";
  if (digits.startsWith("966")) return digits;
  if (digits.startsWith("05")) return `966${digits.slice(1)}`;
  if (digits.startsWith("5") && digits.length === 9) return `966${digits}`;

  return digits;
}

function walletBalanceColor(value: number) {
  const abs = Math.abs(value);

  if (abs > 100) return "text-red-600";
  if (abs >= 50) return "text-orange-600";
  return "text-slate-700";
}

function cashBalanceColor(value: number) {
  if (value === 0) return "text-green-700";
  if (value > 0) return "text-blue-700";
  return "text-red-700";
}

function getWalletStatus(walletBalance: number, isArabic: boolean) {
  const abs = Math.abs(walletBalance);

  if (abs > 100) {
    return {
      type: "danger",
      className: "bg-red-50 text-red-700",
      label: isArabic ? "خطر" : "Danger",
    };
  }

  if (abs >= 50) {
    return {
      type: "warning",
      className: "bg-orange-50 text-orange-700",
      label: isArabic ? "متابعة" : "Watch",
    };
  }

  return {
    type: "good",
    className: "bg-green-50 text-green-700",
    label: isArabic ? "جيد" : "Good",
  };
}