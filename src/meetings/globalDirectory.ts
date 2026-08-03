import {
  GLOBAL_MEETINGS_ENDPOINT,
  type GlobalMeetingCacheEntry,
  type SanitizedGlobalMeeting,
  extractMeetingsFromPayload,
  isGlobalMeetingCacheEntry,
  sanitizeGlobalMeetingRecord,
} from "./meetingData";

export const GLOBAL_MEETINGS_CACHE_KEY = "recovery-dharma-atlantis-global-meetings-v1";
export const GLOBAL_MEETINGS_CACHE_MAX_AGE_MS = 15 * 60 * 1000;

export type StorageLike = Pick<Storage, "getItem" | "setItem">;
export type GlobalDirectoryResult =
  | { status: "ready"; meetings: SanitizedGlobalMeeting[] }
  | { status: "cached"; meetings: SanitizedGlobalMeeting[] }
  | { status: "fallback"; meetings: SanitizedGlobalMeeting[] };

function browserStorage(): StorageLike | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
}

export function readFreshGlobalMeetingCache(
  now = Date.now(),
  storage: StorageLike | null = browserStorage(),
): SanitizedGlobalMeeting[] | null {
  try {
    const raw = storage?.getItem(GLOBAL_MEETINGS_CACHE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!isGlobalMeetingCacheEntry(parsed)) return null;
    if (now - parsed.cachedAt > GLOBAL_MEETINGS_CACHE_MAX_AGE_MS || parsed.cachedAt > now + 60_000)
      return null;
    return parsed.meetings;
  } catch {
    return null;
  }
}

export function writeGlobalMeetingCache(
  meetings: SanitizedGlobalMeeting[],
  now = Date.now(),
  storage: StorageLike | null = browserStorage(),
): void {
  try {
    const entry: GlobalMeetingCacheEntry = { cachedAt: now, meetings };
    storage?.setItem(GLOBAL_MEETINGS_CACHE_KEY, JSON.stringify(entry));
  } catch {
    // Browser storage is optional. No personal data is cached.
  }
}

export async function loadGlobalMeetingDirectory(
  options: { now?: number; storage?: StorageLike | null; fetcher?: typeof fetch } = {},
): Promise<GlobalDirectoryResult> {
  const now = options.now ?? Date.now();
  const storage = options.storage ?? browserStorage();
  const cached = readFreshGlobalMeetingCache(now, storage);
  const fetcher = options.fetcher ?? (typeof fetch === "function" ? fetch : null);
  if (!fetcher)
    return cached ? { status: "cached", meetings: cached } : { status: "fallback", meetings: [] };

  try {
    const response = await fetcher(GLOBAL_MEETINGS_ENDPOINT, {
      headers: { Accept: "application/json" },
    });
    if (!response.ok) throw new Error("Recovery Dharma Global meeting request failed");
    const payload: unknown = await response.json();
    const meetings = extractMeetingsFromPayload(payload)
      .map(sanitizeGlobalMeetingRecord)
      .filter((meeting): meeting is SanitizedGlobalMeeting => meeting !== null);
    writeGlobalMeetingCache(meetings, now, storage);
    return { status: "ready", meetings };
  } catch {
    return cached ? { status: "cached", meetings: cached } : { status: "fallback", meetings: [] };
  }
}
