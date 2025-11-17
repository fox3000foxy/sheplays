import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET(_: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const { userId } = await params;
    if (!userId) return NextResponse.json({ upcoming: [], history: [] });

    const now = Date.now();

    const [rows] = await pool.query<any[]>(
      `SELECT s.id, s.client_id, s.talent_id, s.duration, s.price, s.scheduled_start, s.status, s.created_at,
              t.display_name AS talent_name, t.discord_id AS talent_discord_id
       FROM sessions s
       LEFT JOIN talents t ON t.discord_id = s.talent_id
       WHERE s.client_id = ? OR s.talent_id = ?
       ORDER BY s.scheduled_start DESC`,
      [userId, userId]
    );

    const sessions = Array.isArray(rows) ? rows : [];

    const upcoming = sessions.filter((s) => s.scheduled_start >= now && ["scheduled", "in_progress"].includes(String(s.status)));
    const history = sessions.filter((s) => s.scheduled_start < now || ["completed", "cancelled"].includes(String(s.status)));

    return NextResponse.json({ upcoming, history });
  } catch {
    return NextResponse.json({ upcoming: [], history: [] });
  }
}