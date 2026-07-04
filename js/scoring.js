import { clamp } from './prng.js';

// Configurable weights, not hardcoded inline — tune the formula here.
export const WEIGHTS = {
  growth: 0.35,
  engagement: 0.25,
  underground: 0.20,
  crossPlatform: 0.10,
  userBehavior: 0.10,
};

function growthComponent(signals) {
  const spotifyGrowth = clamp((signals.spotify.stats.listenerGrowthPct / 500) * 100, 0, 100);
  const ytGrowth = clamp((signals.youtube.stats.viewGrowthPct / 450) * 100, 0, 100);
  return spotifyGrowth * 0.6 + ytGrowth * 0.4;
}

function engagementComponent(signals) {
  const ytEngagement = clamp((signals.youtube.stats.engagementRatio / 0.22) * 100, 0, 100);
  const redditEngagement = clamp((signals.reddit.stats.upvotes / 4000) * 100, 0, 100);
  const bandcampEngagement = signals.bandcamp.stats.fanActivity;
  return ytEngagement * 0.5 + redditEngagement * 0.25 + bandcampEngagement * 0.25;
}

// The load-bearing component: without this, ranking converges to raw
// popularity (i.e. Spotify's own charts). Big-audience artists get pushed down.
function undergroundComponent(signals) {
  const listeners = Math.max(signals.spotify.stats.monthlyListeners, 1);
  const scale = Math.log10(40_000_000);
  return 100 * (1 - clamp(Math.log10(listeners) / scale, 0, 1));
}

function crossPlatformComponent(signals) {
  const redditMentionScore = clamp((signals.reddit.stats.mentions / 80) * 100, 0, 100);
  const pressScore = signals.press.subScore;
  const bandcampRankScore = clamp(100 - (signals.bandcamp.stats.salesRank / 9000) * 100, 0, 100);
  return redditMentionScore * 0.4 + pressScore * 0.35 + bandcampRankScore * 0.25;
}

function userBehaviorComponent(signals) {
  return signals.userBehavior.subScore;
}

export function computeDiscoveryScore(signals, weights = WEIGHTS) {
  const components = {
    growth: growthComponent(signals),
    engagement: engagementComponent(signals),
    underground: undergroundComponent(signals),
    crossPlatform: crossPlatformComponent(signals),
    userBehavior: userBehaviorComponent(signals),
  };

  const score = Object.entries(weights).reduce(
    (sum, [key, weight]) => sum + components[key] * weight,
    0
  );

  return { score: Math.round(clamp(score, 0, 100)), components };
}
