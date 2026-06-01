import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { getPaymentClient } from "@/lib/mercadopago";
import { getSupabaseServiceClient } from "@/lib/supabase-service";

export const dynamic = "force-dynamic";

/**
 * POST /api/checkout/criar
 * Body: { nome, email, senha }
 *
 * 1. Cria usuario via Supabase Auth admin (email_confirm=true, pula verificacao por email)
 * 2. Cria perfil em imprimax_profiles com has_access=false
 * 3. Cria cobranca PIX no Mercado Pago (external_reference = userId)
 * 4. Registra em imprimax_payments
 * 5. Retorna QR code + payment_id pra UI fazer polling
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => null)) as {
      nome?: string;
      email?: string;
      senha?: string;
    } | null;

    const nome = body?.nome?.trim();
    const email = body?.email?.trim().toLowerCase();
    const senha = body?.senha;

    if (!nome || !email || !senha) {
      return NextResponse.json(
        { error: "Preencha nome, email e senha." },
        { status: 400 },
      );
    }
    if (senha.length < 6) {
      return NextResponse.json(
        { error: "A senha precisa ter pelo menos 6 caracteres." },
        { status: 400 },
      );
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return NextResponse.json(
        { error: "Email invalido." },
        { status: 400 },
      );
    }

    const siteUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (!siteUrl) {
      console.error("[checkout/criar] NEXT_PUBLIC_APP_URL nao configurado");
      return NextResponse.json(
        { error: "Loja temporariamente indisponivel." },
        { status: 503 },
      );
    }

    const supabaseAdmin = getSupabaseServiceClient();

    // 1) Tenta criar o usuario. Se ja existir, retorna mensagem amigavel.
    const { data: createdUser, error: createError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password: senha,
        email_confirm: true,
        user_metadata: { name: nome },
      });

    if (createError || !createdUser?.user) {
      const msg = createError?.message ?? "";
      if (
        msg.toLowerCase().includes("already") ||
        msg.toLowerCase().includes("registered")
      ) {
        return NextResponse.json(
          {
            error:
              "Este email ja tem conta. Faca login ou use outro email para comprar.",
          },
          { status: 409 },
        );
      }
      console.error("[checkout/criar] erro createUser:", createError);
      return NextResponse.json(
        { error: "Falha ao criar sua conta. Tente novamente." },
        { status: 500 },
      );
    }

    const userId = createdUser.user.id;

    // 2) Cria perfil (idempotente)
    await supabaseAdmin
      .from("imprimax_profiles")
      .upsert(
        {
          id: userId,
          email,
          name: nome,
          has_access: false,
        },
        { onConflict: "id" },
      );

    // 3) Cria cobranca PIX no MP
    const price = Number(process.env.NEXT_PUBLIC_LIFETIME_PRICE_BRL || "19.9");
    const nomePartes = nome.split(/\s+/);
    const idempotencyKey = randomUUID();

    const paymentClient = getPaymentClient();
    let pix;
    try {
      pix = await paymentClient.create({
        body: {
          transaction_amount: price,
          description: "Imprimax - Acesso Vitalicio",
          payment_method_id: "pix",
          external_reference: userId,
          notification_url: `${siteUrl}/api/webhook`,
          payer: {
            email,
            first_name: nomePartes[0],
            last_name: nomePartes.slice(1).join(" ") || nomePartes[0],
          },
        },
        requestOptions: { idempotencyKey },
      });
    } catch (error) {
      console.error("[checkout/criar] erro MP Payment.create:", error);
      return NextResponse.json(
        { error: "Falha ao criar pagamento. Tente novamente em alguns segundos." },
        { status: 502 },
      );
    }

    // 4) Registra em imprimax_payments
    await supabaseAdmin.from("imprimax_payments").insert({
      user_id: userId,
      mp_payment_id: String(pix.id),
      status: pix.status ?? "pending",
      amount: price,
    });

    const txData = (pix.point_of_interaction?.transaction_data ?? {}) as {
      qr_code?: string;
      qr_code_base64?: string;
      ticket_url?: string;
    };

    return NextResponse.json({
      payment_id: String(pix.id),
      user_id: userId,
      amount: price,
      qr_code: txData.qr_code ?? null,
      qr_code_base64: txData.qr_code_base64 ?? null,
      ticket_url: txData.ticket_url ?? null,
    });
  } catch (error) {
    console.error("[checkout/criar] erro inesperado:", error);
    return NextResponse.json(
      { error: "Erro interno. Tente novamente." },
      { status: 500 },
    );
  }
}
