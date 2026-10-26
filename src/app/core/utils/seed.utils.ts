/**
 * True when the stored seed is missing, not a whole number, or not this build's version.
 * A missing key is an install from before seed versions existed, so it reseeds once.
 */
export function shouldReseed(storedVersion: string | null, currentVersion: number): boolean {
  if (storedVersion === null) return true;
  if (!/^\d+$/.test(storedVersion)) return true;
  return Number(storedVersion) !== currentVersion;
}
