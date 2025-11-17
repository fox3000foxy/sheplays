import { NextResponse } from "next/server";
import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "sheplaysuser",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "sheplays",
  waitForConnections: true,
  connectionLimit: 10,
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    }

    const [rows] = await pool.query(
      "SELECT id, discord_id, display_name FROM talents WHERE discord_id = ?",
      [userId]
    );

    const talents = Array.isArray(rows) ? rows : [];
    const isTalent = talents.length > 0;
    const talentData = isTalent ? talents[0] : null;

    return NextResponse.json({
      isTalent,
      talent: talentData,
    });
  } catch (error) {
    console.error("Error checking talent status:", error);
    return NextResponse.json(
      { error: "Internal server error", isTalent: false },
      { status: 500 }
    );
  }
}
