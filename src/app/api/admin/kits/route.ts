import { NextResponse } from "next/server";
import { getSupabaseServiceClient } from "@/lib/supabase-service";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

async function verifyAdmin() {
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

export async function GET() {
  if (!(await verifyAdmin())) return NextResponse.json({ error: "Negado" }, { status: 403 });
  const service = getSupabaseServiceClient();
  const { data, error } = await service
    .from("imprimax_kits")
    .select(`
      *,
      imprimax_kit_templates (
        sort_order,
        imprimax_templates (
          id, name, category, nicho, front_url, back_url, is_free
        )
      )
    `)
    .order("sort_order");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const kits = (data || []).map((k: any) => ({
    ...k,
    templates: (k.imprimax_kit_templates || [])
      .sort((a: any, b: any) => a.sort_order - b.sort_order)
      .map((kt: any) => kt.imprimax_templates)
      .filter(Boolean),
  }));

  return NextResponse.json({ kits });
}

export async function POST(request: Request) {
  if (!(await verifyAdmin())) return NextResponse.json({ error: "Negado" }, { status: 403 });
  const body = await request.json();
  const { name, description, nicho, is_free, is_active, sort_order, template_ids } = body;
  if (!name) return NextResponse.json({ error: "name é obrigatório" }, { status: 400 });

  const service = getSupabaseServiceClient();
  const { data: kit, error } = await service
    .from("imprimax_kits")
    .insert({
      name,
      description: description || null,
      nicho: nicho || "geral",
      is_free: !!is_free,
      is_active: is_active !== false,
      sort_order: sort_order ?? 0,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (Array.isArray(template_ids) && template_ids.length > 0) {
    const rows = template_ids.map((tid: string, i: number) => ({
      kit_id: kit.id,
      template_id: tid,
      sort_order: i,
    }));
    await service.from("imprimax_kit_templates").insert(rows);
  }

  return NextResponse.json({ kit }, { status: 201 });
}

export async function PATCH(request: Request) {
  if (!(await verifyAdmin())) return NextResponse.json({ error: "Negado" }, { status: 403 });
  const body = await request.json();
  const { id, template_ids, ...updates } = body;
  if (!id) return NextResponse.json({ error: "id obrigatório" }, { status: 400 });

  const service = getSupabaseServiceClient();
  const { data: kit, error } = await service
    .from("imprimax_kits")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (Array.isArray(template_ids)) {
    await service.from("imprimax_kit_templates").delete().eq("kit_id", id);
    if (template_ids.length > 0) {
      const rows = template_ids.map((tid: string, i: number) => ({
        kit_id: id,
        template_id: tid,
        sort_order: i,
      }));
      await service.from("imprimax_kit_templates").insert(rows);
    }
  }

  return NextResponse.json({ kit });
}

export async function DELETE(request: Request) {
  if (!(await verifyAdmin())) return NextResponse.json({ error: "Negado" }, { status: 403 });
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id obrigatório" }, { status: 400 });
  const service = getSupabaseServiceClient();
  const { error } = await service.from("imprimax_kits").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ deleted: true });
}
