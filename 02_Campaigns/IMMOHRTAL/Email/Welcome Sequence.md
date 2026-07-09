# The List: Welcome Sequence

Three automated emails for everyone who signs up through the gate.
Written in Dillon's voice, no dashes, ready to paste into an ESP.

## ESP setup (do once, ~15 minutes)

1. **Pick the ESP.** Recommendation: **Brevo** free tier (300 sends/day,
   automation included, no card). Mailchimp free also works.
2. **Import the existing list.** Netlify → Forms → immohrtal-list →
   Export CSV → import into the ESP with a tag like `site-gate`.
3. **Build the automation.** Trigger: contact added. Email 1 instantly,
   Email 2 after 2 days, Email 3 after 5 days.
4. **Keep it in sync.** Weekly: export the Netlify CSV and re-import
   (duplicates are skipped automatically). Later, Claude can wire the
   gate to post directly to the ESP API so this step disappears.
5. Set the sender name to `Dillon // IMMOHRTAL` and the reply-to to
   immohrtal.llc@gmail.com, replies from fans are gold, read them.

---

## Email 1, send instantly
**Subject:** you're in. here's what nobody else has heard
**Preview text:** thirty seconds a track, before anybody else

Hey, it's Dillon.

You just joined the list, which means you get the stuff first. The
previews are open for you now, every track, right here:

[Hear the previews] → https://immohrtal-site.netlify.app/#listen

Quick version of who you just signed up with: I'm a chief marketing
officer from Erie, PA. I market other people's stuff all day. And I
made a rap album called Dance With The Delusional, because I'm almost
29 and if I don't do this now, when?

One ask. If one of those previews hits you, reply and tell me which
one. I read every reply. That's not a marketing line, there's just not
that many of you yet, and I like it that way.

If not now, when.
Dillon // IMMOHRTAL

## Email 2, send +2 days
**Subject:** the reason I rap at all
**Preview text:** Faces came out in 2014 and never left my house

It's Dillon again.

Short story. In 2014 Mac Miller put out Faces and it rearranged
something in me. A guy being completely honest about being a mess,
while rapping better than almost anybody. That album is the reason I
write. It gave me permission I didn't know I was waiting for.

I wrote the whole thing down if you want the long version:

[Why I rap] → https://immohrtal-site.netlify.app/blog/rappers-like-mac-miller.html

And there's an official video now, the first thirty seconds are open
to everybody but you've already got the whole thing:

[Watch Picking Up My Notepad] → https://immohrtal-site.netlify.app/video.html

More soon. The record is coming.
Dillon // IMMOHRTAL

## Email 3, send +5 days
**Subject:** what happens next
**Preview text:** the album, the plan, and one favor

Last one for now, then I'll leave you alone until there's real news.

The album is called Dance With The Delusional. Eleven tracks. My best
friend King Keev is on two of them. It's honest, it's lyrical, and it
was recorded after hours while the day job ran loud.

Here's the plan: singles first, then the record. Everybody on this
list hears everything before the public does. That's the whole deal.

The one favor: think of one person who was raised on Mac, or one
person from the 814 or Pittsburgh, and send them the site:

https://immohrtal-site.netlify.app

Word of mouth is the entire machine right now. You're early, and I
won't forget that.

If not now, when.
Dillon // IMMOHRTAL
