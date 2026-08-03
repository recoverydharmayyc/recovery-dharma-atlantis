import assert from "node:assert/strict";
import test from "node:test";
import {
  getActiveAnnouncement,
  isScheduledAnnouncementActive,
  shouldRenderAnnouncementBanner,
} from "../announcements/announcementTiming";
import type { TemporaryMeeting } from "../content/meetings";

const now = new Date("2030-01-05T12:00:00.000Z");

test("disabled starter announcement leaves no banner state", () => {
  assert.equal(getActiveAnnouncement(now), null);
  assert.equal(shouldRenderAnnouncementBanner(null), false);
});

test("temporary meeting announcement appears before its meeting and expires after it", () => {
  const temporary: TemporaryMeeting = {
    enabled: true,
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
  assert.equal(active?.href, "/meetings");
  assert.equal(
    getActiveAnnouncement(new Date("2030-01-05T14:01:00.000Z"), { temporaryMeeting: temporary }),
    null,
  );
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
