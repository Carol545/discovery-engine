import { loadSettings, saveSettings, loadMeetings, saveMeeting, getMeeting, deleteMeeting, newId } from './store.js';
import { parseTranscriptFile, transcribeMedia } from './transcribe.js';
import { extractMinutes } from './extract.js';
import { generateMinutesHtml } from './generate.js';
import { exportWord, exportPdf } from './export.js';
import { demoMeetings } from './demoData.js';

const app = document.getElementById('app');
let settings = loadSettings();

// ---------- tiny helpers ----------

function h(html) {
  app.innerHTML = html;
}

function esc(s) {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function on(sel, event, fn) {
  document.querySelectorAll(sel).forEach((el) => el.addEventListener(event, fn));
}

// ---------- home ----------

function renderHome() {
  const meetings = loadMeetings();
  h(`
    <section class="screen">
      <div class="hero">
        <h1>Turn a board meeting recording into minutes the board will approve.</h1>
        <p>MinuteMaker distills a recording into a formal Robert's Rules record — motions, votes,
           and action items. What was <em>done</em>, not what was <em>said</em>. Never a transcript dump.</p>
        <button class="btn primary big" id="btn-new">＋ New Meeting</button>
      </div>

      <h2 class="section-h">Try it with a sample recording</h2>
      <div class="demo-grid">
        ${demoMeetings
          .map(
            (d) => `
          <div class="card demo-card" data-demo="${d.id}">
            <h3>${esc(d.label)}</h3>
            <p>${esc(d.blurb)}</p>
            <button class="btn" data-demo-btn="${d.id}">Generate draft minutes →</button>
          </div>`
          )
          .join('')}
      </div>

      <h2 class="section-h">Your meetings</h2>
      ${
        meetings.length
          ? `<div class="meeting-list">${meetings
              .map(
                (m) => `
            <div class="card meeting-row">
              <div>
                <strong>${esc(m.meta.orgName || 'Untitled organization')}</strong>
                <span class="muted">${esc(m.meta.meetingType || '')} meeting · ${esc(m.meta.date || '')}</span>
              </div>
              <div class="row-actions">
                <button class="btn" data-open="${m.id}">Open</button>
                <button class="btn danger-ghost" data-del="${m.id}">Delete</button>
              </div>
            </div>`
              )
              .join('')}</div>`
          : `<p class="muted">No saved meetings yet. Start with a sample above, or upload your own.</p>`
      }
    </section>
  `);

  document.getElementById('btn-new').onclick = () => renderSetup();
  on('[data-demo-btn]', 'click', (e) => {
    const demo = demoMeetings.find((d) => d.id === e.target.dataset.demoBtn);
    renderSetup(demo);
  });
  on('[data-open]', 'click', (e) => renderReview(e.target.dataset.open));
  on('[data-del]', 'click', (e) => {
    if (confirm('Delete this meeting and its draft minutes? This cannot be undone.')) {
      deleteMeeting(e.target.dataset.del);
      renderHome();
    }
  });
}

// ---------- setup: metadata + upload + consent gate ----------

function renderSetup(demo = null) {
  const meta = demo?.meta || {};
  h(`
    <section class="screen narrow">
      <h1>${demo ? 'Sample: ' + esc(demo.label) : 'New Meeting'}</h1>

      <div class="card form-card">
        <h3>Meeting details</h3>
        <label>Organization name
          <input id="f-org" type="text" value="${esc(meta.orgName || settings.orgName)}" placeholder="e.g. Maplewood Commons HOA" />
        </label>
        <div class="form-row">
          <label>Meeting type
            <select id="f-type">
              ${['Regular', 'Special', 'Executive', 'Annual']
                .map((t) => `<option ${t === (meta.meetingType || 'Regular') ? 'selected' : ''}>${t}</option>`)
                .join('')}
            </select>
          </label>
          <label>Date
            <input id="f-date" type="date" value="${esc(meta.date || new Date().toISOString().slice(0, 10))}" />
          </label>
        </div>
        <label>Location / platform
          <input id="f-loc" type="text" value="${esc(meta.location || '')}" placeholder="e.g. Community clubhouse, or Zoom" />
        </label>
        <label>Secretary (recording the minutes)
          <input id="f-sec" type="text" value="${esc(meta.secretaryName || settings.secretaryName)}" placeholder="Name of the recording secretary" />
        </label>
      </div>

      ${
        demo
          ? `<div class="card form-card"><h3>Recording</h3>
             <p class="muted">Using the pre-transcribed sample recording for this demo meeting.</p></div>`
          : `
      <div class="card form-card">
        <h3>Recording</h3>
        <label class="file-drop">
          <input id="f-media" type="file" accept="audio/*,video/*" hidden />
          <span>🎙 Upload the meeting recording (audio or video)</span>
        </label>
        <p class="or">— or —</p>
        <label class="file-drop">
          <input id="f-transcript" type="file" accept=".txt,.vtt,.srt" hidden />
          <span>📄 Upload a transcript file (.txt, .vtt, .srt) from your transcription tool</span>
        </label>
        <p class="muted small">Plain-text transcripts should have one line per speaker turn:
        <code>[00:01:23] Jane Doe: text…</code> (timestamp optional).</p>
        <p id="file-status" class="file-status"></p>
      </div>`
      }

      <div class="card consent-card">
        <h3>Recording consent</h3>
        <p>Recording a meeting may require attendee notification or consent depending on your
           state and your organization's public-record obligations. MinuteMaker cannot verify
           this for you and does not provide legal advice.</p>
        <label class="consent-check">
          <input type="checkbox" id="f-consent" />
          <span>I confirm that attendees were notified this meeting was being recorded.</span>
        </label>
      </div>

      <div class="setup-actions">
        <button class="btn" id="btn-cancel">Cancel</button>
        <button class="btn primary big" id="btn-generate" disabled>Generate draft minutes</button>
      </div>
    </section>
  `);

  let transcriptText = demo ? demo.transcript : null;
  let transcriptName = demo ? demo.id + '.txt' : null;

  const consent = document.getElementById('f-consent');
  const genBtn = document.getElementById('btn-generate');
  const updateGate = () => {
    // The consent confirmation is a hard gate: unchecked by default, required, no bypass.
    genBtn.disabled = !(consent.checked && transcriptText);
    genBtn.title = !consent.checked
      ? 'Confirm recording notification first'
      : !transcriptText
        ? 'Add a recording or transcript first'
        : '';
  };
  consent.addEventListener('change', updateGate);
  updateGate();

  document.getElementById('btn-cancel').onclick = renderHome;

  if (!demo) {
    const status = document.getElementById('file-status');
    document.getElementById('f-media').addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      status.className = 'file-status error';
      try {
        await transcribeMedia(file);
      } catch (err) {
        status.textContent = `“${file.name}”: ${err.message}`;
      }
      updateGate();
    });
    document.getElementById('f-transcript').addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        transcriptText = reader.result;
        transcriptName = file.name;
        status.className = 'file-status ok';
        status.textContent = `✓ Loaded transcript: ${file.name}`;
        updateGate();
      };
      reader.readAsText(file);
    });
  }

  genBtn.onclick = () => {
    const meta2 = {
      orgName: document.getElementById('f-org').value.trim(),
      bodyName: settings.bodyName,
      meetingType: document.getElementById('f-type').value,
      date: document.getElementById('f-date').value,
      location: document.getElementById('f-loc').value.trim(),
      secretaryName: document.getElementById('f-sec').value.trim(),
    };
    runPipeline(transcriptName, transcriptText, meta2);
  };
}

