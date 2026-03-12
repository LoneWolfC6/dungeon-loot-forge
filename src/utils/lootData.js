export function mergeCustomItemsIntoLootTables(baseTables, customItems) {
  const merged = structuredClone(baseTables);

  for (const item of customItems) {
    const tableKey = `${item.category}-${item.rarity}`;

    if (!merged[tableKey]) {
      merged[tableKey] = [];
    }

    merged[tableKey].push({
      name: item.name,
      slots: Number(item.slots),
      source: item.source,
    });
  }

  return merged;
}