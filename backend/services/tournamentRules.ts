const DAY_MS = 24 * 60 * 60 * 1000;
const WARMUP_WINDOW_MS = 15 * 60 * 1000;

/** Mat numbers run 1..matCount and repeat in match order. */
export function matNumberForOrder(order: number, matCount: number): number {
  const count = Number.isFinite(matCount) && matCount >= 1 ? Math.floor(matCount) : 1;
  const index = Number.isFinite(order) && order >= 0 ? Math.floor(order) : 0;
  return (index % count) + 1;
}

/** 50% when the cancellation is at least 30 days before the event starts. Otherwise none. */
export function refundPercentForCancellation(eventStart: Date, cancelledAt: Date): 0 | 50 {
  return eventStart.getTime() - cancelledAt.getTime() >= 30 * DAY_MS ? 50 : 0;
}

/** Minutes until the match, when it is inside the 15-minute warm-up window. */
export function warmUpMinutes(scheduledAt: Date, now: Date): number | null {
  const diff = scheduledAt.getTime() - now.getTime();
  if (diff <= 0 || diff > WARMUP_WINDOW_MS) return null;
  return Math.max(1, Math.ceil(diff / 60000));
}
