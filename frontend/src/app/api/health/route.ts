import { connectDB } from "@/server/db/connect";

export async function GET() {
  try {
    const mongoose = await connectDB();
    if (!mongoose.connection.db) return Response.json({ ok: false }, { status: 503 });
    await mongoose.connection.db.command({ ping: 1 });
    return Response.json({ ok: true });
  } catch {
    return Response.json({ ok: false }, { status: 503 });
  }
}
