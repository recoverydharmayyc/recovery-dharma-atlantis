import assert from "node:assert/strict";
import test from "node:test";
import { LOCAL_MEETINGS } from "../content/meetings";
import {
  GLOBAL_MEETINGS_URL,
  buildLocalMeetings,
  extractMeetingsFromPayload,
  getNearestLocalMeeting,
  safeHttpUrl,
  sanitizeGlobalMeetingRecord,
} from "../meetings/meetingData";

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

test("local meetings are array-based and nearest selection is deterministic", () => {
  const meetings = buildLocalMeetings(new Date("2030-01-01T12:00:00.000Z"));
  assert.equal(LOCAL_MEETINGS.length, 2);
  assert.equal(meetings.length, 2);
  assert.equal(getNearestLocalMeeting(meetings)?.id, meetings[0].id);
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
    GLOBAL_MEETINGS_URL,
  );
});
