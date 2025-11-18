import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

// GET - Vérifier si un talent est dans les favoris
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const clientId = searchParams.get("clientId");
    const talentDiscordId = searchParams.get("talentDiscordId");

    if (!clientId || !talentDiscordId) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    const [favorites] = await pool.query<any[]>(
      `SELECT id FROM favoris WHERE client_id = ? AND talent_discord_id = ?`,
      [clientId, talentDiscordId]
    );

    return NextResponse.json({
      isFavorite: Array.isArray(favorites) && favorites.length > 0
    });
  } catch (error) {
    console.error("Error checking favorite:", error);
    return NextResponse.json({ error: "Failed to check favorite" }, { status: 500 });
  }
}
