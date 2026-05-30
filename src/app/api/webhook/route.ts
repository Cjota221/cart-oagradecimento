import { NextResponse } from "next/server";
import { getPaymentClient } from "@/lib/mercadopago";
import { getSupabaseServiceClient } from "@/lib/supabase-service";

export async function POST(request: Request) {
  try {
    const webhook = await request.json();
    const isPaymentEvent = webhook?.type === "payment" && webhook?.data?.id;
    if (!isPaymentEvent) {
      return NextResponse.json({ received: true });
    }

    const paymentId = String(webhook.data.id);
    const paymentClient = getPaymentClient();
    const payment = await paymentClient.get({ id: paymentId });

    const paymentStatus = payment.status || "pending";
    const userId = String(payment.external_reference || payment.metadata?.user_id || "");
    const preferenceId = String(payment.order?.id || payment.additional_info?.items?.[0]?.id || "");
    const amount = Number(payment.transaction_amount || 0);

    const supabase = getSupabaseServiceClient();

    await supabase.from("payments").upsert(
      {
        user_id: userId || null,
        mp_payment_id: paymentId,
        mp_preference_id: preferenceId || null,
        status: paymentStatus,
        amount,
      },
      { onConflict: "mp_payment_id" },
    );

    if (paymentStatus === "approved" && userId) {
      await supabase
        .from("profiles")
        .update({ has_access: true, paid_at: new Date().toISOString() })
        .eq("id", userId);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("webhook route error:", error);
    return NextResponse.json({ error: "Webhook error" }, { status: 500 });
  }
}
