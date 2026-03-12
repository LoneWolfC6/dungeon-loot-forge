import { shuffle } from "./loot";

export function randomizeSpellTable(spells) {
  const uniqueSpells = [...new Set(spells.map((spell) => spell.trim()))];

  if (uniqueSpells.length === 0) {
    throw new Error("Spell list is empty.");
  }

  const shuffled = shuffle(uniqueSpells);
  const total = shuffled.length;

  const mapped = [];
  for (let roll = 1; roll <= 100; roll++) {
    const index = Math.ceil((roll * total) / 100);
    mapped.push(index);
  }

  const ranges = [];
  let start = 1;

  for (let roll = 2; roll <= 100; roll++) {
    if (mapped[roll - 1] !== mapped[roll - 2]) {
      const end = roll - 1;
      const index = mapped[roll - 2];

      ranges.push({
        from: start,
        to: end,
        spell: shuffled[index - 1],
      });

      start = roll;
    }
  }

  ranges.push({
    from: start,
    to: 100,
    spell: shuffled[mapped[99] - 1],
  });

  return ranges;
}

export function rollOnSpellTable(ranges, roll) {
  return ranges.find((range) => roll >= range.from && roll <= range.to) || null;
}