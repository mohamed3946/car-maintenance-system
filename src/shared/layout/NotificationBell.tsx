"use client";

import { Bell } from "lucide-react";

export default function NotificationBell() {
  return (
    <button className="relative rounded-2xl bg-slate-50 p-3 text-slate-600 hover:bg-slate-100">
      <Bell className="h-5 w-5" />
      <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
    </button>
  );
}