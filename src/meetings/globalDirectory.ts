import { GLOBAL_DIRECTORY_SOURCE } from "../config/externalSources";
import {
  readFreshGlobalMeetingCache,
  writeGlobalMeetingCache,
  type StorageLike,
} from "./globalDirectoryCache";
import {
  sanitizeGlobalMeetingPayload,
  type SanitizedGlobalMeeting,
} from "./globalDirectorySanitizer";

export type GlobalDirectoryResult =
  | { status: "live"; meetings: SanitizedGlobalMeeting[] }
  | { status: "cached"; meetings: SanitizedGlobalMeeting[] }
  | { status: "empty"; meetings: SanitizedGlobalMeeting[] }
  | { status: "unavailable"; meetings: SanitizedGlobalMeeting[] }
  | { status: "error"; meetings: SanitizedGlobalMeeting[] };

export type GlobalDirectoryOptions = {
  now?: number;
  storage?: StorageLike | null;
  fetcher?: typeof fetch | null;
  timeoutMs?: number;
  signal?: AbortSignal;
  cachedMeetings?: SanitizedGlobalMeeting[] | null;
};

export async function loadGlobalMeetingDirectory(
  options: GlobalDirectoryOptions = {},
): Promise<GlobalDirectoryResult> {
  const now = options.now ?? Date.now();
  const cached =
    options.cachedMeetings === undefined
      ? readFreshGlobalMeetingCache(now, options.storage)
      : options.cachedMeetings;
  const fetcher =
    options.fetcher === undefined ? (typeof fetch === "function" ? fetch : null) : options.fetcher;
  if (!fetcher)
    return cached
      ? { status: "cached", meetings: cached }
      : { status: "unavailable", meetings: [] };

  const controller = new AbortController();
  const abortFromCaller = () => controller.abort();
  if (options.signal?.aborted) controller.abort();
  options.signal?.addEventListener("abort", abortFromCaller, { once: true });
  const timeoutId = setTimeout(
    () => controller.abort(),
    options.timeoutMs ?? GLOBAL_DIRECTORY_SOURCE.requestTimeoutMs,
  );

  try {
    const response = await fetcher(GLOBAL_DIRECTORY_SOURCE.endpoint, {
      method: "GET",
      headers: { Accept: "application/json" },
      credentials: "omit",
      cache: "no-store",
      signal: controller.signal,
    });
    if (!response.ok) throw new Error("Recovery Dharma Global meeting request failed");
    const meetings = sanitizeGlobalMeetingPayload(await response.json());
    writeGlobalMeetingCache(meetings, now, options.storage);
    return meetings.length > 0 ? { status: "live", meetings } : { status: "empty", meetings: [] };
  } catch {
    return cached ? { status: "cached", meetings: cached } : { status: "error", meetings: [] };
  } finally {
    clearTimeout(timeoutId);
    options.signal?.removeEventListener("abort", abortFromCaller);
  }
}

export { readFreshGlobalMeetingCache } from "./globalDirectoryCache";
