// =============================================================
// LOCK STATUS API ROUTE
// GET /api/lock-status — returns whether chat is locked (no auth required)
// Used by the frontend to check if the parent has locked the chat
// =============================================================

import { NextRequest, NextResponse } from "next/server";
import { redis } from "../../../lib/redis";

export async function GET(request: NextRequest) {
  try {
    const locked = await redis.get("gojo-locked");
    return NextResponse.json({ locked: locked === "true" });
  } catch (error) {
    console.error("Lock status check error:", error);
    // Default to unlocked on error so the chat isn't broken
    return NextResponse.json({ locked: false });
  }
}
