import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    // Get all talents with their IDs
    const [talents] = await pool.query<any[]>("SELECT id, discord_id FROM talents");

    if (!Array.isArray(talents)) {
      return NextResponse.json({ error: "Failed to fetch talents" }, { status: 500 });
    }

    const updates: { available: string[]; unavailable: string[] } = {
      available: [],
      unavailable: [],
    };

    // Check each talent's availability
    for (const talent of talents) {
      const talentId = talent.id; // Use numeric ID for availability table
      const discordId = talent.discord_id;

      // Get availability slots for this talent
      const [availRows] = await pool.query<any[]>(
        "SELECT weekday, slots FROM availability WHERE talent_id = ?",
        [talentId]
      );

      const hasAvailability = Array.isArray(availRows) && availRows.length > 0;

      // Determine current weekday (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
      const now = new Date();
      const currentWeekday = now.getDay();
      const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

      let isCurrentlyAvailable = false;

      if (hasAvailability) {
        // Check if there's availability for today
        const todaySlots = (availRows as any[]).find((row) => row.weekday === currentWeekday);

        if (todaySlots && todaySlots.slots) {
          try {
            const slots = JSON.parse(todaySlots.slots);

            // Check if current time falls within any slot
            for (const slot of slots) {
              const [start, end] = slot.split("-");
              if (start && end && currentTime >= start && currentTime <= end) {
                isCurrentlyAvailable = true;
                break;
              }
            }
          } catch (e) {
            console.error("Error parsing slots:", e);
          }
        }
      }

      // Update talent status
      const newStatus = isCurrentlyAvailable ? 1 : 0;
      await pool.query(
        "UPDATE talents SET available_status = ?, updated_at = ? WHERE discord_id = ?",
        [newStatus, Date.now(), discordId]
      );

      if (isCurrentlyAvailable) {
        updates.available.push(discordId);
      } else {
        updates.unavailable.push(discordId);
      }
    }

    return NextResponse.json({
      ok: true,
      timestamp: new Date().toISOString(),
      updated: {
        available: updates.available.length,
        unavailable: updates.unavailable.length,
      },
      details: updates,
    });
  } catch (error) {
    console.error("Cron job error:", error);
    return NextResponse.json({ error: "cron_failed" }, { status: 500 });
  }
}
