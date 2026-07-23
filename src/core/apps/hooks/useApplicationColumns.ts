"use client";

import { useCallback, useEffect, useState } from "react";

import {
  columnsService,
  DeliveryAppColumn,
} from "../columns.service";

export function useApplicationColumns(appId: string) {
  const [columns, setColumns] = useState<DeliveryAppColumn[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadColumns = useCallback(async () => {
    if (!appId) {
      setColumns([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const data = await columnsService.getAll(appId);

      setColumns(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "تعذر تحميل أعمدة ملف الأداء"
      );
    } finally {
      setLoading(false);
    }
  }, [appId]);

  useEffect(() => {
    loadColumns();
  }, [loadColumns]);

  return {
    columns,
    loading,
    error,
    reload: loadColumns,
    setColumns,
  };
}