import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

/**
 * Récupère la liste des talents parrainés par un client
 * GET /api/referral/my-referrals/[userId]
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

    // Récupérer tous les talents parrainés par ce client
    const [referrals] = await pool.query(
      `SELECT
        r.talent_discord_id,
        r.referral_code,
        r.created_at,
        t.display_name,
        t.username,
        t.bio,
        t.total_sessions,
        t.rating,
        t.review_count
      FROM referrals r
      INNER JOIN talents t ON r.talent_discord_id = t.discord_id
      WHERE r.referrer_user_id = ?
      ORDER BY r.created_at DESC`,
      [userId]
    );

    if (!Array.isArray(referrals)) {
      return NextResponse.json({ error: "query_failed" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      count: referrals.length,
      referrals: referrals
    });

  } catch (error) {
    console.error("Error getting referrals:", error);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
