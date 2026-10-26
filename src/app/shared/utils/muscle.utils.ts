import { DEFAULT_MUSCLE_ICON } from '@/shared/constants/muscle.constants';
import { Muscle } from '@/shared/models';

/** Icon path for a muscle tile. Empty and missing paths use the shared placeholder. */
export function muscleIconUrl(muscle: Pick<Muscle, 'icon_url'> | null | undefined): string {
  const iconUrl = muscle?.icon_url?.trim();
  if (!iconUrl) return DEFAULT_MUSCLE_ICON;
  return iconUrl;
}
