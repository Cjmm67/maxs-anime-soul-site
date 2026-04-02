import { NextRequest, NextResponse } from "next/server";
import { redis } from "../../../../lib/redis";

export async function POST(request: NextRequest) {
  const parentPass = request.headers.get("x-parent-password");
  const correctPass = process.env.PARENT_PASSWORD || "parent123";

  if (parentPass !== correctPass) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { action } = await request.json();

    if (action === "lock") {
      const result = await redis.set("gojo-locked", "true", { ex: 86400 }); // 24 hours
      // Verify it was actually written
      const verify = await redis.get("gojo-locked");
      console.log("Lock result:", result, "Verify:", verify);
      if (!verify) {
        return NextResponse.json({ 
          success: false, 
          error: "Redis write failed", 
          debug: { setResult: result, verifyResult: verify, envCheck: { hasUrl: !!process.env.KV_REST_API_URL, hasToken: !!process.env.KV_REST_API_TOKEN } }
        }, { status: 500 });
      }
      return NextResponse.json({ success: true, status: "locked" });
    }

    if (action === "unlock") {
      await redis.del("gojo-locked");
      return NextResponse.json({ success: true, status: "unlocked" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Control error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const parentPass = request.headers.get("x-parent-password");
  const correctPass = process.env.PARENT_PASSWORD || "parent123";

  if (parentPass !== correctPass) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const locked = await redis.get("gojo-locked");
    return NextResponse.json({ locked: !!locked });
  } catch (error) {
    console.error("Control error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
