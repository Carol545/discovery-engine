import { pick } from './prng.js';

// Templated metadata generation. This stands in for an LLM call in v1 — the
// interface (seed, rng) -> metadata is what a real prompt-based generator
// would slot into later. Scoped strictly to descriptive metadata; it never
// influences ranking.
const GENRE_DESCRIPTORS = {
  'Shoegaze': 'Wall-of-sound guitars smeared in reverb',
  'Post-Punk Revival': 'Angular guitars over a tense, motorik rhythm',
  'Neo-Soul': 'Warm chord voicings under a smoky, unhurried vocal',
  'Bedroom Pop': 'Lo-fi production wrapped around a diary-entry melody',
  'Ambient Techno': 'Looping textures built for staring at the ceiling',
  'Hyperpop': 'Pitched-up vocals over glitching, maximalist production',
  'Dream Pop': 'Floating synths with a vocal mixed halfway into the fog',
  'Alt-Country': 'Dusty acoustic guitar behind a road-worn vocal',
  'Lo-fi Hip Hop': 'Dusty drums and a sample looped just enough',
  'Drill': 'Sliding 808s under a menacing, half-sung flow',
  'Afrobeat Fusion': 'Polyrhythmic percussion under a sun-bright melody',
  'UK Garage Revival': 'Skippy 2-step drums and a chopped vocal hook',
  'Latin Trap': 'Reggaeton-adjacent bounce with a moody synth bed',
  'Jazz Rap': 'Live-feeling chords behind a conversational flow',
  'Pop': 'Radio-ready hooks built for the widest possible room',
};

const SIMILAR_ARTISTS = {
  'Shoegaze': ['My Bloody Valentine', 'Slowdive'],
  'Post-Punk Revival': ['Fontaines D.C.', 'IDLES'],
  'Neo-Soul': ['Erykah Badu', 'H.E.R.'],
  'Bedroom Pop': ['Clairo', 'beabadoobee'],
  'Ambient Techno': ['Burial', 'Jon Hopkins'],
  'Hyperpop': ['100 gecs', 'Charli XCX'],
  'Dream Pop': ['Beach House', 'Cocteau Twins'],
  'Alt-Country': ['Waxahatchee', 'Jason Isbell'],
  'Lo-fi Hip Hop': ['Nujabes', 'J Dilla'],
  'Drill': ['Pop Smoke', 'Central Cee'],
  'Afrobeat Fusion': ['Burna Boy', 'Tems'],
  'UK Garage Revival': ['Disclosure', 'DJ EZ'],
  'Latin Trap': ['Bad Bunny', 'Rauw Alejandro'],
  'Jazz Rap': ['Kendrick Lamar', 'A Tribe Called Quest'],
  'Pop': ['Dua Lipa', 'The Weeknd'],
};

const FINE_GENRES = {
  'Shoegaze': ['Nu-Gaze', 'Blackgaze-Adjacent', 'Ambient Shoegaze'],
  'Post-Punk Revival': ['Art-Punk', 'Deadpan Post-Punk', 'Dance-Punk'],
  'Neo-Soul': ['Alt-R&B', 'Jazz-Soul', 'Bedroom Soul'],
  'Bedroom Pop': ['Hypnagogic Pop', 'DIY Indie Pop', 'Slacker Pop'],
  'Ambient Techno': ['Dub Techno', 'Ambient Dub', 'Isolationist Techno'],
  'Hyperpop': ['Glitchcore', 'Digicore-Adjacent', 'Bubblegum Bass'],
  'Dream Pop': ['Ethereal Dream Pop', 'Nu-Gaze Pop', 'Slowcore-Adjacent'],
  'Alt-Country': ['Cosmic Americana', 'Roots Rock', 'Twang-Pop'],
  'Lo-fi Hip Hop': ['Boom Bap Revival', 'Jazzhop', 'Chillhop'],
  'Drill': ['UK Drill', 'Melodic Drill', 'Sample Drill'],
  'Afrobeat Fusion': ['Afro-Fusion', 'Alte', 'Afroswing'],
  'UK Garage Revival': ['2-Step Revival', 'Speed Garage', 'Bassline'],
  'Latin Trap': ['Trap Latino', 'Reggaeton-Trap', 'Neoperreo-Adjacent'],
  'Jazz Rap': ['Conscious Jazz Rap', 'Fusion Rap', 'Boom Bap Jazz'],
  'Pop': ['Arena Pop', 'Synth Pop', 'Adult Contemporary Pop'],
};

export function generateAiMeta(seed, rng) {
  const descriptor = GENRE_DESCRIPTORS[seed.genre] || 'Genre-bending production with a distinct voice';
  const [a, b] = SIMILAR_ARTISTS[seed.genre] || ['a mix of underground favorites', 'a few genre staples'];
  const fineGenre = pick(rng, FINE_GENRES[seed.genre] || [seed.genre]);
  const mood = seed.moodTags[0] || 'late-night';

  return {
    description: `${descriptor}, tuned for ${mood} moments.`,
    similarArtists: `Fans of ${a} and ${b} may enjoy this.`,
    fineGenre,
    moodTags: seed.moodTags,
  };
}
