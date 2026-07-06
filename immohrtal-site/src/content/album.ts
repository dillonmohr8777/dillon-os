/**
 * IMMOHRTAL site content config.
 * Edit this file when the real tracks, photos, links, or story details land.
 */

export const artist = {
  name: 'IMMOHRTAL',
  albumTitle: 'Dance With The Delusional',
  introQuoteLines: [
    "I'm from the land of the snow,",
    'so you know imma hold your hands if they cold,',
    "see I'm such a damaged soul so I moved to the city",
    'to get out and I got no plans to be broke',
  ],
  tagline: 'Underground rap from Pittsburgh. Erie raised him. The bars did the rest.',
  sessionTag: 'SESSION 001 // UNDERGROUND RAP FROM PITTSBURGH',
  releaseTag: 'OUT NOW ON ALL PLATFORMS',
  coverArt: null as string | null,
  logo: 'logo-web.jpg' as string | null,
  heroImage: null as string | null,
}

export interface Track {
  title: string
  note?: string
  src: string | null
  duration?: string
}

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
  href: string | null
}

export const platforms: Platform[] = [
  { id: 'spotify', label: 'Spotify', href: null },
  { id: 'apple', label: 'Apple Music', href: null },
  { id: 'youtube', label: 'YouTube', href: null },
  { id: 'soundcloud', label: 'SoundCloud', href: null },
  { id: 'presave', label: 'Pre-Save', href: null },
]

export const story = {
  heading: 'Carry It Forward',
  pullQuote:
    'Mac Miller made it feel possible to rap from Pittsburgh and still sound like yourself.',
  paragraphs: [
    'IMMOHRTAL is Dillon Mohr, a 28-year-old chief marketing officer and rapper. He spent years learning how to make other people sound bigger, sharper, and harder to ignore. Rap was always the thing underneath it. The notebooks, the voice memos, the late-night lines, the part that never left.',
    'He was raised in Erie, Pennsylvania, then moved to Pittsburgh carrying the city in his headphones before he ever carried it in his address. Pittsburgh rap already has giants. Mac Miller is the main reason Dillon wanted to rap at all. Faces hit the house in 2014 and never really left. Wiz showed the city could go worldwide. The bridges, the hills, the rivers, the steel, the weather, the work ethic, it all gets into the writing.',
    'Dance With The Delusional is the first professional IMMOHRTAL record. It is built from two lives meeting in one room: the marketer who understands attention and the rapper who still treats every verse like a sport. The goal is simple. Make something detailed enough for lyric people, human enough for Pittsburgh, and honest enough to stand beside the records that made him start.',
  ],
}

export const markings = [
  {
    numeral: 'I',
    label: 'Erie, PA',
    coord: '42.1292 N / 80.0851 W',
    line: 'Lake-effect winters, small-city pressure, first notebooks, first delusions.',
  },
  {
    numeral: 'II',
    label: 'Pittsburgh, PA',
    coord: '40.4406 N / 79.9959 W',
    line: 'Bridges, rivers, Mac, Wiz, steel, and the standard that made the dream feel local.',
  },
  {
    numeral: 'III',
    label: 'The Sport',
    coord: 'SESSION 001',
    line: 'Rap treated like competition: breath control, detail, swing, punches, and replay value.',
  },
]

export const pittsburghLegacy = [
  {
    label: 'Bridges',
    line: 'The city is built on crossings. The music should feel like one too.',
  },
  {
    label: 'The Point',
    line: 'Three rivers meeting in one place. Erie roots, Pittsburgh pressure, IMMOHRTAL voice.',
  },
  {
    label: 'Steel City',
    line: 'No fragile bars. Work them until they hold weight.',
  },
  {
    label: '412',
    line: 'A local signal first. The rest of the world can catch up.',
  },
]

export const socials = [
  { id: 'instagram', label: 'Instagram', handle: '@immohrtal', href: null as string | null },
  { id: 'tiktok', label: 'TikTok', handle: '@immohrtal', href: null as string | null },
  { id: 'x', label: 'X', handle: '@immohrtal', href: null as string | null },
  { id: 'youtube', label: 'YouTube', handle: '@immohrtal', href: null as string | null },
]

export const contact = {
  bookingEmail: 'immohrtal.llc@gmail.com',
  phone: '(814) 873-5333',
  phoneHref: 'tel:+18148735333',
}
