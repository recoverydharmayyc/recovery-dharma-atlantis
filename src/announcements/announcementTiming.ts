import { ROUTE_PATHS, isSafeSiteHref } from "../config/site";
import {
  COMMUNITY_ANNOUNCEMENT,
  TEMPORARY_MEETING_ANNOUNCEMENT,
  type ScheduledAnnouncementTime,
  type ScheduledCommunityAnnouncement,
} from "../content/announcements";
import type { TemporaryMeeting, TemporaryMeetingOccurrence } from "../content/meetings";
import { validateTemporaryMeeting } from "../meetings/localMeetings";
import {
  MINUTE_MS,
  formatClockInZone,
  formatRelativeDay,
  getTimeZoneShortName,
  parseClockTime,
  parsePlainDate,
  zonedTimeToUtc,
} from "../meetings/meetingTime";

export type AnnouncementTone = "early" | "soon" | "late";
export type ActiveAnnouncement = {
  label: string;
  title: string;
  details: string;
  href: string;
  tone: AnnouncementTone;
  ariaLabel: string;
};

type DatedTemporaryOccurrence = TemporaryMeetingOccurrence & {
  startsAt: Date;
  endsAt: Date;
};

function hasText(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function makeDatedTime(value: ScheduledAnnouncementTime | null): Date | null {
  if (!value) return null;
  const date = parsePlainDate(value.date);
  const time = parseClockTime(value.time);
  if (!date || !time || !value.timeZone) return null;
  try {
    return zonedTimeToUtc({ ...date, hour: time.hour, minute: time.minute }, value.timeZone);
  } catch {
    return null;
  }
}

export function findTemporaryMeetingOccurrence(
  now: Date,
  temporaryMeeting: TemporaryMeeting = TEMPORARY_MEETING_ANNOUNCEMENT,
): DatedTemporaryOccurrence | null {
  if (validateTemporaryMeeting(temporaryMeeting).length > 0) return null;

  return (
    temporaryMeeting.occurrences
      .map((occurrence) => {
        const date = parsePlainDate(occurrence.date);
        const start = parseClockTime(occurrence.startTime);
        const end = parseClockTime(occurrence.endTime);
        if (!date || !start || !end) return null;
        const startsAt = zonedTimeToUtc(
          { ...date, hour: start.hour, minute: start.minute },
          occurrence.timeZone,
        );
        const endsAt = zonedTimeToUtc(
          { ...date, hour: end.hour, minute: end.minute },
          occurrence.timeZone,
        );
        return endsAt > now ? { ...occurrence, startsAt, endsAt } : null;
      })
      .filter((occurrence): occurrence is DatedTemporaryOccurrence => occurrence !== null)
      .sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime())[0] || null
  );
}

export function isScheduledAnnouncementActive(
  now: Date,
  announcement: ScheduledCommunityAnnouncement = COMMUNITY_ANNOUNCEMENT,
): boolean {
  if (
    !announcement.enabled ||
    !hasText(announcement.label) ||
    !hasText(announcement.title) ||
    !hasText(announcement.text) ||
    !isSafeSiteHref(announcement.href)
  )
    return false;
  const startsAt = makeDatedTime(announcement.startsAt);
  const expiresAt = makeDatedTime(announcement.expiresAt);
  if (!startsAt || !expiresAt || expiresAt <= startsAt) return false;
  return now >= startsAt && now < expiresAt;
}

function formatTimeUntil(startsAt: Date, now: Date): { label: string; tone: AnnouncementTone } {
  const minutes = Math.ceil((startsAt.getTime() - now.getTime()) / MINUTE_MS);
  if (minutes <= 0) return { label: "Happening now", tone: "late" };
  if (minutes <= 60) return { label: "Starts soon", tone: "soon" };
  return { label: "Upcoming", tone: "early" };
}

export function getActiveAnnouncement(
  now: Date,
  input: {
    temporaryMeeting?: TemporaryMeeting;
    communityAnnouncement?: ScheduledCommunityAnnouncement;
  } = {},
): ActiveAnnouncement | null {
  const temporaryMeeting = input.temporaryMeeting ?? TEMPORARY_MEETING_ANNOUNCEMENT;
  const communityAnnouncement = input.communityAnnouncement ?? COMMUNITY_ANNOUNCEMENT;
  const occurrence = findTemporaryMeetingOccurrence(now, temporaryMeeting);

  if (occurrence) {
    const timing = formatTimeUntil(occurrence.startsAt, now);
    const zone = getTimeZoneShortName(occurrence.startsAt, occurrence.timeZone);
    return {
      label: `${temporaryMeeting.shortBannerLabel} · ${timing.label}`,
      title: temporaryMeeting.title,
      details:
        temporaryMeeting.shortBannerText +
        " " +
        formatRelativeDay(occurrence.startsAt, now, occurrence.timeZone) +
        " · " +
        formatClockInZone(occurrence.startsAt, occurrence.timeZone) +
        (zone ? " " + zone : "") +
        " · " +
        temporaryMeeting.venueOrOnlineDescription,
      href: `${ROUTE_PATHS.meetings}#local-schedule`,
      tone: timing.tone,
      ariaLabel: temporaryMeeting.shortBannerLabel,
    };
  }

  if (isScheduledAnnouncementActive(now, communityAnnouncement)) {
    return {
      label: communityAnnouncement.label,
      title: communityAnnouncement.title,
      details: communityAnnouncement.text,
      href: communityAnnouncement.href,
      tone: "early",
      ariaLabel: communityAnnouncement.title,
    };
  }

  return null;
}
