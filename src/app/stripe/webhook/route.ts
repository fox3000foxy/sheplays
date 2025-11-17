import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import mysql from "mysql2/promise";
import { stripe, stripeWebhookSecret } from "@/lib/stripe";

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "sheplaysuser",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "sheplays",
  waitForConnections: true,
  connectionLimit: 10,
});

async function addCreditsToUser(userId: string, credits: number, description: string, stripePaymentIntent: string | null = null) {
  const now = Date.now();

  // Récupérer ou créer la balance utilisateur
  const [rows] = await pool.query(
    "SELECT * FROM user_balances WHERE user_id = ?",
    [userId]
  );

  let balance = Array.isArray(rows) && rows.length > 0 ? (rows[0] as any) : null;

  if (!balance) {
    // Créer la balance si elle n'existe pas
    await pool.query(
      "INSERT INTO user_balances (user_id, balance, total_spent, total_added, verified, created_at, updated_at) VALUES (?, 0, 0, 0, 0, ?, ?)",
      [userId, now, now]
    );
    const [newRows] = await pool.query(
      "SELECT * FROM user_balances WHERE user_id = ?",
      [userId]
    );
    balance = Array.isArray(newRows) && newRows.length > 0 ? (newRows[0] as any) : null;
  }

  if (!balance) {
    throw new Error("Failed to get or create user balance");
  }

  const newBalance = balance.balance + credits;
  const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Créer la transaction
  await pool.query(
    "INSERT INTO transactions (id, user_id, type, amount, balance_before, balance_after, description, stripe_payment_intent, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [
      transactionId,
      userId,
      "credit",
      credits,
      balance.balance,
      newBalance,
      description,
      stripePaymentIntent,
      now,
    ]
  );

  // Mettre à jour la balance
  await pool.query(
    "UPDATE user_balances SET balance = ?, total_added = total_added + ?, updated_at = ? WHERE user_id = ?",
    [newBalance, credits, now, userId]
  );

  console.log(`✅ Added ${credits} credits to user ${userId}. Balance: ${balance.balance} → ${newBalance}`);
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    console.error("❌ Missing Stripe signature");
    return NextResponse.json(
      { error: "Missing signature" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      stripeWebhookSecret
    );
  } catch (err: any) {
    console.error("❌ Webhook signature verification failed:", err.message);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  // Gérer l'événement
  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const { metadata } = session;

        if (!metadata?.user_id || !metadata?.credits) {
          console.error("❌ Invalid session metadata:", metadata);
          return NextResponse.json(
            { error: "Invalid metadata" },
            { status: 400 }
          );
        }

        const credits = parseInt(metadata.credits, 10);
        const userId = metadata.user_id;
        const username = metadata.username || "Unknown";
        const amountEur = metadata.amount_eur || "0";

        console.log(`💳 Payment completed for user ${username} (${userId}): ${credits} credits (${amountEur}€)`);

        await addCreditsToUser(
          userId,
          credits,
          `Achat de ${credits} crédits (${amountEur}€)`,
          session.payment_intent as string
        );

        break;
      }

      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log("✅ Payment succeeded:", paymentIntent.id);
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log("❌ Payment failed:", paymentIntent.id);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("❌ Error processing webhook:", error);
    return NextResponse.json(
      { error: `Webhook processing error: ${error.message}` },
      { status: 500 }
    );
  }
}
