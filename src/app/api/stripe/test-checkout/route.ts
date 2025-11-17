import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyJwt } from "@/lib/jwt";
import { stripe } from "@/lib/stripe";

const TEST_SECRET = "sheplays_test_2024"; // Secret pour accéder à cette route

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { secret } = body;

    // Vérifier le secret
    if (secret !== TEST_SECRET) {
      return NextResponse.json({ error: "Invalid secret" }, { status: 403 });
    }

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

    // Montant de test : 0,50€ = 50 crédits (minimum Stripe)
    const amountInCents = 50; // 50 centimes
    const credits = 50; // 50 crédits
    const amountEur = 0.50;

    // Créer la session Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "eur",
            product_data: {
              name: `${credits} crédit ShePlays (TEST)`,
              description: `Test - Ajout de ${credits} crédit à votre compte`,
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
        amount_eur: amountEur.toString(),
      },
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?payment=success&test=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?payment=cancelled`,
      automatic_tax: { enabled: false }, // Pas de taxe pour le test
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
    console.error("Stripe test checkout error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
