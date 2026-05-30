import { NextResponse } from "next/server";
import { getPreferenceClient } from "@/lib/mercadopago";
import { getSupabaseServiceClient } from "@/lib/supabase-service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, email, name } = body as {
      userId: string;
      email: string;
      name?: string;
    };

    if (!userId || !email) {
      return NextResponse.json({ error: "Dados obrigatórios ausentes." }, { status: 400 });
    }

    const price = Number(process.env.NEXT_PUBLIC_LIFETIME_PRICE_BRL || "49.9");
    const preference = getPreferenceClient();

    const result = await preference.create({
      body: {
        items: [
          {
            id: "imprimax-vitalicio",
            title: "Imprimax - Acesso Vitalício",
            quantity: 1,
            currency_id: "BRL",
            unit_price: price,
          },
        ],
        payer: {
          email,
          name: name || undefined,
        },
        metadata: {
          user_id: userId,
        },
        external_reference: userId,
        notification_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhook`,
        back_urls: {
          success: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?payment=success`,
          pending: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?payment=pending`,
          failure: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?payment=failure`,
        },
        auto_return: "approved",
      },
    });

    const supabase = getSupabaseServiceClient();
    await supabase.from("payments").insert({
      user_id: userId,
      mp_preference_id: result.id,
      status: "pending",
      amount: price,
    });

    return NextResponse.json({
      preferenceId: result.id,
      initPoint: result.init_point,
      sandboxInitPoint: result.sandbox_init_point,
    });
  } catch (error) {
    console.error("payment route error:", error);
    return NextResponse.json({ error: "Falha ao criar pagamento." }, { status: 500 });
  }
}
