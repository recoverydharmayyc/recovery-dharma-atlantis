import { TEMPORARY_MEETING_ANNOUNCEMENT } from "../content/announcements";
import { LOCAL_MEETINGS, type LocalMeeting, type TemporaryMeeting } from "../content/meetings";
import { safeHttpUrl } from "../utils/url";
import {
  ATLANTIS_TIME_ZONE,
  DAY_INDEX_TO_NAME,
  DAY_MS,
  HOUR_MS,
  MINUTE_MS,
  addDaysToPlainDate,
  formatClockInZone,
  formatRelativeDay,
  getTimeZoneShortName,
  getZonedDateTimeParts,
  isForwardClockRange,
  isValidTimeZone,
  parseClockTime,
  parsePlainDate,
  safeTimeZone,
  zonedTimeToUtc,
} from "./meetingTime";

const LATE_MEETING_CUTOFF_MINUTES = 9;

export type MeetingStatus = { label: string; tone: "early" | "soon" | "late" };
export type LocalMeetingItem = {
  id: string;
  kind: "recurring" | "temporary";
  tabLabel: string;
  title: string;
  eyebrow: string;
  description: string;
  metaLines: string[];
  startsAt: Date;
  endsAt: Date;
  timeZone: string;
  publicLink: string | null;
};

function hasText(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function validateLocalMeeting(meeting: LocalMeeting): string[] {
  const issues: string[] = [];
  for (const [field, value] of [
    ["id", meeting.id],
    ["title", meeting.title],
    ["day", meeting.day],
    ["displayTime", meeting.displayTime],
    ["timeZone", meeting.timeZone],
    ["format", meeting.format],
    ["venue", meeting.venue],
    ["description", meeting.description],
    ["newcomerNote", meeting.newcomerNote],
    ["registrationNote", meeting.registrationNote],
  ] as const) {
    if (!hasText(value)) issues.push(`${meeting.id || "meeting"}: ${field} is required`);
  }
  if (DAY_INDEX_TO_NAME[meeting.dayIndex] !== meeting.day)
    issues.push(`${meeting.id}: weekday and day index do not agree`);
  if (!isForwardClockRange(meeting.startTime, meeting.endTime))
    issues.push(`${meeting.id}: start and end times are invalid`);
  if (!isValidTimeZone(meeting.timeZone)) issues.push(`${meeting.id}: time zone is invalid`);
  if (meeting.verifiedPublicLink !== null && !safeHttpUrl(meeting.verifiedPublicLink))
    issues.push(`${meeting.id}: verified public link is unsafe`);
  return issues;
}

export function validateLocalMeetings(meetings: readonly LocalMeeting[]): string[] {
  const issues = meetings.flatMap(validateLocalMeeting);
  const ids = new Set<string>();
  for (const meeting of meetings) {
    if (ids.has(meeting.id)) issues.push(`${meeting.id}: meeting ID is duplicated`);
    ids.add(meeting.id);
  }
  return issues;
}

export function validateTemporaryMeeting(
  meeting: TemporaryMeeting,
  recurringMeetings: readonly LocalMeeting[] = LOCAL_MEETINGS,
): string[] {
  const issues: string[] = [];
  if (meeting.verifiedPublicLink !== null && !safeHttpUrl(meeting.verifiedPublicLink))
    issues.push("temporary meeting: verified public link is unsafe");
  if (
    meeting.derivedFromMeetingId !== null &&
    !recurringMeetings.some((item) => item.id === meeting.derivedFromMeetingId)
  )
    issues.push("temporary meeting: derived recurring meeting does not exist");
  if (!meeting.enabled) return issues;
  for (const [field, value] of [
    ["title", meeting.title],
    ["shortBannerLabel", meeting.shortBannerLabel],
    ["shortBannerText", meeting.shortBannerText],
    ["format", meeting.format],
    ["venueOrOnlineDescription", meeting.venueOrOnlineDescription],
  ] as const) {
    if (!hasText(value)) issues.push(`temporary meeting: ${field} is required`);
  }
  if (meeting.occurrences.length === 0)
    issues.push("temporary meeting: at least one occurrence is required");
  for (const occurrence of meeting.occurrences) {
    if (!parsePlainDate(occurrence.date))
      issues.push("temporary meeting: occurrence date is invalid");
    if (!isForwardClockRange(occurrence.startTime, occurrence.endTime))
      issues.push("temporary meeting: occurrence time range is invalid");
    if (!isValidTimeZone(occurrence.timeZone))
      issues.push("temporary meeting: occurrence time zone is invalid");
  }
  return issues;
}

function getEndDate(
  startsAt: Date,
  date: { year: number; month: number; day: number },
  endTime: string,
  timeZone: string,
): Date {
  const end = parseClockTime(endTime);
  if (!end) return new Date(startsAt.getTime() + HOUR_MS);
  let endsAt = zonedTimeToUtc({ ...date, hour: end.hour, minute: end.minute }, timeZone);
  if (endsAt <= startsAt) endsAt = new Date(endsAt.getTime() + DAY_MS);
  return endsAt;
}

function getRecurringOccurrence(
  meeting: Pick<LocalMeeting, "dayIndex" | "startTime" | "endTime" | "timeZone">,
  now: Date,
): { startsAt: Date; endsAt: Date } | null {
  const start = parseClockTime(meeting.startTime);
  if (!start || !isValidTimeZone(meeting.timeZone)) return null;
  const today = getZonedDateTimeParts(now, meeting.timeZone);
  for (let offset = 0; offset <= 14; offset += 1) {
    const date = addDaysToPlainDate(today, offset);
    if (date.weekday !== meeting.dayIndex) continue;
    const startsAt = zonedTimeToUtc(
      { ...date, hour: start.hour, minute: start.minute },
      meeting.timeZone,
    );
    const endsAt = getEndDate(startsAt, date, meeting.endTime, meeting.timeZone);
    const minutesSinceStart = (now.getTime() - startsAt.getTime()) / MINUTE_MS;
    if (
      startsAt > now ||
      (minutesSinceStart >= 0 && minutesSinceStart <= LATE_MEETING_CUTOFF_MINUTES)
    )
      return { startsAt, endsAt };
  }
  return null;
}

function getTemporaryOccurrence(meeting: TemporaryMeeting, now: Date) {
  if (!meeting.enabled || validateTemporaryMeeting(meeting).length > 0) return null;
  return (
    meeting.occurrences
      .map((occurrence) => {
        const date = parsePlainDate(occurrence.date);
        const start = parseClockTime(occurrence.startTime);
        if (!date || !start) return null;
        const startsAt = zonedTimeToUtc(
          { ...date, hour: start.hour, minute: start.minute },
          occurrence.timeZone,
        );
        const endsAt = getEndDate(startsAt, date, occurrence.endTime, occurrence.timeZone);
        return endsAt > now ? { startsAt, endsAt, occurrence } : null;
      })
      .filter(
        (
          item,
        ): item is {
          startsAt: Date;
          endsAt: Date;
          occurrence: TemporaryMeeting["occurrences"][number];
        } => item !== null,
      )
      .sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime())[0] || null
  );
}

