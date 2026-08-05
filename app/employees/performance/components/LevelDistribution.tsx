"use client";

import { useMemo, useState } from "react";
import { ChevronDown, ChevronUp, Users } from "lucide-react";

import { HungerRow } from "../types";
import { batchToLevel } from "../utils";

type Props = {
  rows: HungerRow[];
  isArabic: boolean;
};

type Level = "A" | "B" | "C" | "D" | "E" | "F";

const levels: Level[] = ["A", "B", "C", "D", "E", "F"];

export default function LevelDistribution({
  rows,
  isArabic,
}: Props) {
  const [openedLevel, setOpenedLevel] = useState<Level | null>(null);

  const ridersByLevel = useMemo(() => {
    const result: Record<Level, HungerRow[]> = {
      A: [],
      B: [],
      C: [],
      D: [],
      E: [],
      F: [],
    };

    rows.forEach((rider) => {
      const level = batchToLevel(rider.batchNumber) as Level;

      if (result[level]) {
        result[level].push(rider);
      }
    });

    levels.forEach((level) => {
      result[level].sort((a, b) => {
        return b.completedDeliveries - a.completedDeliveries;
      });
    });

    return result;
  }, [rows]);

  function toggleLevel(level: Level) {
    setOpenedLevel((current) =>
      current === level ? null : level
    );
  }

  return (
    <div className="space-y-3">
      {levels.map((level) => {
        const levelRiders = ridersByLevel[level];
        const isOpen = openedLevel === level;

        return (
          <div
            key={level}
            className="overflow-hidden rounded-2xl border border-slate-100 bg-slate-50"
          >
            <button
              type="button"
              onClick={() => toggleLevel(level)}
              className="flex w-full items-center justify-between p-4 text-start transition hover:bg-blue-50"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white font-black text-[#0f2544] shadow-sm">
                  {level}
                </div>

                <div>
                  <p className="font-black text-[#0f2544]">
                    {isArabic
                      ? `المستوى ${level}`
                      : `Level ${level}`}
                  </p>

                  <p className="mt-1 text-xs font-bold text-slate-500">
                    {levelRiders.length}{" "}
                    {isArabic ? "مندوب" : "Riders"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />

                {isOpen ? (
                  <ChevronUp className="h-5 w-5 text-slate-500" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-slate-500" />
                )}
              </div>
            </button>

            {isOpen && (
              <div className="border-t border-slate-200 bg-white p-3">
                {levelRiders.length === 0 ? (
                  <div className="rounded-xl bg-slate-50 p-4 text-center text-sm font-bold text-slate-400">
                    {isArabic
                      ? "لا يوجد مناديب في هذا المستوى"
                      : "No riders in this level"}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {levelRiders.map((rider) => (
                      <div
                        key={rider.id}
                        className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3"
                      >
                        <div>
                          <p className="font-black text-[#0f2544]">
                            {rider.name}
                          </p>

                          <p className="mt-1 text-xs font-bold text-slate-500">
                            ID: {rider.id}
                          </p>
                        </div>

                        <div className="text-end">
                          <p className="font-black text-blue-700">
                            {Math.round(
                              rider.completedDeliveries
                            ).toLocaleString("en-US")}
                          </p>

                          <p className="mt-1 text-xs font-bold text-slate-500">
                            {isArabic ? "طلب" : "Deliveries"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}