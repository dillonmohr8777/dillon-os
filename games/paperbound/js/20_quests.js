/* ==========================================================================
   PAPERBOUND — 20_quests.js
   Side quests posted on the Quillton board and picked up around the world.
   The Journal reads name/desc from here; the actual logic lives in the NPC
   scripts that start and finish them.
   ========================================================================== */
'use strict';

PB.Quests = (function () {
  var db = {};
  function Q(id, name, desc, o) {
    db[id] = PB.U.extend({ id: id, name: name, desc: desc, chapter: 0, reward: '' }, o || {});
    return db[id];
  }

  Q('lost_acorns', 'The Lost Acorns', 'Twigby scattered five acorns across Creasewood on the way down. Find them all.', { chapter: 1, reward: 'Happy Heart badge' });
  Q('sign_painter', 'Sign of the Times', 'Quillton\'s signpainter needs three Pulp Berries for red ink.', { chapter: 0, reward: '30 coins' });
  Q('deckle_hammer', 'A Proper Hammer', 'Smith Deckle will reforge your mallet if you bring him foundry steel.', { chapter: 2, reward: 'Mallet upgrade' });
  Q('ferry_manifest', 'The Missing Manifest', 'Sailor Keel lost the harbour manifest somewhere in the Sunken Ream.', { chapter: 3, reward: 'Foil Shard' });
  Q('lost_ticket', 'One Ticket, Please', 'A carnival child dropped their ticket in the funhouse.', { chapter: 4, reward: 'Crowd Pleaser badge' });
  Q('overdue_books', 'Extremely Overdue', 'Archivist Marge wants four books returned. They have been out for a century.', { chapter: 5, reward: 'Deep Focus badge' });
  Q('summit_bell', 'The Summit Bell', 'Ring the three bells of the Frostfold passes in the right order.', { chapter: 6, reward: 'Foil Shard' });
  Q('scrap_run', 'Scrap Run', 'Volt wants six discarded cogs from the Foilworks floor.', { chapter: 7, reward: 'Volt rank up' });
  Q('lantern_oil', 'Keeping the Light', 'The Emberfold lamplighter is out of oil.', { chapter: 2, reward: 'Ember Shield badge' });
  Q('missing_courier', 'Return to Sender', 'A courier vanished on the Creasewood road. Find out what happened.', { chapter: 1, reward: 'Foil Shard' });
  Q('cook_recipes', 'A Full Cookbook', 'Discover fifteen of Chef Pulp\'s recipes.', { chapter: 2, reward: 'Sovereign Roast' });
  Q('tattle_all', 'The Complete Bestiary', 'Study every foe in Foldheim with Twigby.', { chapter: 1, reward: 'Peekaboo badge' });
  Q('coliseum_climb', 'Twenty Rounds', 'Take the Folded Coliseum from rank 20 to rank 1.', { chapter: 4, reward: 'Coliseum Crown' });
  Q('seven_seals', 'The Seven Seals', 'Recover all seven seals of the Origami Crown.', { chapter: 1, reward: 'The Crown' });
  Q('smudge_letters', 'Unsent Letters', 'Nine letters Duke Smudge never delivered are scattered across Foldheim.', { chapter: 3, reward: 'Last Page' });
  Q('first_draft', 'The Draft in the Bin', 'Something is living in the Quillton paper bin. It knows your name.', { chapter: 6, reward: 'A hard fight' });

  function get(id) { return db[id]; }
  function all() { return db; }
  function list() { var a = []; for (var k in db) a.push(db[k]); return a; }
  return { get: get, all: all, list: list };
})();
