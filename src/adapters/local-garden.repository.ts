import type { GardenRepository } from '../ports/garden-repository.port';
import type { GardenSnapshot } from '../core/models';
import { LOCAL_DATE_MODE, migrateSnapshot, sampleSnapshot } from '../core/garden-engine';
const KEY = 'c2c-002-emotion-garden';
export class LocalGardenRepository implements GardenRepository {
  load(): GardenSnapshot {
    try {
      const value = localStorage.getItem(KEY);
      if (value) {
        const stored = JSON.parse(value) as GardenSnapshot;
        if (stored.dateMode === LOCAL_DATE_MODE) return stored;
        // 旧口径（UTC 日期）数据：迁移为本地日期口径并写回，连续天数按正确日期重算
        const migrated = migrateSnapshot(stored);
        this.save(migrated);
        return migrated;
      }
    } catch { /* use seed */ }
    return sampleSnapshot();
  }
  save(snapshot: GardenSnapshot) { localStorage.setItem(KEY, JSON.stringify({ ...snapshot, dateMode: LOCAL_DATE_MODE })); }
}
