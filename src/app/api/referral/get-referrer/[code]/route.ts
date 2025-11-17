import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

/**
 * Récupère les informations du parrain à partir d'un code de parrainage
 * GET /api/referral/get-referrer/[code]
 * Retourne: username, discord avatar, etc.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;

    if (!code) {
      return NextResponse.json({ error: "code_required" }, { status: 400 });
    }

    // Chercher le code de parrainage et récupérer les infos du parrain
    const [codeRows] = await pool.query(
      "SELECT user_id FROM referral_codes WHERE referral_code = ?",
      [code.toUpperCase()]
    );

    if (!Array.isArray(codeRows) || codeRows.length === 0) {
      return NextResponse.json({ error: "invalid_code" }, { status: 404 });
    }

    const userId = (codeRows as any[])[0].user_id;

    // Pour les clients, on n'a pas forcément de table dédiée
    // On va chercher dans les transactions ou créer une vue simple
    // Pour l'instant, retournons juste le user_id et on affichera via Discord API

    return NextResponse.json({
      valid: true,
      referrer_user_id: userId,
      referral_code: code.toUpperCase()
    });

  } catch (error) {
    console.error("Error getting referrer:", error);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
