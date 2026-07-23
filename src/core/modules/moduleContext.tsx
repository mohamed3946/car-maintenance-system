"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

import { useCompany } from "@/core/companies";
import { getCompanyModules } from "./moduleService";
import { AppModule } from "./types";

type ModuleContextValue = {
  modules: AppModule[];
  loading: boolean;
  refreshModules: () => Promise<void>;
};

const ModuleContext = createContext<ModuleContextValue>({
  modules: [],
  loading: true,
  refreshModules: async () => {},
});

export function ModuleProvider({ children }: { children: ReactNode }) {
  const { company } = useCompany();

  const [modules, setModules] = useState<AppModule[]>([]);
  const [loading, setLoading] = useState(true);

  async function refreshModules() {
    if (!company?.id) {
      setModules([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const rows = await getCompanyModules(company.id);

      const formattedModules: AppModule[] = (rows || [])
        .map((row: any) => ({
          id: row.modules?.id,
          code: row.modules?.module_key || row.modules?.code,
          name_ar: row.modules?.module_name_ar || row.modules?.name_ar,
          name_en: row.modules?.module_name_en || row.modules?.name_en,
          description_ar: row.modules?.description_ar,
          description_en: row.modules?.description_en,
          icon: row.modules?.icon || "circle",
          route: row.modules?.route || `/v2/${row.modules?.module_key}`,
          enabled: row.is_enabled ?? row.enabled ?? true,
          monthly_price: Number(row.modules?.monthly_price || 0),
          sort_order: Number(row.modules?.sort_order || 0),
        }))
        .filter((module: AppModule) => module.id)
        .sort((a: AppModule, b: AppModule) => a.sort_order - b.sort_order);

      setModules(formattedModules);
    } catch (error) {
      console.error("LOAD COMPANY MODULES ERROR:", error);
      setModules([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshModules();
  }, [company?.id]);

  return (
    <ModuleContext.Provider
      value={{
        modules,
        loading,
        refreshModules,
      }}
    >
      {children}
    </ModuleContext.Provider>
  );
}

export function useModuleContext() {
  return useContext(ModuleContext);
}