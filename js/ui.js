function scoreClass(score) {
  if (score >= 70) return '';
  if (score >= 40) return 'mid';
  return 'low';
}

function fmtNum(n) {
  return n.toLocaleString('en-US');
}

export function buildWhyBullets(track) {
  const { signals } = track;
  const bullets = [];

  bullets.push(
    `<b>+${signals.spotify.stats.listenerGrowthPct}%</b> Spotify listeners in 30 days (${fmtNum(signals.spotify.stats.monthlyListeners)} total)`
  );

  if (signals.youtube.stats.viewGrowthPct > 10) {
    bullets.push(`<b>+${signals.youtube.stats.viewGrowthPct}%</b> YouTube view growth, ${(signals.youtube.stats.engagementRatio * 100).toFixed(1)}% engagement rate`);
  }

  if (signals.reddit.stats.mentions > 0) {
    bullets.push(`<b>${signals.reddit.stats.mentions}</b> mentions on ${signals.reddit.stats.topSubreddit} · ${fmtNum(signals.reddit.stats.upvotes)} upvotes`);
  }

  if (signals.press.stats.outlets.length > 0) {
    bullets.push(`Featured in <b>${signals.press.stats.outlets.join(', ')}</b>`);
  }

  if (signals.bandcamp.stats.featured) {
    bullets.push(`Bandcamp <b>featured release</b> this week`);
  }

  if (signals.spotify.stats.monthlyListeners < 5000) {
    bullets.push(`Still under <b>${fmtNum(signals.spotify.stats.monthlyListeners)}</b> monthly listeners — early`);
  } else if (signals.spotify.stats.monthlyListeners > 1000000) {
    bullets.push(`Already at <b>${fmtNum(signals.spotify.stats.monthlyListeners)}</b> listeners — underground bonus penalized`);
  }

  return bullets.slice(0, 4);
}

export function renderTabs(container, tabs, activeId, onSelect) {
  container.innerHTML = '';
  tabs.forEach((tab) => {
    const btn = document.createElement('button');
    btn.className = 'tab-btn' + (tab.id === activeId ? ' active' : '');
    btn.textContent = tab.label;
    btn.addEventListener('click', () => onSelect(tab.id));
    container.appendChild(btn);
  });
}

export function renderSubFilterChips(container, values, activeValue, onSelect) {
  container.innerHTML = '';
  ['All', ...values].forEach((value) => {
    const chip = document.createElement('button');
    const isActive = (value === 'All' && activeValue === 'all') || value === activeValue;
    chip.className = 'chip' + (isActive ? ' active' : '');
    chip.textContent = value;
    chip.addEventListener('click', () => onSelect(value === 'All' ? 'all' : value));
    container.appendChild(chip);
  });
}

export function renderCard(track) {
  const card = document.createElement('div');
  card.className = 'track-card';
  card.dataset.trackId = track.id;

  const whyBullets = buildWhyBullets(track)
    .map((b) => `<li>${b}</li>`)
    .join('');

  card.innerHTML = `
    <div class="swipe-hint skip">SKIP</div>
    <div class="swipe-hint save">SAVE</div>
    <div class="top-row">
      <div>
        <div class="category-tag">${track.categoryLabel}</div>
        <p class="track-title">${track.title}</p>
        <p class="track-artist">${track.artist} · ${track.region}</p>
      </div>
      <div class="score-badge ${scoreClass(track.score)}">${track.score}</div>
    </div>
    <div class="meta-row">
      <span class="meta-chip">${track.aiMeta.fineGenre}</span>
      ${track.moodTags.map((m) => `<span class="meta-chip">${m}</span>`).join('')}
    </div>
    <p class="ai-description">${track.aiMeta.description}</p>
    <p class="similar-artists">${track.aiMeta.similarArtists}</p>
    <div class="progress-row">
      <span class="time-label" data-role="time">0:00</span>
      <div class="progress-bar"><div class="progress-fill" data-role="progress"></div></div>
    </div>
    <div class="why-panel">
      <span class="why-title">Why you're seeing this</span>
      <ul>${whyBullets}</ul>
    </div>
  `;
  return card;
}

export function renderSavedGrid(container, emptyEl, tracks, onRemove) {
  container.innerHTML = '';
  emptyEl.hidden = tracks.length > 0;
  tracks.forEach((track) => {
    const card = document.createElement('div');
    card.className = 'saved-card';
    card.innerHTML = `
      <span class="saved-title">${track.title}</span>
      <span class="saved-artist">${track.artist} · Score ${track.score}</span>
      <button>Remove</button>
    `;
    card.querySelector('button').addEventListener('click', () => onRemove(track.id));
    container.appendChild(card);
  });
}

export function attachSwipe(card, { onSwipeLeft, onSwipeRight }) {
  let startX = 0;
  let currentX = 0;
  let dragging = false;
  const skipHint = card.querySelector('.swipe-hint.skip');
  const saveHint = card.querySelector('.swipe-hint.save');

  function onPointerDown(e) {
    dragging = true;
    startX = e.clientX;
    card.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e) {
    if (!dragging) return;
    currentX = e.clientX - startX;
    const rotation = currentX / 20;
    card.style.transform = `translateX(${currentX}px) rotate(${rotation}deg)`;
    const intensity = Math.min(Math.abs(currentX) / 120, 1);
    if (currentX < 0) {
      skipHint.style.opacity = intensity;
      saveHint.style.opacity = 0;
    } else {
      saveHint.style.opacity = intensity;
      skipHint.style.opacity = 0;
    }
  }

  function onPointerUp() {
    if (!dragging) return;
    dragging = false;
    const threshold = 110;
    if (currentX > threshold) {
      flyOut(1, onSwipeRight);
    } else if (currentX < -threshold) {
      flyOut(-1, onSwipeLeft);
    } else {
      card.style.transform = '';
      skipHint.style.opacity = 0;
      saveHint.style.opacity = 0;
    }
    currentX = 0;
  }

  function flyOut(direction, callback) {
    card.style.transform = `translateX(${direction * 600}px) rotate(${direction * 25}deg)`;
    card.style.opacity = '0';
    setTimeout(callback, 200);
  }

  card.addEventListener('pointerdown', onPointerDown);
  card.addEventListener('pointermove', onPointerMove);
  card.addEventListener('pointerup', onPointerUp);
  card.addEventListener('pointercancel', onPointerUp);

  return { flyOutLeft: () => flyOut(-1, onSwipeLeft), flyOutRight: () => flyOut(1, onSwipeRight) };
}
