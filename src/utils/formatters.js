function pad2(n) {
  return String(n).padStart(2, "0");
}

export function formatLootTableForClipboard({
  category,
  rarity,
  enabledSources,
  generatedTable,
}) {
  const title = `${capitalize(category)} - ${formatRarity(rarity)} Loot Table`;
  const sourcesLine =
    enabledSources.length > 0
      ? `Sources: ${enabledSources.join(", ")}`
      : "Sources: None";

  const rows = generatedTable.map((entry) => {
    const rangeLabel =
      entry.from === entry.to
        ? pad2(entry.from)
        : `${pad2(entry.from)}-${pad2(entry.to)}`;

    return `${rangeLabel}  ${entry.item.name} (${entry.item.source})`;
  });

  return [title, sourcesLine, "", "d100  Item", ...rows].join("\n");
}

export function formatSpellTableForClipboard({ spellLevel, generatedSpellTable }) {
  const title =
    spellLevel === "cantrip"
      ? "Cantrip Spell Table"
      : `Level ${spellLevel} Spell Table`;

  const rows = generatedSpellTable.map((entry) => {
    const rangeLabel =
      entry.from === entry.to
        ? pad2(entry.from)
        : `${pad2(entry.from)}-${pad2(entry.to)}`;

    return `${rangeLabel}  ${entry.spell}`;
  });

  return [title, "", "d100  Spell", ...rows].join("\n");
}

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatRarity(rarity) {
  return rarity
    .split("-")
    .map((part) => capitalize(part))
    .join(" ");
}