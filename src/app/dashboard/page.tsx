import { redirect } from "next/navigation";
import CardGenerator from "@/components/CardGenerator";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import type { TemplateItem } from "@/components/TemplateGallery";

export default async function DashboardPage() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("has_access")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.has_access) {
    redirect("/?blocked=1");
  }

  const { data: templatesRaw } = await supabase
    .from("templates")
    .select("id,name,category,front_url,back_url,is_free")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  const templates = (templatesRaw || []) as TemplateItem[];

  return (
    <main className="mx-auto w-full max-w-[1500px] flex-1 px-4 py-6 md:px-6">
      <h1 className="mb-3 text-2xl font-extrabold text-[#1a0533]">Dashboard Imprimax</h1>
      <p className="mb-5 text-sm text-[#1a0533]/70">
        Seu acesso vitalício está ativo. Selecione um template premium ou envie suas próprias artes.
      </p>
      <CardGenerator enableTemplates templates={templates} hasAccess />
    </main>
  );
}
