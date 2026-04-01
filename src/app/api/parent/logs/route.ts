// =============================================================
// PARENT DASHBOARD API
// GET /api/parent/logs — fetch chat logs from Redis
// =============================================================

import { NextRequest, NextResponse } from "next/server";
import { getLogsForDate, getLogDates } from "@/lib/logger";

export async function GET(request: NextRequest) {
  // Verify parent password via header
  const parentPass = request.headers.get("x-parent-password");
  const correctPass = process.env.PARENT_PASSWORD || "parent123";

  if (parentPass !== correctPass) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const date = request.nextUrl.searchParams.get("date");

    // If specific date requested, return that day's logs
    if (date) {
      const logs = await getLogsForDate(date);
      return NextResponse.json({ logs, date });
    }

    // Otherwise return list of available dates + summary stats
    const allDates = await getLogDates();

    const dates = await Promise.all(
      allDates.map(async (datePart) => {
        const logs = await getLogsForDate(datePart);

        let messageCount = 0;
        let welfareAlerts = 0;
        let filterBlocks = 0;

        for (const entry of logs) {
          if (entry.type === "MESSAGE") messageCount++;
          if (entry.type === "WELFARE_ALERT") welfareAlerts++;
          if (entry.type === "FILTER_EVENT") filterBlocks++;
        }

        return {
          date: datePart,
          messageCount,
          welfareAlerts,
          filterBlocks,
        };
      })
    );

    return NextResponse.json({ dates });
  } catch (error) {
    console.error("Parent dashboard error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
