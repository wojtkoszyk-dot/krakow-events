import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseKey, getSupabaseUrl } from "@/utils/supabase/env";

export const createClient = () =>
  createBrowserClient(getSupabaseUrl(), getSupabaseKey());
