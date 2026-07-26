"use client";

import { useEffect, useMemo, useState } from "react";
import { X, Save, Banknote, Wallet } from "lucide-react";
import { CashRider } from "../types";

type Props = {
  isArabic: boolean;
  open: boolean;
  rider: CashRider | null;
  saving: boolean;
  onClose: () => void;
  onSave: (data: {
    cashAmount: number;
    depositAmount: number;
    notes: string;
  }) => void;
};

export default function CashDialog({
  isArabic,
  open,
  rider,
  saving,
  onClose,
  onSave,
}: Props) {
  const [cashAmount, setCashAmount] = useState("");
  const [depositAmount, setDepositAmount] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (open) {
      setCashAmount("");
      setDepositAmount("");
      setNotes("");
    }
  }, [open]);

  const remainingAfterSave = useMemo(() => {
    if (!rider) return 0;

    const cash = Number(cashAmount || 0);
    const deposit = Number(depositAmount || 0);

    return rider.remaining + cash - deposit;
  }, [rider, cashAmount, depositAmount]);

  if (!open || !rider) return null;

  function handleSave() {
    const cash = Number(cashAmount || 0);
    const deposit = Number(depositAmount || 0);

    if (cash <= 0 && deposit <= 0) {
      alert(
        isArabic
          ? "اكتب مبلغ الاستلام أو مبلغ الإيداع"
          : "Enter cash received or wallet deposit amount"
      );
      return;
    }

    if (cash < 0 || deposit < 0) {
      alert(isArabic ? "المبلغ غير صحيح" : "Invalid amount");
      return;
    }

    onSave({
      cashAmount: cash,
      depositAmount: deposit,
      notes,
    });
  }

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 p-4">
      <div
        dir={isArabic ? "rtl" : "ltr"}
        className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-slate-100 p-5">
          <div>
            <h2 className="text-2xl font-extrabold text-[#0f2544]">
              {isArabic ? "إدارة كاش المندوب" : "Manage Rider Cash"}
            </h2>
            <p className="mt-1 text-sm font-bold text-slate-500">
              {rider.name} — {rider.hungerId || "-"}
            </p>
          </div>

          <button
            onClick={onClose}
            disabled={saving}
            className="rounded-2xl bg-slate-100 p-3 text-slate-600 hover:bg-slate-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5 p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <InfoBox
              title={isArabic ? "رصيد المحفظة" : "Wallet Balance"}
              value={`SAR ${rider.walletBalance}`}
              color={Math.abs(rider.walletBalance) > 100 ? "red" : "blue"}
            />

            <InfoBox
              title={isArabic ? "ورد اليوم" : "Cash Received"}
              value={`SAR ${rider.cashReceived}`}
              color="green"
            />

            <InfoBox
              title={isArabic ? "المتبقي بالمؤسسة" : "Company Balance"}
              value={`SAR ${rider.remaining}`}
              color="orange"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className="flex items-center gap-2 text-sm font-extrabold text-slate-700">
                <Banknote className="h-5 w-5 text-green-600" />
                {isArabic ? "استلمت منه" : "Cash received"}
              </span>

              <input
                type="number"
                min="0"
                value={cashAmount}
                onChange={(e) => setCashAmount(e.target.value)}
                placeholder="0"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-lg font-extrabold outline-none focus:border-green-500"
              />
            </label>

            <label className="space-y-2">
              <span className="flex items-center gap-2 text-sm font-extrabold text-slate-700">
                <Wallet className="h-5 w-5 text-blue-600" />
                {isArabic ? "أودعت له في المحفظة" : "Wallet deposit"}
              </span>

              <input
                type="number"
                min="0"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                placeholder="0"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-lg font-extrabold outline-none focus:border-blue-500"
              />
            </label>
          </div>

          <label className="space-y-2 block">
            <span className="text-sm font-extrabold text-slate-700">
              {isArabic ? "ملاحظات" : "Notes"}
            </span>

            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-blue-500"
              placeholder={
                isArabic ? "ملاحظة اختيارية..." : "Optional note..."
              }
            />
          </label>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-bold text-slate-500">
              {isArabic ? "المتبقي بعد الحفظ" : "Remaining after save"}
            </p>
            <h3 className="mt-1 text-3xl font-extrabold text-[#0f2544]">
              SAR {remainingAfterSave}
            </h3>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-slate-100 p-5">
          <button
            onClick={onClose}
            disabled={saving}
            className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-extrabold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            {isArabic ? "إلغاء" : "Cancel"}
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 text-sm font-extrabold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            <Save className="h-5 w-5" />
            {saving
              ? isArabic
                ? "جاري الحفظ..."
                : "Saving..."
              : isArabic
                ? "حفظ العملية"
                : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoBox({
  title,
  value,
  color,
}: {
  title: string;
  value: string;
  color: "blue" | "green" | "orange" | "red";
}) {
  const colors: Record<string, string> = {
    blue: "bg-blue-50 text-blue-700",
    green: "bg-green-50 text-green-700",
    orange: "bg-orange-50 text-orange-700",
    red: "bg-red-50 text-red-700",
  };

  return (
    <div className={`rounded-2xl p-4 ${colors[color]}`}>
      <p className="text-sm font-bold opacity-80">{title}</p>
      <h3 className="mt-2 text-2xl font-extrabold">{value}</h3>
    </div>
  );
}