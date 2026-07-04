import { randInt, clamp } from '../prng.js';

// Unlike the other sources, this one is *live*: it blends a small seeded
// baseline (simulates other users' behavior) with this browser's own
// saves/completion/predictions pulled from the local store.
export function getUserBehaviorSignal(seed, rng, liveStats = {}) {
  const baselineActivity = randInt(rng, 5, 35);
  const { saved = false, completionRate = 0, predictions = 0 } = liveStats;

  const subScore = clamp(
    baselineActivity + (saved ? 30 : 0) + completionRate * 25 + Math.min(predictions, 3) * 5,
    0,
    100
  );

  return {
    source: 'userBehavior',
    subScore: Math.round(subScore),
    stats: { baselineActivity, saved, completionRate, predictions },
  };
}
