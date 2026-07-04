import { makeRng } from '../prng.js';
import { getSpotifySignal } from './spotify.js';
import { getYoutubeSignal } from './youtube.js';
import { getRedditSignal } from './reddit.js';
import { getBandcampSignal } from './bandcamp.js';
import { getPressSignal } from './press.js';
import { getUserBehaviorSignal } from './userBehavior.js';

// Each source is an independent, swappable module: (seed, rng) -> { subScore, stats }.
// Add/remove entries here to change which platforms feed the Discovery Score.
const SOURCES = {
  spotify: getSpotifySignal,
  youtube: getYoutubeSignal,
  reddit: getRedditSignal,
  bandcamp: getBandcampSignal,
  press: getPressSignal,
};

export function buildSignals(seed, liveStats) {
  const rng = makeRng(seed.id);
  const signals = {};
  for (const [name, fn] of Object.entries(SOURCES)) {
    signals[name] = fn(seed, rng);
  }
  signals.userBehavior = getUserBehaviorSignal(seed, rng, liveStats);
  return signals;
}
