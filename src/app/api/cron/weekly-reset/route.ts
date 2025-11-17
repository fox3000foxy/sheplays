import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

/**
 * Cron job pour réinitialiser toutes les disponibilités des playmates chaque dimanche à 23h59
 * Ce endpoint doit être appelé via un cron job configuré pour s'exécuter chaque dimanche à 23h59
 */
export async function GET(req: NextRequest) {
  try {
    const now = new Date();

    // Vérifier que nous sommes bien dimanche (0 = dimanche)
    const currentDay = now.getDay();

    console.log(`[Weekly Reset] Cron job exécuté le ${now.toISOString()}, jour: ${currentDay}`);

    // Optionnel: ne réinitialiser que si nous sommes dimanche
    // Cette vérification peut être supprimée si le cron est correctement configuré
    if (currentDay !== 0) {
      console.log(`[Weekly Reset] Aujourd'hui n'est pas dimanche (jour ${currentDay}), skip reset`);
      return NextResponse.json({
        skipped: true,
        message: "Reset uniquement le dimanche",
        currentDay
      });
    }

    // Récupérer tous les talents
    const [talents] = await pool.query("SELECT id, discord_id FROM talents");

    if (!Array.isArray(talents)) {
      return NextResponse.json({ error: "invalid_query_result" }, { status: 500 });
    }

    let resetCount = 0;

    // Pour chaque talent, réinitialiser toutes ses disponibilités
    for (const talent of talents as any[]) {
      const talentId = talent.id;

      // Supprimer tous les créneaux pour tous les jours de la semaine
      for (let weekday = 0; weekday < 7; weekday++) {
        await pool.query(
          "INSERT INTO availability (talent_id, weekday, slots, updated_at) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE slots=VALUES(slots), updated_at=VALUES(updated_at)",
          [talentId, weekday, JSON.stringify([]), Date.now()]
        );
      }

      // Mettre également le statut du talent à offline
      await pool.query(
        "UPDATE talents SET available_status = 0, updated_at = ? WHERE id = ?",
        [Date.now(), talentId]
      );

      resetCount++;
    }

    console.log(`[Weekly Reset] ${resetCount} playmates ont eu leurs disponibilités réinitialisées`);

    return NextResponse.json({
      success: true,
      resetCount,
      timestamp: now.toISOString(),
      message: `${resetCount} playmates ont eu leurs disponibilités réinitialisées`
    });

  } catch (error) {
    console.error("[Weekly Reset] Erreur lors du reset hebdomadaire:", error);
    return NextResponse.json({
      error: "reset_error",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
