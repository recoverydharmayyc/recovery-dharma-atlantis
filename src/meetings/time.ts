// Pure time-zone helpers for the editable Atlantis meeting configuration.
export const ATLANTIS_TIME_ZONE = "Etc/GMT+3";
export const MINUTE_MS = 60 * 1000;
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
  const parts = String(value || "")
    .split("-")
    .map(Number);
  if (parts.length !== 3 || parts.some((part) => !Number.isInteger(part))) return null;
  const [year, month, day] = parts;
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  return { year, month, day };
}

export function safeTimeZone(value: unknown, fallback = ATLANTIS_TIME_ZONE): string {
  const timeZone = typeof value === "string" && value.trim() ? value.trim() : fallback;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone }).format(new Date());
    return timeZone;
  } catch {
    return fallback;
  }
}

export function getZonedDateTimeParts(date: Date, timeZone: string): ZonedDateParts {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: safeTimeZone(timeZone),
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
  return new Intl.DateTimeFormat("en-US", {
    timeZone: safeTimeZone(timeZone),
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function getTimeZoneShortName(date: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: safeTimeZone(timeZone),
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
  return new Intl.DateTimeFormat("en-US", {
    timeZone: safeTimeZone(timeZone),
    weekday: "short",
  }).format(date);
}
