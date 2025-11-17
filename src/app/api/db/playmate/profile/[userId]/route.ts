import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET(_: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const { userId } = await params;
    const [rows] = await pool.query<any[]>("SELECT * FROM talents WHERE discord_id = ?", [userId]);
    const talent = Array.isArray(rows) && (rows as any[])[0] ? (rows as any[])[0] : null;
    return NextResponse.json({ talent });
  } catch {
    return NextResponse.json({ talent: null });
  }
}