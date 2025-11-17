import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, availability } = body as { userId: string; availability: Record<number, string[]> };
    const [talentRows] = await pool.query("SELECT id FROM talents WHERE discord_id = ?", [userId]);
    const talentId = Array.isArray(talentRows) && (talentRows as any[])[0]?.id;
    if (!talentId) return NextResponse.json({ error: "no_talent" }, { status: 400 });
    const now = Date.now();
    for (const [weekdayStr, slots] of Object.entries(availability || {})) {
      const weekday = parseInt(weekdayStr, 10);
      await pool.query(
        "INSERT INTO availability (talent_id, weekday, slots, updated_at) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE slots=VALUES(slots), updated_at=VALUES(updated_at)",
        [talentId, weekday, JSON.stringify(slots || []), now]
      );
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "calendar_error" }, { status: 500 });
  }
}