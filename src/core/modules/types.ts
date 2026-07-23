import { ReactNode } from "react";

export interface AppModule {
  id: string;
  code: string;

  name_ar: string;
  name_en: string;

  description_ar?: string;
  description_en?: string;

  icon: string;

  route: string;

  enabled: boolean;

  monthly_price: number;

  sort_order: number;

  children?: AppModule[];

  component?: ReactNode;
}