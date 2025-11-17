import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET(_: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const { userId } = await params;
    const [talentRows] = await pool.query<any[]>("SELECT id FROM talents WHERE discord_id = ?", [userId]);
    const talentId = Array.isArray(talentRows) && (talentRows as any[])[0]?.id;
    if (!talentId) return NextResponse.json({ availability: {} });
    const [rows] = await pool.query<any[]>("SELECT weekday, slots FROM availability WHERE talent_id = ?", [talentId]);
    const availability: Record<number, string[]> = {};
    if (Array.isArray(rows)) {
      for (const r of rows as any[]) {
        availability[r.weekday] = JSON.parse(r.slots || "[]");
      }
    }
    return NextResponse.json({ availability });
  } catch {
    return NextResponse.json({ availability: {} });
  }
}