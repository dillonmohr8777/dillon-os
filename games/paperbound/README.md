# PAPERBOUND — The Seven Seals of Foldheim

A papercraft turn-based RPG in the mould of the Paper Mario games. Eight chapters,
six partners, sixteen bosses, a twenty-rank battle ladder, and seven torn seals to
put back. Roughly **3–4 hours** for a first playthrough, longer with the side content.

Open `index.html` in any modern browser. No build step, no server, no dependencies.

```
open games/paperbound/index.html
```

---

## Controls

| Key | Field | Battle |
|---|---|---|
| Arrow keys / WASD | Walk. Up and down move you **into** the scene, not up the screen | Move the cursor |
| **Z** | Jump · talk · read · confirm | Confirm · action commands · **Guard** |
| **X** | Swing the mallet | Cancel · **Superguard** · **Stylish** finish |
| **C** | Partner's field ability | — |
| **V** | Fold (slip through cracks, press weight plates) | — |
| **Q / E** | Run | Page a long list |
| **Esc** | Satchel (items, badges, party, journal, options) | — |
| **Tab** | World map | — |

Gamepads work. On a touch device an on-screen pad appears automatically.

---

## What's in it

**Combat.** Every attack has an action command — nine different minigames (timed
press, charge-and-release, mash, multi-press rhythm, arrow sequence, aim, hold-steady,
crank). Land it for full damage, nail it perfectly and you get more, then tap **X** in
the flash window for a **Stylish** finish. On defence, **Z** just before impact Guards;
**X** even later **Superguards** for zero damage and a counter.

**Origami Forms.** The system this game adds on top of the formula. Folding costs FP up
front and reshapes the hero for several turns — a standing trade rather than a one-off
attack. Crane (evade + counter), Fortress (defence + thorns), Dart (pierce everything,
crumple easily), Lantern (party regen), Shear (every attack hits twice).

**The crowd.** An audience meter that grows on stylish play and perfect guards, throws
you items mid-fight, and can be stolen by a boss who plays to it better than you do.
Fill the **Encore** gauge and you unleash a duet finisher unique to your active partner.

**Progression.** Seal Points, levels spent on HP / FP / BP, 52 badges, 7 Seal Powers,
Foil Shards that rank partners up, a cooking system with 20 recipes, 16 side quests,
and three difficulty settings that scale both incoming damage and Seal Point income.

**Cast.** 44 rank-and-file enemies, 8 mini-bosses, 9 chapter bosses (each with scripted
HP-threshold phase changes), and 3 optional superbosses.

---

## No assets

Nothing in this directory is an image or an audio file. Every character is a small
config — colours, proportions, features — fed to a shared archetype renderer, so the
whole cast reads as one printed set. Every note is synthesised by a tracker at runtime.
The total download is the source.

---

## Layout

```
index.html            load order is the dependency order
css/game.css          the page is only a frame; everything visible is canvas
js/00_util.js         maths, RNG, easing, tweens, event bus
js/01_input.js        keyboard / gamepad / touch → six logical buttons
js/02_audio.js        WebAudio synth + a lookahead tracker
js/03_paper.js        the papercraft look: flat fills, ink outlines, torn edges
js/04_sprites.js      seven character archetypes + the feature kit
js/05_cast.js         the whole roster and every prop
js/06_items.js        items, recipes, procedural icons
js/07_badges.js       52 badges
js/08_moves.js        hero attacks, Forms, Seal Powers, partner abilities, duets
js/09_enemies.js      the bestiary, with per-foe move tables and boss phases
js/10_partners.js     six partners
js/11_state.js        the save object and every rule that touches it
js/12_actioncmd.js    the nine action-command minigames + Guard
js/13_ui.js           dialogue, menus, HUD, transitions
js/14_battle.js       the battle engine (generator-driven sequencing)
js/15_script.js       the cutscene interpreter
js/16_world.js        the 2.5D overworld
js/17_themes.js       procedural parallax backdrops
js/18_menus.js        pause book, shops, inn, cooking, saves, world map
js/19_songs.js        chiptune patterns
js/20_quests.js       side quests
js/21_maps_ch0.js     prologue + chapter 1 + the hub road  (reference format)
js/22_mapkit.js       authoring helpers for the chapter files
js/23_maps_ch23.js    chapters 2–3
js/24_maps_ch45.js    chapters 4–5
js/25_maps_ch678.js   chapters 6–8 and the ending
js/26_maps_extra.js   Coliseum ladder, the paper bin, the bound vault
js/30_game.js         boot, fixed-timestep loop, title screen
tools/validate.js     static content check — ids, exits, spawns, script commands
tools/smoke.js        drives the real game in headless Chromium
```

## Checks

```bash
cd games/paperbound

# static: every sprite/enemy/item/badge/theme id, every exit and spawn,
# every script command, across all 63 maps and all dynamic NPC branches
node tools/validate.js

# dynamic: boots the game, plays the prologue, fights a battle, opens every
# menu, renders all 63 maps, and fails on any console error
NODE_PATH=/path/to/node_modules node tools/smoke.js --shots ./shots
```

---

## A note on the look

The visual target is the Paper Mario house style — flat cut-out sprites with heavy ink
outlines, lifted drop shadows, a fibre texture over everything, characters that turn by
sweeping edge-on, and a battle stage dressed as a theatre with curtains, footlights and
a live audience. The hero is drawn to that silhouette (red cap, moustache, blue
dungarees, white gloves, brown boots) but he is an original character, as is the rest of
the cast — no Nintendo artwork or characters are reproduced here.
