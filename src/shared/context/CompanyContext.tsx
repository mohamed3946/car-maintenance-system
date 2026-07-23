"use client";

import { createContext, ReactNode, useContext, useEffect, useState } from "react";

type Company = {
  id: string;
  company_name: string;
  logo_url?: string | null;
  primary_color?: string | null;
  secondary_color?: string | null;
};

type CompanyContextType = {
  company: Company | null;
  loading: boolean;
};

const CompanyContext = createContext<CompanyContextType>({
  company: null,
  loading: false,
});

export function CompanyProvider({ children }: { children: ReactNode }) {
  const [company] = useState<Company | null>({
    id: "demo",
    company_name: "DeliveryOS",
    logo_url: null,
    primary_color: "#2563eb",
    secondary_color: "#0f2544",
  });

  return (
    <CompanyContext.Provider value={{ company, loading: false }}>
      {children}
    </CompanyContext.Provider>
  );
}

export function useCompanyContext() {
  return useContext(CompanyContext);
}