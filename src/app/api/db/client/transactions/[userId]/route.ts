import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET(_: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const { userId } = await params;
    if (!userId) return NextResponse.json({ transactions: [] });

    const [rows] = await pool.query<any[]>(
      `SELECT id, type, amount, balance_before, balance_after, description, session_id, created_at
       FROM transactions
       WHERE user_id = ?
       ORDER BY created_at DESC
       LIMIT 200`,
      [userId]
    );

    return NextResponse.json({ transactions: Array.isArray(rows) ? rows : [] });
  } catch {
    return NextResponse.json({ transactions: [] });
  }
}