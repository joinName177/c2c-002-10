/**
 * 本地日期口径工具。
 * 记录生成、连续天数计算、页面日期展示统一使用这一套本地日期（YYYY-MM-DD），
 * 禁止使用 toISOString()（UTC 口径），避免非零时区下日期错位。
 */

const pad = (value: number) => String(value).padStart(2, '0');

/** 把时刻格式化为本地日期键 YYYY-MM-DD（默认取当前时刻） */
export function localDateKey(date: Date = new Date()): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** 今天的本地日期键 */
export function todayKey(): string {
  return localDateKey(new Date());
}

/** 把 YYYY-MM-DD 日期键按本地时区解析为当天零点 */
export function parseLocalDate(key: string): Date {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year || 1970, (month || 1) - 1, day || 1);
}
