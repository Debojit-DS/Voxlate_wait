/**
 * The only form of a waitlist member's name that may leave the server publicly:
 * first name plus last initial ("Priya S."). Photos, emails, roles and companies never do.
 */
export function publicName(full: unknown): string {
  const parts = typeof full === "string" ? full.trim().split(/\s+/).filter(Boolean) : [];
  if (!parts.length) return "Someone";
  const first = parts[0].slice(0, 24);
  const lastInitial = parts.length > 1 ? parts[parts.length - 1].match(/\p{L}/u)?.[0] : undefined;
  return lastInitial ? `${first} ${lastInitial.toLocaleUpperCase()}.` : first;
}

/** Public lists show at most this many recent names. */
export const PUBLIC_RECENT_LIMIT = 8;

/** The waitlist page lists every member (as "First L.", with no dates); this only guards the query size. */
export const PUBLIC_NAMES_LIMIT = 5000;
