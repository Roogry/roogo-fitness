import { DEFAULT_MUSCLE_ICON } from '@/shared/constants/muscle.constants';
import { Muscle } from '@/shared/models';

/** Icon path for a muscle tile. Empty and missing paths use the shared placeholder. */
export function muscleIconUrl(muscle: Pick<Muscle, 'icon_url'> | null | undefined): string {
  const iconUrl = muscle?.icon_url?.trim();
  if (!iconUrl) return DEFAULT_MUSCLE_ICON;
  return iconUrl;
}

/**
 * Copy of the list in body-region order.
 * A muscle with no display_order sorts by its id, then id breaks ties.
 */
export function sortMuscles(muscles: readonly Muscle[]): Muscle[] {
  return [...muscles].sort((left, right) => {
    const orderDifference = muscleSortKey(left) - muscleSortKey(right);
    if (orderDifference !== 0) return orderDifference;
    return left.id - right.id;
  });
}

function muscleSortKey(muscle: Muscle): number {
  const displayOrder = muscle.display_order;
  if (typeof displayOrder === 'number' && Number.isFinite(displayOrder)) return displayOrder;
  return muscle.id;
}
