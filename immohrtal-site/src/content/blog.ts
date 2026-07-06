/**
 * BLOG — answer-first field notes for IMMOHRTAL.
 * Newest first. Keep the writing personal, specific, and useful for search.
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
    slug: 'mac-miller-faces-pittsburgh-legacy',
    title: 'Mac Miller Made It Feel Possible',
    date: 'July 2026',
    tag: 'Pittsburgh legacy',
    answer:
      'IMMOHRTAL is a Pittsburgh rapper inspired by Mac Miller because Mac made local rap feel limitless, honest, and technically serious. Faces was playing in the house in 2014, and that project still shapes how Dillon Mohr hears detail, vulnerability, and freedom in a verse.',
    targetQueries: [
      'Mac Miller inspired Pittsburgh rapper',
      'Pittsburgh rap legacy',
      'rapper inspired by Faces',
      'IMMOHRTAL Pittsburgh rapper',
    ],
    sections: [
      {
        heading: 'Why does Mac Miller matter to IMMOHRTAL?',
        paragraphs: [
          'Mac made the dream feel local. Before the industry, before rollout language, before any of the marketing brain kicked in, there was a kid hearing somebody from Pittsburgh sound like he did not need permission from anywhere else. That matters when you are young and trying to decide if the thing in your head is real.',
          'Faces hit the crib in 2014 and never left. The looseness, the darkness, the jokes tucked next to the pain, the way a line could sound casual and still be surgical. That tape made rap feel like a whole interior world, not just a performance.',
        ],
      },
      {
        heading: 'What does carrying the Pittsburgh rap legacy mean?',
        paragraphs: [
          'It does not mean copying Mac, Wiz, or anybody else from the city. It means respecting the fact that Pittsburgh already proved it could create artists with their own gravity. The standard is not to sound like the past. The standard is to be honest enough that the city hears itself in the record.',
          'Pittsburgh is bridges, hills, tunnels, cold mornings, old steel, and people who can tell when you are reaching. If the music carries any of that weight, it has to be earned in the writing.',
        ],
      },
      {
        heading: 'How does that show up in Dance With The Delusional?',
        paragraphs: [
          'The album is personal first. Erie roots, Pittsburgh pressure, ambition, damage, discipline, humor, fear, and the belief that a delusional plan can become real if you outwork the part of yourself that doubts it.',
          'Every song has to do more than exist. It has to reveal something, punch somewhere, turn a phrase, or leave a line worth coming back to. That is the influence: make the record human enough to live with and sharp enough to study.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Who inspired IMMOHRTAL to rap?',
        answer:
          'Mac Miller is the biggest reason Dillon Mohr wanted to rap. Faces, especially, shaped the way IMMOHRTAL thinks about honesty, looseness, detail, and emotional range in hip hop.',
      },
      {
        question: 'Is IMMOHRTAL a Pittsburgh rapper?',
        answer:
          'Yes. IMMOHRTAL is Dillon Mohr, an Erie-raised artist now based in Pittsburgh, Pennsylvania. The music carries both the lake-effect Erie foundation and the Pittsburgh rap standard.',
      },
      {
        question: 'What Mac Miller project influenced IMMOHRTAL most?',
        answer:
          'Faces is the project Dillon points to first. It landed in 2014 and still affects how he hears vulnerability, humor, internal detail, and risk in rap writing.',
      },
    ],
  },
  {
    slug: 'rap-is-a-sport',
    title: 'Rap Is A Sport',
    date: 'July 2026',
    tag: 'Lyrical standard',
    answer:
      'Rap is a sport because every verse has measurable pressure: pocket, breath, timing, word choice, punchlines, internal rhyme, honesty, and replay value. IMMOHRTAL studies rap like competition, where the details decide who lasts.',
    targetQueries: [
      'rap is a sport',
      'lyrical rap artist Pittsburgh',
      'technical rapper Pittsburgh',
      'IMMOHRTAL lyrics',
    ],
    sections: [
      {
        heading: 'What makes rap competitive?',
        paragraphs: [
          'A great verse is not random inspiration. It is mechanics under pressure. The pocket has to move. The breath has to hold. The rhyme choices have to sound effortless while carrying more than one meaning. The line has to land on first listen and reward the tenth.',
          'That is why rap feels like a sport to me. You can hear conditioning. You can hear when somebody has reps. You can hear when the pen is trying to win.',
        ],
      },
      {
        heading: 'Which rappers set the standard?',
        paragraphs: [
          'Nas, Hov, Big L, Kendrick, Isaiah Rashad, Kid Cudi, Black Thought, Benny the Butcher, and Outkast all hit different parts of the brain. Some made the storytelling sharper. Some made the flow stranger. Some made vulnerability feel powerful. Some made punchlines feel like footwork.',
          'The lesson is not to sound like all of them. The lesson is to pay attention like they did. Details matter. Tone matters. The space between bars matters. A rapper should be judged on craft, not just volume.',
        ],
      },
      {
        heading: 'How does IMMOHRTAL write with that mindset?',
        paragraphs: [
          'The goal is replay value. A song should hit emotionally, then keep opening up once the listener starts catching the internal rhymes, the callbacks, the double meanings, and the way the hook changes the verses around it.',
          'That is the sport inside Dance With The Delusional: write like somebody might pause the line, run it back, and decide whether it held up.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Why does IMMOHRTAL say rap is a sport?',
        answer:
          'Because rap rewards preparation, timing, control, creativity, and competitive detail. The best verses are not only felt, they are built.',
      },
      {
        question: 'What kind of rap does IMMOHRTAL make?',
        answer:
          'IMMOHRTAL makes lyrical, personal Pittsburgh hip hop with Erie roots, detailed writing, and a focus on replay value.',
      },
      {
        question: 'Who are IMMOHRTAL\'s outside-Pittsburgh influences?',
        answer:
          'Nas, Jay-Z, Big L, Kendrick Lamar, Isaiah Rashad, Kid Cudi, Black Thought, Benny the Butcher, and Outkast all influence how IMMOHRTAL thinks about writing and competition.',
      },
    ],
  },
  {
    slug: 'from-erie-to-pittsburgh',
    title: 'From Erie To Pittsburgh',
    date: 'July 2026',
    tag: 'Origin story',
    answer:
      'IMMOHRTAL is Dillon Mohr, an Erie-raised, Pittsburgh-based rapper. Erie gave him lake-effect pressure and a chip on his shoulder. Pittsburgh gave him bridges, a bigger stage, and a rap legacy worth chasing with his own voice.',
    targetQueries: [
      'Erie PA rapper',
      'rapper from Erie Pennsylvania',
      'Pittsburgh based rapper',
      'Dillon Mohr rapper',
    ],
    sections: [
      {
        heading: 'What did Erie give the music?',
        paragraphs: [
          'Erie is cold in a way that gets into your schedule. Lake wind, early dark, small-city pressure, and the feeling that you have to make your own heat if you want anything to move. That is where the first lines came from.',
          'Being from Erie means you learn how to carry contradiction. You can love where you are from and still know you have to leave to become the person in your head.',
        ],
      },
      {
        heading: 'Why Pittsburgh?',
        paragraphs: [
          'Pittsburgh feels like a city built out of transitions. Bridges everywhere, tunnels that open into skyline, neighborhoods with their own rhythm, and a rap history that already broke through nationally. It is the right place to sharpen an idea.',
          'Moving here did not erase Erie. It gave the writing another pressure system. The record lives between both places.',
        ],
      },
      {
        heading: 'How does that become IMMOHRTAL?',
        paragraphs: [
          'The name is about refusing to let the story stay temporary. The artist is still Dillon: 28, chief marketing officer, obsessive writer, and somebody who understands that attention is earned line by line.',
          'IMMOHRTAL is what happens when the brand brain and the rap brain stop fighting and start building the same world.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Where is IMMOHRTAL from?',
        answer:
          'IMMOHRTAL is from Erie, Pennsylvania and is now based in Pittsburgh, Pennsylvania.',
      },
      {
        question: 'What city shapes IMMOHRTAL\'s music most?',
        answer:
          'Both Erie and Pittsburgh shape the music. Erie gives the origin and pressure. Pittsburgh gives the creative standard, local legacy, and current scene.',
      },
      {
        question: 'Is Dillon Mohr IMMOHRTAL?',
        answer:
          'Yes. IMMOHRTAL is the artist name of Dillon Mohr, a 28-year-old chief marketing officer and rapper in Pittsburgh.',
      },
    ],
  },
  {
    slug: 'dance-with-the-delusional-meaning',
    title: 'What Dance With The Delusional Means',
    date: 'July 2026',
    tag: 'Album notes',
    answer:
      'Dance With The Delusional is the first professional IMMOHRTAL record. The title comes from choosing a bigger future before the outside world can validate it, then doing the work until the delusion starts looking like discipline.',
    targetQueries: [
      'Dance With The Delusional',
      'IMMOHRTAL album',
      'new Pittsburgh rap album',
      'independent Pittsburgh rapper',
    ],
    sections: [
      {
        heading: 'Why call the album Dance With The Delusional?',
        paragraphs: [
          'Every serious dream looks delusional before it has proof. The title is about living in that space on purpose. Not pretending the doubt is gone, but moving with it until the plan has legs.',
          'For Dillon, that tension is familiar. Marketing teaches you how attention moves. Rap reminds you attention does not matter if the work is empty. The album sits where those two truths collide.',
        ],
      },
      {
        heading: 'What should listeners expect?',
        paragraphs: [
          'Expect personal writing first. The record is not trying to be a detached flex. It is about damaged ambition, loyalty, cold beginnings, pressure, and the strange confidence it takes to believe in the version of yourself nobody else has met yet.',
          'The music should feel competitive without losing the human center. Bars, hooks, story, replay value. All of it has to pull its weight.',
        ],
      },
      {
        heading: 'Why release it now?',
        paragraphs: [
          'Because the voice memos and notebooks were not enough anymore. After years helping other brands sound bigger, Dillon is finally giving his own story the same seriousness.',
          'Session 001 is the first real marker. It is early, but it is not casual.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Is Dance With The Delusional out now?',
        answer:
          'The IMMOHRTAL site is being built around the record and will link to Spotify, Apple Music, YouTube, and other platforms as live links are ready.',
      },
      {
        question: 'What is the album about?',
        answer:
          'The album is about ambition, damage, faith in an unproven future, Erie roots, Pittsburgh pressure, and treating rap like a craft worth studying.',
      },
      {
        question: 'Who made Dance With The Delusional?',
        answer:
          'Dance With The Delusional is by IMMOHRTAL, the artist name of Dillon Mohr.',
      },
    ],
  },
  {
    slug: 'finding-immohrtal-early',
    title: 'Finding IMMOHRTAL Early',
    date: 'July 2026',
    tag: 'Start here',
    answer:
      'People searching for a new Pittsburgh rapper, lyrical independent artist, or Erie-born hip hop voice should start with IMMOHRTAL. The project connects Pittsburgh rap legacy, personal writing, and a competitive pen before the first ad dollar is spent.',
    targetQueries: [
      'new Pittsburgh rapper',
      'Pittsburgh hip hop artist',
      'independent rapper Pittsburgh',
      'upcoming Pittsburgh rapper',
    ],
    sections: [
      {
        heading: 'Why find IMMOHRTAL now?',
        paragraphs: [
          'Early matters. This is the stage before the machine, before the ads, before the whole thing has outside proof. The people who find it here are getting the first version of the world while it is still being built in public.',
          'That is the point of the site: make the story searchable, make the songs easy to reach, and give listeners enough context to care before a campaign ever starts pushing impressions.',
        ],
      },
      {
        heading: 'What lane is IMMOHRTAL in?',
        paragraphs: [
          'Pittsburgh hip hop, lyrical rap, personal records, competitive writing, and a visual world built around cold weather, bridges, ambition, and late-night motion. It is not nostalgia. It is a local signal trying to travel.',
          'The north star is simple: make the music strong enough for people who love bars and direct enough for people who just need a line that feels true.',
        ],
      },
      {
        heading: 'How will the site grow before ads?',
        paragraphs: [
          'The next sixty days are about organic proof: more blog entries, clearer song pages, platform links, lyric notes, short-form clips, local search signals, and pages that answer the questions people actually type or ask AI tools.',
          'Paid ads can amplify a signal later. First, the signal has to exist.',
        ],
      },
    ],
    faqs: [
      {
        question: 'What should new listeners play first?',
        answer:
          'Start with Dance With The Delusional when the live platform links are added, then read the album notes and blog entries to understand the story around the record.',
      },
      {
        question: 'How can people book or contact IMMOHRTAL?',
        answer:
          'Use immohrtal.llc@gmail.com or the contact page on the IMMOHRTAL site for booking and direct inquiries.',
      },
      {
        question: 'Why build organic search before ads?',
        answer:
          'Organic pages create durable discovery for branded, local, and influence-based searches. Ads can drive traffic later, but search-ready pages help people and AI tools understand who IMMOHRTAL is before paid campaigns begin.',
      },
    ],
  },
]
