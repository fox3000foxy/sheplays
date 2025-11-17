import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

/**
 * Découpe automatiquement les créneaux qui dépassent minuit en deux créneaux distincts
 * @param slots Array de créneaux au format "HH:MM-HH:MM"
 * @returns Objet contenant les créneaux pour le jour actuel et le jour suivant
 */
function splitSlotsAtMidnight(slots: string[]): { today: string[]; nextDay: string[] } {
  const today: string[] = [];
  const nextDay: string[] = [];

  for (const slot of slots) {
    const [start, end] = slot.split("-");

    // Cas spécial : créneau se terminant exactement à minuit (ex: 20:00-00:00)
    if (end === "00:00") {
      today.push(slot);
      continue;
    }

    // Si start > end, le créneau traverse minuit
    if (start > end) {
      // Découper: de start à 23:59 pour aujourd'hui
      today.push(`${start}-23:59`);
      // Découper: de 00:00 à end pour le jour suivant
      nextDay.push(`00:00-${end}`);
    } else {
      // Créneau normal dans la même journée
      today.push(slot);
    }
  }

  return { today, nextDay };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, availability } = body as { userId: string; availability: Record<number, string[]> };
    const [talentRows] = await pool.query("SELECT id FROM talents WHERE discord_id = ?", [userId]);
    const talentId = Array.isArray(talentRows) && (talentRows as any[])[0]?.id;
    if (!talentId) return NextResponse.json({ error: "no_talent" }, { status: 400 });

    const now = Date.now();

    // Préparer les disponibilités en gérant les créneaux qui dépassent minuit
    const processedAvailability: Record<number, string[]> = {};

    for (const [weekdayStr, slots] of Object.entries(availability || {})) {
      const weekday = parseInt(weekdayStr, 10);
      const { today, nextDay } = splitSlotsAtMidnight(slots);

      // Ajouter les créneaux du jour actuel
      if (!processedAvailability[weekday]) {
        processedAvailability[weekday] = [];
      }
      processedAvailability[weekday].push(...today);

      // Ajouter les créneaux du jour suivant (si le créneau dépasse minuit)
      if (nextDay.length > 0) {
        const nextWeekday = (weekday + 1) % 7; // 0-6, dimanche = 0
        if (!processedAvailability[nextWeekday]) {
          processedAvailability[nextWeekday] = [];
        }
        processedAvailability[nextWeekday].push(...nextDay);
      }
    }

    // Sauvegarder toutes les disponibilités (y compris les jours sans créneaux pour reset)
    for (let weekday = 0; weekday < 7; weekday++) {
      const slotsForDay = processedAvailability[weekday] || [];
      await pool.query(
        "INSERT INTO availability (talent_id, weekday, slots, updated_at) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE slots=VALUES(slots), updated_at=VALUES(updated_at)",
        [talentId, weekday, JSON.stringify(slotsForDay), now]
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Calendar error:", error);
    return NextResponse.json({ error: "calendar_error" }, { status: 500 });
  }
}