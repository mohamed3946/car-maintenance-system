"use client";

import { MainLayout } from "@/shared/layout";

export default function ReportsPage() {
  return (
    <MainLayout title="التقارير" subtitle="Reports & Analytics Module">
      <div className="rounded-3xl border border-slate-200 bg-white p-10 shadow-sm">
        <h2 className="text-2xl font-black text-[#0f2544]">التقارير والتحليلات</h2>
        <p className="mt-2 text-sm font-bold text-slate-500">
          لوحات تحليلية، مؤشرات أداء، وتقارير تشغيلية ومالية.
        </p>
      </div>
    </MainLayout>
  );
}