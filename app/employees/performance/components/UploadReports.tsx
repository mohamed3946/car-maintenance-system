"use client";

import { AlertTriangle, CheckCircle2, FileUp } from "lucide-react";
import { Platform } from "../types";

type ReportType = "performance" | "distance";

type ReportItem = {
  id: string;
  platform: string;
  report_type: ReportType;
  report_date: string;
  file_name: string | null;
  records_count: number | null;
  uploaded_at: string;
};

type Props = {
  platform: Platform;
  isArabic: boolean;
  reports: ReportItem[];
  onUpload: (reportType: ReportType, file: File) => void;
};

export default function UploadReports({
  platform,
  isArabic,
  reports,
  onUpload,
}: Props) {
  const requiredReports: { type: ReportType; title: string }[] =
    platform === "hunger"
      ? [
          { type: "performance", title: isArabic ? "تقرير الأداء" : "Performance Report" },
          { type: "distance", title: isArabic ? "تقرير الكيلومترات" : "Distance Report" },
        ]
      : [{ type: "performance", title: isArabic ? "تقرير الأداء" : "Performance Report" }];

  const uploadedCount = requiredReports.filter((item) =>
    reports.some((report) => report.report_type === item.type)
  ).length;

  const progress = Math.round((uploadedCount / requiredReports.length) * 100);
  const completed = uploadedCount === requiredReports.length;

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h2 className="text-xl font-black text-[#0f2544]">
            {isArabic ? "مركز استيراد التقارير" : "Import Center"}
          </h2>
          <p className="mt-1 text-sm font-bold text-slate-500">
            {isArabic
              ? "ارفع التقارير المطلوبة لتحديث بيانات الأداء"
              : "Upload required reports to update performance data"}
          </p>
        </div>

        <div
          className={`rounded-2xl px-5 py-3 text-sm font-extrabold ${
            completed
              ? "bg-green-50 text-green-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          {isArabic ? "اكتمال التقارير" : "Reports Completion"}: {uploadedCount}/
          {requiredReports.length}
        </div>
      </div>

      <div className="mb-5 h-3 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full ${
            completed ? "bg-green-600" : "bg-blue-600"
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>

      {!completed && (
        <div className="mb-5 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-extrabold text-red-700">
          {isArabic
            ? "تنبيه: يوجد تقرير ناقص، يرجى رفع جميع التقارير المطلوبة قبل الاعتماد على البيانات."
            : "Warning: a required report is missing. Upload all reports before relying on the data."}
        </div>
      )}

      <div className={`grid gap-4 ${platform === "hunger" ? "xl:grid-cols-2" : "xl:grid-cols-1"}`}>
        {requiredReports.map((item) => {
          const report = reports.find((r) => r.report_type === item.type);

          return (
            <UploadCard
              key={item.type}
              isArabic={isArabic}
              title={item.title}
              report={report}
              onUpload={(file) => onUpload(item.type, file)}
            />
          );
        })}
      </div>
    </section>
  );
}

function UploadCard({
  isArabic,
  title,
  report,
  onUpload,
}: {
  isArabic: boolean;
  title: string;
  report?: ReportItem;
  onUpload: (file: File) => void;
}) {
  const uploaded = Boolean(report);

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
              uploaded ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
            }`}
          >
            {uploaded ? <CheckCircle2 className="h-6 w-6" /> : <AlertTriangle className="h-6 w-6" />}
          </div>

          <div className="min-w-0">
            <h3 className="truncate text-lg font-black text-[#0f2544]">
              {title}
            </h3>

            <p className={`mt-1 text-xs font-extrabold ${uploaded ? "text-green-700" : "text-red-600"}`}>
              {uploaded
                ? isArabic
                  ? "تم رفع التقرير اليوم"
                  : "Uploaded today"
                : isArabic
                  ? "لم يتم رفع التقرير"
                  : "Not uploaded"}
            </p>

            <p className="mt-1 truncate text-xs font-bold text-slate-500">
              {uploaded
                ? `${report?.file_name || "-"} • ${isArabic ? "السجلات" : "Rows"}: ${report?.records_count || 0}`
                : isArabic
                  ? "يرجى رفع التقرير"
                  : "Please upload report"}
            </p>
          </div>
        </div>

        <label className="inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-2xl border border-blue-200 bg-white px-5 py-3 text-sm font-black text-blue-700 hover:bg-blue-50">
          <FileUp className="h-5 w-5" />
          {uploaded
            ? isArabic
              ? "استبدال"
              : "Replace"
            : isArabic
              ? "رفع"
              : "Upload"}

          <input
            type="file"
            accept=".csv,.xlsx"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onUpload(file);
              e.target.value = "";
            }}
          />
        </label>
      </div>
    </div>
  );
}