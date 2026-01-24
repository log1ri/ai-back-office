export function formatDate(date: Date, format = 'YYYY-MM-DD'): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  if (format === 'YYYY-MM-DD') return `${yyyy}-${mm}-${dd}`;
  if (format === 'DD/MM/YYYY') return `${dd}/${mm}/${yyyy}`;
  return date.toISOString();
}

export function toDate(input: string | Date): Date {
  return input instanceof Date ? input : new Date(input);
}

// use
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

// use
export function subtractDays(date: Date, days: number): Date {
  return addDays(date, -days);
}

// use
export function shiftMonthSafeUTC(date: Date, deltaMonths: number): Date {
  const y = date.getUTCFullYear();
  const m = date.getUTCMonth();
  const d = date.getUTCDate();

  const lastDay = new Date(Date.UTC(y, m + deltaMonths + 1, 0)).getUTCDate();
  const safeDay = Math.min(d, lastDay);

  return new Date(Date.UTC(
    y, m + deltaMonths, safeDay,
    date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds(), date.getUTCMilliseconds()
  ));
}

// use
export function normalizeStartOfDayUTC(date: Date): Date {
  return new Date(Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(), 
    0, 0, 0, 0 
  ));
}

// use
export function endOfDayUTC(date: Date): Date {
  return new Date(Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    23, 59, 59, 999
  ));
}

// use start of month UTC
export function getStartOfMonthUTC(date: Date): Date {
    return new Date(Date.UTC(date.getFullYear(), date.getMonth(), 1, 0, 0, 0));
}

// use end of month UTC  
export function getEndOfMonthUTC(date: Date): Date {
    return new Date(Date.UTC(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59));
}

// use alidate date range
export function validateDateRange(startDate: Date, endDate: Date): boolean {
    return startDate.getTime() < endDate.getTime();
}

// use query date range
export function createDateRangeQuery(startDate: Date, endDate: Date) {
    return { $gte: startDate, $lte: endDate };
}

// ===== UTC+7 Today Range =====

const BANGKOK_OFFSET_MS = 7 * 60 * 60 * 1000; // 7 * 60 min * 60 sec * 1000 ms

export function getTodayRangeUTC7(now = new Date()) {
  // UTC+7
  const bangkokNow = new Date(now.getTime() + BANGKOK_OFFSET_MS);

  const y = bangkokNow.getUTCFullYear();
  const m = bangkokNow.getUTCMonth();
  const d = bangkokNow.getUTCDate();

  // 00:00 - 23:59:59.999 (UTC+7) in UTC
  const startUtc = new Date(Date.UTC(y, m, d, 0, 0, 0, 0) - BANGKOK_OFFSET_MS);
  const endUtc   = new Date(Date.UTC(y, m, d, 23, 59, 59, 999) - BANGKOK_OFFSET_MS);

  return { startUtc, endUtc };
}

export function getLastNDaysRangeUTC7(days: number, now = new Date()) {
  if (days <= 0) throw new Error('days must be > 0');

  // UTC+7
  const bangkokNow = new Date(now.getTime() + BANGKOK_OFFSET_MS);

  // end UTC = 16:59:59.99 (23:59:59.999 (Thai))
  const endUtc = new Date(bangkokNow);
  endUtc.setHours(23, 59, 59, 999);


  // start UTC = (days-1) 17:00:00.00 (00:00:00.000 (Thai))
  const startUtc = new Date(bangkokNow);
  startUtc.setHours(0, 0, 0, 0);
  startUtc.setDate(startUtc.getDate() - (days - 1));

  return { startUtc, endUtc };
}



