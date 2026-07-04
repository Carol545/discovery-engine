// Persistence layer: org settings + saved meetings, backed by localStorage.

const SETTINGS_KEY = 'mm.settings';
const MEETINGS_KEY = 'mm.meetings';

export const defaultSettings = {
  orgName: '',
  bodyName: 'Board of Directors',
  secretaryName: '',
  // Some boards want dissenting/abstaining members named in the minutes, others
  // explicitly do not — this is an org norm, so it is a setting, never hardcoded.
  nameDissent: true,
  // 'auto' = "carried unanimously" when applicable, counts otherwise; 'counts' = always show counts
  voteDisplay: 'auto',
  plan: 'free', // free plan watermarks exports
};

export function loadSettings() {
  try {
    return { ...defaultSettings, ...JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}') };
  } catch {
    return { ...defaultSettings };
  }
}

export function saveSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function loadMeetings() {
  try {
    return JSON.parse(localStorage.getItem(MEETINGS_KEY) || '[]');
  } catch {
    return [];
  }
}

export function saveMeeting(meeting) {
  const meetings = loadMeetings();
  const i = meetings.findIndex((m) => m.id === meeting.id);
  if (i >= 0) meetings[i] = meeting;
  else meetings.unshift(meeting);
  localStorage.setItem(MEETINGS_KEY, JSON.stringify(meetings));
}

export function getMeeting(id) {
  return loadMeetings().find((m) => m.id === id) || null;
}

export function deleteMeeting(id) {
  localStorage.setItem(MEETINGS_KEY, JSON.stringify(loadMeetings().filter((m) => m.id !== id)));
}

export function newId() {
  return 'mtg_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}
