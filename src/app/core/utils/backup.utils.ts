import { BackupFile } from '@/shared/models';
import { BACKUP_VERSION_V1, BACKUP_VERSION_V2 } from './backup.constants';

function isRecord(data: unknown): data is Record<string, unknown> {
  return typeof data === 'object' && data !== null;
}

/** True for a version 1 or version 2 backup with the four stored collections. */
export function isBackupFile(data: unknown): data is BackupFile {
  if (!isRecord(data)) return false;

  const version = data['version'];
  if (version !== BACKUP_VERSION_V1 && version !== BACKUP_VERSION_V2) return false;
  if (!Array.isArray(data['workout_plans']) || !Array.isArray(data['logged_sessions']))
    return false;
  if (!Array.isArray(data['exercises']) || !Array.isArray(data['muscles'])) return false;

  const seedVersion = data['seed_version'];
  if (seedVersion !== undefined && typeof seedVersion !== 'number') return false;

  return true;
}
