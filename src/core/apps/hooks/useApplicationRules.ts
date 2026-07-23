"use client";

import { useCallback, useEffect, useState } from "react";

import {
  DeliveryAppRule,
  rulesService,
} from "../rules.service";

export function useApplicationRules(appId: string) {
  const [rules, setRules] = useState<DeliveryAppRule[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadRules = useCallback(async () => {
    if (!appId) {
      setRules([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const data = await rulesService.getAll(appId);

      setRules(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "تعذر تحميل قواعد الأداء"
      );
    } finally {
      setLoading(false);
    }
  }, [appId]);

  useEffect(() => {
    loadRules();
  }, [loadRules]);

  return {
    rules,
    loading,
    error,
    reload: loadRules,
    setRules,
  };
}