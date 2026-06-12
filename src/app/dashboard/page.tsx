import { redirect } from "next/navigation";
import CardGenerator from "@/components/CardGenerator";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { getSupabaseServiceClient } from "@/lib/supabase-service";
import type { TemplateItem, KitItem, ColecaoItem } from "@/components/TemplateGallery";

export default async function DashboardPage() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("imprimax_profiles")
    .select("has_access")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.has_access) redirect("/?blocked=1");

  const { data: templatesRaw } = await supabase
    .from("imprimax_templates")
    .select("id,name,category,nicho,front_url,back_url,is_free,sort_order")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  const templates = (templatesRaw || []) as TemplateItem[];

  const serviceClient = getSupabaseServiceClient();

  const { data: kitsRaw } = await serviceClient
    .from("imprimax_kits")
    .select(`
      id, name, description, nicho, cover_url, is_free,
      imprimax_kit_templates (
        sort_order,
        imprimax_templates ( id, name, category, nicho, front_url, back_url, is_free )
      )
    `)
    .eq("is_active", true)
    .order("sort_order");

  const kits: KitItem[] = (kitsRaw || []).map((k: any) => ({
    id: k.id,
    name: k.name,
    description: k.description,
    nicho: k.nicho,
    cover_url: k.cover_url,
    is_free: k.is_free,
    templates: (k.imprimax_kit_templates || [])
      .sort((a: any, b: any) => a.sort_order - b.sort_order)
      .map((kt: any) => kt.imprimax_templates)
      .filter(Boolean),
  }));

  const { data: colecoesRaw } = await serviceClient
    .from("imprimax_colecoes")
    .select(`
      id, name, description, cover_url,
      imprimax_colecao_templates (
        sort_order,
        imprimax_templates (
          id, name, category, nicho,
          front_url, back_url, is_free
        )
      )
    `)
    .eq("is_active", true)
    .order("sort_order");

  const colecoes: ColecaoItem[] = (colecoesRaw || []).map((c: any) => ({
    id: c.id,
    name: c.name,
    description: c.description,
    cover_url: c.cover_url,
    templates: (c.imprimax_colecao_templates || [])
      .sort((a: any, b: any) => a.sort_order - b.sort_order)
      .map((ct: any) => ct.imprimax_templates)
      .filter(Boolean),
  }));

  return (
    <main className="mx-auto w-full max-w-375 flex-1 px-4 py-6 md:px-6">
      <h1 className="no-print mb-3 text-2xl font-extrabold text-[#16120E]">Dashboard Imprimax</h1>
      <p className="no-print mb-5 text-sm text-[#16120E]/70">
        Seu acesso vitalício está ativo. Selecione um template premium ou envie suas próprias artes.
      </p>
      <CardGenerator enableTemplates templates={templates} kits={kits} colecoes={colecoes} hasAccess />
    </main>
  );
}
