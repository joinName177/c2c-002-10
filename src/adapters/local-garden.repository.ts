import type { GardenRepository } from '../ports/garden-repository.port';
import type { GardenSnapshot } from '../core/models';
import { sampleSnapshot, syncPlants } from '../core/garden-engine';

const KEY = 'c2c-002-emotion-garden';
// 日期口径标记：旧数据没有该字段，日期按 UTC 口径（toISOString）存下
const DATE_CALIBER = 'local';

interface StoredSnapshot extends GardenSnapshot { dateCaliber?: string; }

export class LocalGardenRepository implements GardenRepository {
  load(): GardenSnapshot {
    try {
      const value = localStorage.getItem(KEY);
      if (value) {
        const stored = JSON.parse(value) as StoredSnapshot;
        const entries = stored.entries ?? [];
        // 旧口径数据兼容读取：日期字符串本身仍是合法的 YYYY-MM-DD，直接保留；
        // 连续天数与生长阶段是派生数据，按本地日期口径重新计算（每次加载都重算，跨天断签也能及时反映）
        const snapshot: GardenSnapshot = { entries, plants: syncPlants(entries, stored.plants ?? []) };
        if (stored.dateCaliber !== DATE_CALIBER) this.save(snapshot); // 迁移后立即按新口径落盘
        return snapshot;
      }
    } catch { /* use seed */ }
    return sampleSnapshot();
  }
  save(snapshot: GardenSnapshot) { localStorage.setItem(KEY, JSON.stringify({ ...snapshot, dateCaliber: DATE_CALIBER } satisfies StoredSnapshot)); }
}
