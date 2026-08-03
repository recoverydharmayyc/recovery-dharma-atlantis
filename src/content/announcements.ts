import type { TemporaryMeeting } from "./meetings";

export type ScheduledAnnouncementTime = {
  date: string;
  time: string;
  timeZone: string;
};

export type ScheduledCommunityAnnouncement = {
  enabled: boolean;
  label: string;
  title: string;
  text: string;
  href: string;
  startsAt: ScheduledAnnouncementTime | null;
  expiresAt: ScheduledAnnouncementTime | null;
};

// This starter intentionally ships with no dated temporary meeting. In the
// tutorial, an owner can enable this object and add a verified future occurrence.
export const TEMPORARY_MEETING_ANNOUNCEMENT: TemporaryMeeting = {
  enabled: false,
  title: "Temporary community meeting",
  shortBannerLabel: "Extra meeting",
  shortBannerText: "A one-time gathering has been added.",
  occurrences: [],
  format: "In person",
  venueOrOnlineDescription: "Atlantis Community Room",
  verifiedPublicLink: null,
  note: "",
};

// Disabled means no banner is rendered and no announcement space is reserved.
export const COMMUNITY_ANNOUNCEMENT: ScheduledCommunityAnnouncement = {
  enabled: false,
  label: "Community update",
  title: "",
  text: "",
  href: "/meetings",
  startsAt: null,
  expiresAt: null,
};
