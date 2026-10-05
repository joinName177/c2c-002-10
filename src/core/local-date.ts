/**
 * 本地日期工具：记录生成、连续天数计算、页面日期展示统一使用本地时区的
 * YYYY-MM-DD 口径，不再混用 UTC 日期（toISOString）。
 */

/** 把 Date 格式化为本地日期字符串 YYYY-MM-DD。 */
export function toLocalDateString(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** 今天的本地日期字符串。 */
export function localToday(): string {
  return toLocalDateString(new Date());
}

/** 把 YYYY-MM-DD 解析为本地零点，供页面展示与日期运算使用。 */
export function parseLocalDate(date: string): Date {
  const [year, month, day] = date.split('-').map(Number);
  return new Date(year || 1970, (month || 1) - 1, day || 1);
}
