// =============================================================
// REDIS CLIENT
// Shared Upstash Redis instance for logging + usage tracking
// =============================================================

import { Redis } from "@upstash/redis";

export const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});
