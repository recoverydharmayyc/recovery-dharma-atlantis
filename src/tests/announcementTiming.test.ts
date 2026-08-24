import assert from "node:assert/strict";
import test from "node:test";
import {
  getActiveAnnouncement,
  isScheduledAnnouncementActive,
} from "../announcements/announcementTiming";
import type { TemporaryMeeting } from "../content/meetings";

const now = new Date("2030-01-05T12:00:00.000Z");

test("disabled starter announcement leaves no banner state", () => {
  assert.equal(getActiveAnnouncement(now), null);
});

test("a disabled temporary meeting stays hidden even when occurrences remain", () => {
  const disabled: TemporaryMeeting = {
    enabled: false,
    derivedFromMeetingId: null,
    title: "Disabled community meeting",
    shortBannerLabel: "Extra meeting",
    shortBannerText: "This must remain hidden.",
    occurrences: [{ date: "2030-01-05", startTime: "13:00", endTime: "14:00", timeZone: "UTC" }],
    format: "In person",
    venueOrOnlineDescription: "Verified venue",
    verifiedPublicLink: null,
    note: "",
  };
  assert.equal(getActiveAnnouncement(now, { temporaryMeeting: disabled }), null);
});

test("temporary meeting announcement appears before its meeting and expires after it", () => {
  const temporary: TemporaryMeeting = {
    enabled: true,
    derivedFromMeetingId: null,
    title: "One-time community meeting",
    shortBannerLabel: "Extra meeting",
    shortBannerText: "A verified temporary gathering.",
    occurrences: [{ date: "2030-01-05", startTime: "13:00", endTime: "14:00", timeZone: "UTC" }],
    format: "In person",
    venueOrOnlineDescription: "Verified venue",
    verifiedPublicLink: null,
    note: "",
  };
  const active = getActiveAnnouncement(now, { temporaryMeeting: temporary });
  assert.equal(active?.title, "One-time community meeting");
  assert.equal(active?.label, "Extra meeting · Starts soon");
  assert.equal(active?.href, "/meetings#local-schedule");
  assert.equal(
    getActiveAnnouncement(new Date("2030-01-05T14:01:00.000Z"), { temporaryMeeting: temporary }),
    null,
  );
});

test("malformed and unsafe announcements fail closed", () => {
  const malformed = {
    enabled: true,
    label: "Notice",
    title: "Malformed notice",
    text: "This should not render.",
    href: "javascript:alert(1)",
    startsAt: { date: "not-a-date", time: "12:30", timeZone: "UTC" },
    expiresAt: { date: "2030-01-05", time: "13:30", timeZone: "UTC" },
  };
  assert.equal(isScheduledAnnouncementActive(now, malformed), false);
  assert.equal(getActiveAnnouncement(now, { communityAnnouncement: malformed }), null);
});

test("scheduled announcements reject invalid time zones", () => {
  const invalidTimeZone = {
    enabled: true,
    label: "Notice",
    title: "Invalid time zone",
    text: "This should not render.",
    href: "/meetings",
    startsAt: { date: "2030-01-05", time: "11:30", timeZone: "Not/A_Time_Zone" },
    expiresAt: { date: "2030-01-05", time: "13:30", timeZone: "Not/A_Time_Zone" },
  };
  assert.equal(isScheduledAnnouncementActive(now, invalidTimeZone), false);
});

test("scheduled announcement respects both its start and expiry", () => {
  const announcement = {
    enabled: true,
    label: "Notice",
    title: "Scheduled update",
    text: "Short update",
    href: "/meetings",
    startsAt: { date: "2030-01-05", time: "12:30", timeZone: "UTC" },
    expiresAt: { date: "2030-01-05", time: "13:30", timeZone: "UTC" },
  };
  assert.equal(isScheduledAnnouncementActive(now, announcement), false);
  assert.equal(
    isScheduledAnnouncementActive(new Date("2030-01-05T12:45:00.000Z"), announcement),
    true,
  );
  assert.equal(
    isScheduledAnnouncementActive(new Date("2030-01-05T13:30:00.000Z"), announcement),
    false,
  );
});
