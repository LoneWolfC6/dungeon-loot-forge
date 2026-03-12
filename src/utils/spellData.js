export function mergeCustomSpellsIntoSpellData(baseSpells, customSpells) {
  const merged = structuredClone(baseSpells);

  for (const spell of customSpells) {
    const levelKey = spell.level;

    if (!merged[levelKey]) {
      merged[levelKey] = [];
    }

    merged[levelKey].push(spell.name);
  }

  return merged;
}