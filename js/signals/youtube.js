import { randRange, randInt, clamp } from '../prng.js';
import { archetypeBase } from './archetypes.js';

function normalizeViewGrowth(growthPct) {
  return clamp((growthPct / 450) * 100, 0, 100);
}

export function getYoutubeSignal(seed, rng) {
  const base = archetypeBase(seed.archetype);
  const viewGrowthPct = Math.round(randRange(rng, base.viewGrowthPct[0], base.viewGrowthPct[1]));
  const subGrowthPct = Math.round(viewGrowthPct * randRange(rng, 0.5, 0.9));
  const engagementRatio = Math.round(randRange(rng, base.engagementRatio[0], base.engagementRatio[1]) * 1000) / 1000;

  const growthComponent = normalizeViewGrowth(viewGrowthPct);
  const engagementComponent = clamp((engagementRatio / 0.22) * 100, 0, 100);
  const subScore = Math.round(growthComponent * 0.6 + engagementComponent * 0.4);

  return {
    source: 'youtube',
    subScore,
    stats: { viewGrowthPct, subGrowthPct, engagementRatio },
  };
}
