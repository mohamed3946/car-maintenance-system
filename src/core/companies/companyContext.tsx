"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

import { Company } from "./types";
import { getCompanyById } from "./companyService";

type CompanyContextValue = {
  company: Company | null;
  loading: boolean;
  setCompanyId: (companyId: string) => void;
  refreshCompany: () => Promise<void>;
};

const CompanyContext = createContext<CompanyContextValue>({
  company: null,
  loading: true,
  setCompanyId: () => {},
  refreshCompany: async () => {},
});

export function CompanyProvider({ children }: { children: ReactNode }) {
  const [company, setCompany] = useState<Company | null>(null);
  const [companyId, setCompanyIdState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  function setCompanyId(id: string) {
    localStorage.setItem("company_id", id);
    setCompanyIdState(id);
  }

  async function refreshCompany() {
    setLoading(true);

    try {
      const id = companyId || localStorage.getItem("company_id");

      if (!id) {
        setCompany(null);
        return;
      }

      const { data, error } = await getCompanyById(id);

      if (error) {
        console.error("LOAD COMPANY ERROR:", error);
        setCompany(null);
        return;
      }

      setCompany(data as Company);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const savedCompanyId = localStorage.getItem("company_id");
    setCompanyIdState(savedCompanyId);
  }, []);

  useEffect(() => {
    refreshCompany();
  }, [companyId]);

  return (
    <CompanyContext.Provider
      value={{
        company,
        loading,
        setCompanyId,
        refreshCompany,
      }}
    >
      {children}
    </CompanyContext.Provider>
  );
}

export function useCompanyContext() {
  return useContext(CompanyContext);
}