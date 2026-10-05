import type { Emotion, EmotionEntry, GardenSnapshot, GrowthStage, Plant } from './models';
import { EMOTION_META, EMOTIONS } from './models';
import { localDateKey, parseLocalDate, todayKey } from './local-date';

const day = 86400000;
export const LOCAL_DATE_MODE = 'local-date';
export function stageFor(streak: number): GrowthStage { if (streak >= 14) return '结果'; if (streak >= 7) return '开花'; if (streak >= 3) return '发芽'; return '种子'; }
export function streakFor(entries: EmotionEntry[], emotion: Emotion): number {
  const dates = new Set(entries.filter((item) => item.emotion === emotion).map((item) => item.date));
  let streak = 0; const cursor = parseLocalDate(todayKey());
  while (dates.has(localDateKey(cursor))) { streak += 1; cursor.setDate(cursor.getDate() - 1); }
  if (!streak) {
    const sortedDates = [...dates].sort(); const latest = sortedDates[sortedDates.length - 1]; if (!latest) return 0;
    const distance = Math.round((parseLocalDate(todayKey()).getTime() - parseLocalDate(latest).getTime()) / day);
    if (distance > 1) return 0;
    streak = 1;
  }
  return streak;
}
export function syncPlants(entries: EmotionEntry[], previous: Plant[] = []): Plant[] {
  return EMOTIONS.filter((emotion) => entries.some((item) => item.emotion === emotion)).map((emotion) => {
    const own = entries.filter((item) => item.emotion === emotion).sort((a, b) => a.date.localeCompare(b.date));
    const existing = previous.find((item) => item.emotion === emotion);
    const streak = streakFor(entries, emotion);
    return { id: existing?.id ?? `plant-${emotion}`, emotion, plantedAt: own[0].date, lastWatered: own[own.length - 1].date, streak, stage: stageFor(streak), status: streak ? '繁茂' : '枯萎', entryIds: own.map((item) => item.id) };
  });
}
export function createEntry(emotion: Emotion, note: string, intensity: number, date = todayKey()): EmotionEntry { return { id: `emotion-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, date, emotion, note: note.trim() || EMOTION_META[emotion].hint, intensity: Math.min(5, Math.max(1, Number(intensity) || 3)) }; }
export function migrateSnapshot(stored: GardenSnapshot): GardenSnapshot {
  const entries = Array.isArray(stored.entries) ? stored.entries : [];
  // 旧数据按 UTC 口径存日期：日期字符串保持兼容读取，连续天数等派生数据按本地口径重算
  return { entries, plants: syncPlants(entries, Array.isArray(stored.plants) ? stored.plants : []), dateMode: LOCAL_DATE_MODE };
}
export function annualReport(entries: EmotionEntry[]) {
  const counts = EMOTIONS.map((emotion) => ({ emotion, count: entries.filter((item) => item.emotion === emotion).length })).sort((a, b) => b.count - a.count);
  const active = new Set(entries.map((item) => item.date)).size;
  const intensity = entries.length ? entries.reduce((sum, item) => sum + item.intensity, 0) / entries.length : 0;
  return { top: counts[0], counts, active, lushness: Math.min(100, Math.round((active / 90) * 70 + (intensity / 5) * 30)), intensity: Math.round(intensity * 10) / 10 };
}
export function sampleSnapshot(): GardenSnapshot {
  const today = new Date(); const entries: EmotionEntry[] = [];
  const seed: Emotion[] = ['喜悦', '喜悦', '平静', '平静', '平静', '平静', '喜悦', '忧伤', '焦虑', '平静', '喜悦'];
  seed.forEach((emotion, index) => { const moment = new Date(today); moment.setDate(moment.getDate() - (seed.length - index - 1)); entries.push(createEntry(emotion, index % 2 ? '今天注意到了自己的节奏。' : '给这一天留下一颗种子。', (index % 5) + 1, localDateKey(moment))); });
  return { entries, plants: syncPlants(entries), dateMode: LOCAL_DATE_MODE };
}
