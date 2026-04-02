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
    return NextResponse.json({ 
      locked: !!locked,
      debug: { 
        rawValue: locked, 
        type: typeof locked,
        hasUrl: !!process.env.KV_REST_API_URL,
        hasToken: !!process.env.KV_REST_API_TOKEN,
        urlPrefix: process.env.KV_REST_API_URL?.substring(0, 30) || "NOT_SET"
      }
    });
  } catch (error) {
    console.error("Lock status check error:", error);
    return NextResponse.json({ locked: false, error: String(error) });
  }
}
