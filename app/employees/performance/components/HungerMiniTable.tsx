"use client";

import { HungerRow } from "../types";
import { batchToLevel, qualityBonusByBatch } from "../utils";

type Props = {
  rows: HungerRow[];
};

export default function HungerMiniTable({ rows }: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[520px] text-sm">
        <thead className="bg-slate-50 text-slate-500">
          <tr>
            <th className="p-3 text-start">المندوب</th>
            <th className="p-3 text-start">المستوى</th>
            <th className="p-3 text-start">الطلبات</th>
            <th className="p-3 text-start">المكافأة</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-b border-slate-100">
              <td className="p-3 font-black">{r.name}</td>

              <td className="p-3 font-bold">
                {batchToLevel(r.batchNumber)}
              </td>

              <td className="p-3 font-bold">
                {formatInteger(r.completedDeliveries)}
              </td>

              <td className="p-3 font-bold text-green-600">
                {formatNumber(
                  r.completedDeliveries *
                    qualityBonusByBatch(r.batchNumber)
                )}{" "}
                SAR
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function formatInteger(value: number | string | null | undefined) {
  return Math.round(Number(value ?? 0)).toLocaleString("en-US");
}

function formatNumber(value: number | string | null | undefined) {
  return Number(value ?? 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
