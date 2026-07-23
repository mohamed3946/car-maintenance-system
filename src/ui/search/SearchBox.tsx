"use client";

import { Search } from "lucide-react";

export default function SearchBox() {
  return (
    <div className="flex items-center gap-2 rounded-2xl bg-slate-50 px-4 py-3">
      <Search className="h-5 w-5 text-slate-400" />
      <input
        placeholder="Search..."
        className="w-full bg-transparent text-sm font-bold outline-none"
      />
    </div>
  );
}