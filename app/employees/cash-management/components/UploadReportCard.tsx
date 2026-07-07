"use client";

import { CheckCircle, Upload, AlertTriangle } from "lucide-react";

type Props = {
  isArabic: boolean;
  reportUploadedToday: boolean;
  uploading: boolean;
  lastReport: any;
  onUpload: (file: File) => void;
};

export default function UploadReportCard({
  isArabic,
  reportUploadedToday,
  uploading,
  lastReport,
  onUpload,
}: Props) {
  return (
    <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

      <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">

        <div>

          <h2 className="text-xl font-extrabold text-[#0f2544]">
            {isArabic
              ? "تقرير محفظة هنجر"
              : "Hunger Wallet Report"}
          </h2>

          {!reportUploadedToday ? (
            <div className="mt-4 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4">

              <AlertTriangle className="h-7 w-7 text-red-600" />

              <div>

                <p className="font-extrabold text-red-700">
                  {isArabic
                    ? "لم يتم رفع تقرير اليوم"
                    : "Today's report has not been uploaded"}
                </p>

                <p className="text-sm text-red-600">
                  {isArabic
                    ? "يرجى رفع التقرير حتى يتم تحديث بيانات المحافظ."
                    : "Please upload today's report before starting cash operations."}
                </p>

              </div>

            </div>
          ) : (
            <div className="mt-4 flex items-center gap-3 rounded-2xl border border-green-200 bg-green-50 p-4">

              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">

                <CheckCircle className="h-6 w-6 text-green-600" />

              </div>

              <div>

                <p className="font-extrabold text-green-700">
                  {isArabic
                    ? "تم رفع التقرير بنجاح"
                    : "Today's report uploaded successfully"}
                </p>

                <p className="text-sm text-green-600">

                  {lastReport?.report_date}

                </p>

              </div>

            </div>
          )}

        </div>

        <label className="inline-flex cursor-pointer items-center gap-3 rounded-2xl bg-blue-600 px-6 py-4 font-extrabold text-white shadow hover:bg-blue-700">

          <Upload className="h-6 w-6" />

          {uploading
            ? (isArabic ? "جاري الرفع..." : "Uploading...")
            : (isArabic ? "رفع التقرير" : "Upload Report")}

          <input
            type="file"
            accept=".csv,.xlsx"
            className="hidden"
            disabled={uploading}
            onChange={(e) => {
              const file = e.target.files?.[0];

              if (file) {
                onUpload(file);
              }

              e.target.value = "";
            }}
          />

        </label>

      </div>

      {lastReport && (
        <div className="mt-5 rounded-xl bg-slate-50 p-4 text-sm">

          <div className="flex flex-wrap gap-8">

            <div>

              <span className="font-bold">
                {isArabic ? "آخر تقرير:" : "Last Report:"}
              </span>

              <div>{lastReport.file_name}</div>

            </div>

            <div>

              <span className="font-bold">
                {isArabic ? "عدد السجلات:" : "Rows:"}
              </span>

              <div>{lastReport.uploaded_rows}</div>

            </div>

            <div>

              <span className="font-bold">
                {isArabic ? "تمت المطابقة:" : "Matched:"}
              </span>

              <div>{lastReport.matched_rows}</div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}