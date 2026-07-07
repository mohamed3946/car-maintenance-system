"use client";

import { HungerRow } from "../types";
import { batchToLevel, qualityBonusByBatch } from "../utils";

type Props = {
  rows: HungerRow[];
};

export default function HungerMiniTable({ rows }: Props) {
  return (
    <table className="w-full text-sm">
      <tbody>
        {rows.map((r) => (
          <tr key={r.id} className="border-b border-slate-100">
            <td className="p-3 font-black">{r.name}</td>

            <td className="p-3 font-bold">
              {batchToLevel(r.batchNumber)}
            </td>

            <td className="p-3 font-bold">
              {r.avgKm} KM
            </td>

            <td className="p-3 font-bold text-green-600">
              {(r.completedDeliveries *
                qualityBonusByBatch(r.batchNumber)).toFixed(0)}
              {" "}SAR
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}