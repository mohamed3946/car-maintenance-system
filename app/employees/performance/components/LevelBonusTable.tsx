"use client";

export default function LevelBonusTable() {
  const rows = [
    ["A", "2.75"],
    ["B", "2.25"],
    ["C", "1.75"],
    ["D", "1.25"],
    ["E", "0.75"],
    ["F", "0.00"],
  ];

  return (
    <table className="w-full text-sm">
      <tbody>
        {rows.map(([level, bonus]) => (
          <tr key={level} className="border-b border-slate-100">
            <td className="p-3 font-black">{level}</td>
            <td className="p-3 font-bold text-green-600">{bonus} SAR</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}