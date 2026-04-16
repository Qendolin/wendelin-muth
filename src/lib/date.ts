export interface SimpleDate {
  year: number;
  month: number | undefined;
  day: number | undefined;
}

export function SimpleDate(year: number, month?: number, day?: number): SimpleDate {
  return { year, month, day };
}

export function toJsDate(date: SimpleDate): Date {
  return new Date(date.year, date.month ? date.month - 1 : 0, date.day ?? 1);
}
