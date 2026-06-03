import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://hmyyldouqyjfizomhooj.supabase.co";

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "sb_publishable_gb7BRCvm-T3Ge5rcuDvnTQ_3ByrPsz6";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);