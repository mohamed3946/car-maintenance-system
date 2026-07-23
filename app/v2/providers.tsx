"use client";

import { ReactNode } from "react";
import { SystemProvider } from "@/providers/SystemProvider";

export default function Providers({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <SystemProvider>
      {children}
    </SystemProvider>
  );
}