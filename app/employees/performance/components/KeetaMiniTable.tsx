"use client";

import { KeetaRow } from "../types";

type Props = {
  rows: KeetaRow[];
  text: any;
};

export default function KeetaMiniTable({
  rows,
  text,
}: Props) {
  return (
    <table className="w-full text-sm">
      <tbody>
        {rows.map((r) => (
          <tr key={r.id} className="border-b border-slate-100">
            <td className="p-3 font-black">
              {r.name}
            </td>

            <td className="p-3 font-bold">
              {r.orders}
            </td>

            <td className="p-3 font-bold">
              {r.validDays}
            </td>

            <td className="p-3 font-bold">
              {r.status === "valid"
                ? text.valid
                : text.invalid}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}