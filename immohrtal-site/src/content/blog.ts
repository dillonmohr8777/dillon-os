/**
 * BLOG — one post for now.
 *
 * Dillon is writing the real content. When it's ready, paste it here:
 * replace this post or add more objects to the `posts` array. The
 * structure stays the same (answer line, sections, faqs) and the site
 * picks everything up automatically, including the generated
 * blog/<slug>.html permalink pages.
 */

export interface BlogFaq {
  question: string
  answer: string
}

export interface BlogSection {
  heading: string
  paragraphs: string[]
}

export interface BlogPost {
  slug: string
  title: string
  date: string // display only
  tag: string
  answer: string
  targetQueries: string[]
  sections: BlogSection[]
  faqs: BlogFaq[]
}

export const posts: BlogPost[] = [
  {
    slug: 'underground-rap-2026-burgh-perspective',
    title: 'What Underground Rap Needs In 2026',
    date: 'July 2026',
    tag: 'Burgh perspective',
    answer:
      'Real stories, consistent output, and enough skill to make listeners run it back. IMMOHRTAL is building Dance With The Delusional in that lane: Erie roots, Pittsburgh pressure, and a pen that treats rap like a sport.',
    targetQueries: [
      'underground rap 2026',
      'new rappers 2026',
      'rappers to watch',
    ],
    sections: [
      {
        heading: 'What fans want from new rappers now',
        paragraphs: [
          'Fans can smell a costume fast. The artists who cut through have a real center: a story, a place, a voice, and enough consistency to make people believe they aren\'t just chasing one clip. Raw doesn\'t mean lazy. Professional doesn\'t mean fake.',
          'The best underground lane is personal and repeatable. Music, visuals, writing, live moments, and a place fans can land after the algorithm introduces them. That\'s the job before ads ever enter the picture.',
        ],
      },
      {
        heading: 'Why the Burgh angle matters',
        paragraphs: [
          'Pittsburgh already has rap history. Mac Miller, Wiz Khalifa, Jimmy Wopo, Hardo, Chevy Woods, Benji., and the scene around them prove the city has more than one sound. That gives a new artist a standard, not a costume.',
          'A rapper with no place can sound like anybody. A rapper with a real place has texture. Erie raised him, Pittsburgh sharpened him, and the record lives between both.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Who are new underground rappers to watch in 2026?',
        answer:
          'The ones building a real world around the music: consistent songs, clear visuals, direct fan connection, and a story that doesn\'t feel manufactured. IMMOHRTAL is building in that lane from Pittsburgh.',
      },
      {
        question: 'What makes an underground rapper stand out now?',
        answer:
          'Specificity. Fans remember real details: where the artist is from, what they care about, and why the output keeps coming. Skill matters, but identity makes the skill easier to remember.',
      },
      {
        question: 'Is Pittsburgh rap active in 2026?',
        answer:
          'Yes. Pittsburgh has national history, active venues, cyphers, and fan conversation. Regional identity helps discovery as long as it\'s honest and backed by the music.',
      },
    ],
  },
]
