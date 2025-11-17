import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const sortBy = searchParams.get("sortBy") || "rating"; // rating, sessions, name
    const games = searchParams.get("games") || "";
    const languages = searchParams.get("languages") || "";

    let query = `
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
        t.review_count
      FROM talents t
      WHERE t.status = 'available'
      AND t.display_name IS NOT NULL
      AND t.display_name != ''
    `;

    const params: any[] = [];

    // Search filter
    if (search) {
      query += ` AND (t.display_name LIKE ? OR t.username LIKE ? OR t.bio LIKE ?)`;
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    // Games filter
    if (games) {
      const gamesList = games.split(",");
      const gameConditions = gamesList.map(() => `t.games LIKE ?`).join(" OR ");
      query += ` AND (${gameConditions})`;
      gamesList.forEach((game) => params.push(`%${game}%`));
    }

    // Languages filter
    if (languages) {
      const langsList = languages.split(",");
      const langConditions = langsList.map(() => `t.languages LIKE ?`).join(" OR ");
      query += ` AND (${langConditions})`;
      langsList.forEach((lang) => params.push(`%${lang}%`));
    }

    // Sorting
    switch (sortBy) {
      case "rating":
        query += ` ORDER BY t.rating DESC, t.review_count DESC`;
        break;
      case "sessions":
        query += ` ORDER BY t.total_sessions DESC`;
        break;
      case "name":
        query += ` ORDER BY t.display_name ASC`;
        break;
      default:
        query += ` ORDER BY t.rating DESC`;
    }

    const [talents] = await pool.query<any[]>(query, params);

    if (!Array.isArray(talents)) {
      return NextResponse.json({ talents: [] });
    }

    // Parse JSON fields
    const formattedTalents = talents.map((talent) => ({
      ...talent,
      games: talent.games ? JSON.parse(talent.games) : [],
      languages: talent.languages ? JSON.parse(talent.languages) : [],
      rating: parseFloat(talent.rating) || 0,
    }));

    return NextResponse.json({ talents: formattedTalents });
  } catch (error) {
    console.error("Error fetching playmates:", error);
    return NextResponse.json({ error: "Failed to fetch playmates" }, { status: 500 });
  }
}
