const STORAGE_KEY = "dungeon-loot-forge-custom-items";

export function loadCustomItems() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveCustomItems(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function addCustomItem(item) {
  const existing = loadCustomItems();
  const updated = [...existing, item];
  saveCustomItems(updated);
  return updated;
}

export function updateCustomItem(updatedItem) {
  const existing = loadCustomItems();
  const updated = existing.map((item) =>
    item.id === updatedItem.id ? updatedItem : item
  );
  saveCustomItems(updated);
  return updated;
}

export function deleteCustomItem(id) {
  const existing = loadCustomItems();
  const updated = existing.filter((item) => item.id !== id);
  saveCustomItems(updated);
  return updated;
}

export function replaceCustomItems(items) {
  saveCustomItems(items);
  return items;
}

export function mergeCustomItems(importedItems) {
  const existing = loadCustomItems();

  const existingIds = new Set(existing.map((item) => item.id));
  const dedupedIncoming = importedItems.filter((item) => !existingIds.has(item.id));

  const updated = [...existing, ...dedupedIncoming];
  saveCustomItems(updated);
  return updated;
}

export function validateCustomItems(items) {
  if (!Array.isArray(items)) return false;

  return items.every((item) => {
    return (
      item &&
      typeof item.id === "string" &&
      typeof item.name === "string" &&
      typeof item.category === "string" &&
      typeof item.rarity === "string" &&
      typeof item.source === "string" &&
      Number.isInteger(Number(item.slots)) &&
      Number(item.slots) >= 1
    );
  });
}