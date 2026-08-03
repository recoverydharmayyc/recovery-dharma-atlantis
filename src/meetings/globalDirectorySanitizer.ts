import { GLOBAL_DIRECTORY_SOURCE } from "../config/externalSources";
import { safeHttpUrl } from "../utils/url";
import { parseClockTime, safeTimeZone, type DayIndex } from "./meetingTime";

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

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function cleanText(value: unknown, fallback = ""): string {
  if (value === null || value === undefined) return fallback;
  const text = String(value)
    .replace(/<[^>]*>/g, " ")
    .split("")
    .map((character) => {
      const code = character.charCodeAt(0);
      return code < 32 || code === 127 ? " " : character;
    })
    .join("")
    .replace(/\s+/g, " ")
    .trim();
  return text || fallback;
}

export function flattenText(value: unknown): string {
  if (Array.isArray(value)) return value.slice(0, 40).map(flattenText).join(" ");
  if (isObject(value)) return Object.values(value).slice(0, 40).map(flattenText).join(" ");
  return cleanText(value);
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
    .join(" ")
    .slice(0, 8_000);
}

function sanitizeTypes(value: unknown): string[] {
  return Array.isArray(value)
    ? value
        .slice(0, 40)
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
  const regions = Array.isArray(record.regions) ? record.regions.slice(0, 40) : [];
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
  const endTimeCandidate = cleanText(value.end_time);
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
  const id = cleanText(value.id || value.slug || name).slice(0, 180);
  if (!id || !name) return null;
  return {
    id,
    name,
    dayIndex: dayIndex as DayIndex,
    time,
    endTime: parseClockTime(endTimeCandidate) ? endTimeCandidate : "",
    timeZone: safeTimeZone(value.timezone, "UTC"),
    region: getRegion(value).slice(0, 140),
    conferenceUrl,
    sourceUrl: safeHttpUrl(value.url) || GLOBAL_DIRECTORY_SOURCE.directoryUrl,
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

export function isSanitizedGlobalMeeting(value: unknown): value is SanitizedGlobalMeeting {
  if (!isObject(value)) return false;
  return (
    typeof value.id === "string" &&
    value.id.length > 0 &&
    value.id.length <= 180 &&
    typeof value.name === "string" &&
    value.name.length > 0 &&
    value.name.length <= 180 &&
    Number.isInteger(value.dayIndex) &&
    Number(value.dayIndex) >= 0 &&
    Number(value.dayIndex) <= 6 &&
    Boolean(parseClockTime(value.time)) &&
    (value.endTime === "" || Boolean(parseClockTime(value.endTime))) &&
    Boolean(safeHttpUrl(value.conferenceUrl)) &&
    Boolean(safeHttpUrl(value.sourceUrl)) &&
    typeof value.timeZone === "string" &&
    safeTimeZone(value.timeZone, "") === value.timeZone &&
    typeof value.region === "string" &&
    value.region.length <= 140
  );
}

export function sanitizeGlobalMeetingPayload(payload: unknown): SanitizedGlobalMeeting[] {
  const seen = new Set<string>();
  const sanitized: SanitizedGlobalMeeting[] = [];
  for (const value of extractMeetingsFromPayload(payload).slice(
    0,
    GLOBAL_DIRECTORY_SOURCE.maxResponseRecords,
  )) {
    const meeting = sanitizeGlobalMeetingRecord(value);
    if (!meeting) continue;
    const key = `${meeting.id}|${meeting.dayIndex}|${meeting.time}`;
    if (seen.has(key)) continue;
    seen.add(key);
    sanitized.push(meeting);
    if (sanitized.length >= GLOBAL_DIRECTORY_SOURCE.maxCachedRecords) break;
  }
  return sanitized;
}
