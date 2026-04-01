// =============================================================
// AUTH API ROUTE
// POST /api/auth — simple PIN verification
// =============================================================

import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { pin } = await request.json();

    // PIN is stored as env variable — never in client code
    const correctPin = process.env.MAX_PIN || "1234"; // Default for dev only

    if (pin === correctPin) {
      // In production, set an httpOnly cookie or session token
      const response = NextResponse.json({ success: true });
      response.cookies.set("gojo-auth", "authenticated", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 4, // 4 hours then re-enter PIN
        path: "/",
      });
      return response;
    }

    return NextResponse.json({ success: false }, { status: 401 });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
