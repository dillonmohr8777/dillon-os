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
    'Dance With The Delusional is what happens when confidence stops asking permission. It was made late, after the calls stopped and the city went quiet, in the one honest hour nobody schedules.',
    'It moves like a night drive. Pressure in the low end, chrome on the surface, and something slightly off in the mix that you stop wanting to fix. Damaged romance. Exit plans. The version of you that survives by refusing to be reasonable.',
    'This is not an apology record. It is a status report from the far side of "you good?" Still moving. Still dancing. Too far gone to come back normal, and better for it.',
  ],
}

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
