"use client";

import { HungerRow } from "../types";
import { batchToLevel, qualityBonusByBatch } from "../utils";

type Props = {
  rows: HungerRow[];
  text: any;
};

export default function HungerDetailsTable({ rows, text }: Props) {
  return (
    <div className="overflow-auto">
      <table className="w-full min-w-[1200px] text-sm">
        <thead className="bg-slate-50 text-slate-500">
          <tr>
            <th className="p-4 text-start">{text.rider}</th>
            <th className="p-4 text-start">{text.batchNumber}</th>
            <th className="p-4 text-start">{text.level}</th>
            <th className="p-4 text-start">{text.deliveries}</th>
            <th className="p-4 text-start">{text.attendance}</th>
            <th className="p-4 text-start">{text.acceptance}</th>
            <th className="p-4 text-start">{text.contact}</th>
            <th className="p-4 text-start">{text.noShow}</th>
            <th className="p-4 text-start">{text.hours}</th>
            <th className="p-4 text-start">{text.totalKm}</th>
            <th className="p-4 text-start">{text.payableKm}</th>
            <th className="p-4 text-start">{text.avgKm}</th>
            <th className="p-4 text-start">{text.bonus}</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-t border-slate-100">
              <td className="p-4 font-black">{r.name}</td>
              <td className="p-4 font-bold">{r.batchNumber}</td>
              <td className="p-4 font-bold">{batchToLevel(r.batchNumber)}</td>
              <td className="p-4 font-bold">{r.completedDeliveries}</td>
              <td className="p-4 font-bold">{r.attendanceRate}%</td>
              <td className="p-4 font-bold">{r.acceptanceRate}%</td>
              <td className="p-4 font-bold">{r.contactRate}%</td>
              <td className="p-4 font-bold text-red-600">{r.noShowPercent}%</td>
              <td className="p-4 font-bold">{r.workingHours}</td>
              <td className="p-4 font-bold">{r.totalKm}</td>
              <td className="p-4 font-bold">{r.payableKm}</td>
              <td className="p-4 font-bold">{r.avgKm}</td>
              <td className="p-4 font-bold text-green-600">
                {(r.completedDeliveries * qualityBonusByBatch(r.batchNumber)).toFixed(2)} SAR
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}