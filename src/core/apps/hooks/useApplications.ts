"use client";

import { useCallback, useEffect, useState } from "react";

import {
  appsService,
  DeliveryApp,
} from "../apps.service";

export function useApplications(companyId: string) {
  const [applications, setApplications] = useState<
    DeliveryApp[]
  >([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(
    null
  );

  const loadApplications = useCallback(async () => {
    try {
      setLoading(true);

      const data = await appsService.getAll(companyId);

      setApplications(data);

      setError(null);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Unknown Error");
      }
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    if (!companyId) return;

    loadApplications();
  }, [companyId, loadApplications]);

  return {
    applications,

    loading,

    error,

    reload: loadApplications,

    setApplications,
  };
}