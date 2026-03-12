const STORAGE_KEY = "dungeon-loot-forge-custom-spells";

export function loadCustomSpells() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveCustomSpells(spells) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(spells));
}

export function addCustomSpell(spell) {
  const existing = loadCustomSpells();
  const updated = [...existing, spell];
  saveCustomSpells(updated);
  return updated;
}

export function updateCustomSpell(updatedSpell) {
  const existing = loadCustomSpells();
  const updated = existing.map((spell) =>
    spell.id === updatedSpell.id ? updatedSpell : spell
  );
  saveCustomSpells(updated);
  return updated;
}

export function deleteCustomSpell(id) {
  const existing = loadCustomSpells();
  const updated = existing.filter((spell) => spell.id !== id);
  saveCustomSpells(updated);
  return updated;
}