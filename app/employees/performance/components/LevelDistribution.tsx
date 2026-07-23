"use client";

type Props = {
  isArabic: boolean;
};

export default function LevelDistribution({ isArabic }: Props) {
  const rows = [
    ["A", 1],
    ["B", 1],
    ["C", 1],
    ["D", 0],
    ["E", 0],
    ["F", 1],
  ];

  return (
    <div className="space-y-3">
      {rows.map(([level, count]) => (
        <div
          key={level}
          className="flex items-center justify-between rounded-2xl bg-slate-50 p-3"
        >
          <span className="font-black">{level}</span>
          <span className="font-bold text-slate-600">
            {count} {isArabic ? "مندوب" : "Rider"}
          </span>
        </div>
      ))}
    </div>
  );
}