// ---------- processing ----------

async function runPipeline(filename, transcriptText, meta) {
  const steps = ['Parsing diarized transcript', 'Extracting motions, votes & attendance', 'Distilling discussion summaries', 'Formatting Robert’s Rules minutes'];
  h(`
    <section class="screen narrow processing">
      <h1>Generating draft minutes…</h1>
      <ul class="steps">${steps.map((s, i) => `<li id="step-${i}">${s}</li>`).join('')}</ul>
    </section>
  `);

  const tick = (i) => new Promise((r) => setTimeout(() => {
    document.getElementById(`step-${i}`)?.classList.add('done');
    r();
  }, 350));

  try {
    const lines = parseTranscriptFile(filename || 'transcript.txt', transcriptText);
    await tick(0);
    if (!lines.some((l) => l.speaker)) {
      throw new Error('No speaker-labeled lines found. Expected lines like “Jane Doe: …”.');
    }
    const extracted = extractMinutes(lines, meta, settings);
    await tick(1);
    await tick(2);
    const minutesHtml = generateMinutesHtml(extracted, settings);
    await tick(3);

    const meeting = {
      id: newId(),
      createdAt: new Date().toISOString(),
      meta,
      transcriptLines: lines,
      extracted,
      minutesHtml, // secretary edits live here after review
    };
    saveMeeting(meeting);
    renderReview(meeting.id);
  } catch (err) {
    h(`
      <section class="screen narrow">
        <h1>Couldn’t process that recording</h1>
        <div class="card error-card"><p>${esc(err.message)}</p></div>
        <button class="btn" id="btn-back">← Back</button>
      </section>
    `);
    document.getElementById('btn-back').onclick = () => renderSetup();
  }
}

// ---------- review & edit ----------

