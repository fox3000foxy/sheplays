import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

/**
 * Route pour synchroniser les stats d'un talent (total_sessions, rating, review_count)
 * basé sur les données réelles dans la BDD
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { talentDiscordId } = body;

    if (!talentDiscordId) {
      return NextResponse.json({ error: "Missing talentDiscordId" }, { status: 400 });
    }

    // Compter les sessions complétées
    const [sessionStats] = await pool.query<any[]>(
      `SELECT COUNT(*) as total_sessions FROM sessions WHERE talent_id = ? AND status = 'completed'`,
      [talentDiscordId]
    );

    const totalSessions = sessionStats[0]?.total_sessions || 0;

    // Calculer la moyenne des avis et le nombre d'avis
    const [reviewStats] = await pool.query<any[]>(
      `SELECT AVG(rating) as avg_rating, COUNT(*) as review_count FROM reviews WHERE talent_id = ?`,
      [talentDiscordId]
    );

    const avgRating = reviewStats[0]?.avg_rating || 0;
    const reviewCount = reviewStats[0]?.review_count || 0;

    // Mettre à jour les stats du talent
    await pool.query(
      `UPDATE talents SET total_sessions = ?, rating = ?, review_count = ?, updated_at = ? WHERE discord_id = ?`,
      [totalSessions, avgRating, reviewCount, Date.now(), talentDiscordId]
    );

    return NextResponse.json({
      ok: true,
      stats: {
        totalSessions,
        rating: avgRating,
        reviewCount,
      },
    });
  } catch (error) {
    console.error("Error syncing talent stats:", error);
    return NextResponse.json({ error: "Failed to sync talent stats" }, { status: 500 });
  }
}

/**
 * Route pour synchroniser TOUS les talents (utile pour la maintenance)
 */
export async function PUT(req: NextRequest) {
  try {
    // Récupérer tous les talents
    const [talents] = await pool.query<any[]>(`SELECT discord_id FROM talents`);

    if (!Array.isArray(talents)) {
      return NextResponse.json({ error: "No talents found" }, { status: 404 });
    }

    let updated = 0;

    for (const talent of talents) {
      // Compter les sessions complétées
      const [sessionStats] = await pool.query<any[]>(
        `SELECT COUNT(*) as total_sessions FROM sessions WHERE talent_id = ? AND status = 'completed'`,
        [talent.discord_id]
      );

      const totalSessions = sessionStats[0]?.total_sessions || 0;

      // Calculer la moyenne des avis et le nombre d'avis
      const [reviewStats] = await pool.query<any[]>(
        `SELECT AVG(rating) as avg_rating, COUNT(*) as review_count FROM reviews WHERE talent_id = ?`,
        [talent.discord_id]
      );

      const avgRating = reviewStats[0]?.avg_rating || 0;
      const reviewCount = reviewStats[0]?.review_count || 0;

      // Mettre à jour les stats du talent
      await pool.query(
        `UPDATE talents SET total_sessions = ?, rating = ?, review_count = ?, updated_at = ? WHERE discord_id = ?`,
        [totalSessions, avgRating, reviewCount, Date.now(), talent.discord_id]
      );

      updated++;
    }

    return NextResponse.json({
      ok: true,
      message: `Synced stats for ${updated} talents`,
      updated,
    });
  } catch (error) {
    console.error("Error syncing all talents:", error);
    return NextResponse.json({ error: "Failed to sync all talents" }, { status: 500 });
  }
}
