"use client";

type Props = {
  isArabic: boolean;
};

export default function Header({ isArabic }: Props) {
  return (
    <div className="mb-6 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
      <div>
        <h1 className="text-3xl font-extrabold text-[#0f2544]">
          {isArabic ? "متابعة الأداء" : "Performance Tracking"}
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          {isArabic
            ? "تحليل أداء المناديب ورفع التقارير الشهرية"
            : "Analyze riders performance and monthly reports"}
        </p>
      </div>
    </div>
  );
}