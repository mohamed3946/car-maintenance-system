"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Clock3,
  Download,
  ExternalLink,
  Eye,
  FileText,
  Loader2,
  RefreshCw,
  Search,
  ShieldCheck,
  Smartphone,
  Trash2,
  UserCheck,
  UserRound,
  UsersRound,
  X,
  XCircle,
} from "lucide-react";

import { supabase } from "@/app/lib/supabase";
import AppLayout, { useLanguage } from "@/components/AppLayout";

type ApplicationStatus = "pending" | "under_review" | "approved" | "rejected";
type StatusFilter = "all" | ApplicationStatus;
type PlatformFilter = "all" | "hunger" | "keeta" | "both";
type VehicleFilter = "all" | "car" | "motorcycle";

type RiderApplication = {
  id: string;
  full_name: string;
  iqama: string;
  phone: string;
  nationality: string | null;
  city: string | null;
  vehicle_type: string | null;
  owns_vehicle: boolean;
  preferred_platform: string | null;
  experience_notes: string | null;
  profile_photo_path: string | null;
  iqama_front_path: string | null;
  driving_license_path: string | null;
  status: ApplicationStatus;
  rejection_reason: string | null;
  created_at: string;
  reviewed_at: string | null;
};

type DocumentUrls = {
  profile: string | null;
  iqama: string | null;
  license: string | null;
};

