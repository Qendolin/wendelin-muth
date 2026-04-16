import type { SimpleDate } from './date.ts';

interface DateRangeLike {
  startDate: SimpleDate;
  endDate?: SimpleDate;
}

const nbsp = '\u00A0';

export const formatDate = (d: SimpleDate) => (d.month ? `${d.year}/${d.month.toString().padStart(2, '0')}` : `${d.year}`);
export const formatDateRange = (r: DateRangeLike) =>
  r.endDate ? `${formatDate(r.startDate)}${nbsp}— ${formatDate(r.endDate)}` : `${formatDate(r.startDate)}${nbsp}— now`;
