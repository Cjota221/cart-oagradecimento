import { getSupabaseServerClient } from "@/lib/supabase-server";

export async function checkIsAdmin(): Promise<boolean> {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data } = await supabase
    .from("imprimax_profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();

  return data?.is_admin === true;
}
