import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: talentDiscordId } = await params;

    const [reviews] = await pool.query<any[]>(
      `
      SELECT
        r.id,
        r.rating,
        r.comment,
        r.tags,
        r.created_at,
        r.client_id,
        ub.balance as client_username
      FROM reviews r
      LEFT JOIN user_balances ub ON r.client_id = ub.user_id
      WHERE r.talent_id = ?
      ORDER BY r.created_at DESC
    `,
      [talentDiscordId]
    );

    if (!Array.isArray(reviews)) {
      return NextResponse.json({ reviews: [] });
    }

    const formattedReviews = reviews.map((review) => ({
      ...review,
      tags: review.tags ? JSON.parse(review.tags) : [],
    }));

    return NextResponse.json({ reviews: formattedReviews });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: talentDiscordId } = await params;
    const body = await req.json();
    const { clientId, sessionId, rating, comment, tags } = body;

    if (!clientId || !sessionId || !rating) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 });
    }

    // Check if session exists and is completed
    const [sessions] = await pool.query<any[]>(
      `SELECT id, status FROM sessions WHERE id = ? AND client_id = ? AND talent_id = ?`,
      [sessionId, clientId, talentDiscordId]
    );

    if (!Array.isArray(sessions) || sessions.length === 0) {
      return NextResponse.json({ error: "Session not found or not authorized" }, { status: 404 });
    }

    const session = sessions[0];
    if (session.status !== "completed") {
      return NextResponse.json(
        { error: "You can only review completed sessions" },
        { status: 400 }
      );
    }

    // Check if review already exists for this session
    const [existingReviews] = await pool.query<any[]>(
      `SELECT id FROM reviews WHERE session_id = ? AND client_id = ?`,
      [sessionId, clientId]
    );

    if (Array.isArray(existingReviews) && existingReviews.length > 0) {
      return NextResponse.json({ error: "You already reviewed this session" }, { status: 400 });
    }

    // Insert review
    await pool.query(
      `INSERT INTO reviews (session_id, client_id, talent_id, rating, comment, tags, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [sessionId, clientId, talentDiscordId, rating, comment || null, JSON.stringify(tags || []), Date.now()]
    );

    // Update talent stats
    const [stats] = await pool.query<any[]>(
      `SELECT AVG(rating) as avg_rating, COUNT(*) as review_count FROM reviews WHERE talent_id = ?`,
      [talentDiscordId]
    );

    if (Array.isArray(stats) && stats[0]) {
      const { avg_rating, review_count } = stats[0];
      await pool.query(
        `UPDATE talents SET rating = ?, review_count = ?, updated_at = ? WHERE discord_id = ?`,
        [avg_rating || 0, review_count || 0, Date.now(), talentDiscordId]
      );
    }

    return NextResponse.json({ ok: true, message: "Review submitted successfully" });
  } catch (error) {
    console.error("Error submitting review:", error);
    return NextResponse.json({ error: "Failed to submit review" }, { status: 500 });
  }
}
