import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

// POST - Ajouter un favori
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { clientId, talentDiscordId } = body;

    if (!clientId || !talentDiscordId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Vérifier si le favori existe déjà
    const [existing] = await pool.query<any[]>(
      `SELECT id FROM favoris WHERE client_id = ? AND talent_discord_id = ?`,
      [clientId, talentDiscordId]
    );

    if (Array.isArray(existing) && existing.length > 0) {
      return NextResponse.json({ error: "Already in favorites" }, { status: 409 });
    }

    // Ajouter le favori
    await pool.query(
      `INSERT INTO favoris (client_id, talent_discord_id) VALUES (?, ?)`,
      [clientId, talentDiscordId]
    );

    return NextResponse.json({ ok: true, message: "Added to favorites" });
  } catch (error) {
    console.error("Error adding favorite:", error);
    return NextResponse.json({ error: "Failed to add favorite" }, { status: 500 });
  }
}

// DELETE - Supprimer un favori
export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { clientId, talentDiscordId } = body;

    if (!clientId || !talentDiscordId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await pool.query(
      `DELETE FROM favoris WHERE client_id = ? AND talent_discord_id = ?`,
      [clientId, talentDiscordId]
    );

    return NextResponse.json({ ok: true, message: "Removed from favorites" });
  } catch (error) {
    console.error("Error removing favorite:", error);
    return NextResponse.json({ error: "Failed to remove favorite" }, { status: 500 });
  }
}
