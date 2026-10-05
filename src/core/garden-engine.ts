import type { Emotion, EmotionEntry, GardenSnapshot, GrowthStage, Plant } from './models';
import { EMOTION_META, EMOTIONS } from './models';
import { localToday, toLocalDateString } from './local-date';

export function stageFor(streak: number): GrowthStage { if (streak >= 14) return '结果'; if (streak >= 7) return '开花'; if (streak >= 3) return '发芽'; return '种子'; }
export function streakFor(entries: EmotionEntry[], emotion: Emotion): number {
  const dates = new Set(entries.filter((item) => item.emotion === emotion).map((item) => item.date));
  const cursor = new Date(); cursor.setHours(0, 0, 0, 0);
  if (!dates.has(toLocalDateString(cursor))) cursor.setDate(cursor.getDate() - 1); // 今天还没记录时从昨天往回数，连续不中断
  let streak = 0;
  while (dates.has(toLocalDateString(cursor))) { streak += 1; cursor.setDate(cursor.getDate() - 1); }
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
export function createEntry(emotion: Emotion, note: string, intensity: number, date = localToday()): EmotionEntry { return { id: `emotion-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, date, emotion, note: note.trim() || EMOTION_META[emotion].hint, intensity: Math.min(5, Math.max(1, Number(intensity) || 3)) }; }
export function annualReport(entries: EmotionEntry[]) {
  const counts = EMOTIONS.map((emotion) => ({ emotion, count: entries.filter((item) => item.emotion === emotion).length })).sort((a, b) => b.count - a.count);
  const active = new Set(entries.map((item) => item.date)).size;
  const intensity = entries.length ? entries.reduce((sum, item) => sum + item.intensity, 0) / entries.length : 0;
  return { top: counts[0], counts, active, lushness: Math.min(100, Math.round((active / 90) * 70 + (intensity / 5) * 30)), intensity: Math.round(intensity * 10) / 10 };
}
export function sampleSnapshot(): GardenSnapshot {
  const today = new Date(); today.setHours(0, 0, 0, 0); const entries: EmotionEntry[] = [];
  const seed: Emotion[] = ['喜悦', '喜悦', '平静', '平静', '平静', '平静', '喜悦', '忧伤', '焦虑', '平静', '喜悦'];
  seed.forEach((emotion, index) => { const day = new Date(today); day.setDate(today.getDate() - (seed.length - index - 1)); entries.push(createEntry(emotion, index % 2 ? '今天注意到了自己的节奏。' : '给这一天留下一颗种子。', (index % 5) + 1, toLocalDateString(day))); });
  return { entries, plants: syncPlants(entries) };
}
