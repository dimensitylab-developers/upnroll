import { NextResponse } from "next/server";
import { connection } from "next/server";
import {
  getOutboxRunGate,
  processDueOutboxJobs,
  recoverStaleProcessingJobs,
} from "@/server/services/outboxService";

async function handle(request: Request) {
  await connection();
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Cron not configured." }, { status: 503 });
  }

  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const url = new URL(request.url);
  const ua = request.headers.get("user-agent") ?? "";
  const vercelCron = ua.includes("vercel-cron") || Boolean(request.headers.get("x-vercel-cron-schedule"));
  // Frequent callers (GitHub Actions) skip off event day. Vercel daily cron / ?force=1 always sweep.
  const force = url.searchParams.get("force") === "1" || vercelCron;

  if (!force) {
    const gate = await getOutboxRunGate();
    if (!gate.run) {
      return NextResponse.json({
        ok: true,
        skipped: true,
        reason: gate.reason,
        processed: 0,
      });
    }
  }

  const recovered = await recoverStaleProcessingJobs();
  const results = await processDueOutboxJobs(25);

  return NextResponse.json({
    ok: true,
    skipped: false,
    recovered,
    processed: results.length,
    results,
  });
}

export async function GET(request: Request) {
  return handle(request);
}

export async function POST(request: Request) {
  return handle(request);
}
