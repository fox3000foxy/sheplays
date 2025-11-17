import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: talentDiscordId } = await params;
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get("startDate"); // YYYY-MM-DD
    const days = parseInt(searchParams.get("days") || "7"); // Number of days to fetch

    if (!startDate) {
      return NextResponse.json({ error: "startDate is required" }, { status: 400 });
    }

    // Get talent ID from discord_id
    const [talentRows] = await pool.query<any[]>(
      `SELECT id FROM talents WHERE discord_id = ?`,
      [talentDiscordId]
    );

    if (!Array.isArray(talentRows) || talentRows.length === 0) {
      return NextResponse.json({ error: "Talent not found" }, { status: 404 });
    }

    const talentId = talentRows[0].id;

    // Get talent availability slots
    const [availabilityRows] = await pool.query<any[]>(
      `SELECT weekday, slots FROM availability WHERE talent_id = ?`,
      [talentId]
    );

    if (!Array.isArray(availabilityRows)) {
      return NextResponse.json({ slots: [] });
    }

    // Parse availability into a map
    const availabilityMap: Record<number, string[]> = {};
    availabilityRows.forEach((row) => {
      try {
        availabilityMap[row.weekday] = JSON.parse(row.slots);
      } catch (e) {
        availabilityMap[row.weekday] = [];
      }
    });

    // Get all booked sessions for the talent
    const startDateMs = new Date(startDate).getTime();
    const endDateMs = startDateMs + days * 24 * 60 * 60 * 1000;

    const [bookedSessions] = await pool.query<any[]>(
      `
      SELECT scheduled_start, duration FROM sessions
      WHERE talent_id = ?
      AND status IN ('scheduled', 'in_progress')
      AND scheduled_start >= ?
      AND scheduled_start < ?
    `,
      [talentDiscordId, startDateMs, endDateMs]
    );

    // Generate available slots for each day
    const availableSlots: any[] = [];
    const currentDate = new Date(startDate);

    for (let i = 0; i < days; i++) {
      // Convert JavaScript day (0=Sunday, 1=Monday, ..., 6=Saturday)
      // to our DB system (1=Monday, 2=Tuesday, ..., 6=Saturday, 0=Sunday)
      const jsDay = currentDate.getDay();
      const dayOfWeek = jsDay === 0 ? 0 : jsDay; // 0 stays 0 (Sunday), 1-6 stay the same
      const dateString = currentDate.toISOString().split("T")[0];

      // Check if talent has availability for this day
      const daySlots = availabilityMap[dayOfWeek] || [];

      if (daySlots.length === 0) {
        currentDate.setDate(currentDate.getDate() + 1);
        continue;
      }

      // For each time slot, generate 15-minute intervals
      daySlots.forEach((slot: string) => {
        const [startTime, endTime] = slot.split("-");
        if (!startTime || !endTime) return;

        const [startHour, startMinute] = startTime.split(":").map(Number);
        const [endHour, endMinute] = endTime.split(":").map(Number);

        let currentHour = startHour;
        let currentMinute = startMinute;

        while (
          currentHour < endHour ||
          (currentHour === endHour && currentMinute < endMinute)
        ) {
          const slotStart = new Date(dateString);
          slotStart.setHours(currentHour, currentMinute, 0, 0);
          const slotStartMs = slotStart.getTime();

          // Check if this slot is in the past
          if (slotStartMs < Date.now()) {
            currentMinute += 15;
            if (currentMinute >= 60) {
              currentMinute = 0;
              currentHour += 1;
            }
            continue;
          }

          // Check availability for 15, 30, and 60 minute durations
          const durations = [15, 30, 60];
          const availableDurations: number[] = [];

          for (const duration of durations) {
            const slotEndMs = slotStartMs + duration * 60 * 1000;

            // Check if this duration fits within the availability slot
            const slotEnd = new Date(slotEndMs);
            const slotEndHour = slotEnd.getHours();
            const slotEndMinute = slotEnd.getMinutes();

            const fitsInSlot =
              slotEndHour < endHour ||
              (slotEndHour === endHour && slotEndMinute <= endMinute);

            if (!fitsInSlot) continue;

            // Check if there's any conflict with booked sessions
            const hasConflict = Array.isArray(bookedSessions) && bookedSessions.some((session) => {
              const sessionStart = session.scheduled_start;
              const sessionEnd = sessionStart + session.duration * 60 * 1000;

              // Check if there's an overlap
              return (
                (slotStartMs >= sessionStart && slotStartMs < sessionEnd) ||
                (slotEndMs > sessionStart && slotEndMs <= sessionEnd) ||
                (slotStartMs <= sessionStart && slotEndMs >= sessionEnd)
              );
            });

            if (!hasConflict) {
              availableDurations.push(duration);
            }
          }

          if (availableDurations.length > 0) {
            availableSlots.push({
              date: dateString,
              time: `${String(currentHour).padStart(2, "0")}:${String(currentMinute).padStart(2, "0")}`,
              timestamp: slotStartMs,
              availableDurations,
            });
          }

          // Move to next 15-minute slot
          currentMinute += 15;
          if (currentMinute >= 60) {
            currentMinute = 0;
            currentHour += 1;
          }
        }
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return NextResponse.json({ slots: availableSlots });
  } catch (error) {
    console.error("Error fetching availability:", error);
    return NextResponse.json({ error: "Failed to fetch availability" }, { status: 500 });
  }
}
