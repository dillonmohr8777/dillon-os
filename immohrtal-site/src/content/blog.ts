/**
 * BLOG — posts about Dillon's life, in his voice. Add a new post by
 * appending an object here; newest first. Everything is editable.
 */

export interface BlogPost {
  slug: string
  title: string
  date: string // display only
  tag: string
  paragraphs: string[]
}

export const posts: BlogPost[] = [
  {
    slug: 'land-of-the-snow',
    title: 'Land of the Snow',
    date: 'July 2026',
    tag: 'Where I come from',
    paragraphs: [
      'I am from Erie, Pennsylvania. If you know, you know. Lake wind that cuts through whatever you wear, snow that starts in November and forgets to leave, and a city small enough that everybody knows what you are doing and quick enough to tell you it will not work.',
      'Winters like that build a certain kind of person. You learn to make your own heat. You learn that nobody is coming to hand you a lane, so you draw one in your head and drive it like it is already paved. People around me had a word for that. Delusional. I heard it enough times that I stopped hearing it as an insult.',
      'So when I say I am from the land of the snow, so you know imma hold your hands if they cold, that is not a cute line. That is the whole ethic. Take care of your people. Stay warm by moving. And when the town gets too small for the plan, move to the city and do not look back.',
      'I moved to get out. I got no plans to be broke. The rest of it, the album, the name, all of it, starts right there.',
    ],
  },
  {
    slug: 'session-001',
    title: 'Session 001',
    date: 'July 2026',
    tag: 'Why the album, why now',
    paragraphs: [
      'I have spent about a decade telling other people\'s stories. Building brands, writing the words that make somebody else\'s thing sound like a movement. I got good at it. Good enough that it took me a long time to notice the one story I never gave that treatment to was mine.',
      'The bars were always there. In the margins of notebooks, in voice memos at red lights, in the hour after everybody else went to sleep. What I never did was treat them like they deserved a real session. A real mix. A real cover. A real release date. Dance With The Delusional is me finally doing this the way I do everything else I care about. Properly.',
      'I live in Pittsburgh now. This city already gave the world greats, and I think about that every time I write here. I am not trying to be the next anybody. I am trying to make something honest enough that the city would claim it.',
      'This is Session 001. First real record. There will be more posts here as it comes together. The studio nights, the doubts, the tracklist fights with myself. If you are reading this early, you are early. Remember that.',
    ],
  },
]
