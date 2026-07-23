import { supabase } from "@/app/lib/supabase";

export type DeliveryApp = {
  id: string;
  company_id: string;
  name: string;
  code: string;
  account_id: string | null;
  logo_url: string | null;
  cities: string[];
  is_active: boolean;
  import_method: "excel" | "csv" | "api" | "manual";
  rules_source: "manual" | "file";
  rules_file_name: string | null;
  rules_file_url: string | null;
  column_mapping: Record<string, unknown>;
  api_settings: Record<string, unknown>;
  notes: string | null;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
};

export type CreateDeliveryAppInput = {
  company_id: string;
  name: string;
  code: string;
  account_id?: string | null;
  logo_url?: string | null;
  cities?: string[];
  is_active?: boolean;
  import_method?: DeliveryApp["import_method"];
  rules_source?: DeliveryApp["rules_source"];
  notes?: string | null;
};

export type UpdateDeliveryAppInput = Partial<
  Omit<
    DeliveryApp,
    "id" | "company_id" | "created_at" | "updated_at"
  >
>;

function normalizeCode(value: string) {
  return value
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export const appsService = {
  async getAll(companyId: string): Promise<DeliveryApp[]> {
    const { data, error } = await supabase
      .from("delivery_apps")
      .select("*")
      .eq("company_id", companyId)
      .is("archived_at", null)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`تعذر تحميل التطبيقات: ${error.message}`);
    }

    return (data ?? []) as DeliveryApp[];
  },

  async getById(appId: string): Promise<DeliveryApp | null> {
    const { data, error } = await supabase
      .from("delivery_apps")
      .select("*")
      .eq("id", appId)
      .maybeSingle();

    if (error) {
      throw new Error(`تعذر تحميل التطبيق: ${error.message}`);
    }

    return data as DeliveryApp | null;
  },

  async create(
    input: CreateDeliveryAppInput
  ): Promise<DeliveryApp> {
    const payload = {
      company_id: input.company_id,
      name: input.name.trim(),
      code: normalizeCode(input.code || input.name),
      account_id: input.account_id?.trim() || null,
      logo_url: input.logo_url || null,
      cities: input.cities ?? [],
      is_active: input.is_active ?? true,
      import_method: input.import_method ?? "excel",
      rules_source: input.rules_source ?? "manual",
      notes: input.notes?.trim() || null,
    };

    const { data, error } = await supabase
      .from("delivery_apps")
      .insert(payload)
      .select("*")
      .single();

    if (error) {
      if (error.code === "23505") {
        throw new Error(
          "هذا التطبيق مسجل بالفعل لنفس الشركة."
        );
      }

      throw new Error(`تعذر إضافة التطبيق: ${error.message}`);
    }

    return data as DeliveryApp;
  },

  async update(
    appId: string,
    input: UpdateDeliveryAppInput
  ): Promise<DeliveryApp> {
    const payload: UpdateDeliveryAppInput = {
      ...input,
    };

    if (typeof input.name === "string") {
      payload.name = input.name.trim();
    }

    if (typeof input.code === "string") {
      payload.code = normalizeCode(input.code);
    }

    if (typeof input.account_id === "string") {
      payload.account_id = input.account_id.trim() || null;
    }

    if (typeof input.notes === "string") {
      payload.notes = input.notes.trim() || null;
    }

    const { data, error } = await supabase
      .from("delivery_apps")
      .update(payload)
      .eq("id", appId)
      .select("*")
      .single();

    if (error) {
      throw new Error(`تعذر تعديل التطبيق: ${error.message}`);
    }

    return data as DeliveryApp;
  },

  async setActive(
    appId: string,
    isActive: boolean
  ): Promise<DeliveryApp> {
    return this.update(appId, {
      is_active: isActive,
    });
  },

  async archive(appId: string): Promise<void> {
    const { error } = await supabase
      .from("delivery_apps")
      .update({
        is_active: false,
        archived_at: new Date().toISOString(),
      })
      .eq("id", appId);

    if (error) {
      throw new Error(`تعذر أرشفة التطبيق: ${error.message}`);
    }
  },

  async restore(appId: string): Promise<DeliveryApp> {
    const { data, error } = await supabase
      .from("delivery_apps")
      .update({
        is_active: true,
        archived_at: null,
      })
      .eq("id", appId)
      .select("*")
      .single();

    if (error) {
      throw new Error(`تعذر استعادة التطبيق: ${error.message}`);
    }

    return data as DeliveryApp;
  },

  async getArchived(companyId: string): Promise<DeliveryApp[]> {
    const { data, error } = await supabase
      .from("delivery_apps")
      .select("*")
      .eq("company_id", companyId)
      .not("archived_at", "is", null)
      .order("archived_at", { ascending: false });

    if (error) {
      throw new Error(
        `تعذر تحميل التطبيقات المؤرشفة: ${error.message}`
      );
    }

    return (data ?? []) as DeliveryApp[];
  },
};