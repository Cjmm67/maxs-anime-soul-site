// =============================================================
// CHAT API ROUTE
// POST /api/chat — handles the full pipeline:
// Input Filter → Usage Check → Claude API → Output Filter → Response
// GET /api/chat — returns current usage status
// =============================================================

import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { SYSTEM_PROMPT, MAX_TOKENS, MODEL, TEMPERATURE } from "@/lib/system-prompt";
import { filterInput } from "@/lib/input-filter";
import { filterOutput } from "@/lib/output-filter";
import { recordWelfareEvent } from "@/lib/welfare";
import { logMessage, logFilterEvent } from "@/lib/logger";
import { checkUsageLimit, recordUsage } from "@/lib/usage-limiter";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Rate limiting — simple in-memory (use Redis in production)
let lastMessageTime = 0;
const MIN_INTERVAL_MS = 2000; // 2 seconds between messages

// Message history for context (keep last 20 exchanges)
const conversationHistory: { role: "user" | "assistant"; content: string }[] = [];
const MAX_HISTORY = 40; // 20 exchanges = 40 messages

// GET — return current usage status (for the frontend timer)
export async function GET(request: NextRequest) {
  const authCookie = request.cookies.get("gojo-auth");
  if (!authCookie || authCookie.value !== "authenticated") {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const usage = await checkUsageLimit();
  return NextResponse.json({ usage });
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authCookie = request.cookies.get("gojo-auth");
    if (!authCookie || authCookie.value !== "authenticated") {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { message } = await request.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message required" }, { status: 400 });
    }

    // Trim and limit message length
    const trimmed = message.trim().substring(0, 500);

    if (trimmed.length === 0) {
      return NextResponse.json({ error: "Empty message" }, { status: 400 });
    }

    // ---- Daily Usage Limit ----
    const usage = await checkUsageLimit();
    if (!usage.allowed) {
      return NextResponse.json({
        response:
          "⏰ That's a wrap for today! You've used up your chat time — even Gojo-sensei needs to rest between battles. Come back tomorrow for more anime talk! 😎💤",
        filtered: false,
        limitReached: true,
        usage,
      });
    }

    // ---- Rate Limiting ----
    const now = Date.now();
    if (now - lastMessageTime < MIN_INTERVAL_MS) {
      return NextResponse.json(
        {
          response: "Easy there! Even Gojo needs a second to think 😎 Try again in a moment.",
          filtered: false,
        },
        { status: 429 }
      );
    }
    lastMessageTime = now;

    // ---- Log Input ----
    await logMessage("user", trimmed);

    // ---- Input Filter ----
    const inputResult = filterInput(trimmed);

    if (!inputResult.allowed) {
      // Log the filter event
      await logFilterEvent("input", trimmed, {
        allowed: false,
        reason: inputResult.reason,
        welfareLevel: inputResult.welfareLevel,
      });

      // Record welfare events
      if (inputResult.welfareLevel && inputResult.welfareLevel >= 2) {
        await recordWelfareEvent({
          level: inputResult.welfareLevel as 2 | 3,
          timestamp: new Date().toISOString(),
          userMessage: trimmed,
          reason: inputResult.reason || "unknown",
          responseGiven: inputResult.gojoResponse || "",
        });
      }

      // Return the pre-written Gojo response (doesn't hit Claude)
      await logMessage("assistant", inputResult.gojoResponse || "", {
        filterBlocked: true,
        reason: inputResult.reason,
      });

      // Still counts toward usage time (prevents filter-spam to waste time)
      await recordUsage(5);

      return NextResponse.json({
        response: inputResult.gojoResponse,
        filtered: true,
        usage: await checkUsageLimit(),
      });
    }

    // ---- Build Messages ----
    conversationHistory.push({ role: "user", content: trimmed });

    // Trim history if too long
    while (conversationHistory.length > MAX_HISTORY) {
      conversationHistory.shift();
    }

    // ---- Call Claude (timed) ----
    const startTime = Date.now();

    const apiResponse = await anthropic.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      temperature: TEMPERATURE,
      system: SYSTEM_PROMPT,
      messages: conversationHistory,
    });

    const elapsedSeconds = Math.max(1, Math.round((Date.now() - startTime) / 1000));

    // Record usage — actual API time + a base of 10 seconds per interaction
    // (accounts for the child reading and thinking about the response)
    await recordUsage(elapsedSeconds + 10);

    // Extract text response
    const rawResponse =
      apiResponse.content[0].type === "text" ? apiResponse.content[0].text : "";

    // ---- Output Filter ----
    const outputResult = filterOutput(rawResponse);

    if (outputResult.flags.length > 0) {
      await logFilterEvent("output", rawResponse, {
        safe: outputResult.safe,
        flags: outputResult.flags,
      });
    }

    // Add (filtered) response to history
    conversationHistory.push({ role: "assistant", content: outputResult.filtered });

    // ---- Log Output ----
    await logMessage("assistant", outputResult.filtered, {
      outputFiltered: !outputResult.safe,
      flags: outputResult.flags,
    });

    return NextResponse.json({
      response: outputResult.filtered,
      filtered: !outputResult.safe,
      usage: await checkUsageLimit(),
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      {
        response:
          "Whoa, my Six Eyes glitched for a second there 😅 Try sending that again!",
        filtered: false,
        error: true,
      },
      { status: 500 }
    );
  }
}
