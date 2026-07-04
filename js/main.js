import { SEED_TRACKS, previewUrlFor } from './seed.js';
import { makeRng } from './prng.js';
import { buildSignals } from './signals/index.js';
import { computeDiscoveryScore } from './scoring.js';
import { assignCategory, CATEGORIES } from './categorize.js';
import { generateAiMeta } from './aiMeta.js';
import * as store from './store.js';
import { renderTabs, renderSubFilterChips, renderCard, renderSavedGrid, attachSwipe } from './ui.js';

const TABS = [
  { id: 'future-stars', label: 'Future Stars' },
  { id: 'hidden-gems', label: 'Hidden Gems' },
  { id: 'underground-radar', label: 'Underground Radar' },
  { id: 'global-signals', label: 'Global Signals', groupBy: 'region' },
  { id: 'genre-deep-dive', label: 'Genre Deep Dive', groupBy: 'genre' },
  { id: 'saved', label: 'Saved' },
];

const seedById = new Map(SEED_TRACKS.map((s) => [s.id, s]));

function buildTrack(seed) {
  const liveStats = store.getLiveStats(seed.id);
  const signals = buildSignals(seed, liveStats);
  const { score, components } = computeDiscoveryScore(signals);
  const category = assignCategory(score, components, signals.spotify.stats);
  const aiMeta = generateAiMeta(seed, makeRng(seed.id + '-meta'));

  return {
    ...seed,
    signals,
    score,
    components,
    category,
    categoryLabel: CATEGORIES[category].label,
    aiMeta,
    previewUrl: previewUrlFor(seed.id),
  };
}

const allTracks = SEED_TRACKS.map(buildTrack);

let activeTabId = 'future-stars';
let activeSubfilter = 'all';
const feedCache = new Map();
const indexCache = new Map();

function feedKey() {
  return `${activeTabId}:${activeSubfilter}`;
}

function computeFeed(tabId, subfilter) {
  const tab = TABS.find((t) => t.id === tabId);
  let base = allTracks;
  if (tab.groupBy) {
    if (subfilter !== 'all') base = base.filter((t) => t[tab.groupBy] === subfilter);
  } else {
    base = base.filter((t) => t.category === tabId);
  }
  return [...base].sort((a, b) => b.score - a.score);
}

function getCurrentFeed() {
  const key = feedKey();
  if (!feedCache.has(key)) feedCache.set(key, computeFeed(activeTabId, activeSubfilter));
  return feedCache.get(key);
}

function getIndex() {
  return indexCache.get(feedKey()) || 0;
}
function setIndex(value) {
  indexCache.set(feedKey(), value);
}

function subfilterValues(tabId) {
  const tab = TABS.find((t) => t.id === tabId);
  if (!tab.groupBy) return [];
  return [...new Set(allTracks.map((t) => t[tab.groupBy]))].sort();
}

// --- Audio ---
const audio = new Audio();
let maxFraction = 0;
let currentTrackId = null;

function loadCardAudio(track) {
  audio.pause();
  audio.src = track.previewUrl;
  audio.currentTime = 0;
  maxFraction = 0;
  currentTrackId = track.id;
  playBtn.textContent = '▶';
}

function commitProgress() {
  if (currentTrackId) store.recordProgress(currentTrackId, maxFraction);
}

function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

audio.addEventListener('timeupdate', () => {
  if (!audio.duration || !currentTrackId) return;
  const fraction = audio.currentTime / audio.duration;
  maxFraction = Math.max(maxFraction, fraction);
  const card = cardStack.querySelector(`.track-card[data-track-id="${currentTrackId}"]`);
  if (!card) return;
  const fill = card.querySelector('[data-role="progress"]');
  const time = card.querySelector('[data-role="time"]');
  if (fill) fill.style.width = `${fraction * 100}%`;
  if (time) time.textContent = formatTime(audio.currentTime);
});

audio.addEventListener('ended', () => {
  playBtn.textContent = '▶';
});

