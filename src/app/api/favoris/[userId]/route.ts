import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

// GET - Récupérer les favoris d'un utilisateur avec les infos des talents
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    // Récupérer les favoris avec toutes les infos des talents
    const [favorites] = await pool.query<any[]>(
      `
      SELECT
        t.id,
        t.discord_id,
        t.username,
        t.display_name,
        t.bio,
        t.age,
        t.games,
        t.languages,
        t.style,
        t.audio_sample_url,
        t.price_15min,
        t.price_30min,
        t.price_60min,
        t.available_status,
        t.status,
        t.total_sessions,
        t.rating,
        t.review_count,
        f.created_at as favorited_at
      FROM favoris f
      JOIN talents t ON f.talent_discord_id = t.discord_id
      WHERE f.client_id = ?
      ORDER BY f.created_at DESC
      `,
      [userId]
    );

    // Parse JSON fields
    const parsedFavorites = (favorites as any[]).map((fav) => ({
      ...fav,
      games: JSON.parse(fav.games || "[]"),
      languages: JSON.parse(fav.languages || "[]"),
    }));

    return NextResponse.json({ favorites: parsedFavorites });
  } catch (error) {
    console.error("Error fetching favorites:", error);
    return NextResponse.json({ error: "Failed to fetch favorites" }, { status: 500 });
  }
}
