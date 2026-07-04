// The distillation pass — the core of MinuteMaker. Takes a diarized transcript and produces
// a structured record of what was DONE (motions, votes, action items), never what was said.
// This layer is deliberately separate from the transcript: "more detail" must never regress
// into transcript-style output. The raw transcript remains available as an audit artifact only.
//
// v1 is rule-based. A future LLM-assisted pass would slot in per-function here (especially
// summarizeDiscussion), keeping the same structured output shape.

const NON_SPEAKERS = new Set(['all', 'everyone', 'both', 'several', 'multiple', 'group', 'board', 'unknown']);

const TIME_RE = /\b(\d{1,2}(?::\d{2})?\s*(?:a\.?m\.?|p\.?m\.?))\b/i;
const CALL_TO_ORDER_RE = /\bcall(?:s|ed|ing)?\s+(?:this\s+|the\s+)?(?:\w+\s+){0,4}meeting\b.*\bto order\b|\bmeeting\s+will\s+come\s+to\s+order\b/i;
const ADJOURN_RE = /\badjourn/i;

const MOTION_RE = /\b(?:i\s+(?:would like to\s+|'d like to\s+)?move\s+(that|to)\s+(.+)|make\s+a\s+motion\s+(that|to)\s+(.+)|so moved)/i;
const MOTION_PROMPT_RE = /\bmotion\s+(that|to)\s+([^?.!]+)/i;
const SECOND_RE = /^\s*(?:i\s+)?second(?:ed)?\b|^\s*i'?ll second\b/i;

const PROCEDURAL_RE = /^(?:aye|nay|yes|no|here|present|second(?:ed)?|so moved|opposed|abstain)[.! ]*$|all in favor|any opposed|any abstentions|roll call|hearing (?:none|nothing)|is there (?:a motion|any other business)|do i have a motion|further discussion|good of the order/i;

const SECTION_PATTERNS = [
  { re: /\b(treasurer'?s report|financial report|president'?s report|manager'?s report|executive director'?s report|committee reports?|secretary'?s report)\b/i, title: (m) => m[1] },
  { re: /(?:first|next|last|final)\s+(?:item|order of business|topic|matter)(?:\s+on the agenda)?(?:\s+tonight|\s+today)?\s*(?:is|:)\s*([^.?!]*)/i, title: (m) => m[1] },
  { re: /(?:moving on to|let'?s move on to|let'?s turn to|turning to|we'?ll turn to)\s+([^.?!]*)/i, title: (m) => m[1] },
  { re: /\b(new business|old business|unfinished business)\b/i, title: (m) => m[1] },
  { re: /\bagenda item\s+(?:number\s+)?\w+\s*[:,-]?\s*([^.?!]*)/i, title: (m) => m[1] },
];

export function extractMinutes(lines, meta, settings) {
  const roster = buildRoster(lines);
  const guests = detectGuests(lines, roster);
  const present = roster.filter((n) => !guests.includes(n));
  const absent = detectAbsent(lines, present);

  const callIdx = lines.findIndex((l) => CALL_TO_ORDER_RE.test(l.text));
  const chair = callIdx >= 0 ? lines[callIdx].speaker : present[0] || '';
  const calledToOrder = callIdx >= 0 ? (lines[callIdx].text.match(TIME_RE) || [])[1] || '' : '';

  const motions = detectMotions(lines, present.concat(chair));
  const adjournMotion = motions.find((m) => ADJOURN_RE.test(m.text));
  const adjournedAt = findAdjournTime(lines);

  const actionItems = detectActionItems(lines, present.concat(guests));
  const actionLineIdx = new Set(actionItems.map((a) => a.index));

  const sections = segmentSections(lines, callIdx);
  const priorSection = sections.find((s) => /\bminutes\b/i.test(s.title));
  const minutesMotion = motions.find((m) => /\bminutes\b/i.test(m.text) && !ADJOURN_RE.test(m.text));

  const items = sections
    .filter((s) => s !== priorSection)
    .map((s) => ({
      title: s.title,
      discussion: summarizeDiscussion(lines, s, motions, actionLineIdx),
      motions: motions.filter((m) => m.index >= s.start && m.index < s.end && m !== adjournMotion && m !== minutesMotion),
      verbatim: detectVerbatim(lines, s),
    }))
    .filter((it) => it.discussion.length || it.motions.length || it.verbatim.length);

  return {
    metadata: {
      ...meta,
      chair,
      calledToOrder: calledToOrder || meta.calledToOrder || '',
      adjournedAt,
    },
    attendance: {
      present: present.sort(),
      absent,
      alsoPresent: guestLabels(lines).length ? guestLabels(lines) : guests,
      chair,
      secretary: meta.secretaryName || settings.secretaryName || '',
      quorum: present.length > (present.length + absent.length) / 2,
    },
    priorMinutes: minutesMotion ? { motion: minutesMotion } : null,
    items,
    actionItems,
    adjournMotion: adjournMotion || null,
  };
}

// ---------- roster & attendance ----------

function buildRoster(lines) {
  const names = new Set();
  for (const l of lines) {
    if (l.speaker && !NON_SPEAKERS.has(l.speaker.toLowerCase())) names.add(l.speaker);
  }
  return [...names];
}

// Non-board attendees (staff, guests) announced with phrases like
// "Also with us tonight is our executive director, David Kim."
function detectGuests(lines, roster) {
  const guests = [];
  const CUE_RE = /\b(?:also (?:with us|present|joining)|joining us)\b/i;
  for (const l of lines) {
    if (!CUE_RE.test(l.text)) continue;
    const roleName = l.text.match(/\b(?:our|the)\s+([\w\s]+?),\s*([A-Z][\w'’-]+\s+[A-Z][\w'’-]+)/);
    const name = roleName
      ? roleName[2]
      : [...l.text.matchAll(/([A-Z][\w'’-]+\s+[A-Z][\w'’-]+)/g)]
          .map((x) => x[1])
          .find((c) => c !== l.speaker && roster.includes(c));
    if (name && roster.includes(name) && !guests.includes(name)) guests.push(name);
  }
  return guests;
}

export function guestLabels(lines) {
  const labels = [];
  const RE = /\b(?:also (?:with us|present|joining)|joining us)\b[^.?!]*?\b(?:our|the)\s+([\w\s]+?),\s*([A-Z][\w'’-]+\s+[A-Z][\w'’-]+)/i;
  for (const l of lines) {
    const m = l.text.match(RE);
    if (m) labels.push(`${m[2]} (${titleCase(m[1].trim())})`);
  }
  return labels;
}

function detectAbsent(lines, present) {
  const absent = new Set();
  const PATTERNS = [
    /([A-Z][\w'’-]+(?:\s+[A-Z][\w'’-]+)+)\s+(?:is|are|was|will be)\s+(?:absent|not able to|unable to|not (?:here|with us|joining))/i,
    /regrets from\s+([A-Z][\w'’-]+(?:\s+[A-Z][\w'’-]+)+)/i,
    /([A-Z][\w'’-]+(?:\s+[A-Z][\w'’-]+)+)\s+sends? (?:his|her|their) regrets/i,
    /([A-Z][\w'’-]+(?:\s+[A-Z][\w'’-]+)+)\s+(?:couldn'?t|could not)\s+(?:make it|be here|join)/i,
  ];
  for (const l of lines) {
    for (const re of PATTERNS) {
      const m = l.text.match(re);
      if (m && !present.includes(m[1])) absent.add(m[1]);
    }
  }
  return [...absent].sort();
}

// ---------- motions & votes ----------

function detectMotions(lines, roster) {
  const motions = [];
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (!l.speaker || NON_SPEAKERS.has((l.speaker || '').toLowerCase())) continue;
    const m = l.text.match(MOTION_RE);
    if (!m) continue;

    let text = '';
    if (/so moved/i.test(m[0]) && !m[2] && !m[4]) {
      // "So moved" — the motion text lives in the chair's prompt just above.
      for (let j = i - 1; j >= Math.max(0, i - 3); j--) {
        const p = lines[j].text.match(MOTION_PROMPT_RE);
        if (p) {
          text = `${p[1]} ${p[2].trim()}`;
          break;
        }
      }
      if (!text) continue;
    } else {
      const kw = m[1] || m[3];
      const body = (m[2] || m[4] || '').trim().replace(/[.?!]+$/, '');
      text = `${kw} ${body}`;
    }

    const motion = { index: i, mover: l.speaker, text: normalizeMotion(text), seconder: '', vote: null };

    for (let j = i + 1; j <= Math.min(lines.length - 1, i + 5); j++) {
      if (SECOND_RE.test(lines[j].text) && lines[j].speaker && lines[j].speaker !== motion.mover) {
        motion.seconder = lines[j].speaker;
        break;
      }
    }
    motion.vote = parseVote(lines, i, roster);
    motions.push(motion);
  }
  return motions;
}

function normalizeMotion(text) {
  let t = text.trim().replace(/\s+/g, ' ').replace(/[.?!]+$/, '');
  if (!/^(that|to)\b/i.test(t)) t = 'that ' + t;
  return t.charAt(0).toLowerCase() + t.slice(1);
}

function parseVote(lines, motionIdx, roster) {
  const vote = { type: 'voice', for: null, against: null, abstain: null, dissenters: [], abstainers: [], passed: null, unanimous: false };
  const end = Math.min(lines.length, motionIdx + 16);
  let sawFavor = false;

  let announced = false;
  for (let i = motionIdx + 1; i < end; i++) {
    const t = lines[i].text;
    const speaker = lines[i].speaker || '';
    if (i > motionIdx + 1 && MOTION_RE.test(t) && !/so moved/i.test(t)) break; // next motion starts

    if (/\bunanimous(?:ly)?\b/i.test(t)) {
      vote.unanimous = true;
      vote.passed = vote.passed !== false;
      if (sawFavor) announced = true; // "That's unanimous" after the vote = final result
    }
    if (/all in favor/i.test(t)) sawFavor = true;

    const counts = t.match(/\bcarries?\s+(\d+)\s*(?:to|–|—|-)\s*(\d+)|(\d+)\s+(?:in favor|for)\b.*?(\d+)\s+(?:opposed|against)/i);
    if (counts) {
      vote.type = 'count';
      vote.for = Number(counts[1] ?? counts[3]);
      vote.against = Number(counts[2] ?? counts[4]);
    }
    const abst = t.match(/(\d+|one|two|three)\s+abstentions?/i);
    if (abst) vote.abstain = wordToNum(abst[1]);

    if (/\bmotion\s+(?:carries|passes|passed|carried|is adopted|is approved)\b/i.test(t)) {
      vote.passed = true;
      announced = true;
    }
    if (/\bmotion\s+(?:fails|failed|does not pass|is defeated)\b/i.test(t)) {
      vote.passed = false;
      announced = true;
    }

    // Named dissent / abstention by individual board members.
    if (roster.includes(speaker)) {
      if (/^\s*(?:no|nay|opposed|i(?:'m| am)? opposed|i vote no)\b/i.test(t) && !t.trim().endsWith('?')) {
        if (!vote.dissenters.includes(speaker)) vote.dissenters.push(speaker);
      }
      // First-person only — a chair announcing "Marcus abstains" is handled below and
      // must not mark the chair as abstaining.
      if (/\bi\s+(?:will\s+|'ll\s+|am going to\s+|would like to\s+|must\s+|have to\s+)?abstain\b/i.test(t) && !t.trim().endsWith('?')) {
        if (!vote.abstainers.includes(speaker)) vote.abstainers.push(speaker);
      }
    }
    // Chair announcing someone else's abstention: "Marcus Webb abstains..."
    const namedAbst = t.match(/([A-Z][\w'’-]+\s+[A-Z][\w'’-]+)\s+abstains?\b/);
    if (namedAbst && roster.includes(namedAbst[1]) && !vote.abstainers.includes(namedAbst[1])) {
      vote.abstainers.push(namedAbst[1]);
    }

    // Once the chair has announced the result, the vote is closed — anything after
    // belongs to the next item, not this motion.
    if (announced) break;
  }

  if (vote.abstain === null && vote.abstainers.length) vote.abstain = vote.abstainers.length;
  if (vote.passed === null && sawFavor && !vote.dissenters.length && vote.against === null) {
    vote.passed = true;
    vote.unanimous = vote.unanimous || vote.abstain === null;
  }
  if (vote.passed === null && vote.for !== null && vote.against !== null) vote.passed = vote.for > vote.against;
  if (vote.for !== null) vote.type = 'count';
  return vote;
}

function wordToNum(w) {
  const map = { one: 1, two: 2, three: 3 };
  return map[w.toLowerCase()] ?? Number(w);
}

// ---------- agenda segmentation ----------

function segmentSections(lines, callIdx) {
  const bounds = [];
  for (let i = Math.max(0, callIdx); i < lines.length; i++) {
    const text = lines[i].text;
    // Motion prompts and motions mention item names ("motion to accept the treasurer's
    // report") but do not open a new agenda item.
    if (/do i have a motion|is there a motion/i.test(text) || MOTION_RE.test(text)) continue;
    for (const p of SECTION_PATTERNS) {
      const m = text.match(p.re);
      if (m) {
        const title = cleanTitle(p.title(m)) || 'Agenda Item';
        // A repeated mention of the current item is continuation, not a new section.
        if (bounds.length && bounds[bounds.length - 1].title === title) break;
        bounds.push({ index: i, title });
        break;
      }
    }
  }
  return bounds.map((b, k) => ({
    title: b.title,
    start: b.index,
    end: k + 1 < bounds.length ? bounds[k + 1].index : lines.length,
  }));
}

function cleanTitle(raw) {
  if (!raw) return '';
  let t = raw.trim().replace(/^the\s+/i, '').split(/[—–:;,]| - /)[0].trim().replace(/[.?!]+$/, '');
  if (t.split(/\s+/).length > 10) t = t.split(/\s+/).slice(0, 10).join(' ') + '…';
  return titleCase(t);
}

function titleCase(s) {
  const small = new Set(['of', 'the', 'a', 'an', 'and', 'or', 'to', 'for', 'from', 'in', 'on', 'at', 'with']);
  return s
    .split(/\s+/)
    .map((w, i) => (i > 0 && small.has(w.toLowerCase()) ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(' ');
}

// ---------- discussion distillation ----------

// 1-3 sentences of rationale per item: enough to explain WHY a decision was made,
// never a blow-by-blow. Questions, procedure, and motion language are excluded.
function summarizeDiscussion(lines, section, motions, actionLineIdx) {
  const motionIdx = new Set(motions.map((m) => m.index));
  const candidates = [];
  // section.start is the transition line itself ("moving on to…") — never summary material.
  for (let i = section.start + 1; i < section.end; i++) {
    const l = lines[i];
    if (!l.speaker || NON_SPEAKERS.has(l.speaker.toLowerCase())) continue;
    if (motionIdx.has(i) || actionLineIdx.has(i) || PROCEDURAL_RE.test(l.text) || SECOND_RE.test(l.text)) continue;
    if (l.text.trim().endsWith('?') || l.text.length < 60) continue;
    if (MOTION_RE.test(l.text) || /minutes to reflect|for the record|in my own words/i.test(l.text)) continue;
    candidates.push({ i, l, score: scoreSentence(l.text) });
  }
  return candidates
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .sort((a, b) => a.i - b.i)
    .map(({ l }) => toReportedSpeech(l.speaker, l.text));
}

function scoreSentence(text) {
  let s = 0;
  if (/[$€£]\s?[\d,]+|\b\d+(\.\d+)?\s*(percent|%)/i.test(text)) s += 3;
  if (/\b\d[\d,]*\b/.test(text)) s += 1;
  if (/\b(recommend|concern|propos|budget|cost|bid|report|issue|update|plan|schedule|contract|complaint|risk|quote[sd]?|review)\w*/i.test(text)) s += 2;
  s += Math.min(2, Math.floor(text.length / 120));
  return s;
}

// Convert a first-person utterance into third-person reported speech —
// imperfect by design; the secretary edits the draft.
function toReportedSpeech(speaker, text) {
  let t = text
    .replace(/^(?:okay|ok|alright|all right|well|so|um|uh|yeah|yes|no|right|sure|agreed|thanks(?:,? \w+)?|thank you(?:,? \w+)?)[,.]?\s+/i, '')
    // Drop a short leading affirmation sentence ("It is." / "That's right.") — the
    // substance follows it.
    .replace(/^(?:it (?:is|does|did|was)|that'?s (?:right|correct|true)|correct|exactly|absolutely)[.!]\s+/i, '')
    .replace(/[.?!]+$/, '');
  const firstPerson = /(^|\W)(i|i'm|i've|i'd|we|we're|we've|my|our|me|us)(\W|$)/i.test(t);
  if (!firstPerson) {
    return `${speaker} noted that ${t.charAt(0).toLowerCase() + t.slice(1)}.`;
  }
  t = t
    .replace(/\bI am\b|\bI'm\b/g, 'they are')
    .replace(/\bI have\b|\bI've\b/g, 'they have')
    .replace(/\bI would\b|\bI'd\b/g, 'they would')
    .replace(/\bI will\b|\bI'll\b/g, 'they will')
    .replace(/\bI\b/g, 'they')
    .replace(/\bmy\b/gi, 'their')
    .replace(/\bWe are\b|\bWe're\b/g, 'the board is')
    .replace(/\bwe are\b|\bwe're\b/g, 'the board is')
    .replace(/\bWe have\b|\bWe've\b/g, 'the board has')
    .replace(/\bwe have\b|\bwe've\b/g, 'the board has')
    .replace(/\bWe\b/g, 'The board')
    .replace(/\bwe\b/g, 'the board')
    .replace(/\bour\b/gi, 'the board’s')
    .replace(/\bus\b/g, 'the board');
  return `${speaker} reported that ${t.charAt(0).toLowerCase() + t.slice(1)}.`;
}

// ---------- verbatim override ----------

// Rare but must be supported: a member explicitly asks that something be entered
// "in their own words." The ONLY case where a direct quote belongs in minutes.
function detectVerbatim(lines, section) {
  const out = [];
  const RE = /(?:i(?:'|’)?d like|i want|i ask(?:ed)?|request(?:ing)?)\s+(?:that\s+)?the (?:minutes|record)\s+(?:to\s+)?reflect|for the record|in my own words|enter(?:ed)? into the (?:minutes|record)/i;
  for (let i = section.start; i < section.end; i++) {
    const l = lines[i];
    if (!l.speaker || !RE.test(l.text)) continue;
    const m = l.text.match(RE);
    let quote = l.text
      .slice(m.index + m[0].length)
      .replace(/^[\s:,.-]+(?:that\s+)?/i, '')
      // The trigger phrase may span several clauses ("…to reflect, in my own words: …");
      // strip any remaining trigger fragments so only the member's statement is quoted.
      .replace(/^(?:in my own words|for the record)[\s:,.-]+/i, '')
      .trim();
    if (!quote && lines[i + 1] && lines[i + 1].speaker === l.speaker) quote = lines[i + 1].text.trim();
    if (quote) out.push({ speaker: l.speaker, quote });
  }
  return out;
}

// ---------- action items ----------

function detectActionItems(lines, roster) {
  const items = [];
  const firstNames = new Map(roster.map((n) => [n.split(/\s+/)[0].toLowerCase(), n]));
  const DUE_RE = /\bby\s+((?:the\s+)?next (?:meeting|month|week)|(?:the\s+)?end of (?:the\s+)?(?:month|week|year)|[A-Z][a-z]+ \d{1,2}(?:st|nd|rd|th)?|(?:this |next )?(?:Mon|Tues|Wednes|Thurs|Fri|Satur|Sun)day)\b/;
  const PATTERNS = [
    { re: /^(?:yes[,.]?\s*)?(?:i(?:'|’)ll|i will)\s+(.{8,})/i, owner: 'speaker' },
    { re: /\b([A-Z][\w'’-]+(?:\s+[A-Z][\w'’-]+)?)\s+(?:will|is going to|agreed to|volunteered to)\s+(.{8,})/, owner: 'named' },
    { re: /\baction item\s*[:\-]\s*(.{8,})/i, owner: 'speaker' },
  ];

  for (let idx = 0; idx < lines.length; idx++) {
    const l = lines[idx];
    if (!l.speaker || MOTION_RE.test(l.text) || ADJOURN_RE.test(l.text)) continue;
    const text = l.text;
    // A single line can assign several tasks ("Raj will X, and I will Y") — split on clause
    // boundaries and evaluate each.
    for (const clause of text.split(/,\s+and\s+|;\s+|\.\s+/)) {
      for (const p of PATTERNS) {
        const m = clause.match(p.re);
        if (!m) continue;
        let owner, task;
        if (p.owner === 'named') {
          const resolved = resolveName(m[1], roster, firstNames);
          if (!resolved) continue;
          owner = resolved;
          task = m[2];
        } else {
          owner = l.speaker;
          task = m[1];
        }
        task = task.trim().replace(/[.?!]+$/, '');
        if (task.split(/\s+/).length < 3 || /\bsecond\b|\bmotion\b|\bmove\b/i.test(task)) continue;
        const due = (task.match(DUE_RE) || [])[1] || '';
        task = cleanTask(task);
        if (!items.some((it) => it.owner === owner && similar(it.task, task))) {
          items.push({ task, owner, due, index: idx });
        }
        break;
      }
    }
  }
  return items;
}

function resolveName(candidate, roster, firstNames) {
  if (roster.includes(candidate)) return candidate;
  return firstNames.get(candidate.toLowerCase().split(/\s+/)[0]) || null;
}

function cleanTask(task) {
  const t = task.replace(/\s+/g, ' ').trim();
  return t.charAt(0).toUpperCase() + t.slice(1);
}

function similar(a, b) {
  const wa = new Set(a.toLowerCase().split(/\W+/).filter((w) => w.length > 3));
  const wb = new Set(b.toLowerCase().split(/\W+/).filter((w) => w.length > 3));
  if (!wa.size || !wb.size) return false;
  let hits = 0;
  for (const w of wa) if (wb.has(w)) hits++;
  return hits / Math.min(wa.size, wb.size) > 0.6;
}

// ---------- adjournment ----------

function findAdjournTime(lines) {
  for (let i = lines.length - 1; i >= 0; i--) {
    if (ADJOURN_RE.test(lines[i].text)) {
      const t = lines[i].text.match(TIME_RE);
      if (t) return t[1];
    }
  }
  return '';
}
