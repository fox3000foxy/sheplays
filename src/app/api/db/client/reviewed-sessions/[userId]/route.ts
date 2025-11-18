import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET(_: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const { userId } = await params;
    if (!userId) return NextResponse.json({ reviewedSessionIds: [] });

    const [rows] = await pool.query<any[]>(
      `SELECT session_id FROM reviews WHERE client_id = ?`,
      [userId]
    );

    const reviewedSessionIds = Array.isArray(rows) ? rows.map((r) => r.session_id) : [];

    return NextResponse.json({ reviewedSessionIds });
  } catch (error) {
    console.error("Error fetching reviewed sessions:", error);
    return NextResponse.json({ reviewedSessionIds: [] });
  }
}
