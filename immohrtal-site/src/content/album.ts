/**
 * ─────────────────────────────────────────────────────────────
 *  IMMOHRTAL — SITE CONTENT CONFIG
 *  This is the ONE file to edit when the real assets land.
 *
 *  1. TRACKS — titles below are SUGGESTIONS ONLY (nothing is
 *     approved). Rename freely. When final MP3s are ready, drop
 *     them in  public/audio/  and point each track's `src` at
 *     the file (e.g. "/audio/01-signal.mp3"). A track with no
 *     src renders as a placeholder row (no play button error).
 *  2. STREAMING LINKS — replace the null hrefs with real URLs
 *     (Spotify artist/album link, DistroKid hyperfollow, etc.).
 *     A null href shows the platform as "SOON".
 *  3. SOCIALS / BOOKING — swap the placeholder handles + email.
 *  4. COVER ART — when final art exists, put it in  public/
 *     (e.g. /cover.jpg) and set `coverArt` below. Until then a
 *     generated placeholder cover renders.
 *  5. LOGO — public/logo.jpg is the exact IMMOHRTAL logo and is
 *     already wired into the hero, nav, and loader. Swap the file
 *     to update it everywhere at once.
 *  6. HERO PHOTO — when the artist shot is ready, drop it in
 *     public/ (e.g. /artist.jpg) and set `heroImage` below. It
 *     renders huge under the hero lockup, Mac Miller style, with
 *     the hover pop.
 * ─────────────────────────────────────────────────────────────
 */

export const artist = {
  name: 'IMMOHRTAL',
  albumTitle: 'Dance With The Delusional',
  tagline: 'A signal from somewhere too far gone to come back normal.',
  sessionTag: 'SESSION 001 // THE NEW ALBUM',
  releaseTag: 'OUT NOW ON ALL PLATFORMS', // or "PRE-SAVE. DROPS 00.00.26"
  coverArt: null as string | null, // e.g. "/cover.jpg" when final art is ready
  logo: '/logo.jpg' as string | null,
  heroImage: null as string | null, // e.g. "/artist.jpg" when the photo lands
}

export interface Track {
  title: string
  note?: string // small mono label shown under the title
  src: string | null // "/audio/01-signal.mp3" once real files exist
  duration?: string // display only, e.g. "3:12"
}

// SUGGESTED titles — edit freely, none are final.
export const tracks: Track[] = [
  { title: 'Signal', note: 'intro', src: null },
  { title: 'Dance With The Delusional', note: 'title track', src: null },
  { title: 'Chrome Heart', src: null },
  { title: 'Late Night Drive', src: null },
  { title: 'Pressure', src: null },
  { title: 'Loop', src: null },
  { title: 'Damaged Romance', src: null },
  { title: 'Exit Plan', src: null },
  { title: 'Switch Up', src: null },
  { title: 'Too Far Gone', note: 'outro', src: null },
]

export interface Platform {
  id: 'spotify' | 'apple' | 'youtube' | 'soundcloud' | 'presave'
  label: string
  href: string | null // real URL when available; null renders "SOON"
}

export const platforms: Platform[] = [
  { id: 'spotify', label: 'Spotify', href: null },
  { id: 'apple', label: 'Apple Music', href: null },
  { id: 'youtube', label: 'YouTube', href: null },
  { id: 'soundcloud', label: 'SoundCloud', href: null },
  { id: 'presave', label: 'Pre-Save', href: null }, // DistroKid hyperfollow link
]

export const story = {
  heading: 'The Delusion',
  pullQuote:
    'Everybody kept telling me to come back to earth. I built a better one.',
  paragraphs: [
    'IMMOHRTAL is Dillon Mohr. Raised in Erie, Pennsylvania, where the lake wind teaches you to make your own heat and nobody hands you anything. When a town feels small, you build a bigger world in your head and start living in it. People called that delusional. He kept the name.',
    'Now he lives in Pittsburgh, a city that already gave this music some of its greats. He is not here to imitate anybody. He is here to carry the thing forward the way this city expects it carried: no shortcuts, all heart, every bar earned.',
    'Dance With The Delusional is his first real professional album. Years of writing in the margins of everything else, finally pressed into one record. It moves like a night drive. Pressure in the low end, chrome on the surface, damaged romance, exit plans. This is not an apology record. Still moving. Still dancing. Too far gone to come back normal, and better for it.',
  ],
}

/**
 * THE THREE MARKINGS — the three marks the story stands on.
 * These are placeholder readings of Dillon's three markings; edit the
 * labels, coordinates, and lines to match the real ones.
 */
export const markings = [
  {
    numeral: 'I',
    label: 'Erie, PA',
    coord: '42.1292° N · 80.0851° W',
    line: 'Where the signal started. Lake wind, long winters, first delusions.',
  },
  {
    numeral: 'II',
    label: 'Pittsburgh, PA',
    coord: '40.4406° N · 79.9959° W',
    line: 'Where it lives now. Carrying what the greats left behind, not copying it.',
  },
  {
    numeral: 'III',
    label: 'The Record',
    coord: 'SESSION 001',
    line: 'The first real one. Everything before this was rehearsal.',
  },
]

export const socials = [
  { id: 'instagram', label: 'Instagram', handle: '@immohrtal', href: null as string | null },
  { id: 'tiktok', label: 'TikTok', handle: '@immohrtal', href: null as string | null },
  { id: 'x', label: 'X', handle: '@immohrtal', href: null as string | null },
  { id: 'youtube', label: 'YouTube', handle: '@immohrtal', href: null as string | null },
]

export const contact = {
  bookingEmail: 'booking@immohrtal.com', // placeholder — swap for the real inbox
  pressEmail: 'press@immohrtal.com',
}
