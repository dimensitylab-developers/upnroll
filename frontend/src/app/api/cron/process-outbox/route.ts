import { NextResponse } from "next/server";
import { connection } from "next/server";
import { processDueOutboxJobs, recoverStaleProcessingJobs } from "@/server/services/outboxService";

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

  const recovered = await recoverStaleProcessingJobs();
  const results = await processDueOutboxJobs(25);

  return NextResponse.json({
    ok: true,
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
