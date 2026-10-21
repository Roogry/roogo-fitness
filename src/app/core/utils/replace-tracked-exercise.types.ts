/**
 * Targets copied from a routine onto the replacement.
 * Reading these must not write the routine back.
 */
export interface ReplacementTargets {
  target_sets?: number;
  target_weight?: number;
  target_reps?: number;
  target_rest_time?: number;
}
