# Discovery Engine

A swipe-feed music discovery app — "Bloomberg Terminal for emerging music." It optimizes
for finding great artists *before* they blow up: velocity over popularity.

No build step, no dependencies. Vanilla JS (ES modules) + HTML/CSS, served as static files.

## Run it

```
python -m http.server 5173
```

Then open http://localhost:5173.

## What's here

- **Swipe feed** — drag a card or use the ✕ / ♡ / ▶ controls to skip, save, and preview-play
- **Discovery Score** — a configurable weighted formula (35% growth, 25% engagement, 20%
  underground bonus, 10% cross-platform mentions, 10% user behavior), see [js/scoring.js](js/scoring.js)
- **Feeds** — Future Stars, Hidden Gems, Underground Radar, Global Signals (by region),
  Genre Deep Dive (by genre)
- **"Why you're seeing this"** — data-driven bullets per track (growth %, mentions, press)
- **Saved list** — persisted to `localStorage`
- **AI metadata** — templated song description, similar-artist line, mood tags, fine genre
  ([js/aiMeta.js](js/aiMeta.js)); scoped to metadata only, doesn't affect ranking

## Signal pipeline

Each data source is an independent, swappable module in [js/signals/](js/signals/)
(`spotify.js`, `youtube.js`, `reddit.js`, `bandcamp.js`, `press.js`, `userBehavior.js`),
each returning a normalized 0–100 sub-score plus raw stats. They currently generate
deterministic mock data (seeded per track) — swap in real API calls per source without
touching the scoring or UI layers.

## Not built (post-v1)

Named Save Collections, the Prediction/leaderboard feature, and the Artist Dashboard.
