import { randInt, clamp } from '../prng.js';
import { archetypeBase } from './archetypes.js';

export function getBandcampSignal(seed, rng) {
  const base = archetypeBase(seed.archetype);
  const featured = rng() < base.bandcampFeaturedChance;
  const salesRank = randInt(rng, base.salesRank[0], base.salesRank[1]);
  const fanActivity = randInt(rng, 0, 100);

  const rankScore = clamp(100 - (salesRank / 9000) * 100, 0, 100);
  const subScore = Math.round(rankScore * 0.5 + fanActivity * 0.35 + (featured ? 15 : 0));

  return {
    source: 'bandcamp',
    subScore: clamp(subScore, 0, 100),
    stats: { featured, salesRank, fanActivity },
  };
}
