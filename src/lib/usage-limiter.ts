// =============================================================
// USAGE LIMITER
// Enforces a daily time limit on chat usage (server-side)
// Tracked in Redis so it persists across deployments/cold starts
// =============================================================

import { redis } from "./redis";

// Daily limit in seconds — default 15 minutes
const DAILY_LIMIT_SECONDS = parseInt(process.env.DAILY_LIMIT_MINUTES || "15", 10) * 60;

function getTodayKey(): string {
  const now = new Date();
  return `usage:${now.toISOString().split("T")[0]}`;
}

export interface UsageStatus {
  allowed: boolean;
  usedSeconds: number;
  limitSeconds: number;
  remainingSeconds: number;
}

/**
 * Check if the user still has time remaining today.
 */
export async function checkUsageLimit(): Promise<UsageStatus> {
  try {
    const key = getTodayKey();
    const usedSeconds = (await redis.get<number>(key)) || 0;
    const remaining = DAILY_LIMIT_SECONDS - usedSeconds;

    return {
      allowed: remaining > 0,
      usedSeconds,
      limitSeconds: DAILY_LIMIT_SECONDS,
      remainingSeconds: Math.max(0, remaining),
    };
  } catch (err) {
    console.error("Usage check failed:", err);
    // Fail open — allow usage if Redis is down
    return {
      allowed: true,
      usedSeconds: 0,
      limitSeconds: DAILY_LIMIT_SECONDS,
      remainingSeconds: DAILY_LIMIT_SECONDS,
    };
  }
}

/**
 * Record time spent on an interaction.
 * Call this after each chat exchange with the elapsed seconds.
 */
export async function recordUsage(durationSeconds: number): Promise<void> {
  try {
    const key = getTodayKey();
    const current = (await redis.get<number>(key)) || 0;
    await redis.set(key, current + durationSeconds, { ex: 86400 }); // expires after 24h
  } catch (err) {
    console.error("Usage recording failed:", err);
  }
}
