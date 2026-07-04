// Transcription layer. Kept strictly separate from the extraction pass: this module's only
// job is to produce a normalized, speaker-diarized transcript:
//   [{ time: seconds|null, speaker: string|null, text: string }]
//
// Providers are swappable. This build ships with:
//   - transcript-file ingestion (.txt / .vtt / .srt) for recordings transcribed elsewhere
//   - demo recordings (see demoData.js)
//   - transcribeMedia(): the slot where a real speech-to-text provider plugs in
//
// transcribeMedia deliberately REFUSES rather than fabricating output — generating made-up
// minutes from a real recording would be worse than no minutes at all.

export async function transcribeMedia(_file) {
  throw new Error(
    'No speech-to-text provider is configured in this build. Wire one up here ' +
      '(e.g. OpenAI Whisper, AssemblyAI, or Deepgram with diarization enabled), or upload ' +
      'a transcript file (.txt, .vtt, .srt) exported from your transcription tool.'
  );
}

export function parseTranscriptFile(filename, content) {
  const ext = (filename.split('.').pop() || '').toLowerCase();
  if (ext === 'vtt') return parseVTT(content);
  if (ext === 'srt') return parseSRT(content);
  return parsePlainText(content);
}

// Plain text: optional [hh:mm:ss] timestamp, then "Speaker Name: text".
// Lines without a speaker prefix continue the previous utterance.
export function parsePlainText(content) {
  const lines = [];
  const LINE_RE = /^\s*(?:\[(\d{1,2}:\d{2}(?::\d{2})?)\]\s*)?([A-Z][\w.'’-]*(?:\s+[A-Z][\w.'’-]*){0,3}):\s*(.+)$/;
  for (const raw of content.split(/\r?\n/)) {
    if (!raw.trim()) continue;
    const m = raw.match(LINE_RE);
    if (m) {
      lines.push({ time: m[1] ? toSeconds(m[1]) : null, speaker: m[2].trim(), text: m[3].trim() });
    } else if (lines.length) {
      lines[lines.length - 1].text += ' ' + raw.trim();
    } else {
      lines.push({ time: null, speaker: null, text: raw.trim() });
    }
  }
  return lines;
}

// WebVTT: cues with "hh:mm:ss.mmm --> hh:mm:ss.mmm"; speaker via <v Name> tags or "Name: text".
export function parseVTT(content) {
  const lines = [];
  let cueTime = null;
  for (const raw of content.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || /^WEBVTT/i.test(line) || /^NOTE\b/.test(line) || /^\d+$/.test(line)) continue;
    const timing = line.match(/^(\d{1,2}:)?\d{1,2}:\d{2}[.,]\d{3}\s+-->/);
    if (timing) {
      cueTime = toSeconds(line.split(/\s+/)[0].replace(',', '.').replace(/\.\d+$/, ''));
      continue;
    }
    const voiced = line.match(/^<v\s+([^>]+)>\s*(.*?)(?:<\/v>)?$/i);
    if (voiced) {
      lines.push({ time: cueTime, speaker: voiced[1].trim(), text: voiced[2].trim() });
      continue;
    }
    const spoken = line.match(/^([A-Z][\w.'’-]*(?:\s+[A-Z][\w.'’-]*){0,3}):\s*(.+)$/);
    if (spoken) {
      lines.push({ time: cueTime, speaker: spoken[1].trim(), text: spoken[2].trim() });
    } else if (lines.length) {
      lines[lines.length - 1].text += ' ' + line;
    }
  }
  return mergeConsecutive(lines);
}

export function parseSRT(content) {
  // SRT is structurally VTT-like enough for this parser (numeric indexes and
  // comma-millisecond timings are both handled above).
  return parseVTT(content);
}

function mergeConsecutive(lines) {
  const out = [];
  for (const l of lines) {
    const prev = out[out.length - 1];
    if (prev && prev.speaker === l.speaker && l.time !== null && prev.time !== null && l.time - prev.time < 3) {
      prev.text += ' ' + l.text;
    } else {
      out.push(l);
    }
  }
  return out;
}

function toSeconds(stamp) {
  const parts = stamp.split(':').map(Number);
  if (parts.some(Number.isNaN)) return null;
  return parts.reduce((acc, p) => acc * 60 + p, 0);
}
