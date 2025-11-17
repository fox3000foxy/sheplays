import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

/**
 * Génère ou récupère le code de parrainage d'un client
 * GET /api/referral/get-code/[userId]
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    if (!userId) {
      return NextResponse.json({ error: "user_id_required" }, { status: 400 });
    }

    // Vérifier si le client a déjà un code de parrainage
    const [existingCodes] = await pool.query(
      "SELECT referral_code FROM referral_codes WHERE user_id = ?",
      [userId]
    );

    if (Array.isArray(existingCodes) && existingCodes.length > 0) {
      const code = (existingCodes as any[])[0].referral_code;
      return NextResponse.json({
        referral_code: code,
        referral_link: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://sheplays.wtf'}/start?ref=${code}`
      });
    }

    // Générer un nouveau code de parrainage unique
    const referralCode = await generateUniqueReferralCode(userId);
    const now = Date.now();

    // Insérer dans la base de données
    await pool.query(
      "INSERT INTO referral_codes (user_id, referral_code, created_at) VALUES (?, ?, ?)",
      [userId, referralCode, now]
    );

    return NextResponse.json({
      referral_code: referralCode,
      referral_link: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://sheplays.wtf'}/start?ref=${referralCode}`
    });

  } catch (error) {
    console.error("Error getting referral code:", error);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}

/**
 * Génère un code de parrainage unique basé sur le user_id
 * Format: 6-8 caractères alphanumériques en majuscules
 */
async function generateUniqueReferralCode(userId: string): Promise<string> {
  // Utiliser une partie du userId + random pour garantir l'unicité
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Sans O, 0, I, 1 pour éviter confusion

  // Tenter de générer un code unique (max 10 tentatives)
  for (let attempt = 0; attempt < 10; attempt++) {
    let code = '';

    // Générer 8 caractères aléatoires
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    // Vérifier que le code n'existe pas déjà
    const [existing] = await pool.query(
      "SELECT referral_code FROM referral_codes WHERE referral_code = ?",
      [code]
    );

    if (!Array.isArray(existing) || existing.length === 0) {
      return code;
    }
  }

  // Fallback: utiliser un timestamp pour garantir l'unicité
  const timestamp = Date.now().toString(36).toUpperCase();
  return timestamp.substring(timestamp.length - 8);
}
