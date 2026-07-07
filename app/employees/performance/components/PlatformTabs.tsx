"use client";

import { Platform } from "../types";

type Props = {
  platform: Platform;
  onChange: (platform: Platform) => void;
  isArabic: boolean;
};

export default function PlatformTabs({ platform, onChange }: Props) {
  return (
    <div className="mb-6 grid grid-cols-2 gap-4">
      <button
        onClick={() => onChange("hunger")}
        className={`rounded-2xl border px-8 py-4 text-2xl font-black transition ${
          platform === "hunger"
            ? "border-blue-600 bg-white text-blue-700 shadow-sm"
            : "border-slate-200 bg-slate-50 text-slate-500 hover:bg-white"
        }`}
      >
        HungerStation
      </button>

      <button
        onClick={() => onChange("keeta")}
        className={`rounded-2xl border px-8 py-4 text-2xl font-black transition ${
          platform === "keeta"
            ? "border-blue-600 bg-white text-blue-700 shadow-sm"
            : "border-slate-200 bg-slate-50 text-slate-500 hover:bg-white"
        }`}
      >
        Keeta
      </button>
    </div>
  );
}