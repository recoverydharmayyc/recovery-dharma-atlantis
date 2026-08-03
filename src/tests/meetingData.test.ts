import assert from "node:assert/strict";
import test from "node:test";
import { LOCAL_MEETINGS, type LocalMeeting, type TemporaryMeeting } from "../content/meetings";
import {
  buildLocalMeetings,
  getNearestLocalMeeting,
  validateLocalMeetings,
  validateTemporaryMeeting,
} from "../meetings/localMeetings";
import {
  extractMeetingsFromPayload,
  sanitizeGlobalMeetingRecord,
} from "../meetings/globalDirectorySanitizer";
import { safeHttpUrl } from "../utils/url";

const openRecord = {
  id: "open-online",
  name: "Open online meeting",
  day: 0,
  time: "09:00",
  end_time: "10:00",
  timezone: "UTC",
  types: ["O"],
  conference_url: "https://zoom.us/j/123456789",
  url: "https://recoverydharma.org/meetings/",
  regions: ["Online"],
};

test("two recurring local meetings are valid and nearest selection is deterministic", () => {
  assert.deepEqual(validateLocalMeetings(LOCAL_MEETINGS), []);
  const meetings = buildLocalMeetings(new Date("2030-01-01T12:00:00.000Z"));
  assert.equal(LOCAL_MEETINGS.length, 2);
  assert.equal(meetings.length, 2);
  assert.equal(getNearestLocalMeeting(meetings)?.id, meetings[0].id);
});

test("local meeting validation rejects duplicate IDs, mismatched days, bad ranges, and unsafe links", () => {
  const invalid: LocalMeeting[] = [
    { ...LOCAL_MEETINGS[0], endTime: "18:00", verifiedPublicLink: "javascript:alert(1)" },
    { ...LOCAL_MEETINGS[0], day: "Sunday" },
  ];
  const issues = validateLocalMeetings(invalid).join("\n");
  assert.match(issues, /duplicated/);
  assert.match(issues, /time/);
  assert.match(issues, /weekday/);
  assert.match(issues, /unsafe/);
});

test("temporary meetings cannot derive from an unknown recurring meeting", () => {
  const temporary: TemporaryMeeting = {
    enabled: true,
    derivedFromMeetingId: "missing-meeting",
    title: "One-time gathering",
    shortBannerLabel: "Extra meeting",
    shortBannerText: "A one-time gathering.",
    occurrences: [{ date: "2030-01-05", startTime: "13:00", endTime: "14:00", timeZone: "UTC" }],
    format: "In person",
    venueOrOnlineDescription: "Verified venue",
    verifiedPublicLink: null,
    note: "",
  };
  assert.match(validateTemporaryMeeting(temporary).join("\n"), /does not exist/);
});

test("Global payload extraction accepts supported public response shapes", () => {
  assert.deepEqual(extractMeetingsFromPayload({ data: { meetings: [openRecord] } }), [openRecord]);
  assert.deepEqual(extractMeetingsFromPayload({ meetings: [openRecord] }), [openRecord]);
});

test("sanitization accepts open online records and rejects unsafe links and access gates", () => {
  assert.equal(sanitizeGlobalMeetingRecord(openRecord)?.id, "open-online");
  assert.equal(
    sanitizeGlobalMeetingRecord({ ...openRecord, conference_url: "javascript:alert(1)" }),
    null,
  );
  assert.equal(
    sanitizeGlobalMeetingRecord({ ...openRecord, notes: "Email for the Zoom link" }),
    null,
  );
  assert.equal(safeHttpUrl("data:text/html,no"), null);
  assert.equal(
    sanitizeGlobalMeetingRecord({ ...openRecord, url: "javascript:alert(1)" })?.sourceUrl,
    "https://recoverydharma.org/meetings/",
  );
});
