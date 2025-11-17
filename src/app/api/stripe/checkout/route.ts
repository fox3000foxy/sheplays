import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyJwt } from "@/lib/jwt";
import { stripe } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  try {
    // Vérifier l'authentification
    const store = await cookies();
    const token = store.get("sp_session")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyJwt(token, process.env.AUTH_JWT_SECRET || "dev-secret-change-me");
    if (!payload) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    const userId = String(payload.sub);
    const username = String(payload.username || "");

    // Récupérer le montant depuis le body
    const body = await req.json();
    const { amount } = body; // Montant en euros

    if (!amount || amount < 5) {
      return NextResponse.json(
        { error: "Le montant minimum est de 5€" },
        { status: 400 }
      );
    }

    // Convertir en centimes
    const amountInCents = Math.round(amount * 100);

    // Calculer les crédits (1€ = 100 crédits)
    const credits = amount * 100;

    // Créer la session Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "eur",
            product_data: {
              name: `${credits} crédits ShePlays`,
              description: `Ajout de ${credits} crédits à votre compte ShePlays`,
              images: ["https://sheplays.wtf/images/logo.svg"],
            },
            unit_amount: amountInCents,
          },
        },
      ],
      mode: "payment",
      metadata: {
        credits: credits.toString(),
        user_id: userId,
        discord_id: userId,
        username: username,
        amount_eur: amount.toString(),
      },
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?payment=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?payment=cancelled`,
      automatic_tax: { enabled: true },
      billing_address_collection: "auto",
      customer_creation: "if_required",
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "Failed to create checkout session" },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