export function buildLocalMeetings(
  now: Date,
  meetings: readonly LocalMeeting[] = LOCAL_MEETINGS,
  temporaryMeeting: TemporaryMeeting = TEMPORARY_MEETING_ANNOUNCEMENT,
): LocalMeetingItem[] {
  const items: LocalMeetingItem[] = [];
  for (const meeting of meetings) {
    if (validateLocalMeeting(meeting).length > 0) continue;
    const occurrence = getRecurringOccurrence(meeting, now);
    if (!occurrence) continue;
    items.push({
      id: meeting.id,
      kind: "recurring",
      tabLabel: meeting.tabLabel,
      title: meeting.title,
      eyebrow: meeting.format,
      description: meeting.description,
      metaLines: [
        meeting.day,
        meeting.displayTime,
        meeting.timeZoneLabel,
        meeting.venue,
        meeting.newcomerNote,
        meeting.registrationNote,
      ],
      startsAt: occurrence.startsAt,
      endsAt: occurrence.endsAt,
      timeZone: meeting.timeZone,
      publicLink: meeting.verifiedPublicLink,
    });
  }

  const temporary = getTemporaryOccurrence(temporaryMeeting, now);
  if (temporary) {
    items.push({
      id: `temporary-${temporary.occurrence.date}`,
      kind: "temporary",
      tabLabel: "Temporary",
      title: temporaryMeeting.title,
      eyebrow: temporaryMeeting.format,
      description: temporaryMeeting.note || "A one-time fictional community gathering.",
      metaLines: [
        formatRelativeDay(temporary.startsAt, now, temporary.occurrence.timeZone),
        temporaryMeeting.venueOrOnlineDescription,
      ],
      startsAt: temporary.startsAt,
      endsAt: temporary.endsAt,
      timeZone: temporary.occurrence.timeZone,
      publicLink: temporaryMeeting.verifiedPublicLink,
    });
  }
  return items.sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime());
}

export function getNearestLocalMeeting(
  meetings: readonly LocalMeetingItem[],
): LocalMeetingItem | null {
  return meetings[0] || null;
}

export function getMeetingStatus(startsAt: Date, now: Date): MeetingStatus {
  const minutes = Math.round((startsAt.getTime() - now.getTime()) / MINUTE_MS);
  if (minutes <= 0) return { label: minutes > -60 ? "Happening now" : "In progress", tone: "late" };
  if (minutes <= 60) return { label: "Starts soon", tone: "soon" };
  return { label: "Upcoming", tone: "early" };
}

export function formatMeetingStartLabel(
  startsAt: Date,
  now: Date,
  timeZone = ATLANTIS_TIME_ZONE,
): string {
  const zone = safeTimeZone(timeZone);
  const name = getTimeZoneShortName(startsAt, zone);
  return (
    formatRelativeDay(startsAt, now, zone) +
    " · " +
    formatClockInZone(startsAt, zone) +
    (name ? " " + name : "")
  );
}
