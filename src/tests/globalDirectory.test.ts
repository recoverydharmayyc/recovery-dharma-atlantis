import assert from "node:assert/strict";
import test from "node:test";
import { GLOBAL_DIRECTORY_SOURCE } from "../config/externalSources";
import { loadGlobalMeetingDirectory } from "../meetings/globalDirectory";
import {
  readFreshGlobalMeetingCache,
  writeGlobalMeetingCache,
} from "../meetings/globalDirectoryCache";
import { buildLocalMeetings } from "../meetings/localMeetings";

class MemoryStorage {
  values = new Map<string, string>();
  getItem(key: string) {
    return this.values.get(key) ?? null;
  }
  setItem(key: string, value: string) {
    this.values.set(key, value);
  }
}

const cachedMeeting = {
  id: "safe",
  name: "Safe",
  dayIndex: 0 as const,
  time: "09:00",
  endTime: "10:00",
  timeZone: "UTC",
  region: "Online",
  conferenceUrl: "https://zoom.us/j/1",
  sourceUrl: "https://recoverydharma.org/meetings/",
};

const record = {
  id: "cached-open",
  name: "Cached open meeting",
  day: 0,
  time: "09:00",
  end_time: "10:00",
  timezone: "UTC",
  types: ["O"],
  conference_url: "https://zoom.us/j/987654321",
  url: "https://recoverydharma.org/meetings/",
  regions: ["Online"],
};

test("versioned fresh cache is accepted and corrupted cache is ignored", () => {
  const storage = new MemoryStorage();
  writeGlobalMeetingCache([cachedMeeting], 1_000, storage);
  assert.equal(readFreshGlobalMeetingCache(1_100, storage)?.[0].id, "safe");
  storage.setItem(GLOBAL_DIRECTORY_SOURCE.cacheKey, "{bad json");
  assert.equal(readFreshGlobalMeetingCache(1_100, storage), null);
  storage.setItem(
    GLOBAL_DIRECTORY_SOURCE.cacheKey,
    JSON.stringify({ schemaVersion: 1, cachedAt: 1_000, meetings: [cachedMeeting] }),
  );
  assert.equal(readFreshGlobalMeetingCache(1_100, storage), null);
});

test("live failure retains a fresh sanitized cache", async () => {
  const storage = new MemoryStorage();
  writeGlobalMeetingCache([cachedMeeting], 1_000, storage);
  const result = await loadGlobalMeetingDirectory({
    now: 1_100,
    storage,
    fetcher: async () => {
      throw new Error("offline");
    },
  });
  assert.equal(result.status, "cached");
  assert.equal(result.meetings[0].id, "safe");
});

test("live failure without cache exposes fallback state while local meetings remain available", async () => {
  const result = await loadGlobalMeetingDirectory({
    now: 1_000,
    storage: new MemoryStorage(),
    fetcher: async () => {
      throw new Error("offline");
    },
  });
  assert.equal(result.status, "error");
  assert.deepEqual(result.meetings, []);
  assert.equal(GLOBAL_DIRECTORY_SOURCE.directoryUrl, "https://recoverydharma.org/meetings/");
  assert.equal(buildLocalMeetings(new Date("2030-01-01T12:00:00.000Z")).length, 2);
});

test("missing fetch support has an explicit unavailable state", async () => {
  const result = await loadGlobalMeetingDirectory({
    now: 1_000,
    storage: new MemoryStorage(),
    fetcher: null,
  });
  assert.equal(result.status, "unavailable");
});

test("live success omits credentials, stores sanitized records, and rejects unsafe records", async () => {
  const storage = new MemoryStorage();
  let requestInit: RequestInit | undefined;
  const result = await loadGlobalMeetingDirectory({
    now: 1_000,
    storage,
    fetcher: async (_input, init) => {
      requestInit = init;
      return new Response(
        JSON.stringify({
          meetings: [record, { ...record, id: "unsafe", conference_url: "javascript:alert(1)" }],
        }),
        { status: 200 },
      );
    },
  });
  assert.equal(result.status, "live");
  assert.equal(result.meetings.length, 1);
  assert.equal(requestInit?.credentials, "omit");
  assert.ok(requestInit?.signal instanceof AbortSignal);
  assert.match(storage.getItem(GLOBAL_DIRECTORY_SOURCE.cacheKey) || "", /cached-open/);
});

test("remote records are bounded before entering the cache", async () => {
  const records = Array.from(
    { length: GLOBAL_DIRECTORY_SOURCE.maxCachedRecords + 20 },
    (_, index) => ({ ...record, id: `meeting-${index}` }),
  );
  const result = await loadGlobalMeetingDirectory({
    storage: new MemoryStorage(),
    fetcher: async () => new Response(JSON.stringify({ meetings: records }), { status: 200 }),
  });
  assert.equal(result.meetings.length, GLOBAL_DIRECTORY_SOURCE.maxCachedRecords);
});

test("request timeout aborts a stalled live request", async () => {
  const result = await loadGlobalMeetingDirectory({
    storage: new MemoryStorage(),
    timeoutMs: 5,
    fetcher: async (_input, init) =>
      new Promise<Response>((_resolve, reject) => {
        init?.signal?.addEventListener("abort", () => reject(new Error("aborted")), { once: true });
      }),
  });
  assert.equal(result.status, "error");
});
