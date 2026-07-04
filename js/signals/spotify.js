import { randRange, randInt, clamp } from '../prng.js';
import { archetypeBase } from './archetypes.js';

// Normalizes listener growth % onto a 0-100 curve, capping out around +500%.
function normalizeGrowth(growthPct) {
  return clamp((growthPct / 500) * 100, 0, 100);
}

export function getSpotifySignal(seed, rng) {
  const base = archetypeBase(seed.archetype);
  const monthlyListeners = randInt(rng, base.listeners[0], base.listeners[1]);
  const listenerGrowthPct = Math.round(randRange(rng, base.listenerGrowthPct[0], base.listenerGrowthPct[1]));
  const playlistAdds = randInt(rng, Math.round(monthlyListeners * 0.004), Math.round(monthlyListeners * 0.02) + 1);

  return {
    source: 'spotify',
    subScore: Math.round(normalizeGrowth(listenerGrowthPct)),
    stats: { monthlyListeners, listenerGrowthPct, playlistAdds },
  };
}
