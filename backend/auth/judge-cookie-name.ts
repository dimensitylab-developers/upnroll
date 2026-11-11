/** Separate cookie from fighter/admin sessions — Edge-safe (no node:crypto). */
export const JUDGE_SESSION_COOKIE_NAME = "upnroll_judge_session";
export const JUDGE_SESSION_MAX_AGE_SECONDS = 60 * 60 * 12; // 12 hours
