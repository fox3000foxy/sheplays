import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

/**
 * Applique un code de parrainage à un talent
 * POST /api/referral/apply
 * Body: { talentDiscordId: string, referralCode: string }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { talentDiscordId, referralCode } = body;

    if (!talentDiscordId || !referralCode) {
      return NextResponse.json(
        { error: "missing_parameters" },
        { status: 400 }
      );
    }

    const code = referralCode.toUpperCase().trim();

    // Vérifier que le code de parrainage existe
    const [codeRows] = await pool.query(
      "SELECT user_id FROM referral_codes WHERE referral_code = ?",
      [code]
    );

    if (!Array.isArray(codeRows) || codeRows.length === 0) {
      return NextResponse.json(
        { error: "invalid_code", message: "Code de parrainage invalide" },
        { status: 404 }
      );
    }

    const referrerUserId = (codeRows as any[])[0].user_id;

    // Vérifier que le talent existe
    const [talentRows] = await pool.query(
      "SELECT id, discord_id, display_name, referred_by FROM talents WHERE discord_id = ?",
      [talentDiscordId]
    );

    if (!Array.isArray(talentRows) || talentRows.length === 0) {
      return NextResponse.json(
        { error: "talent_not_found", message: "Talent non trouvé" },
        { status: 404 }
      );
    }

    const talent = (talentRows as any[])[0];

    // Vérifier si le talent a déjà été parrainé
    if (talent.referred_by) {
      return NextResponse.json(
        {
          error: "already_referred",
          message: "Vous avez déjà utilisé un code de parrainage"
        },
        { status: 400 }
      );
    }

    const now = Date.now();

    // Mettre à jour le talent avec le code de parrainage
    await pool.query(
      "UPDATE talents SET referred_by = ?, referral_code_used = ?, updated_at = ? WHERE discord_id = ?",
      [referrerUserId, code, now, talentDiscordId]
    );

    // Enregistrer le parrainage dans la table referrals
    await pool.query(
      "INSERT INTO referrals (talent_discord_id, referrer_user_id, referral_code, created_at) VALUES (?, ?, ?, ?)",
      [talentDiscordId, referrerUserId, code, now]
    );

    return NextResponse.json({
      success: true,
      message: "Code de parrainage appliqué avec succès!",
      referrer_user_id: referrerUserId
    });

  } catch (error: any) {
    console.error("Error applying referral code:", error);

    // Gérer les erreurs de duplicates
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json(
        {
          error: "already_referred",
          message: "Vous avez déjà utilisé un code de parrainage"
        },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
