export const ATLANTIS_TIME_ZONE = "Etc/GMT+3";
export const MINUTE_MS = 60 * 1_000;
export const HOUR_MS = 60 * MINUTE_MS;
export const DAY_MS = 24 * HOUR_MS;

export type DayIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export const DAY_INDEX_TO_NAME = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;
export type ClockTime = { hour: number; minute: number };
export type PlainDate = { year: number; month: number; day: number };
export type ZonedDateParts = PlainDate & ClockTime & { weekday: DayIndex; second: number };

const timeZoneValidity = new Map<string, boolean>();
const dateTimeFormatters = new Map<string, Intl.DateTimeFormat>();

function cachedFormatter(
  key: string,
  locale: string,
  options: Intl.DateTimeFormatOptions,
): Intl.DateTimeFormat {
  const existing = dateTimeFormatters.get(key);
  if (existing) return existing;
  const formatter = new Intl.DateTimeFormat(locale, options);
  dateTimeFormatters.set(key, formatter);
  return formatter;
}

export function parseClockTime(value: unknown): ClockTime | null {
  if (typeof value !== "string") return null;
  const twentyFour = value.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (twentyFour) {
    const hour = Number(twentyFour[1]);
    const minute = Number(twentyFour[2]);
    return hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59 ? { hour, minute } : null;
  }
  const twelveHour = value.trim().match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)$/i);
  if (!twelveHour) return null;
  let hour = Number(twelveHour[1]);
  const minute = Number(twelveHour[2] || "0");
  if (hour < 1 || hour > 12 || minute < 0 || minute > 59) return null;
  if (twelveHour[3].toUpperCase() === "AM" && hour === 12) hour = 0;
  if (twelveHour[3].toUpperCase() === "PM" && hour !== 12) hour += 12;
  return { hour, minute };
}

export function parsePlainDate(value: unknown): PlainDate | null {
  if (typeof value !== "string") return null;
  const match = value.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const candidate = new Date(Date.UTC(year, month - 1, day, 12));
  if (
    candidate.getUTCFullYear() !== year ||
    candidate.getUTCMonth() + 1 !== month ||
    candidate.getUTCDate() !== day
  )
    return null;
  return { year, month, day };
}

export function isValidTimeZone(value: unknown): value is string {
  if (typeof value !== "string" || !value.trim()) return false;
  const timeZone = value.trim();
  const known = timeZoneValidity.get(timeZone);
  if (known !== undefined) return known;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone }).format(new Date());
    timeZoneValidity.set(timeZone, true);
    return true;
  } catch {
    timeZoneValidity.set(timeZone, false);
    return false;
  }
}

export function safeTimeZone(value: unknown, fallback = ATLANTIS_TIME_ZONE): string {
  return isValidTimeZone(value) ? value.trim() : fallback;
}

export function clockMinutes(value: unknown): number | null {
  const parsed = parseClockTime(value);
  return parsed ? parsed.hour * 60 + parsed.minute : null;
}

export function isForwardClockRange(startTime: unknown, endTime: unknown): boolean {
  const start = clockMinutes(startTime);
  const end = clockMinutes(endTime);
  return start !== null && end !== null && end > start;
}

export function getZonedDateTimeParts(date: Date, timeZone: string): ZonedDateParts {
  const zone = safeTimeZone(timeZone);
  const parts = cachedFormatter(`zoned-parts|${zone}`, "en-CA", {
    timeZone: zone,
    calendar: "gregory",
    numberingSystem: "latn",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value])) as Record<
    string,
    string
  >;
  const year = Number(values.year);
  const month = Number(values.month);
  const day = Number(values.day);
  const hour = Number(values.hour);
  return {
    year,
    month,
    day,
    hour: hour === 24 ? 0 : hour,
    minute: Number(values.minute),
    second: Number(values.second),
    weekday: new Date(Date.UTC(year, month - 1, day, 12)).getUTCDay() as DayIndex,
  };
}

export function addDaysToPlainDate(
  date: PlainDate,
  days: number,
): PlainDate & { weekday: DayIndex } {
  const next = new Date(Date.UTC(date.year, date.month - 1, date.day + days, 12));
  return {
    year: next.getUTCFullYear(),
    month: next.getUTCMonth() + 1,
    day: next.getUTCDate(),
    weekday: next.getUTCDay() as DayIndex,
  };
}

export function zonedTimeToUtc(parts: PlainDate & ClockTime, timeZone: string): Date {
  const target = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, 0);
  let guess = target;
  for (let index = 0; index < 4; index += 1) {
    const zoned = getZonedDateTimeParts(new Date(guess), timeZone);
    const asUtc = Date.UTC(
      zoned.year,
      zoned.month - 1,
      zoned.day,
      zoned.hour,
      zoned.minute,
      zoned.second,
    );
    const difference = target - asUtc;
    if (difference === 0) break;
    guess += difference;
  }
  return new Date(guess);
}

export function formatClockInZone(date: Date, timeZone: string): string {
  const zone = safeTimeZone(timeZone);
  return cachedFormatter(`clock|${zone}`, "en-US", {
    timeZone: zone,
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function getTimeZoneShortName(date: Date, timeZone: string): string {
  const zone = safeTimeZone(timeZone);
  const parts = cachedFormatter(`zone-name|${zone}`, "en-US", {
    timeZone: zone,
    hour: "numeric",
    timeZoneName: "short",
  }).formatToParts(date);
  return parts.find((part) => part.type === "timeZoneName")?.value || "";
}

export function getPlainDateKey(date: Date, timeZone = ATLANTIS_TIME_ZONE): string {
  const parts = getZonedDateTimeParts(date, timeZone);
  return (
    String(parts.year) +
    "-" +
    String(parts.month).padStart(2, "0") +
    "-" +
    String(parts.day).padStart(2, "0")
  );
}

export function formatRelativeDay(date: Date, now: Date, timeZone = ATLANTIS_TIME_ZONE): string {
  const target = getPlainDateKey(date, timeZone);
  const current = getPlainDateKey(now, timeZone);
  if (target === current) return "Today";
  const tomorrow = addDaysToPlainDate(getZonedDateTimeParts(now, timeZone), 1);
  const tomorrowKey =
    String(tomorrow.year) +
    "-" +
    String(tomorrow.month).padStart(2, "0") +
    "-" +
    String(tomorrow.day).padStart(2, "0");
  if (target === tomorrowKey) return "Tomorrow";
  const zone = safeTimeZone(timeZone);
  return cachedFormatter(`weekday|${zone}`, "en-US", {
    timeZone: zone,
    weekday: "short",
  }).format(date);
}