function renderReview(id) {
  const meeting = getMeeting(id);
  if (!meeting) return renderHome();
  const ex = meeting.extracted;
  const stats = [
    `${ex.items.length} agenda item${ex.items.length === 1 ? '' : 's'}`,
    `${countMotions(ex)} motion${countMotions(ex) === 1 ? '' : 's'}`,
    `${ex.actionItems.length} action item${ex.actionItems.length === 1 ? '' : 's'}`,
    `${ex.attendance.present.length} present / ${ex.attendance.absent.length} absent`,
  ];

  h(`
    <section class="screen review">
      <div class="review-toolbar">
        <button class="btn" id="btn-home">← Meetings</button>
        <div class="stats">${stats.map((s) => `<span class="chip">${esc(s)}</span>`).join('')}</div>
        <div class="toolbar-actions">
          <button class="btn" id="btn-word">Export Word</button>
          <button class="btn" id="btn-pdf">Export PDF</button>
        </div>
      </div>

      <p class="draft-note">✏️ This is a <strong>draft</strong> — click anywhere in the document to edit.
      Changes save automatically. Anything flagged <span class="needs-review">[in red]</span> needs your review.</p>

      <article class="minutes-doc" id="minutes-doc" contenteditable="true" spellcheck="true">
        ${meeting.minutesHtml}
      </article>

      <details class="transcript-ref">
        <summary>Raw transcript (reference only — not part of the minutes)</summary>
        <div class="transcript-lines">
          ${meeting.transcriptLines
            .map((l) => `<p>${l.speaker ? `<strong>${esc(l.speaker)}:</strong> ` : ''}${esc(l.text)}</p>`)
            .join('')}
        </div>
      </details>
    </section>
  `);

  document.getElementById('btn-home').onclick = renderHome;

  const doc = document.getElementById('minutes-doc');
  let saveTimer;
  doc.addEventListener('input', () => {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      meeting.minutesHtml = doc.innerHTML;
      saveMeeting(meeting);
    }, 600);
  });

  const filename = exportFilename(meeting);
  document.getElementById('btn-word').onclick = () => exportWord(doc.innerHTML, filename, settings);
  document.getElementById('btn-pdf').onclick = () => exportPdf(doc.innerHTML, filename, settings);
}

function countMotions(ex) {
  return ex.items.reduce((n, it) => n + it.motions.length, 0) + (ex.priorMinutes ? 1 : 0) + (ex.adjournMotion ? 1 : 0);
}

function exportFilename(meeting) {
  const org = (meeting.meta.orgName || 'minutes').replace(/[^\w]+/g, '-').replace(/^-|-$/g, '');
  return `${org}-minutes-${meeting.meta.date || 'draft'}`;
}

// ---------- settings ----------

function renderSettings() {
  h(`
    <section class="screen narrow">
      <h1>Organization Settings</h1>
      <div class="card form-card">
        <label>Organization name
          <input id="s-org" type="text" value="${esc(settings.orgName)}" />
        </label>
        <label>Governing body name
          <input id="s-body" type="text" value="${esc(settings.bodyName)}" placeholder="Board of Directors" />
        </label>
        <label>Default secretary
          <input id="s-sec" type="text" value="${esc(settings.secretaryName)}" />
        </label>
      </div>

      <div class="card form-card">
        <h3>Minutes style <span class="muted small">(board norms differ — these are settings, not rules)</span></h3>
        <label class="consent-check">
          <input type="checkbox" id="s-dissent" ${settings.nameDissent ? 'checked' : ''} />
          <span>Record dissenting and abstaining members by name</span>
        </label>
        <label>Vote display
          <select id="s-votes">
            <option value="auto" ${settings.voteDisplay === 'auto' ? 'selected' : ''}>“Carried unanimously” when applicable</option>
            <option value="counts" ${settings.voteDisplay === 'counts' ? 'selected' : ''}>Always show vote counts</option>
          </select>
        </label>
      </div>

      <div class="card form-card">
        <h3>Plan</h3>
        <p class="muted">You're on the <strong>Free</strong> plan: single organization, watermarked exports.
        Paid plans add unlimited meetings, multiple boards, and template customization.</p>
      </div>

      <div class="setup-actions">
        <button class="btn" id="s-cancel">Cancel</button>
        <button class="btn primary" id="s-save">Save settings</button>
      </div>
    </section>
  `);

  document.getElementById('s-cancel').onclick = renderHome;
  document.getElementById('s-save').onclick = () => {
    settings = {
      ...settings,
      orgName: document.getElementById('s-org').value.trim(),
      bodyName: document.getElementById('s-body').value.trim() || 'Board of Directors',
      secretaryName: document.getElementById('s-sec').value.trim(),
      nameDissent: document.getElementById('s-dissent').checked,
      voteDisplay: document.getElementById('s-votes').value,
    };
    saveSettings(settings);
    renderHome();
  };
}

// ---------- boot ----------

document.getElementById('nav-home').onclick = renderHome;
document.getElementById('brand-home').onclick = renderHome;
document.getElementById('nav-settings').onclick = renderSettings;
renderHome();
