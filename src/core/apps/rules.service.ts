import { supabase } from "@/app/lib/supabase";

export type DeliveryAppRule = {
  id: string;
  company_id: string;
  app_id: string;

  rule_key: string;

  name_ar: string;
  name_en: string;

  description_ar: string | null;
  description_en: string | null;

  rule_type:
    | "number"
    | "percentage"
    | "boolean"
    | "text"
    | "time"
    | "days"
    | "orders"
    | "distance";

  operator:
    | "="
    | "!="
    | ">"
    | ">="
    | "<"
    | "<="
    | "between"
    | "contains"
    | "boolean";

  value_text: string | null;
  value_number: number | null;

  min_value: number | null;
  max_value: number | null;

  unit_ar: string | null;
  unit_en: string | null;

  is_required: boolean;
  is_active: boolean;

  sort_order: number;

  archived_at: string | null;

  created_at: string;
  updated_at: string;
};

export const rulesService = {
  async getAll(appId: string): Promise<DeliveryAppRule[]> {
    const { data, error } = await supabase
      .from("delivery_app_rules")
      .select("*")
      .eq("app_id", appId)
      .is("archived_at", null)
      .order("sort_order", { ascending: true });

    if (error) {
      throw new Error(error.message);
    }

    return (data ?? []) as DeliveryAppRule[];
  },

  async create(rule: Partial<DeliveryAppRule>) {
    const { data, error } = await supabase
      .from("delivery_app_rules")
      .insert(rule)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  async update(
    id: string,
    values: Partial<DeliveryAppRule>
  ) {
    const { data, error } = await supabase
      .from("delivery_app_rules")
      .update(values)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  async archive(id: string) {
    const { error } = await supabase
      .from("delivery_app_rules")
      .update({
        archived_at: new Date().toISOString(),
        is_active: false,
      })
      .eq("id", id);

    if (error) {
      throw new Error(error.message);
    }
  },

  async restore(id: string) {
    const { error } = await supabase
      .from("delivery_app_rules")
      .update({
        archived_at: null,
        is_active: true,
      })
      .eq("id", id);

    if (error) {
      throw new Error(error.message);
    }
  },

  async delete(id: string) {
    const { error } = await supabase
      .from("delivery_app_rules")
      .delete()
      .eq("id", id);

    if (error) {
      throw new Error(error.message);
    }
  },
};