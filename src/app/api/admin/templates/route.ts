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
    .from("imprimax_templates")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ templates: data });
}

export async function POST(request: Request) {
  if (!(await verifyAdmin())) return NextResponse.json({ error: "Negado" }, { status: 403 });
  const body = await request.json();
  const { name, category, front_url, back_url, is_free, is_active } = body;
  if (!name || !category || !front_url) {
    return NextResponse.json({ error: "name, category e front_url são obrigatórios" }, { status: 400 });
  }
  const service = getSupabaseServiceClient();
  const { data, error } = await service
    .from("imprimax_templates")
    .insert({ name, category, front_url, back_url: back_url || null, is_free: !!is_free, is_active: is_active !== false })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ template: data }, { status: 201 });
}

export async function PATCH(request: Request) {
  if (!(await verifyAdmin())) return NextResponse.json({ error: "Negado" }, { status: 403 });
  const body = await request.json();
  const { id, ...updates } = body;
  if (!id) return NextResponse.json({ error: "id obrigatório" }, { status: 400 });
  const service = getSupabaseServiceClient();
  const { data, error } = await service
    .from("imprimax_templates")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ template: data });
}

export async function DELETE(request: Request) {
  if (!(await verifyAdmin())) return NextResponse.json({ error: "Negado" }, { status: 403 });
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id obrigatório" }, { status: 400 });
  const service = getSupabaseServiceClient();
  const { error } = await service.from("imprimax_templates").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ deleted: true });
}
