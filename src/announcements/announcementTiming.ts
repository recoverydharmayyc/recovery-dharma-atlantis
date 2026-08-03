import {
  COMMUNITY_ANNOUNCEMENT,
  TEMPORARY_MEETING_ANNOUNCEMENT,
  type ScheduledAnnouncementTime,
  type ScheduledCommunityAnnouncement,
} from "../content/announcements";
import type { TemporaryMeeting, TemporaryMeetingOccurrence } from "../content/meetings";
import {
  DAY_MS,
  HOUR_MS,
  MINUTE_MS,
  formatClockInZone,
  formatRelativeDay,
  getTimeZoneShortName,
  parseClockTime,
  parsePlainDate,
  safeTimeZone,
  zonedTimeToUtc,
} from "../meetings/time";

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

function makeDatedTime(value: ScheduledAnnouncementTime | null): Date | null {
  if (!value) return null;
  const date = parsePlainDate(value.date);
  const time = parseClockTime(value.time);
  if (!date || !time) return null;
  return zonedTimeToUtc(
    { ...date, hour: time.hour, minute: time.minute },
    safeTimeZone(value.timeZone),
  );
}

export function findTemporaryMeetingOccurrence(
  now: Date,
  temporaryMeeting: TemporaryMeeting = TEMPORARY_MEETING_ANNOUNCEMENT,
): DatedTemporaryOccurrence | null {
  if (!temporaryMeeting.enabled || !Array.isArray(temporaryMeeting.occurrences)) return null;

  return (
    temporaryMeeting.occurrences
      .map((occurrence) => {
        const date = parsePlainDate(occurrence.date);
        const start = parseClockTime(occurrence.startTime);
        const end = parseClockTime(occurrence.endTime);
        const timeZone = safeTimeZone(occurrence.timeZone);
        if (!date || !start) return null;
        const startsAt = zonedTimeToUtc(
          { ...date, hour: start.hour, minute: start.minute },
          timeZone,
        );
        let endsAt = end
          ? zonedTimeToUtc({ ...date, hour: end.hour, minute: end.minute }, timeZone)
          : new Date(startsAt.getTime() + HOUR_MS);
        if (endsAt <= startsAt) endsAt = new Date(endsAt.getTime() + DAY_MS);
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
  if (!announcement.enabled) return false;
  const startsAt = makeDatedTime(announcement.startsAt);
  const expiresAt = makeDatedTime(announcement.expiresAt);
  if (startsAt && now < startsAt) return false;
  return !(expiresAt && now >= expiresAt);
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
    const timeZone = safeTimeZone(occurrence.timeZone);
    const timing = formatTimeUntil(occurrence.startsAt, now);
    const zone = getTimeZoneShortName(occurrence.startsAt, timeZone);
    return {
      label:
        (temporaryMeeting.shortBannerLabel ? temporaryMeeting.shortBannerLabel + " · " : "") +
        timing.label,
      title: temporaryMeeting.title,
      details:
        (temporaryMeeting.shortBannerText ? temporaryMeeting.shortBannerText + " " : "") +
        formatRelativeDay(occurrence.startsAt, now, timeZone) +
        " · " +
        formatClockInZone(occurrence.startsAt, timeZone) +
        (zone ? " " + zone : "") +
        " · " +
        temporaryMeeting.venueOrOnlineDescription,
      href: "/meetings",
      tone: timing.tone,
      ariaLabel: temporaryMeeting.shortBannerLabel || temporaryMeeting.title,
    };
  }

  if (isScheduledAnnouncementActive(now, communityAnnouncement)) {
    return {
      label: communityAnnouncement.label,
      title: communityAnnouncement.title,
      details: communityAnnouncement.text,
      href: communityAnnouncement.href || "/meetings",
      tone: "early",
      ariaLabel: communityAnnouncement.title || communityAnnouncement.label,
    };
  }

  return null;
}

export function shouldRenderAnnouncementBanner(announcement: ActiveAnnouncement | null): boolean {
  return announcement !== null;
}
