import type { SimpleDate } from './date.ts';

interface DateRangeLike {
  startDate: SimpleDate;
  endDate?: SimpleDate;
}

export const formatDate = (d: SimpleDate) => (d.month ? `${d.year}/${d.month.toString().padStart(2, '0')}` : `${d.year}`);
export const formatDateRange = (r: DateRangeLike) => (r.endDate ? `${formatDate(r.startDate)} — ${formatDate(r.endDate)}` : `${formatDate(r.startDate)} — now`);
