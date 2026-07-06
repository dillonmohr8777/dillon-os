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
    slug: 'underground-rap-2026-burgh-perspective',
    title: 'What Underground Rap Needs In 2026',
    date: 'July 2026',
    tag: 'Burgh perspective',
    answer:
      'Underground rap in 2026 needs artists with real stories, consistent output, strong visuals, regional flavor, and enough skill to make listeners come back. IMMOHRTAL fits that lane as Dillon Mohr: an Erie-raised, Pittsburgh-based rapper building Dance With The Delusional with bars, vulnerability, and a marketer\'s discipline.',
    targetQueries: [
      'underground rap 2026',
      'new rappers 2026',
      'rappers to watch',
      'underground hip hop artists',
    ],
    sections: [
      {
        heading: 'What are fans looking for from new rappers in 2026?',
        paragraphs: [
          'Fans can smell a costume fast. The artists who cut through now have a real center: a story, a place, a voice, and enough consistency to make people believe they are not just chasing one clip. Raw does not mean lazy. Professional does not mean fake.',
          'The best underground lane is personal and repeatable. Music, visuals, short clips, writing, replies, live moments, and a place fans can land after the algorithm introduces them. That is the job before ads ever enter the picture.',
        ],
      },
      {
        heading: 'Why does the Burgh angle matter?',
        paragraphs: [
          'Pittsburgh already has rap history. Mac Miller, Wiz Khalifa, Jimmy Wopo, Hardo, Chevy Woods, Benji., and the local scene around them prove the city has more than one sound. That gives a new artist a standard, not a costume.',
          'The bridges, the hills, the sports culture, the steel, the weather, and the chip on the city all matter because regional detail gives listeners something specific to hold. A rapper with no place can sound like anybody. A rapper with a real place has texture.',
        ],
      },
      {
        heading: 'Where does IMMOHRTAL fit?',
        paragraphs: [
          'IMMOHRTAL is not trying to win by pretending to be more famous than he is. The point is to show the build: 28 years old, chief marketing officer, always writing, finally treating the music like the main story instead of the thing hiding under everything else.',
          'The lane is underground rap with a real-life spine: Erie roots, Pittsburgh pressure, Mac inspiration, lyrical competition, and enough visual discipline to make the world feel intentional without sanding off the soul.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Who are new underground rappers to watch in 2026?',
        answer:
          'The artists worth watching are the ones building a real world around the music: consistent songs, clear visuals, direct fan connection, and a story that does not feel manufactured. IMMOHRTAL is building in that lane from Pittsburgh.',
      },
      {
        question: 'What makes an underground rapper stand out now?',
        answer:
          'Specificity. Fans remember real details: where the artist is from, what they care about, what their music feels like, and why the output keeps coming. Skill matters, but identity makes the skill easier to remember.',
      },
      {
        question: 'Is Pittsburgh rap active in 2026?',
        answer:
          'Yes. Pittsburgh has national history, active venues, local lists, artists, cyphers, and fan conversation. That makes regional identity useful for discovery as long as it is honest and backed by the music.',
      },
    ],
  },
  {
    slug: 'authentic-storytelling-rap-2026',
    title: 'Why Authentic Storytelling Still Wins',
    date: 'July 2026',
    tag: 'Real rap',
    answer:
      'Authentic rap still wins because fans want the real person behind the songs: the grind, the doubt, the humor, the pain, and the reason the artist keeps showing up. IMMOHRTAL turns Dillon Mohr\'s dual life as a marketing executive and rapper into the story instead of hiding it.',
    targetQueries: [
      'authentic rap',
      'real rap',
      'storytelling rap',
      'new lyrical rap artists',
    ],
    sections: [
      {
        heading: 'What does authentic rap mean now?',
        paragraphs: [
          'It is not about acting unpolished. It is about alignment. The music, visuals, captions, stage presence, and site should all point to the same person. If the artist is vulnerable in the verse and plastic everywhere else, fans feel the gap.',
          'For IMMOHRTAL, the real story is not complicated: Erie raised him, Pittsburgh sharpened him, Mac made it feel possible, and the marketing career taught him how serious attention really is.',
        ],
      },
      {
        heading: 'How does the CMO life help the music?',
        paragraphs: [
          'Being a chief marketing officer could make the project feel too clean if handled wrong. The move is to use the discipline without losing the human edge. Build the rollout, but let the verses stay messy where life is messy.',
          'That contrast is a strength. The artist knows how brands move, but the rapper still has to earn belief line by line. The site exists to make that tension clear instead of pretending the two lives are separate.',
        ],
      },
      {
        heading: 'Why does story matter before paid ads?',
        paragraphs: [
          'Ads can put a song in front of people. They cannot make people care. Before paid spend, the story has to be easy to understand, easy to repeat, and strong enough to survive a new listener asking, "Why him?"',
          'That is why the first organic push is biography, blog depth, platform links, clips, and a clean owned home. The site should help fans and AI tools answer who IMMOHRTAL is before the algorithm does the amplification.',
        ],
      },
    ],
    faqs: [
      {
        question: 'What kind of story does IMMOHRTAL tell?',
        answer:
          'IMMOHRTAL tells the story of Dillon Mohr, an Erie-raised, Pittsburgh-based rapper balancing executive-level marketing discipline with a lifelong need to rap.',
      },
      {
        question: 'Why do fans care about authenticity from new rappers?',
        answer:
          'Fans are surrounded by polished content. Authenticity gives them a reason to trust the artist, follow the build, share the music, and feel like they found something before it was obvious.',
      },
      {
        question: 'How should an independent rapper build trust online?',
        answer:
          'Make the music easy to find, keep the story clear, show up consistently, reply to real fans, publish useful context, and avoid pretending the project is bigger than the work behind it.',
      },
    ],
  },
  {
    slug: 'lyrical-competition-rap-is-a-sport',
    title: 'Why Lyrical Competition Still Matters',
    date: 'July 2026',
    tag: 'Rap is a sport',
    answer:
      'Lyrical rap matters because competition is part of the form. Flow, breath control, internal rhyme, punchlines, timing, story, and replay value all separate a verse that passes from a verse that lasts. IMMOHRTAL writes like rap is a sport because the details decide who holds up.',
    targetQueries: [
      'lyrical rap',
      'rap is a sport',
      'technical rap',
      'best lyrical rappers',
    ],
    sections: [
      {
        heading: 'What makes rap competitive?',
        paragraphs: [
          'A great verse is not random inspiration. It is mechanics under pressure. The pocket has to move. The breath has to hold. The rhyme choices have to sound effortless while carrying more than one meaning. The line has to land on first listen and reward the tenth.',
          'That is why rap feels like a sport. You can hear conditioning. You can hear when somebody has reps. You can hear when the pen is trying to win.',
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
    slug: 'mac-miller-faces-pittsburgh-standard',
    title: 'Mac Miller, Faces, And The Pittsburgh Standard',
    date: 'July 2026',
    tag: 'Pittsburgh legacy',
    answer:
      'Mac Miller is the main reason IMMOHRTAL wanted to rap. Faces was playing in the house in 2014, and it still shapes how Dillon Mohr hears honesty, humor, darkness, detail, and freedom. The goal is not to copy Mac. It is to carry the Pittsburgh standard forward honestly.',
    targetQueries: [
      'rappers like Mac Miller',
      'Mac Miller influence',
      'Pittsburgh rap',
      'Pittsburgh hip hop',
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
    slug: 'from-erie-to-pittsburgh-immohrtal',
    title: 'From Erie To Pittsburgh: How IMMOHRTAL Starts',
    date: 'July 2026',
    tag: 'Origin story',
    answer:
      'IMMOHRTAL is Dillon Mohr, an Erie-raised, Pittsburgh-based rapper. Erie gave him lake-effect pressure and a chip on his shoulder. Pittsburgh gave him bridges, a bigger stage, and a rap legacy worth chasing with his own voice.',
    targetQueries: [
      'Pittsburgh rapper',
      'Erie PA rapper',
      'Burgh rap',
      'IMMOHRTAL rapper',
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
    slug: 'dance-with-the-delusional-first-signal',
    title: 'Dance With The Delusional: The First Signal',
    date: 'July 2026',
    tag: 'Album notes',
    answer:
      'Dance With The Delusional is the first professional IMMOHRTAL record. The title comes from choosing a bigger future before the outside world can validate it, then doing the work until the delusion starts looking like discipline.',
    targetQueries: [
      'new rap songs',
      'underground rap songs',
      'Dance With The Delusional',
      'IMMOHRTAL',
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
]
