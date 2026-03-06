/**
 * Helpers for user-timezone-aware slot logic.
 * Uses IANA timezone (e.g. "America/New_York") so DST is handled correctly.
 */

/**
 * Get the current date (YYYY-MM-DD) and minutes since midnight in the given timezone.
 */
export function getNowInTimezone(timeZone: string): {
  dateStr: string;
  minutesSinceMidnight: number;
} {
  const now = new Date();
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(now);

  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "0";
  const year = get("year");
  const month = get("month");
  const day = get("day");
  const hour = parseInt(get("hour"), 10);
  const minute = parseInt(get("minute"), 10);

  return {
    dateStr: `${year}-${month}-${day}`,
    minutesSinceMidnight: hour * 60 + minute,
  };
}

/**
 * Get the offset in minutes to add to local time (in the given timezone) to get UTC.
 * Uses noon UTC on the given date for DST correctness.
 */
function getOffsetMinutesUtcForDate(dateStr: string, timeZone: string): number {
  const [y, m, d] = dateStr.split("-").map(Number);
  const noonUtc = new Date(Date.UTC(y, m - 1, d, 12, 0));

  const localParts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(noonUtc);

  const localHour = parseInt(
    localParts.find((p) => p.type === "hour")?.value ?? "0",
    10
  );
  const localMin = parseInt(
    localParts.find((p) => p.type === "minute")?.value ?? "0",
    10
  );
  const localMinutes = localHour * 60 + localMin;
  const utcMinutes = 12 * 60; // noon
  return utcMinutes - localMinutes;
}

/**
 * Convert a slot (date + time in user's timezone) to a UTC Date for comparison with DB timestamps.
 */
export function slotInTimezoneToUtc(
  dateStr: string,
  timeStr: string,
  timeZone: string
): Date {
  const [hour, min] = timeStr.split(":").map(Number);
  const [y, m, d] = dateStr.split("-").map(Number);
  const offsetMinutes = getOffsetMinutesUtcForDate(dateStr, timeZone);
  const utcMs =
    Date.UTC(y, m - 1, d, hour, min) + offsetMinutes * 60 * 1000;
  return new Date(utcMs);
}

/**
 * Parse "HH:mm" to minutes since midnight.
 */
export function timeStrToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}
