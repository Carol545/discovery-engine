// Seed roster: hand-authored fictional artists tagged with an archetype that
// drives how their mock signals get generated. "giant" entries exist to prove
// the underground bonus works (huge raw popularity, low Discovery Score).
export const PREVIEW_TRACKS = [
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
];

export const SEED_TRACKS = [
  { id: 'trk-001', artist: 'Marigold Static', title: 'Slow Bloom', genre: 'Shoegaze', region: 'UK', moodTags: ['hazy', 'late-night'], archetype: 'rocket' },
  { id: 'trk-002', artist: 'Concrete Orchard', title: 'Rebar', genre: 'Post-Punk Revival', region: 'US', moodTags: ['tense', 'driving'], archetype: 'rocket' },
  { id: 'trk-003', artist: 'Nilufer Anka', title: 'Copper Tongue', genre: 'Neo-Soul', region: 'Turkey', moodTags: ['sultry', 'late-night'], archetype: 'gem' },
  { id: 'trk-004', artist: 'Glass Ceiling Fan', title: 'Static Cling', genre: 'Bedroom Pop', region: 'US', moodTags: ['bittersweet', 'study'], archetype: 'gem' },
  { id: 'trk-005', artist: 'Kessho', title: 'Frostglass', genre: 'Ambient Techno', region: 'Japan', moodTags: ['meditative', 'driving'], archetype: 'radar' },
  { id: 'trk-006', artist: 'Dial Tone Prophet', title: 'Busy Signal', genre: 'Hyperpop', region: 'US', moodTags: ['manic', 'chaotic'], archetype: 'radar' },
  { id: 'trk-007', artist: 'Low Orbit Choir', title: 'Reentry', genre: 'Dream Pop', region: 'Canada', moodTags: ['floating', 'melancholic'], archetype: 'rocket' },
  { id: 'trk-008', artist: 'Ruthann Voss', title: 'Dust Ledger', genre: 'Alt-Country', region: 'US', moodTags: ['dusty', 'reflective'], archetype: 'gem' },
  { id: 'trk-009', artist: 'Paperweight King', title: 'Desk Drawer', genre: 'Lo-fi Hip Hop', region: 'US', moodTags: ['study', 'mellow'], archetype: 'radar' },
  { id: 'trk-010', artist: 'Vantablk', title: 'No Light Escapes', genre: 'Drill', region: 'UK', moodTags: ['menacing', 'driving'], archetype: 'rocket' },
  { id: 'trk-011', artist: 'Marta Lune', title: 'Perigee', genre: 'Dream Pop', region: 'France', moodTags: ['floating', 'late-night'], archetype: 'gem' },
  { id: 'trk-012', artist: 'Okoro Beach Club', title: 'Lagos Tide', genre: 'Afrobeat Fusion', region: 'Nigeria', moodTags: ['sunny', 'driving'], archetype: 'rocket' },
  { id: 'trk-013', artist: 'Felt Tip Ghost', title: 'Margin Notes', genre: 'Bedroom Pop', region: 'US', moodTags: ['bittersweet', 'study'], archetype: 'radar' },
  { id: 'trk-014', artist: 'Subsonic Choir', title: 'Basement Hymn', genre: 'Ambient Techno', region: 'Germany', moodTags: ['meditative', 'late-night'], archetype: 'gem' },
  { id: 'trk-015', artist: 'Twelve String Nun', title: 'Habit', genre: 'Alt-Country', region: 'US', moodTags: ['reflective', 'dusty'], archetype: 'radar' },
  { id: 'trk-016', artist: 'Yuzu Static', title: 'Vending Machine Love', genre: 'Bedroom Pop', region: 'Japan', moodTags: ['bittersweet', 'sunny'], archetype: 'rocket' },
  { id: 'trk-017', artist: 'Cassette Funeral', title: 'Rewind Only', genre: 'Shoegaze', region: 'US', moodTags: ['hazy', 'melancholic'], archetype: 'gem' },
  { id: 'trk-018', artist: 'Rani & The Ration', title: 'Curfew Riddim', genre: 'UK Garage Revival', region: 'UK', moodTags: ['driving', 'nocturnal'], archetype: 'rocket' },
  { id: 'trk-019', artist: 'Moth Motel', title: 'Porch Light', genre: 'Dream Pop', region: 'US', moodTags: ['floating', 'late-night'], archetype: 'radar' },
  { id: 'trk-020', artist: 'Dario Sombra', title: 'Andes Static', genre: 'Latin Trap', region: 'Chile', moodTags: ['driving', 'menacing'], archetype: 'gem' },
  { id: 'trk-021', artist: 'Kettle Logic', title: 'Boiling Point', genre: 'Jazz Rap', region: 'US', moodTags: ['clever', 'late-night'], archetype: 'rocket' },
  { id: 'trk-022', artist: 'Salt Circle', title: 'Ward Off', genre: 'Post-Punk Revival', region: 'Ireland', moodTags: ['tense', 'ritualistic'], archetype: 'radar' },
  { id: 'trk-023', artist: 'Honeywell Static', title: 'Thermostat', genre: 'Bedroom Pop', region: 'US', moodTags: ['cozy', 'bittersweet'], archetype: 'gem' },
  { id: 'trk-024', artist: 'Grim Almanac', title: 'Frost Warning', genre: 'Drill', region: 'UK', moodTags: ['menacing', 'driving'], archetype: 'radar' },
  { id: 'trk-025', artist: 'Reef Static', title: 'Coral Bleach', genre: 'Ambient Techno', region: 'Australia', moodTags: ['meditative', 'melancholic'], archetype: 'gem' },
  { id: 'trk-026', artist: 'Barrio Halo', title: 'Corner Store Saint', genre: 'Latin Trap', region: 'Mexico', moodTags: ['driving', 'sunny'], archetype: 'rocket' },
  { id: 'trk-027', artist: 'Milk Tooth', title: 'Baby Steps', genre: 'Hyperpop', region: 'US', moodTags: ['manic', 'chaotic'], archetype: 'gem' },
  { id: 'trk-028', artist: 'Overcast Radio', title: 'Static Forecast', genre: 'Lo-fi Hip Hop', region: 'US', moodTags: ['mellow', 'study'], archetype: 'radar' },
  { id: 'trk-029', artist: 'Nairobi Static', title: 'Matatu Line', genre: 'Afrobeat Fusion', region: 'Kenya', moodTags: ['sunny', 'driving'], archetype: 'rocket' },
  { id: 'trk-030', artist: 'Widow Signal', title: 'Last Frequency', genre: 'Neo-Soul', region: 'US', moodTags: ['sultry', 'melancholic'], archetype: 'radar' },
  { id: 'trk-031', artist: 'Halcyon Rex', title: 'Golden Hour Anthem', genre: 'Pop', region: 'US', moodTags: ['sunny', 'anthemic'], archetype: 'giant' },
  { id: 'trk-032', artist: 'Titan Frequency', title: 'Arena Static', genre: 'Pop', region: 'US', moodTags: ['anthemic', 'driving'], archetype: 'giant' },
  { id: 'trk-033', artist: 'Every Radio', title: 'Chartbreaker', genre: 'Pop', region: 'UK', moodTags: ['anthemic', 'sunny'], archetype: 'giant' },
];

export function previewUrlFor(id) {
  const idx = parseInt(id.replace(/\D/g, ''), 10) % PREVIEW_TRACKS.length;
  return PREVIEW_TRACKS[idx];
}
