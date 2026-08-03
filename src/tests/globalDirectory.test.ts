import assert from "node:assert/strict";
import test from "node:test";
import {
  GLOBAL_MEETINGS_CACHE_KEY,
  readFreshGlobalMeetingCache,
  loadGlobalMeetingDirectory,
  writeGlobalMeetingCache,
} from "../meetings/globalDirectory";
import { buildLocalMeetings } from "../meetings/meetingData";

class MemoryStorage {
  values = new Map<string, string>();
  getItem(key: string) {
    return this.values.get(key) ?? null;
  }
  setItem(key: string, value: string) {
    this.values.set(key, value);
  }
}

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

test("valid cache is read before the live directory", () => {
  const storage = new MemoryStorage();
  writeGlobalMeetingCache(
    [
      {
        id: "safe",
        name: "Safe",
        dayIndex: 0,
        time: "09:00",
        endTime: "10:00",
        timeZone: "UTC",
        region: "Online",
        conferenceUrl: "https://zoom.us/j/1",
        sourceUrl: "https://recoverydharma.org/meetings/",
      },
    ],
    1_000,
    storage,
  );
  assert.equal(readFreshGlobalMeetingCache(1_100, storage)?.[0].id, "safe");
});

test("live failure retains a fresh sanitized cache", async () => {
  const storage = new MemoryStorage();
  writeGlobalMeetingCache(
    [
      {
        id: "safe",
        name: "Safe",
        dayIndex: 0,
        time: "09:00",
        endTime: "10:00",
        timeZone: "UTC",
        region: "Online",
        conferenceUrl: "https://zoom.us/j/1",
        sourceUrl: "https://recoverydharma.org/meetings/",
      },
    ],
    1_000,
    storage,
  );
  const offlineFetcher = (async () => {
    throw new Error("offline");
  }) as typeof fetch;
  const result = await loadGlobalMeetingDirectory({ now: 1_100, storage, fetcher: offlineFetcher });
  assert.equal(result.status, "cached");
  assert.equal(result.meetings[0].id, "safe");
});

test("live failure without usable cache offers the source-directory fallback while local meetings remain available", async () => {
  const storage = new MemoryStorage();
  const offlineFetcher = (async () => {
    throw new Error("offline");
  }) as typeof fetch;
  const result = await loadGlobalMeetingDirectory({ now: 1_000, storage, fetcher: offlineFetcher });
  assert.equal(result.status, "fallback");
  assert.deepEqual(result.meetings, []);
  assert.equal(buildLocalMeetings(new Date("2030-01-01T12:00:00.000Z")).length, 2);
});

test("live success stores sanitized records only", async () => {
  const storage = new MemoryStorage();
  const response = new Response(
    JSON.stringify({
      meetings: [record, { ...record, id: "unsafe", conference_url: "javascript:alert(1)" }],
    }),
    { status: 200 },
  );
  const result = await loadGlobalMeetingDirectory({
    now: 1_000,
    storage,
    fetcher: async () => response,
  });
  assert.equal(result.status, "ready");
  assert.equal(result.meetings.length, 1);
  assert.match(storage.getItem(GLOBAL_MEETINGS_CACHE_KEY) || "", /cached-open/);
});
