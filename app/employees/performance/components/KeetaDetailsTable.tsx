"use client";

import { KeetaRow } from "../types";

type Props = {
  rows: KeetaRow[];
  text: any;
};

export default function KeetaDetailsTable({ rows, text }: Props) {
  return (
    <div className="overflow-auto">
      <table className="w-full min-w-[900px] text-sm">
        <thead className="bg-slate-50 text-slate-500">
          <tr>
            <th className="p-4 text-start">{text.rider}</th>
            <th className="p-4 text-start">{text.deliveries}</th>
            <th className="p-4 text-start">{text.validDays}</th>
            <th className="p-4 text-start">{text.onTime}</th>
            <th className="p-4 text-start">{text.acceptance}</th>
            <th className="p-4 text-start">{text.status}</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-t border-slate-100">
              <td className="p-4 font-black">{r.name}</td>
              <td className="p-4 font-bold">{r.orders}</td>
              <td className="p-4 font-bold">{r.validDays}</td>
              <td className="p-4 font-bold">{r.onTime}%</td>
              <td className="p-4 font-bold">{r.acceptance}%</td>
              <td className="p-4 font-bold">
                {r.status === "valid" ? text.valid : text.invalid}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}