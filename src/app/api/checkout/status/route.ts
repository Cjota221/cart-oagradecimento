import { NextResponse } from "next/server";
import { getPaymentClient } from "@/lib/mercadopago";
import { getSupabaseServiceClient } from "@/lib/supabase-service";

export const dynamic = "force-dynamic";

/**
 * GET /api/checkout/status?id=PAYMENT_ID
 * Polling do status do pagamento PIX.
 * Quando aprovado, libera has_access=true (defensivo — o webhook tambem faz isso).
 */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const paymentId = url.searchParams.get("id");

    if (!paymentId) {
      return NextResponse.json({ error: "id obrigatorio" }, { status: 400 });
    }

    const paymentClient = getPaymentClient();
    const payment = await paymentClient.get({ id: paymentId });

    const status = payment.status ?? "pending";
    const approved = status === "approved";
    const userId = String(payment.external_reference ?? "");

    if (approved && userId) {
      const supabaseAdmin = getSupabaseServiceClient();
      // Atualiza perfil (idempotente; webhook ja pode ter feito isso antes)
      await supabaseAdmin
        .from("imprimax_profiles")
        .update({ has_access: true, paid_at: new Date().toISOString() })
        .eq("id", userId);

      await supabaseAdmin
        .from("imprimax_payments")
        .update({ status: "approved" })
        .eq("mp_payment_id", paymentId);
    }

    return NextResponse.json({
      payment_id: paymentId,
      status,
      approved,
    });
  } catch (error) {
    console.error("[checkout/status] erro:", error);
    return NextResponse.json(
      { error: "Falha ao consultar status." },
      { status: 500 },
    );
  }
}
