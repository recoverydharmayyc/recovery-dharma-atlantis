import { TEMPORARY_MEETING_ANNOUNCEMENT } from "../content/announcements";
import { LOCAL_MEETINGS, type LocalMeeting, type TemporaryMeeting } from "../content/meetings";
import {
  ATLANTIS_TIME_ZONE,
  DAY_MS,
  HOUR_MS,
  MINUTE_MS,
  addDaysToPlainDate,
  formatClockInZone,
  formatRelativeDay,
  getTimeZoneShortName,
  getZonedDateTimeParts,
  parseClockTime,
  parsePlainDate,
  safeTimeZone,
  zonedTimeToUtc,
  type DayIndex,
} from "./time";

export const GLOBAL_MEETINGS_ENDPOINT =
  "https://recoverydharma.org/wp-admin/admin-ajax.php?action=meetings";
export const GLOBAL_MEETINGS_URL = "https://recoverydharma.org/meetings/";
const LATE_MEETING_CUTOFF_MINUTES = 9;
const ACCESS_GATE_PATTERNS = [
  /\b(email|e-mail|text|contact|dm|message).{0,50}\b(access|info|link|zoom|meeting|password|passcode|code)\b/i,
  /\b(register|registration|pre-register|preregister)\b/i,
  /\binvite[-\s]?only\b/i,
  /\bmembers?\s+only\b/i,
  /\bclosed\s+meeting\b/i,
];
const NON_WORKING_CONFERENCE_PATTERNS = [
  /\bplaceholder\b/i,
  /\bwill\s+not\s+work\b/i,
  /\bdo\s+not\s+use\b.{0,40}\bzoom\b/i,
];
const SPECIALTY_ACCESS_PATTERNS = [
  /\blgbtqia?\+?\b/i,
  /\bqueer\b/i,
  /\btrans\b/i,
  /\bnon[-\s]?binary\b/i,
  /\bbipoc\b/i,
  /\bblack\b/i,
  /\bwomen(?:'s)?\b/i,
  /\bmen(?:'s)?\b/i,
  /\ballies?\s+only\b/i,
];
const SPECIALTY_TYPE_CODES = new Set(["ILGB", "IW", "IM", "IWMN", "IMEN", "IBIPOC"]);
const CLOSED_TYPE_CODES = new Set(["C"]);

export type RawGlobalMeetingRecord = Record<string, unknown>;
export type SanitizedGlobalMeeting = {
  id: string;
  name: string;
  dayIndex: DayIndex;
  time: string;
  endTime: string;
  timeZone: string;
  region: string;
  conferenceUrl: string;
  sourceUrl: string;
};
export type GlobalMeetingCacheEntry = { cachedAt: number; meetings: SanitizedGlobalMeeting[] };
export type MeetingStatus = { label: string; tone: "early" | "soon" | "late" };
export type LocalMeetingCardItem = {
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
export type GlobalMeetingOccurrence = SanitizedGlobalMeeting & {
  startsAt: Date;
  endsAt: Date;
  minutesUntilStart: number;
};
export type GlobalMeetingCardItem = GlobalMeetingOccurrence;

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function cleanText(value: unknown, fallback = ""): string {
  if (value === null || value === undefined) return fallback;
  const text = String(value)
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text || fallback;
}

export function flattenText(value: unknown): string {
  if (Array.isArray(value)) return value.map(flattenText).join(" ");
  if (isObject(value)) return Object.values(value).map(flattenText).join(" ");
  return cleanText(value);
}

export function safeHttpUrl(value: unknown): string | null {
  if (typeof value !== "string" || !value.trim()) return null;
  try {
    const url = new URL(value.trim());
    return url.protocol === "http:" || url.protocol === "https:" ? url.href : null;
  } catch {
    return null;
  }
}

function isZoomUrl(value: unknown): boolean {
  const safe = safeHttpUrl(value);
  return Boolean(safe && /(^|\.)zoom\.us$/i.test(new URL(safe).hostname));
}

function getSearchText(record: RawGlobalMeetingRecord): string {
  return [
    record.name,
    record.notes,
    record.conference_url_notes,
    record.conference_phone_notes,
    record.location,
    record.formatted_address,
    record.regions,
    record.types,
  ]
    .map(flattenText)
    .join(" ");
}

function sanitizeTypes(value: unknown): string[] {
  return Array.isArray(value)
    ? value
        .filter((item): item is string => typeof item === "string")
        .map((item) => item.trim())
        .filter(Boolean)
    : [];
}

function isOpenOnlinePreview(
  record: RawGlobalMeetingRecord,
  conferenceUrl: string,
  types: string[],
): boolean {
  const text = getSearchText(record);
  return (
    types.includes("O") &&
    !types.some((type) => CLOSED_TYPE_CODES.has(type) || SPECIALTY_TYPE_CODES.has(type)) &&
    isZoomUrl(conferenceUrl) &&
    !ACCESS_GATE_PATTERNS.some((pattern) => pattern.test(text)) &&
    !NON_WORKING_CONFERENCE_PATTERNS.some((pattern) => pattern.test(text)) &&
    !SPECIALTY_ACCESS_PATTERNS.some((pattern) => pattern.test(text))
  );
}

function getRegion(record: RawGlobalMeetingRecord): string {
  const regions = Array.isArray(record.regions) ? record.regions : [];
  const region = regions.find(
    (value) => typeof value === "string" && value && value !== "-Online Only",
  );
  return cleanText(
    region || record.formatted_address || record.region || record.location,
    "Online",
  );
}

export function sanitizeGlobalMeetingRecord(value: unknown): SanitizedGlobalMeeting | null {
  if (!isObject(value)) return null;
  const conferenceUrl = safeHttpUrl(value.conference_url);
  const dayIndex = Number(value.day);
  const time = cleanText(value.time);
  const types = sanitizeTypes(value.types);
  if (
    !conferenceUrl ||
    !Number.isInteger(dayIndex) ||
    dayIndex < 0 ||
    dayIndex > 6 ||
    !parseClockTime(time)
  )
    return null;
  if (!isOpenOnlinePreview(value, conferenceUrl, types)) return null;
  const name = cleanText(value.name, "Recovery Dharma online meeting").slice(0, 180);
  return {
    id: cleanText(value.id || value.slug || name).slice(0, 180),
    name,
    dayIndex: dayIndex as DayIndex,
    time,
    endTime: cleanText(value.end_time),
    timeZone: safeTimeZone(value.timezone, "UTC"),
    region: getRegion(value).slice(0, 140),
    conferenceUrl,
    sourceUrl: safeHttpUrl(value.url) || GLOBAL_MEETINGS_URL,
  };
}

export function extractMeetingsFromPayload(payload: unknown): unknown[] {
  if (Array.isArray(payload)) return payload;
  if (!isObject(payload)) return [];
  if (Array.isArray(payload.meetings)) return payload.meetings;
  if (Array.isArray(payload.data)) return payload.data;
  return isObject(payload.data) && Array.isArray(payload.data.meetings)
    ? payload.data.meetings
    : [];
}

function isSanitizedGlobalMeeting(value: unknown): value is SanitizedGlobalMeeting {
  if (!isObject(value)) return false;
  return (
    typeof value.id === "string" &&
    typeof value.name === "string" &&
    Number.isInteger(value.dayIndex) &&
    Number(value.dayIndex) >= 0 &&
    Number(value.dayIndex) <= 6 &&
    Boolean(parseClockTime(value.time)) &&
    Boolean(safeHttpUrl(value.conferenceUrl)) &&
    Boolean(safeHttpUrl(value.sourceUrl)) &&
    typeof value.timeZone === "string" &&
    typeof value.region === "string"
  );
}

export function isGlobalMeetingCacheEntry(value: unknown): value is GlobalMeetingCacheEntry {
  return (
    isObject(value) &&
    typeof value.cachedAt === "number" &&
    Number.isFinite(value.cachedAt) &&
    Array.isArray(value.meetings) &&
    value.meetings.every(isSanitizedGlobalMeeting)
  );
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
  if (!start) return null;
  const zone = safeTimeZone(meeting.timeZone);
  const today = getZonedDateTimeParts(now, zone);
  for (let offset = 0; offset <= 14; offset += 1) {
    const date = addDaysToPlainDate(today, offset);
    if (date.weekday !== meeting.dayIndex) continue;
    const startsAt = zonedTimeToUtc({ ...date, hour: start.hour, minute: start.minute }, zone);
    const endsAt = getEndDate(startsAt, date, meeting.endTime, zone);
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
  if (!meeting.enabled) return null;
  return (
    meeting.occurrences
      .map((occurrence) => {
        const date = parsePlainDate(occurrence.date);
        const start = parseClockTime(occurrence.startTime);
        if (!date || !start) return null;
        const zone = safeTimeZone(occurrence.timeZone);
        const startsAt = zonedTimeToUtc({ ...date, hour: start.hour, minute: start.minute }, zone);
        const endsAt = getEndDate(startsAt, date, occurrence.endTime, zone);
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
): LocalMeetingCardItem[] {
  const cards: LocalMeetingCardItem[] = [];
  for (const meeting of meetings) {
    const occurrence = getRecurringOccurrence(meeting, now);
    if (!occurrence) continue;
    cards.push({
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
    cards.push({
      id: "temporary-" + temporary.occurrence.date,
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
  return cards.sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime());
}

export function getNearestLocalMeeting(
  meetings: readonly LocalMeetingCardItem[],
): LocalMeetingCardItem | null {
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
): GlobalMeetingCardItem[] {
  const soon = meetings.filter((meeting) => meeting.minutesUntilStart <= 60);
  const nextDay = meetings.filter(
    (meeting) => meeting.minutesUntilStart > 60 && meeting.minutesUntilStart <= 24 * 60,
  );
  const remaining = meetings.filter((meeting) => meeting.minutesUntilStart > 24 * 60);
  return [...soon, ...nextDay, ...remaining].slice(0, 6);
}

export function formatListedLocalTime(meeting: GlobalMeetingOccurrence): string {
  const zone = safeTimeZone(meeting.timeZone, "UTC");
  const name = getTimeZoneShortName(meeting.startsAt, zone);
  return "Listed locally: " + formatClockInZone(meeting.startsAt, zone) + (name ? " " + name : "");
}
