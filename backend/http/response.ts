import { NextResponse } from "next/server";
import { AppError, toAppError } from "./errors";
import { logger } from "@/server/observability/logger";

/** Envelope conventions from docs/api/api-contract.md — used by Route Handlers. */

export function ok<T>(data: T, meta?: Record<string, unknown>) {
  return NextResponse.json({ success: true, data, meta: meta ?? {} });
}

export function fail(err: unknown) {
  const appError = toAppError(err);
  if (!(err instanceof AppError) || appError.statusCode >= 500) {
    logger.error("route_handler_failure", {
      code: appError.code,
      statusCode: appError.statusCode,
      name: err instanceof Error ? err.name : typeof err,
    });
  }
  return NextResponse.json(
    { success: false, error: { code: appError.code, message: appError.message } },
    { status: appError.statusCode }
  );
}
