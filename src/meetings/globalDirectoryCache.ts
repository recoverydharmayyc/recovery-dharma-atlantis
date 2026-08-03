import { GLOBAL_DIRECTORY_SOURCE } from "../config/externalSources";
import { isSanitizedGlobalMeeting, type SanitizedGlobalMeeting } from "./globalDirectorySanitizer";

export type GlobalMeetingCacheEntry = {
  schemaVersion: number;
  cachedAt: number;
  meetings: SanitizedGlobalMeeting[];
};
export type StorageLike = Pick<Storage, "getItem" | "setItem">;

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function browserStorage(): StorageLike | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
}

export function isGlobalMeetingCacheEntry(value: unknown): value is GlobalMeetingCacheEntry {
  return (
    isObject(value) &&
    value.schemaVersion === GLOBAL_DIRECTORY_SOURCE.cacheSchemaVersion &&
    typeof value.cachedAt === "number" &&
    Number.isFinite(value.cachedAt) &&
    Array.isArray(value.meetings) &&
    value.meetings.length <= GLOBAL_DIRECTORY_SOURCE.maxCachedRecords &&
    value.meetings.every(isSanitizedGlobalMeeting)
  );
}

export function readFreshGlobalMeetingCache(
  now = Date.now(),
  storage: StorageLike | null = browserStorage(),
): SanitizedGlobalMeeting[] | null {
  try {
    const raw = storage?.getItem(GLOBAL_DIRECTORY_SOURCE.cacheKey);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!isGlobalMeetingCacheEntry(parsed)) return null;
    if (
      now - parsed.cachedAt > GLOBAL_DIRECTORY_SOURCE.cacheMaxAgeMs ||
      parsed.cachedAt > now + 60_000
    )
      return null;
    return parsed.meetings;
  } catch {
    return null;
  }
}

export function writeGlobalMeetingCache(
  meetings: readonly SanitizedGlobalMeeting[],
  now = Date.now(),
  storage: StorageLike | null = browserStorage(),
): void {
  try {
    const entry: GlobalMeetingCacheEntry = {
      schemaVersion: GLOBAL_DIRECTORY_SOURCE.cacheSchemaVersion,
      cachedAt: now,
      meetings: meetings.slice(0, GLOBAL_DIRECTORY_SOURCE.maxCachedRecords),
    };
    storage?.setItem(GLOBAL_DIRECTORY_SOURCE.cacheKey, JSON.stringify(entry));
  } catch {
    // Browser storage is optional. Only sanitized public meeting records are cached.
  }
}
