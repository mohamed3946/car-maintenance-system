import { supabase } from "@/app/lib/supabase";

export type DeliveryAppColumn = {
  id: string;
  company_id: string;
  app_id: string;

  field_key: string;

  label_ar: string;
  label_en: string;

  source_column_name: string;

  data_type:
    | "text"
    | "number"
    | "percentage"
    | "date"
    | "datetime"
    | "boolean"
    | "duration";

  is_required: boolean;
  is_identifier: boolean;

  default_value: string | null;

  sort_order: number;

  archived_at: string | null;

  created_at: string;
  updated_at: string;
};

export type CreateDeliveryAppColumnInput = {
  company_id: string;
  app_id: string;

  field_key: string;

  label_ar: string;
  label_en: string;

  source_column_name: string;

  data_type?: DeliveryAppColumn["data_type"];

  is_required?: boolean;
  is_identifier?: boolean;

  default_value?: string | null;

  sort_order?: number;
};

export type UpdateDeliveryAppColumnInput = Partial<
  Omit<
    DeliveryAppColumn,
    | "id"
    | "company_id"
    | "app_id"
    | "created_at"
    | "updated_at"
  >
>;

function normalizeFieldKey(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export const columnsService = {
  async getAll(appId: string): Promise<DeliveryAppColumn[]> {
    const { data, error } = await supabase
      .from("delivery_app_columns")
      .select("*")
      .eq("app_id", appId)
      .is("archived_at", null)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) {
      throw new Error(
        `تعذر تحميل تعريفات الأعمدة: ${error.message}`
      );
    }

    return (data ?? []) as DeliveryAppColumn[];
  },

  async getArchived(
    appId: string
  ): Promise<DeliveryAppColumn[]> {
    const { data, error } = await supabase
      .from("delivery_app_columns")
      .select("*")
      .eq("app_id", appId)
      .not("archived_at", "is", null)
      .order("archived_at", { ascending: false });

    if (error) {
      throw new Error(
        `تعذر تحميل الأعمدة المؤرشفة: ${error.message}`
      );
    }

    return (data ?? []) as DeliveryAppColumn[];
  },

  async create(
    input: CreateDeliveryAppColumnInput
  ): Promise<DeliveryAppColumn> {
    const payload = {
      company_id: input.company_id,
      app_id: input.app_id,

      field_key: normalizeFieldKey(input.field_key),

      label_ar: input.label_ar.trim(),
      label_en: input.label_en.trim(),

      source_column_name: input.source_column_name.trim(),

      data_type: input.data_type ?? "text",

      is_required: input.is_required ?? false,
      is_identifier: input.is_identifier ?? false,

      default_value: input.default_value?.trim() || null,

      sort_order: input.sort_order ?? 0,
    };

    const { data, error } = await supabase
      .from("delivery_app_columns")
      .insert(payload)
      .select("*")
      .single();

    if (error) {
      if (error.code === "23505") {
        throw new Error(
          "هذا الحقل الداخلي مسجل بالفعل داخل التطبيق."
        );
      }

      throw new Error(
        `تعذر إضافة تعريف العمود: ${error.message}`
      );
    }

    return data as DeliveryAppColumn;
  },

  async update(
    columnId: string,
    input: UpdateDeliveryAppColumnInput
  ): Promise<DeliveryAppColumn> {
    const payload: UpdateDeliveryAppColumnInput = {
      ...input,
    };

    if (typeof input.field_key === "string") {
      payload.field_key = normalizeFieldKey(input.field_key);
    }

    if (typeof input.label_ar === "string") {
      payload.label_ar = input.label_ar.trim();
    }

    if (typeof input.label_en === "string") {
      payload.label_en = input.label_en.trim();
    }

    if (typeof input.source_column_name === "string") {
      payload.source_column_name =
        input.source_column_name.trim();
    }

    if (typeof input.default_value === "string") {
      payload.default_value =
        input.default_value.trim() || null;
    }

    const { data, error } = await supabase
      .from("delivery_app_columns")
      .update(payload)
      .eq("id", columnId)
      .select("*")
      .single();

    if (error) {
      throw new Error(
        `تعذر تعديل تعريف العمود: ${error.message}`
      );
    }

    return data as DeliveryAppColumn;
  },

  async archive(columnId: string): Promise<void> {
    const { error } = await supabase
      .from("delivery_app_columns")
      .update({
        archived_at: new Date().toISOString(),
      })
      .eq("id", columnId);

    if (error) {
      throw new Error(
        `تعذر أرشفة تعريف العمود: ${error.message}`
      );
    }
  },

  async restore(
    columnId: string
  ): Promise<DeliveryAppColumn> {
    const { data, error } = await supabase
      .from("delivery_app_columns")
      .update({
        archived_at: null,
      })
      .eq("id", columnId)
      .select("*")
      .single();

    if (error) {
      throw new Error(
        `تعذر استعادة تعريف العمود: ${error.message}`
      );
    }

    return data as DeliveryAppColumn;
  },

  async reorder(
    columns: Array<{
      id: string;
      sort_order: number;
    }>
  ): Promise<void> {
    const results = await Promise.all(
      columns.map((column) =>
        supabase
          .from("delivery_app_columns")
          .update({
            sort_order: column.sort_order,
          })
          .eq("id", column.id)
      )
    );

    const failedResult = results.find(
      (result) => result.error
    );

    if (failedResult?.error) {
      throw new Error(
        `تعذر ترتيب الأعمدة: ${failedResult.error.message}`
      );
    }
  },
};