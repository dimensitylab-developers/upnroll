/**
 * Atlas / MongoDB connection strings without a path open the driver default DB
 * named "test". That makes Compass look "empty" when operators open `upnroll`.
 * Require an explicit database name so writes land where we expect.
 */
export function ensureMongoDatabaseName(uri: string, fallbackDb = "upnroll"): string {
  const trimmed = uri.trim();
  if (!trimmed) return trimmed;

  const schemeMatch = trimmed.match(/^(mongodb(?:\+srv)?:\/\/)(.*)$/i);
  if (!schemeMatch) return trimmed;

  const scheme = schemeMatch[1]!;
  const rest = schemeMatch[2]!;

  // Split query/fragment before parsing authority + path.
  const qIndex = rest.search(/[?#]/);
  const beforeQuery = qIndex >= 0 ? rest.slice(0, qIndex) : rest;
  const afterQuery = qIndex >= 0 ? rest.slice(qIndex) : "";

  const slash = beforeQuery.indexOf("/");
  if (slash === -1) {
    return `${scheme}${beforeQuery}/${fallbackDb}${afterQuery}`;
  }

  const path = beforeQuery.slice(slash + 1);
  // Empty path (`...mongodb.net/` or `...mongodb.net/?...`) → inject fallback.
  if (!path || path.split("/")[0] === "") {
    return `${scheme}${beforeQuery.slice(0, slash)}/${fallbackDb}${afterQuery}`;
  }

  return trimmed;
}

export function mongoDatabaseNameFromUri(uri: string): string | null {
  const ensured = ensureMongoDatabaseName(uri, "");
  const m = ensured.match(/^mongodb(?:\+srv)?:\/\/[^/]+\/([^/?#]+)/i);
  return m?.[1] ?? null;
}