export default function RiderApplicationsPage() {
  const { lang } = useLanguage();
  const ar = lang === "ar";

  const [applications, setApplications] = useState<RiderApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [platformFilter, setPlatformFilter] = useState<PlatformFilter>("all");
  const [vehicleFilter, setVehicleFilter] = useState<VehicleFilter>("all");
  const [selected, setSelected] = useState<RiderApplication | null>(null);
  const [documents, setDocuments] = useState<DocumentUrls>({
    profile: null,
    iqama: null,
    license: null,
  });
  const [documentLoading, setDocumentLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [approvePassword, setApprovePassword] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionMode, setActionMode] = useState<"approve" | "reject" | null>(null);
  const [reserveCount, setReserveCount] = useState(0);

  const loadApplications = useCallback(async () => {
    const [{ data, error }, { count: reserveTotal, error: reserveError }] =
      await Promise.all([
        supabase
          .from("rider_applications")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase
          .from("employees")
          .select("id", { count: "exact", head: true })
          .eq("employment_stage", "reserve"),
      ]);

    if (error) {
      console.error("LOAD RIDER APPLICATIONS ERROR:", error);
      return;
    }

    if (reserveError) {
      console.error("LOAD RESERVE COUNT ERROR:", reserveError);
    }

    setApplications((data || []) as RiderApplication[]);
    setReserveCount(reserveTotal || 0);
  }, []);

  useEffect(() => {
    async function start() {
      setLoading(true);
      await loadApplications();
      setLoading(false);
    }

    start();

    const channel = supabase
      .channel("erp-rider-applications-page")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "rider_applications",
        },
        () => {
          loadApplications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadApplications]);

  async function refresh() {
    setRefreshing(true);
    await loadApplications();
    setRefreshing(false);
  }

  const stats = useMemo(
    () => ({
      total: applications.length,
      pending: applications.filter((item) => item.status === "pending").length,
      review: applications.filter((item) => item.status === "under_review").length,
      approved: applications.filter((item) => item.status === "approved").length,
      rejected: applications.filter((item) => item.status === "rejected").length,
    }),
    [applications]
  );

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return applications.filter((item) => {
      if (statusFilter !== "all" && item.status !== statusFilter) return false;
      if (
        platformFilter !== "all" &&
        item.preferred_platform !== platformFilter
      ) {
        return false;
      }
      if (vehicleFilter !== "all" && item.vehicle_type !== vehicleFilter) {
        return false;
      }

      if (!query) return true;

      return [
        item.full_name,
        item.iqama,
        item.phone,
        item.nationality,
        item.city,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query));
    });
  }, [applications, search, statusFilter, platformFilter, vehicleFilter]);

  async function openApplication(application: RiderApplication) {
    let nextApplication = application;

    if (application.status === "pending") {
      const { error } = await supabase
        .from("rider_applications")
        .update({
          status: "under_review",
          updated_at: new Date().toISOString(),
        })
        .eq("id", application.id)
        .eq("status", "pending");

      if (!error) {
        nextApplication = { ...application, status: "under_review" };
        setApplications((current) =>
          current.map((item) =>
            item.id === application.id ? nextApplication : item
          )
        );
      }
    }

    setSelected(nextApplication);
    setActionMode(null);
    setApprovePassword("");
    setRejectionReason(nextApplication.rejection_reason || "");
    setDocuments({ profile: null, iqama: null, license: null });
    setDocumentLoading(true);

    try {
      const [profile, iqama, license] = await Promise.all([
        createSignedUrl(nextApplication.profile_photo_path),
        createSignedUrl(nextApplication.iqama_front_path),
        createSignedUrl(nextApplication.driving_license_path),
      ]);

      setDocuments({ profile, iqama, license });
    } finally {
      setDocumentLoading(false);
    }
  }

  async function createSignedUrl(path: string | null) {
    if (!path) return null;

    const { data, error } = await supabase.storage
      .from("rider-applications")
      .createSignedUrl(path, 60 * 10);

    if (error) {
      console.error("SIGNED URL ERROR:", error);
      return null;
    }

    return data.signedUrl || null;
  }

  async function downloadDocument(url: string | null, filename: string) {
    if (!url) return;

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Unable to download file");
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = objectUrl;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(objectUrl);
    } catch (error) {
      console.error("DOWNLOAD DOCUMENT ERROR:", error);
      alert(ar ? "تعذر تحميل المستند." : "Unable to download document.");
    }
  }

  async function approveApplication() {
    if (!selected) return;

    if (approvePassword.length < 6) {
      alert(
        ar
          ? "كلمة المرور يجب أن تكون 6 أحرف أو أرقام على الأقل."
          : "Password must contain at least 6 characters."
      );
      return;
    }

    setProcessing(true);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;
      if (!accessToken) throw new Error("No authenticated session.");

      const { data, error } = await supabase.functions.invoke(
        "approve-rider-application",
        {
          body: {
            application_id: selected.id,
            password: approvePassword,
          },
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (error) throw error;
      if (!data?.success) throw new Error(data?.message || "Approval failed.");

      alert(
        ar
          ? `تم قبول المندوب وتحويله إلى الموظفين الاحتياطيين.\n\nرقم الإقامة: ${data.iqama}\nكلمة المرور: ${data.temporary_password}`
          : `Rider approved and moved to reserve employees.\n\nIqama: ${data.iqama}\nPassword: ${data.temporary_password}`
      );

      setSelected(null);
      setActionMode(null);
      await loadApplications();
    } catch (error) {
      console.error("APPROVE APPLICATION ERROR:", error);
      alert(
        error instanceof Error
          ? error.message
          : ar
            ? "تعذر قبول الطلب."
            : "Unable to approve application."
      );
    } finally {
      setProcessing(false);
    }
  }

  async function rejectApplication() {
    if (!selected) return;

    if (!rejectionReason.trim()) {
      alert(ar ? "اكتب سبب الرفض أولًا." : "Enter a rejection reason first.");
      return;
    }

    setProcessing(true);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;
      if (!accessToken) throw new Error("No authenticated session.");

      const { data, error } = await supabase.functions.invoke(
        "reject-rider-application",
        {
          body: {
            application_id: selected.id,
            reason: rejectionReason.trim(),
          },
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (error) throw error;
      if (!data?.success) throw new Error(data?.message || "Reject failed.");

      setSelected(null);
      setActionMode(null);
      await loadApplications();
    } catch (error) {
      console.error("REJECT APPLICATION ERROR:", error);
      alert(
        error instanceof Error
          ? error.message
          : ar
            ? "تعذر رفض الطلب."
            : "Unable to reject application."
      );
    } finally {
      setProcessing(false);
    }
  }

  async function deleteApplication() {
    if (!selected) return;

    const confirmed = window.confirm(
      ar
        ? selected.status === "approved"
          ? "سيتم حذف سجل طلب الانضمام فقط ولن يتم حذف الموظف الاحتياطي أو حسابه. هل تريد المتابعة؟"
          : "هل أنت متأكد من حذف طلب الانضمام نهائيًا؟"
        : selected.status === "approved"
          ? "Only the application record will be deleted. The reserve employee and login account will remain. Continue?"
          : "Are you sure you want to permanently delete this application?"
    );

    if (!confirmed) return;

    setDeleting(true);

    try {
      const filePaths = [
        selected.profile_photo_path,
        selected.iqama_front_path,
        selected.driving_license_path,
      ].filter(Boolean) as string[];

      if (filePaths.length > 0) {
        const { error: storageError } = await supabase.storage
          .from("rider-applications")
          .remove(filePaths);

        if (storageError) {
          console.error("DELETE APPLICATION FILES ERROR:", storageError);
        }
      }

      const { error } = await supabase
        .from("rider_applications")
        .delete()
        .eq("id", selected.id);

      if (error) throw error;

      setSelected(null);
      setActionMode(null);
      await loadApplications();
    } catch (error) {
      console.error("DELETE APPLICATION ERROR:", error);
      alert(ar ? "تعذر حذف الطلب." : "Unable to delete application.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <AppLayout system="employees">
      <div
        dir={ar ? "rtl" : "ltr"}
        className="min-h-screen bg-[#f5f7fb] p-4 md:p-6 xl:p-8"
      >
        <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-blue-600">
              <UsersRound size={17} />
              {ar ? "الموارد البشرية" : "Human Resources"}
            </div>
            <h1 className="text-2xl font-black text-slate-900 md:text-3xl">
              {ar ? "طلبات انضمام المناديب" : "Rider Applications"}
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              {ar
                ? "مراجعة الطلبات والمستندات وتحويل المقبولين إلى الموظفين الاحتياطيين."
                : "Review applications and move approved riders to reserve employees."}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/employees/reserve"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-black text-white shadow-sm transition hover:bg-slate-800"
            >
              <UserCheck size={17} />
              {ar ? "الموظفون الاحتياطيون" : "Reserve Employees"}
              {reserveCount > 0 && (
                <span className="flex min-w-6 items-center justify-center rounded-full bg-white px-1.5 py-0.5 text-[10px] font-black text-slate-900">
                  {reserveCount > 99 ? "99+" : reserveCount}
                </span>
              )}
            </Link>

            <button
              onClick={refresh}
              disabled={refreshing}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 shadow-sm transition hover:border-blue-200 hover:text-blue-600"
            >
              <RefreshCw size={17} className={refreshing ? "animate-spin" : ""} />
              {ar ? "تحديث" : "Refresh"}
            </button>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-5">
          <StatCard
            label={ar ? "كل الطلبات" : "All Applications"}
            value={stats.total}
            icon={UsersRound}
            active={statusFilter === "all"}
            onClick={() => setStatusFilter("all")}
          />
          <StatCard
            label={ar ? "جديدة" : "Pending"}
            value={stats.pending}
            icon={Clock3}
            active={statusFilter === "pending"}
            onClick={() => setStatusFilter("pending")}
          />
          <StatCard
            label={ar ? "قيد المراجعة" : "Under Review"}
            value={stats.review}
            icon={Eye}
            active={statusFilter === "under_review"}
            onClick={() => setStatusFilter("under_review")}
          />
          <StatCard
            label={ar ? "مقبولة" : "Approved"}
            value={stats.approved}
            icon={CheckCircle2}
            active={statusFilter === "approved"}
            onClick={() => setStatusFilter("approved")}
          />
          <StatCard
            label={ar ? "مرفوضة" : "Rejected"}
            value={stats.rejected}
            icon={XCircle}
            active={statusFilter === "rejected"}
            onClick={() => setStatusFilter("rejected")}
          />
        </div>

        <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
            <div className="relative flex-1">
              <Search
                size={18}
                className={`absolute top-1/2 -translate-y-1/2 text-slate-400 ${ar ? "right-4" : "left-4"}`}
              />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={
                  ar
                    ? "بحث بالاسم أو الإقامة أو الجوال..."
                    : "Search by name, Iqama or phone..."
                }
                className={`h-12 w-full rounded-xl border border-slate-200 bg-slate-50 outline-none transition focus:border-blue-400 focus:bg-white ${ar ? "pr-11 pl-4" : "pl-11 pr-4"}`}
              />
            </div>

            <FilterButtons
              values={[
                ["all", ar ? "كل التطبيقات" : "All Platforms"],
                ["hunger", "HungerStation"],
                ["keeta", "Keeta"],
                ["both", ar ? "الاثنين" : "Both"],
              ]}
              value={platformFilter}
              onChange={(value) => setPlatformFilter(value as PlatformFilter)}
            />

            <FilterButtons
              values={[
                ["all", ar ? "كل المركبات" : "All Vehicles"],
                ["car", ar ? "سيارة" : "Car"],
                ["motorcycle", ar ? "دراجة" : "Motorcycle"],
              ]}
              value={vehicleFilter}
              onChange={(value) => setVehicleFilter(value as VehicleFilter)}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-[320px] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white py-20 text-center">
            <UsersRound className="mx-auto mb-4 h-10 w-10 text-slate-300" />
            <div className="font-bold text-slate-700">
              {ar ? "لا توجد طلبات" : "No applications found"}
            </div>
          </div>
        ) : (
          <div className="grid gap-4 xl:grid-cols-2">
            {filtered.map((application) => (
              <ApplicationCard
                key={application.id}
                application={application}
                ar={ar}
                onOpen={() => openApplication(application)}
              />
            ))}
          </div>
        )}

        {selected && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-3 backdrop-blur-sm">
            <div className="max-h-[94vh] w-full max-w-5xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white/95 px-5 py-4 backdrop-blur">
                <div>
                  <div className="text-lg font-black text-slate-900">
                    {selected.full_name}
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    {selected.iqama} • {selected.phone}
                  </div>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition hover:bg-slate-200"
                >
                  <X size={19} />
                </button>
              </div>

              <div className="p-5 md:p-7">
                <div className="grid gap-5 xl:grid-cols-[1fr_1.15fr]">
                  <div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <Info label={ar ? "الاسم" : "Name"} value={selected.full_name} />
                      <Info label={ar ? "رقم الإقامة" : "Iqama"} value={selected.iqama} />
                      <Info label={ar ? "الجوال" : "Phone"} value={selected.phone} />
                      <Info label={ar ? "الجنسية" : "Nationality"} value={selected.nationality} />
                      <Info label={ar ? "المدينة" : "City"} value={selected.city} />
                      <Info
                        label={ar ? "المركبة" : "Vehicle"}
                        value={vehicleName(selected.vehicle_type, ar)}
                      />
                      <Info
                        label={ar ? "يمتلك المركبة" : "Own Vehicle"}
                        value={selected.owns_vehicle ? (ar ? "نعم" : "Yes") : ar ? "لا" : "No"}
                      />
                      <Info
                        label={ar ? "التطبيق" : "Platform"}
                        value={platformName(selected.preferred_platform)}
                        last
                      />
                    </div>

                    {selected.experience_notes && (
                      <div className="mt-4 rounded-2xl border border-slate-200 p-4">
                        <div className="text-xs font-bold text-slate-500">
                          {ar ? "الخبرة السابقة" : "Previous Experience"}
                        </div>
                        <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-700">
                          {selected.experience_notes}
                        </p>
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="mb-3 flex items-center gap-2">
                      <FileText size={18} className="text-blue-600" />
                      <h3 className="font-black text-slate-900">
                        {ar ? "المستندات" : "Documents"}
                      </h3>
                    </div>

                    {documentLoading ? (
                      <div className="flex min-h-64 items-center justify-center rounded-2xl bg-slate-50">
                        <Loader2 className="animate-spin text-blue-600" />
                      </div>
                    ) : (
                      <div className="grid gap-3 md:grid-cols-3">
                        <DocumentCard
                          title={ar ? "الصورة الشخصية" : "Profile Photo"}
                          url={documents.profile}
                          onDownload={() =>
                            downloadDocument(documents.profile, `${selected.iqama}-profile.jpg`)
                          }
                        />
                        <DocumentCard
                          title={ar ? "الإقامة" : "Iqama"}
                          url={documents.iqama}
                          onDownload={() =>
                            downloadDocument(documents.iqama, `${selected.iqama}-iqama.jpg`)
                          }
                        />
                        <DocumentCard
                          title={ar ? "الرخصة" : "License"}
                          url={documents.license}
                          onDownload={() =>
                            downloadDocument(documents.license, `${selected.iqama}-license.jpg`)
                          }
                        />
                      </div>
                    )}
                  </div>
                </div>

                {selected.status !== "approved" && selected.status !== "rejected" && (
                  <div className="mt-7 border-t border-slate-100 pt-6">
                    {!actionMode && (
                      <div className="flex flex-col gap-3 sm:flex-row">
                        <button
                          onClick={() => setActionMode("approve")}
                          className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 text-sm font-black text-white transition hover:bg-emerald-700"
                        >
                          <CheckCircle2 size={18} />
                          {ar ? "قبول ونقل للاحتياطي" : "Approve to Reserve"}
                        </button>
                        <button
                          onClick={() => setActionMode("reject")}
                          className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-red-50 text-sm font-black text-red-600 transition hover:bg-red-100"
                        >
                          <XCircle size={18} />
                          {ar ? "رفض الطلب" : "Reject Application"}
                        </button>
                      </div>
                    )}

                    {actionMode === "approve" && (
                      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4">
                        <div className="flex items-center gap-2 font-black text-emerald-800">
                          <ShieldCheck size={19} />
                          {ar ? "إنشاء حساب المندوب الاحتياطي" : "Create Reserve Rider Account"}
                        </div>
                        <p className="mt-2 text-xs leading-6 text-emerald-700">
                          {ar
                            ? "حدد كلمة المرور الأولية. بعد القبول سيظهر المندوب في قائمة الموظفين الاحتياطيين."
                            : "Set the initial password. The rider will appear in Reserve Employees after approval."}
                        </p>
                        <input
                          type="text"
                          value={approvePassword}
                          onChange={(event) => setApprovePassword(event.target.value)}
                          placeholder={ar ? "كلمة المرور الأولية" : "Initial password"}
                          className="mt-4 h-12 w-full rounded-xl border border-emerald-200 bg-white px-4 font-bold outline-none focus:border-emerald-500"
                        />
                        <div className="mt-4 flex gap-2">
                          <button
                            onClick={approveApplication}
                            disabled={processing}
                            className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 font-black text-white disabled:opacity-60"
                          >
                            {processing ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <CheckCircle2 size={17} />
                            )}
                            {ar ? "تأكيد القبول" : "Confirm Approval"}
                          </button>
                          <button
                            onClick={() => setActionMode(null)}
                            className="h-11 rounded-xl bg-white px-5 font-bold text-slate-600"
                          >
                            {ar ? "إلغاء" : "Cancel"}
                          </button>
                        </div>
                      </div>
                    )}

                    {actionMode === "reject" && (
                      <div className="rounded-2xl border border-red-200 bg-red-50/60 p-4">
                        <div className="font-black text-red-700">
                          {ar ? "سبب الرفض" : "Rejection Reason"}
                        </div>
                        <textarea
                          value={rejectionReason}
                          onChange={(event) => setRejectionReason(event.target.value)}
                          rows={4}
                          placeholder={ar ? "اكتب سبب الرفض..." : "Enter rejection reason..."}
                          className="mt-3 w-full resize-none rounded-xl border border-red-200 bg-white p-3 outline-none focus:border-red-400"
                        />
                        <div className="mt-4 flex gap-2">
                          <button
                            onClick={rejectApplication}
                            disabled={processing}
                            className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 font-black text-white disabled:opacity-60"
                          >
                            {processing ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <XCircle size={17} />
                            )}
                            {ar ? "تأكيد الرفض" : "Confirm Rejection"}
                          </button>
                          <button
                            onClick={() => setActionMode(null)}
                            className="h-11 rounded-xl bg-white px-5 font-bold text-slate-600"
                          >
                            {ar ? "إلغاء" : "Cancel"}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-6 border-t border-slate-100 pt-5">
                  <button
                    onClick={deleteApplication}
                    disabled={deleting || processing}
                    className="flex h-11 items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-5 text-sm font-black text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                  >
                    {deleting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 size={17} />
                    )}
                    {ar ? "حذف الطلب" : "Delete Application"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

function FilterButtons({
  values,
  value,
  onChange,
}: {
  values: [string, string][];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {values.map(([itemValue, label]) => (
        <button
          key={itemValue}
          type="button"
          onClick={() => onChange(itemValue)}
          className={`rounded-xl px-3 py-2 text-[11px] font-black transition ${
            value === itemValue
              ? "bg-slate-900 text-white"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  active,
  onClick,
}: {
  label: string;
  value: number;
  icon: any;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl border p-4 text-start shadow-sm transition ${
        active
          ? "border-blue-300 bg-blue-50 ring-2 ring-blue-100"
          : "border-slate-200 bg-white hover:border-blue-200 hover:shadow-md"
      }`}
    >
      <div className="flex items-center justify-between">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${
            active ? "bg-blue-600 text-white" : "bg-blue-50 text-blue-600"
          }`}
        >
          <Icon size={19} />
        </div>
        <div className="text-2xl font-black text-slate-900">{value}</div>
      </div>
      <div className="mt-3 text-xs font-bold text-slate-500">{label}</div>
    </button>
  );
}

function ApplicationCard({
  application,
  ar,
  onOpen,
}: {
  application: RiderApplication;
  ar: boolean;
  onOpen: () => void;
}) {
  return (
    <button
      onClick={onOpen}
      className="group rounded-2xl border border-slate-200 bg-white p-5 text-start shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
            <UserRound size={22} />
          </div>
          <div className="min-w-0">
            <div className="truncate font-black text-slate-900">
              {application.full_name}
            </div>
            <div className="mt-1 text-xs text-slate-500">{application.iqama}</div>
          </div>
        </div>
        <StatusBadge status={application.status} ar={ar} />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <SmallInfo icon={Smartphone} value={application.phone} />
        <SmallInfo icon={FileText} value={application.city || "-"} />
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
        <span className="text-xs font-bold text-slate-400">
          {formatDate(application.created_at, ar)}
        </span>
        <span className="flex items-center gap-1 text-xs font-black text-blue-600">
          <Eye size={15} />
          {ar ? "عرض الطلب" : "View Application"}
        </span>
      </div>
    </button>
  );
}

function StatusBadge({ status, ar }: { status: ApplicationStatus; ar: boolean }) {
  const config = {
    pending: {
      text: ar ? "جديد" : "Pending",
      className: "bg-amber-50 text-amber-700",
    },
    under_review: {
      text: ar ? "قيد المراجعة" : "Under Review",
      className: "bg-blue-50 text-blue-700",
    },
    approved: {
      text: ar ? "مقبول" : "Approved",
      className: "bg-emerald-50 text-emerald-700",
    },
    rejected: {
      text: ar ? "مرفوض" : "Rejected",
      className: "bg-red-50 text-red-700",
    },
  }[status];

  return (
    <span className={`rounded-full px-3 py-1.5 text-[10px] font-black ${config.className}`}>
      {config.text}
    </span>
  );
}

function SmallInfo({ icon: Icon, value }: { icon: any; value: string }) {
  return (
    <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2.5">
      <Icon size={15} className="shrink-0 text-slate-400" />
      <span className="truncate text-xs font-bold text-slate-600">{value}</span>
    </div>
  );
}

function Info({
  label,
  value,
  last,
}: {
  label: string;
  value: string | null;
  last?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-4 py-3 ${
        !last ? "border-b border-slate-200" : ""
      }`}
    >
      <span className="text-xs font-bold text-slate-500">{label}</span>
      <span className="text-sm font-black text-slate-800">{value || "-"}</span>
    </div>
  );
}

function DocumentCard({
  title,
  url,
  onDownload,
}: {
  title: string;
  url: string | null;
  onDownload: () => void;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
      <div className="relative aspect-[4/3] bg-slate-100">
        {url ? (
          <>
            <img src={url} alt={title} className="h-full w-full object-cover" />
            <div className="absolute inset-x-2 bottom-2 flex justify-center gap-2">
              <a
                href={url}
                target="_blank"
                rel="noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/95 text-slate-700 shadow-lg backdrop-blur transition hover:bg-white"
                title="Open"
                onClick={(event) => event.stopPropagation()}
              >
                <ExternalLink size={16} />
              </a>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onDownload();
                }}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg transition hover:bg-blue-700"
                title="Download"
              >
                <Download size={16} />
              </button>
            </div>
          </>
        ) : (
          <div className="flex h-full items-center justify-center text-slate-300">
            <FileText size={35} />
          </div>
        )}
      </div>
      <div className="p-3 text-center text-xs font-black text-slate-700">{title}</div>
    </div>
  );
}

function platformName(value: string | null) {
  if (value === "both") return "HungerStation + Keeta";
  if (value === "keeta") return "Keeta";
  if (value === "hunger") return "HungerStation";
  return "-";
}

function vehicleName(value: string | null, ar: boolean) {
  if (value === "motorcycle") return ar ? "دراجة" : "Motorcycle";
  if (value === "car") return ar ? "سيارة" : "Car";
  return "-";
}

function formatDate(value: string, ar: boolean) {
  try {
    return new Intl.DateTimeFormat(ar ? "ar-SA" : "en-GB", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(value));
  } catch {
    return "-";
  }
}
