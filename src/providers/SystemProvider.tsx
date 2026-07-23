"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AppLanguage,
  getSystemTranslation,
  systemConfig,
} from "@/config/systemConfig";

type SystemContextValue = {
  lang: AppLanguage;
  dir: "rtl" | "ltr";
  t: ReturnType<typeof getSystemTranslation>;
  toggleLanguage: () => void;
};

const SystemContext = createContext<SystemContextValue | null>(null);

export function SystemProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<AppLanguage>(
    systemConfig.app.defaultLanguage
  );

  useEffect(() => {
    const savedLanguage = localStorage.getItem(
      "deliveryos_language"
    ) as AppLanguage | null;

    if (savedLanguage === "ar" || savedLanguage === "en") {
      setLang(savedLanguage);
    }
  }, []);

  function toggleLanguage() {
    const nextLanguage: AppLanguage = lang === "ar" ? "en" : "ar";

    setLang(nextLanguage);
    localStorage.setItem("deliveryos_language", nextLanguage);
  }

  const t = useMemo(() => getSystemTranslation(lang), [lang]);
  const dir = t.direction;

  useEffect(() => {
    const root = document.documentElement;
    const colors = systemConfig.theme.colors;

    root.lang = lang;
    root.dir = dir;

    root.style.setProperty("--color-primary", colors.primary);
    root.style.setProperty("--color-primary-hover", colors.primaryHover);
    root.style.setProperty("--color-background", colors.background);
    root.style.setProperty("--color-card", colors.card);
    root.style.setProperty("--color-border", colors.border);
    root.style.setProperty("--color-text", colors.text);
    root.style.setProperty("--color-muted", colors.mutedText);
    root.style.setProperty("--color-success", colors.success);
    root.style.setProperty("--color-warning", colors.warning);
    root.style.setProperty("--color-danger", colors.danger);
  }, [lang, dir]);

  return (
    <SystemContext.Provider
      value={{
        lang,
        dir,
        t,
        toggleLanguage,
      }}
    >
      <div dir={dir}>{children}</div>
    </SystemContext.Provider>
  );
}

export function useSystem() {
  const context = useContext(SystemContext);

  if (!context) {
    throw new Error("useSystem must be used inside SystemProvider");
  }

  return context;
}