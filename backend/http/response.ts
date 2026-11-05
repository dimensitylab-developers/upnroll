import { NextResponse } from "next/server";
import { toAppError } from "./errors";

/** Envelope conventions from docs/api/api-contract.md — used by Route Handlers. */

export function ok<T>(data: T, meta?: Record<string, unknown>) {
  return NextResponse.json({ success: true, data, meta: meta ?? {} });
}

export function fail(err: unknown) {
  const appError = toAppError(err);
  return NextResponse.json(
    { success: false, error: { code: appError.code, message: appError.message } },
    { status: appError.statusCode }
  );
}
