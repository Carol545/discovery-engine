export const CATEGORIES = {
  'future-stars': { label: 'Future Stars', blurb: 'High momentum right now — likely to blow up' },
  'hidden-gems': { label: 'Hidden Gems', blurb: 'Strong engagement, still a tiny audience' },
  'underground-radar': { label: 'Underground Radar', blurb: 'Very niche, barely any cross-platform footprint yet' },
  'on-the-radar': { label: 'On The Radar', blurb: "Doesn't fit a sharp momentum pattern yet" },
};

export function assignCategory(score, components, spotifyStats) {
  const listeners = spotifyStats.monthlyListeners;

  if (components.growth > 35 && score >= 38) return 'future-stars';
  if (components.engagement > 40 && listeners < 20000) return 'hidden-gems';
  if (components.crossPlatform < 25 && listeners < 5000) return 'underground-radar';
  return 'on-the-radar';
}
