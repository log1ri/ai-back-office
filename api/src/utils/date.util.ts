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




