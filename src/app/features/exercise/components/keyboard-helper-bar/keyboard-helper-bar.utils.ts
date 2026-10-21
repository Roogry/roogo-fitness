import {
  HEAVY_REPS_CHIPS,
  HEAVY_REPS_WEIGHT_KG,
  LIGHT_REPS_CHIPS,
} from './keyboard-helper-bar.constants';

export function adjustWeight(current: string, target: number | undefined, delta: number): number {
  const parsed = current === '' ? NaN : parseFloat(current);
  const base = isNaN(parsed) ? (target ?? 0) : parsed;
  return Math.max(0, Math.round((base + delta) * 1000) / 1000);
}

export function repsChips(weight: number | undefined): number[] {
  return (weight ?? 0) > HEAVY_REPS_WEIGHT_KG ? [...HEAVY_REPS_CHIPS] : [...LIGHT_REPS_CHIPS];
}
