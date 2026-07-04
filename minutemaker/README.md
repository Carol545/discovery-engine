# MinuteMaker

AI meeting-minutes generator for nonprofit and HOA/condo boards. Not a transcription tool —
the entire value is the **distillation step**: turning a recording into the compressed,
formal record a board actually approves, per Robert's Rules of Order. What was **done**,
not what was **said**.

No build step, no dependencies. Vanilla JS (ES modules) + HTML/CSS, served as static files.

## Run it

```
python -m http.server 5173
```

Then open http://localhost:5173/minutemaker/ (from the repo root) or serve this folder directly.

## v1 flow

1. **New Meeting** — enter meeting details, upload a recording or a transcript file
   (.txt / .vtt / .srt)
2. **Consent gate** — processing is blocked until the organizer explicitly confirms
   attendees were notified of the recording (unchecked by default, no bypass)
3. **Pipeline** — transcript parse → structured extraction → formatted minutes
4. **Review** — the draft is fully editable in place (contenteditable, autosaves);
   the raw transcript is a collapsed reference panel, never the deliverable
5. **Export** — Word (.doc) or PDF (print dialog), watermarked on the Free plan

## Architecture (layers kept deliberately separate)

- [js/transcribe.js](js/transcribe.js) — transcription layer. Parses .txt/.vtt/.srt into
  normalized diarized lines. `transcribeMedia()` is the slot for a real speech-to-text
  provider (Whisper / AssemblyAI / Deepgram with diarization); it **refuses rather than
  fabricates** when no provider is configured.
- [js/extract.js](js/extract.js) — **the core IP**: the distillation pass. Rule-based
  extraction of attendance (present/absent/guests), chair, call-to-order/adjournment times,
  agenda segmentation, motions (mover/seconder/vote incl. "so moved" back-reference),
  vote results (unanimous / counts / named dissent & abstention), action items with owners
  and due dates, verbatim-on-request overrides, and 1–3 sentence discussion summaries in
  reported speech. An LLM-assisted pass would slot in per-function here with the same
  output shape.
- [js/generate.js](js/generate.js) — structured record → Robert's Rules document (passive
  voice, third person, motions/votes/action-items table, signature block).
- [js/export.js](js/export.js) — Word/PDF export, no dependencies.
- [js/store.js](js/store.js) — org settings + saved meetings in `localStorage`. Board norms
  (naming dissenters, vote display style) are **settings, not hardcoded branches**.
- [js/demoData.js](js/demoData.js) — two realistic sample meetings (HOA with a 4–1 dissent
  vote and a verbatim request; nonprofit with a conflict-of-interest abstention), written in
  the same plain-text format users upload, so they double as parser fixtures.

Never let "more detail" regress into transcript-style output — the transcript stays an
audit artifact behind a toggle.

## Not built (post-v1)

Live bot join (Zoom/Meet/Teams), board-platform integrations, org-level bylaws templates,
multi-meeting action-item carry-over tracking.
