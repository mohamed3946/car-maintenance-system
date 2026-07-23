"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  AppWindow,
  CheckCircle2,
  PauseCircle,
  Plus,
  Users,
} from "lucide-react";

import { useSystem } from "@/providers/SystemProvider";

import Button from "@/ui/button/Button";
import PageHeader from "@/ui/page-header";
import StatCard from "@/ui/stat-card/StatCard";

import ApplicationCard from "./ApplicationCard";
import { applications } from "../mock/applications";

export default function ApplicationsPage() {
  const router = useRouter();
  const { lang } = useSystem();

  const isArabic = lang === "ar";

  const statistics = useMemo(() => {
    const active = applications.filter(
      (application) => application.status === "active"
    ).length;

    const inactiveAndDraft = applications.filter(
      (application) =>
        application.status === "inactive" ||
        application.status === "draft"
    ).length;

    const riders = applications.reduce(
      (total, application) =>
        total + application.ridersCount,
      0
    );

    return {
      total: applications.length,
      active,
      inactiveAndDraft,
      riders,
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title={isArabic ? "إجمالي التطبيقات" : "Total Applications"}
          value={statistics.total}
          note={
            isArabic
              ? "جميع منصات التوصيل المسجلة"
              : "All registered delivery platforms"
          }
          tone="blue"
          icon={<AppWindow className="h-6 w-6" />}
        />

        <StatCard
          title={isArabic ? "التطبيقات النشطة" : "Active Applications"}
          value={statistics.active}
          note={
            isArabic
              ? "متاحة حاليًا للتشغيل"
              : "Currently available for operations"
          }
          tone="green"
          icon={<CheckCircle2 className="h-6 w-6" />}
        />

        <StatCard
          title={isArabic ? "المتوقفة والمسودات" : "Inactive & Drafts"}
          value={statistics.inactiveAndDraft}
          note={
            isArabic
              ? "تحتاج مراجعة أو استكمال"
              : "Require review or configuration"
          }
          tone="amber"
          icon={<PauseCircle className="h-6 w-6" />}
        />

        <StatCard
          title={isArabic ? "إجمالي المناديب" : "Total Riders"}
          value={statistics.riders}
          note={
            isArabic
              ? "المناديب المرتبطون بالتطبيقات"
              : "Riders assigned to applications"
          }
          tone="violet"
          icon={<Users className="h-6 w-6" />}
        />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 xl:grid-cols-3">
        {applications.map((application) => (
          <ApplicationCard
            key={application.id}
            application={application}
            lang={lang}
          />
        ))}
      </div>
    </div>
  );
}