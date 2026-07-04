import { randInt, clamp, pick } from '../prng.js';
import { archetypeBase } from './archetypes.js';

const OUTLETS = ['Pitchfork', 'NME', 'Stereogum', 'The Fader', 'Gorilla vs Bear'];

export function getPressSignal(seed, rng) {
  const base = archetypeBase(seed.archetype);
  const mentionCount = randInt(rng, base.pressMentions[0], base.pressMentions[1]);
  const outlets = [];
  for (let i = 0; i < mentionCount; i++) {
    const outlet = pick(rng, OUTLETS);
    if (!outlets.includes(outlet)) outlets.push(outlet);
  }

  const subScore = clamp((mentionCount / 4) * 100, 0, 100);

  return {
    source: 'press',
    subScore: Math.round(subScore),
    stats: { mentionCount, outlets },
  };
}
