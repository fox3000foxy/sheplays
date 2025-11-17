import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { clientId, talentId, duration, scheduledStart } = body;

    if (!clientId || !talentId || !duration || !scheduledStart) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Validate duration
    if (![15, 30, 60].includes(duration)) {
      return NextResponse.json({ error: "Invalid duration. Must be 15, 30, or 60 minutes" }, { status: 400 });
    }

    // Get talent info and pricing
    const [talents] = await pool.query<any[]>(
      `SELECT id, discord_id, price_15min, price_30min, price_60min, available_status FROM talents WHERE discord_id = ?`,
      [talentId]
    );

    if (!Array.isArray(talents) || talents.length === 0) {
      return NextResponse.json({ error: "Talent not found" }, { status: 404 });
    }

    const talent = talents[0];
    const priceMap: Record<number, number> = {
      15: talent.price_15min,
      30: talent.price_30min,
      60: talent.price_60min,
    };
    const price = priceMap[duration];

    // Check client balance
    const [balances] = await pool.query<any[]>(
      `SELECT balance FROM user_balances WHERE user_id = ?`,
      [clientId]
    );

    if (!Array.isArray(balances) || balances.length === 0) {
      return NextResponse.json({ error: "Client balance not found" }, { status: 404 });
    }

    const clientBalance = balances[0].balance;
    if (clientBalance < price) {
      return NextResponse.json(
        { error: "Insufficient balance", required: price, current: clientBalance },
        { status: 400 }
      );
    }

    // Check for conflicting sessions
    const scheduledEnd = scheduledStart + duration * 60 * 1000;
    const [conflicts] = await pool.query<any[]>(
      `
      SELECT id FROM sessions
      WHERE talent_id = ?
      AND status IN ('scheduled', 'in_progress')
      AND (
        (scheduled_start <= ? AND (scheduled_start + duration * 60000) > ?)
        OR (scheduled_start < ? AND (scheduled_start + duration * 60000) >= ?)
        OR (scheduled_start >= ? AND scheduled_start < ?)
      )
    `,
      [talentId, scheduledStart, scheduledStart, scheduledEnd, scheduledEnd, scheduledStart, scheduledEnd]
    );

    if (Array.isArray(conflicts) && conflicts.length > 0) {
      return NextResponse.json(
        { error: "This time slot is already booked. Please choose another time." },
        { status: 409 }
      );
    }

    // Check if the scheduled time is within talent's availability
    const scheduledDate = new Date(scheduledStart);
    const weekday = scheduledDate.getDay();
    const scheduledTime = `${String(scheduledDate.getHours()).padStart(2, "0")}:${String(scheduledDate.getMinutes()).padStart(2, "0")}`;

    const [availability] = await pool.query<any[]>(
      `SELECT slots FROM availability WHERE talent_id = ? AND weekday = ?`,
      [talentId, weekday]
    );

    if (!Array.isArray(availability) || availability.length === 0) {
      return NextResponse.json(
        { error: "Talent is not available on this day" },
        { status: 400 }
      );
    }

    const slots = JSON.parse(availability[0].slots);
    const isInAvailableSlot = slots.some((slot: string) => {
      const [start, end] = slot.split("-");
      return scheduledTime >= start && scheduledTime <= end;
    });

    if (!isInAvailableSlot) {
      return NextResponse.json(
        { error: "Scheduled time is outside talent's available hours" },
        { status: 400 }
      );
    }

    // Create session
    const sessionId = uuidv4();
    await pool.query(
      `INSERT INTO sessions (id, client_id, talent_id, duration, price, scheduled_start, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, 'scheduled', ?)`,
      [sessionId, clientId, talentId, duration, price, scheduledStart, Date.now()]
    );

    // Deduct balance from client
    const newBalance = clientBalance - price;
    await pool.query(
      `UPDATE user_balances SET balance = ?, total_spent = total_spent + ?, updated_at = ? WHERE user_id = ?`,
      [newBalance, price, Date.now(), clientId]
    );

    // Create transaction record
    await pool.query(
      `INSERT INTO transactions (id, user_id, type, amount, balance_before, balance_after, description, session_id, created_at)
       VALUES (?, ?, 'debit', ?, ?, ?, ?, ?, ?)`,
      [
        uuidv4(),
        clientId,
        price,
        clientBalance,
        newBalance,
        `Session booking with ${talent.discord_id}`,
        sessionId,
        Date.now(),
      ]
    );

    return NextResponse.json({
      ok: true,
      sessionId,
      message: "Session booked successfully",
      newBalance,
    });
  } catch (error) {
    console.error("Booking error:", error);
    return NextResponse.json({ error: "Failed to create booking" }, { status: 500 });
  }
}
