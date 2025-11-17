import Stripe from "stripe";

// Vérifier si on est en mode sandbox
const isSandboxMode = process.env.STRIPE_SANDBOX_MODE === "true";

// Sélectionner les bonnes clés selon le mode
const stripeSecretKey = isSandboxMode
  ? process.env.STRIPE_TEST_SECRET_KEY!
  : process.env.STRIPE_LIVE_SECRET_KEY!;

const stripePublishableKey = isSandboxMode
  ? process.env.STRIPE_TEST_PUBLISHABLE_KEY!
  : process.env.STRIPE_LIVE_PUBLISHABLE_KEY!;

export const stripeWebhookSecret = isSandboxMode
  ? process.env.STRIPE_TEST_WEBHOOK_SECRET!
  : process.env.STRIPE_LIVE_WEBHOOK_SECRET!;

// Créer l'instance Stripe
export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2025-10-29.clover",
});

// Exporter les informations de configuration
export const stripeConfig = {
  isSandboxMode,
  publishableKey: stripePublishableKey,
  mode: isSandboxMode ? "TEST" : "LIVE",
};

// Logger pour debug
console.log(`🔧 Stripe configuré en mode: ${stripeConfig.mode}`);
