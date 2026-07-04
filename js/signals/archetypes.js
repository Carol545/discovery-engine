// Base ranges per archetype. Every signal module reads from here so the whole
// mock dataset stays internally consistent (a "rocket" is fast-growing on
// every platform, not just Spotify).
export const ARCHETYPES = {
  rocket: {
    listeners: [5000, 60000],
    listenerGrowthPct: [150, 500],
    viewGrowthPct: [120, 450],
    engagementRatio: [0.06, 0.14],
    redditMentions: [15, 80],
    redditUpvotes: [200, 4000],
    pressMentions: [1, 3],
    bandcampFeaturedChance: 0.4,
    salesRank: [50, 2000],
  },
  gem: {
    listeners: [1000, 15000],
    listenerGrowthPct: [20, 80],
    viewGrowthPct: [15, 70],
    engagementRatio: [0.1, 0.22],
    redditMentions: [5, 25],
    redditUpvotes: [80, 900],
    pressMentions: [0, 1],
    bandcampFeaturedChance: 0.3,
    salesRank: [100, 3000],
  },
  radar: {
    listeners: [100, 3000],
    listenerGrowthPct: [5, 40],
    viewGrowthPct: [0, 30],
    engagementRatio: [0.03, 0.09],
    redditMentions: [0, 6],
    redditUpvotes: [0, 150],
    pressMentions: [0, 0],
    bandcampFeaturedChance: 0.15,
    salesRank: [2000, 9000],
  },
  giant: {
    listeners: [2000000, 40000000],
    listenerGrowthPct: [1, 8],
    viewGrowthPct: [1, 6],
    engagementRatio: [0.02, 0.05],
    redditMentions: [50, 300],
    redditUpvotes: [500, 10000],
    pressMentions: [3, 8],
    bandcampFeaturedChance: 0.05,
    salesRank: [1, 20],
  },
};

export function archetypeBase(archetype) {
  return ARCHETYPES[archetype] || ARCHETYPES.gem;
}
