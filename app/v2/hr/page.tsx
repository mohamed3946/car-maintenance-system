"use client";

import { MainLayout } from "@/shared/layout";

export default function HRPage() {
  return (
    <MainLayout title="الموارد البشرية" subtitle="Human Resources Module">
      <div className="rounded-3xl border border-slate-200 bg-white p-10 shadow-sm">
        <h2 className="text-2xl font-black text-[#0f2544]">الموارد البشرية</h2>
        <p className="mt-2 text-sm font-bold text-slate-500">
          إدارة الموظفين، الرواتب، المستندات، المخالفات، والإنذارات.
        </p>
      </div>
    </MainLayout>
  );
}