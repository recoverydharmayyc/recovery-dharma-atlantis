import { GLOBAL_DIRECTORY_SOURCE } from "../config/externalSources";
import type { SanitizedGlobalMeeting } from "./globalDirectorySanitizer";
import {
  DAY_MS,
  HOUR_MS,
  MINUTE_MS,
  addDaysToPlainDate,
  formatClockInZone,
  getTimeZoneShortName,
  getZonedDateTimeParts,
  parseClockTime,
  safeTimeZone,
  zonedTimeToUtc,
} from "./meetingTime";

const LATE_MEETING_CUTOFF_MINUTES = 9;

export type GlobalMeetingOccurrence = SanitizedGlobalMeeting & {
  startsAt: Date;
  endsAt: Date;
  minutesUntilStart: number;
};

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

export function getGlobalMeetingOccurrences(
  records: readonly SanitizedGlobalMeeting[],
  now: Date,
): GlobalMeetingOccurrence[] {
  return records
    .map((meeting) => {
      const start = parseClockTime(meeting.time);
      if (!start) return null;
      const zone = safeTimeZone(meeting.timeZone, "UTC");
      const today = getZonedDateTimeParts(now, zone);
      for (let offset = 0; offset <= 7; offset += 1) {
        const date = addDaysToPlainDate(today, offset);
        if (date.weekday !== meeting.dayIndex) continue;
        const startsAt = zonedTimeToUtc({ ...date, hour: start.hour, minute: start.minute }, zone);
        const endsAt = getEndDate(startsAt, date, meeting.endTime, zone);
        const minutesSinceStart = (now.getTime() - startsAt.getTime()) / MINUTE_MS;
        if (
          startsAt > now ||
          (minutesSinceStart >= 0 && minutesSinceStart <= LATE_MEETING_CUTOFF_MINUTES)
        ) {
          return {
            ...meeting,
            startsAt,
            endsAt,
            minutesUntilStart: Math.round((startsAt.getTime() - now.getTime()) / MINUTE_MS),
          };
        }
      }
      return null;
    })
    .filter((item): item is GlobalMeetingOccurrence => item !== null)
    .sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime());
}

export function selectGlobalPreviewMeetings(
  meetings: readonly GlobalMeetingOccurrence[],
): GlobalMeetingOccurrence[] {
  const soon = meetings.filter((meeting) => meeting.minutesUntilStart <= 60);
  const nextDay = meetings.filter(
    (meeting) => meeting.minutesUntilStart > 60 && meeting.minutesUntilStart <= 24 * 60,
  );
  const remaining = meetings.filter((meeting) => meeting.minutesUntilStart > 24 * 60);
  return [...soon, ...nextDay, ...remaining].slice(0, GLOBAL_DIRECTORY_SOURCE.previewLimit);
}

export function formatListedLocalTime(meeting: GlobalMeetingOccurrence): string {
  const zone = safeTimeZone(meeting.timeZone, "UTC");
  const name = getTimeZoneShortName(meeting.startsAt, zone);
  return "Listed locally: " + formatClockInZone(meeting.startsAt, zone) + (name ? " " + name : "");
}
