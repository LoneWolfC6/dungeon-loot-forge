export function getAllSources(tables) {
  const sources = new Set();

  Object.values(tables).forEach((table) => {
    table.forEach((item) => {
      if (item.source) {
        sources.add(item.source);
      }
    });
  });

  return Array.from(sources).sort();
}

export function filterBySources(items, enabledSources) {
  return items.filter((item) => enabledSources.includes(item.source));
}

export function selectAllSources(allSources) {
  return [...allSources];
}

export function clearAllSources() {
  return [];
}

export function officialOnlySources(allSources) {
  return allSources.filter((source) => source !== "Homebrew");
}

export function homebrewOnlySources(allSources) {
  return allSources.filter((source) => source === "Homebrew");
}