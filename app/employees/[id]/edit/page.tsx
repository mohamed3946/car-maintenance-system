"use client";

import Link from "next/link";
import AppLayout, { useLanguage } from "../../../../components/AppLayout";
import {
  ArrowRight,
  CloudUpload,
  FileText,
  IdCard,
  Image as ImageIcon,
  Save,
  Upload,
  Wallet,
} from "lucide-react";

export default function EditEmployeePage() {
  return (
    <AppLayout
      system="employees"
      titleKey="editEmployeeTitle"
      subtitleKey="editEmployeeSubtitle"
    >
      <EditEmployeeContent />
    </AppLayout>
  );
}

function EditEmployeeContent() {
  const { lang } = useLanguage();
  const isAr = lang === "ar";

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-[#0f2544]">
            {isAr ? "تعديل بيانات الموظف" : "Edit Employee"}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {isAr
              ? "تعديل البيانات الأساسية وبيانات العمل والراتب."
              : "Edit basic, work, and salary information."}
          </p>
        </div>

        <Link
          href="/employees/list"
          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-extrabold text-slate-700 shadow-sm hover:bg-slate-50"
        >
          <ArrowRight className="h-5 w-5" />
          {isAr ? "الرجوع للقائمة" : "Back"}
        </Link>
      </div>

      <Section title={isAr ? "البيانات الأساسية" : "Basic Information"} icon={<IdCard />}>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          <Input label={isAr ? "اسم الموظف" : "Employee Name"} defaultValue={isAr ? "أحمد محمد" : "Ahmed Mohamed"} />
          <Input label={isAr ? "رقم الإقامة" : "Iqama Number"} defaultValue="251xxxxxxx" />
          <Input label={isAr ? "رقم الجوال" : "Phone Number"} defaultValue="05xxxxxxxx" />
          <Input label={isAr ? "الجنسية" : "Nationality"} defaultValue={isAr ? "مصري" : "Egyptian"} />
          <Input label={isAr ? "تاريخ بداية العمل - اختياري" : "Start Date - Optional"} type="date" />
        </div>
      </Section>

      <Section title={isAr ? "بيانات العمل" : "Work Information"} icon={<FileText />}>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          <Select
            label={isAr ? "المسمى الوظيفي" : "Job Title"}
            options={
              isAr
                ? ["مندوب كيتا", "مندوب هنقرستيشن", "مشرف", "ميكانيكي", "مسؤول الصيانة"]
                : ["Keeta Courier", "HungerStation Courier", "Supervisor", "Mechanic", "Maintenance Officer"]
            }
          />

          <Select
            label={isAr ? "موقع العمل" : "Work Location"}
            options={
              isAr
                ? ["Keeta", "HungerStation", "الإدارة", "الصيانة"]
                : ["Keeta", "HungerStation", "Management", "Maintenance"]
            }
          />

          <Select
            label={isAr ? "الحالة" : "Status"}
            options={
              isAr
                ? ["نشط", "متوقف", "إجازة", "خارج الخدمة"]
                : ["Active", "Stopped", "Vacation", "Out Of Service"]
            }
          />

          <Select
            label={isAr ? "الأداء" : "Performance"}
            options={
              isAr
                ? ["ممتاز", "جيد", "متوسط", "ضعيف"]
                : ["Excellent", "Good", "Average", "Poor"]
            }
          />

          <Input label={isAr ? "رقم المركبة / الدباب" : "Vehicle Number"} defaultValue="ب ب 1254" />
          <Input label={isAr ? "رقم هوية كيتا / هنقر" : "Keeta / Hunger ID"} defaultValue="KT-1254" />
        </div>
      </Section>

      <Section title={isAr ? "بيانات الراتب" : "Salary Details"} icon={<Wallet />}>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          <Input label={isAr ? "الراتب الأساسي" : "Base Salary"} defaultValue="1300" />
          <Input label={isAr ? "التارجت" : "Target"} defaultValue="350" />
          <Input label={isAr ? "نصف التارجت" : "Half Target"} defaultValue="175" />
          <Input label={isAr ? "استقطاعات التارجت" : "Target Deductions"} defaultValue="0" />
        </div>
      </Section>

      <Section title={isAr ? "إرفاق المستندات" : "Documents"} icon={<CloudUpload />}>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          <UploadBox label={isAr ? "صورة الهوية / الإقامة" : "ID / Iqama Image"} icon={<IdCard />} />
          <UploadBox label={isAr ? "صورة رخصة القيادة" : "Driving License Image"} icon={<FileText />} />
          <UploadBox label={isAr ? "صورة المندوب" : "Employee Photo"} icon={<ImageIcon />} />
          <UploadBox label={isAr ? "عقد قوى" : "Qiwa Contract"} icon={<FileText />} />
          <UploadBox label={isAr ? "عهدة استلام مركبة" : "Vehicle Custody Form"} icon={<FileText />} />
          <UploadBox label={isAr ? "مستندات أخرى" : "Other Documents"} icon={<Upload />} />
        </div>
      </Section>

      <div className="mt-6 flex justify-end gap-3">
        <Link
          href="/employees/list"
          className="rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-extrabold text-slate-700 hover:bg-slate-50"
        >
          {isAr ? "إلغاء" : "Cancel"}
        </Link>

        <button
          onClick={() => alert(isAr ? "تم حفظ التعديلات مؤقتًا" : "Changes saved temporarily")}
          className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 text-sm font-extrabold text-white hover:bg-blue-700"
        >
          <Save className="h-5 w-5" />
          {isAr ? "حفظ التعديلات" : "Save Changes"}
        </button>
      </div>
    </>
  );
}

function Section({ title, icon, children }: any) {
  return (
    <section className="mb-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-4">
        <h2 className="text-xl font-extrabold text-[#0f2544]">{title}</h2>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
          {icon}
        </div>
      </div>
      {children}
    </section>
  );
}

function Input({ label, defaultValue = "", type = "text" }: any) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-extrabold text-slate-600">{label}</span>
      <input
        type={type}
        defaultValue={defaultValue}
        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-blue-500"
      />
    </label>
  );
}

function Select({ label, options }: any) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-extrabold text-slate-600">{label}</span>
      <select className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-blue-500">
        {options.map((option: string) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}

function UploadBox({ label, icon }: any) {
  return (
    <label className="cursor-pointer rounded-3xl border border-dashed border-blue-300 bg-blue-50/30 p-5 transition hover:bg-blue-50">
      <input type="file" className="hidden" />
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-blue-700 shadow-sm">
          {icon}
        </div>
        <div>
          <p className="font-extrabold text-[#0f2544]">{label}</p>
          <p className="mt-1 text-xs font-bold text-slate-500">PNG, JPG, PDF</p>
        </div>
      </div>
    </label>
  );
}