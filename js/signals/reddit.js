import { randInt, randRange, clamp, pick } from '../prng.js';
import { archetypeBase } from './archetypes.js';

const SUBREDDITS = ['r/indieheads', 'r/listentothis', 'r/music', 'r/hiphopheads', 'r/electronicmusic'];

export function getRedditSignal(seed, rng) {
  const base = archetypeBase(seed.archetype);
  const mentions = randInt(rng, base.redditMentions[0], base.redditMentions[1]);
  const upvotes = randInt(rng, base.redditUpvotes[0], base.redditUpvotes[1]);
  const comments = Math.round(upvotes * randRange(rng, 0.03, 0.12));
  const sentiment = Math.round(randRange(rng, mentions > 10 ? 0.2 : -0.1, 0.9) * 100) / 100;
  const topSubreddit = pick(rng, SUBREDDITS);

  const mentionScore = clamp((mentions / 80) * 100, 0, 100);
  const sentimentScore = clamp(((sentiment + 1) / 2) * 100, 0, 100);
  const subScore = Math.round(mentionScore * 0.7 + sentimentScore * 0.3);

  return {
    source: 'reddit',
    subScore,
    stats: { mentions, upvotes, comments, sentiment, topSubreddit },
  };
}