// --- DOM refs ---
const tabsEl = document.getElementById('tabs');
const subFilterBar = document.getElementById('subFilterBar');
const subFilterChips = document.getElementById('subFilterChips');
const cardStack = document.getElementById('cardStack');
const emptyState = document.getElementById('emptyState');
const resetFeedBtn = document.getElementById('resetFeedBtn');
const savedView = document.getElementById('savedView');
const savedGrid = document.getElementById('savedGrid');
const savedEmpty = document.getElementById('savedEmpty');
const controls = document.getElementById('controls');
const stage = document.getElementById('stage');
const skipBtn = document.getElementById('skipBtn');
const playBtn = document.getElementById('playBtn');
const saveBtn = document.getElementById('saveBtn');

let currentSwipeControls = null;

function advance(track, saved) {
  commitProgress();
  if (saved) store.toggleSave(track.id);
  setIndex(getIndex() + 1);
  renderStack();
}

function renderStack() {
  cardStack.innerHTML = '';
  currentSwipeControls = null;
  const tracks = getCurrentFeed();
  const idx = getIndex();

  if (idx >= tracks.length) {
    emptyState.hidden = false;
    audio.pause();
    currentTrackId = null;
    return;
  }
  emptyState.hidden = true;

  const visible = tracks.slice(idx, idx + 2);
  visible
    .slice()
    .reverse()
    .forEach((track) => {
      const isTop = track.id === visible[0].id;
      const card = renderCard(track);
      if (!isTop) {
        card.style.transform = 'scale(0.95) translateY(10px)';
        card.style.zIndex = '1';
        card.style.pointerEvents = 'none';
      } else {
        card.style.zIndex = '2';
        loadCardAudio(track);
        currentSwipeControls = attachSwipe(card, {
          onSwipeLeft: () => advance(track, false),
          onSwipeRight: () => advance(track, true),
        });
      }
      cardStack.appendChild(card);
    });
}

function renderSubFilterBar() {
  const tab = TABS.find((t) => t.id === activeTabId);
  if (!tab.groupBy) {
    subFilterBar.hidden = true;
    return;
  }
  subFilterBar.hidden = false;
  renderSubFilterChips(subFilterChips, subfilterValues(activeTabId), activeSubfilter, (value) => {
    activeSubfilter = value;
    renderSubFilterBar();
    renderStack();
  });
}

function renderSaved() {
  const savedIds = store.getSavedIds();
  const tracks = savedIds
    .map((id) => seedById.get(id))
    .filter(Boolean)
    .map(buildTrack)
    .sort((a, b) => b.score - a.score);
  renderSavedGrid(savedGrid, savedEmpty, tracks, (id) => {
    store.toggleSave(id);
    renderSaved();
  });
}

function selectTab(tabId) {
  activeTabId = tabId;
  activeSubfilter = 'all';
  renderTabs(tabsEl, TABS, activeTabId, selectTab);

  if (tabId === 'saved') {
    stage.hidden = true;
    subFilterBar.hidden = true;
    controls.hidden = true;
    savedView.hidden = false;
    audio.pause();
    renderSaved();
  } else {
    savedView.hidden = true;
    stage.hidden = false;
    controls.hidden = false;
    renderSubFilterBar();
    renderStack();
  }
}

resetFeedBtn.addEventListener('click', () => {
  setIndex(0);
  renderStack();
});

skipBtn.addEventListener('click', () => currentSwipeControls?.flyOutLeft());
saveBtn.addEventListener('click', () => currentSwipeControls?.flyOutRight());
playBtn.addEventListener('click', () => {
  if (!currentTrackId) return;
  if (audio.paused) {
    audio.play();
    playBtn.textContent = '❚❚';
  } else {
    audio.pause();
    playBtn.textContent = '▶';
  }
});

window.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft') currentSwipeControls?.flyOutLeft();
  if (e.key === 'ArrowRight') currentSwipeControls?.flyOutRight();
});

renderTabs(tabsEl, TABS, activeTabId, selectTab);
renderSubFilterBar();
renderStack();
