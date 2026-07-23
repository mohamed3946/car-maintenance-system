"use client";

import { User } from "lucide-react";

export default function UserMenu() {
  return (
    <button className="hidden rounded-2xl bg-slate-50 p-3 text-slate-600 hover:bg-slate-100 sm:block">
      <User className="h-5 w-5" />
    </button>
  );
}