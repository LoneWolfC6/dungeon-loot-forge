import { useEffect, useMemo, useState } from "react";
import lootTables from "../data/loot-tables.json";
import { randomizeLootTable, rollOnTable } from "../utils/loot";
import {
  getAllSources,
  filterBySources,
  selectAllSources,
  clearAllSources,
  officialOnlySources,
  homebrewOnlySources,
} from "../utils/helpers";
import { copyTextToClipboard } from "../utils/clipboard";
import { formatLootTableForClipboard } from "../utils/formatters";
import { mergeCustomItemsIntoLootTables } from "../utils/lootData";
import {
  fetchCustomLootItems,
  createCustomLootItem,
  updateCustomLootItem,
  deleteCustomLootItem,
} from "../utils/supabaseLoot";

function LootGenerator() {
  /*
    =========================
    DATA / DERIVED DATA
    =========================
  */
  const [customItems, setCustomItems] = useState([]);
  const [customItemsLoading, setCustomItemsLoading] = useState(true);

  const mergedLootTables = useMemo(() => {
    return mergeCustomItemsIntoLootTables(lootTables, customItems);
  }, [customItems]);

  const allSources = getAllSources(mergedLootTables);

  /*
    =========================
    LOOT TABLE UI STATE
    =========================
  */
  const [category, setCategory] = useState("arcana");
  const [rarity, setRarity] = useState("common");
  const [roll, setRoll] = useState("");
  const [enabledSources, setEnabledSources] = useState(allSources);
  const [generatedTable, setGeneratedTable] = useState([]);
  const [copyMessage, setCopyMessage] = useState("");
  const [showCustomItems, setShowCustomItems] = useState(false);

  /*
    =========================
    CUSTOM ITEM FORM STATE
    =========================
  */
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [editingItemId, setEditingItemId] = useState(null);
  const [customName, setCustomName] = useState("");
  const [customCategory, setCustomCategory] = useState("arcana");
  const [customRarity, setCustomRarity] = useState("common");
  const [customSource, setCustomSource] = useState("Homebrew");
  const [customSlots, setCustomSlots] = useState(1);

  /*
    =========================
    DERIVED TABLE SELECTION
    =========================
  */
  const tableKey = `${category}-${rarity}`;
  const selectedTable = mergedLootTables[tableKey] || [];

  /*
    =========================
    LOAD CUSTOM ITEMS FROM SUPABASE
    =========================
  */
  useEffect(() => {
    async function loadItems() {
      try {
        const items = await fetchCustomLootItems();
        setCustomItems(items);
      } catch (error) {
        console.error("Failed to load custom loot items:", error);
      } finally {
        setCustomItemsLoading(false);
      }
    }

    loadItems();
  }, []);

  /*
    =========================
    AUTO-GENERATE TABLE WHEN FILTERS CHANGE
    =========================
  */
  useEffect(() => {
    const filtered = filterBySources(selectedTable, enabledSources);

    if (filtered.length > 0) {
      setGeneratedTable(randomizeLootTable(filtered));
    } else {
      setGeneratedTable([]);
    }

    setRoll("");
  }, [selectedTable, enabledSources]);

  /*
    =========================
    ROLLED RESULT
    =========================
  */
  const rolledItem = useMemo(() => {
    const parsedRoll = Number(roll);

    if (!Number.isInteger(parsedRoll) || parsedRoll < 1 || parsedRoll > 100) {
      return null;
    }

    return rollOnTable(generatedTable, parsedRoll);
  }, [roll, generatedTable]);

  /*
    =========================
    LOOT TABLE ACTIONS
    =========================
  */
  function handleGenerate() {
    const filtered = filterBySources(selectedTable, enabledSources);

    if (filtered.length === 0) {
      alert("No items match the selected sources.");
      return;
    }

    setGeneratedTable(randomizeLootTable(filtered));
    setRoll("");
  }

  function handleRoll() {
    const newRoll = Math.floor(Math.random() * 100) + 1;
    setRoll(String(newRoll));
  }

  async function handleCopyLootTable() {
    if (generatedTable.length === 0) {
      setCopyMessage("Nothing to copy.");
      return;
    }

    const text = formatLootTableForClipboard({
      category,
      rarity,
      enabledSources,
      generatedTable,
    });

    const success = await copyTextToClipboard(text);
    setCopyMessage(success ? "Loot table copied!" : "Copy failed.");

    setTimeout(() => {
      setCopyMessage("");
    }, 2000);
  }

  /*
    =========================
    SOURCE FILTER ACTIONS
    =========================
  */
  function toggleSource(source) {
    setEnabledSources((prev) => {
      if (prev.includes(source)) {
        return prev.filter((s) => s !== source);
      }

      return [...prev, source];
    });
  }

  function handleSelectAll() {
    setEnabledSources(selectAllSources(allSources));
  }

  function handleClearAll() {
    setEnabledSources(clearAllSources());
  }

  function handleOfficialOnly() {
    setEnabledSources(officialOnlySources(allSources));
  }

  function handleHomebrewOnly() {
    setEnabledSources(homebrewOnlySources(allSources));
  }

  /*
    =========================
    CUSTOM ITEM FORM ACTIONS
    =========================
  */
  function resetCustomForm() {
    setCustomName("");
    setCustomCategory("arcana");
    setCustomRarity("common");
    setCustomSource("Homebrew");
    setCustomSlots(1);
    setEditingItemId(null);
    setShowCustomForm(false);
  }

  async function handleSaveCustomItem(e) {
    e.preventDefault();

    const trimmedName = customName.trim();
    const trimmedSource = customSource.trim() || "Homebrew";
    const parsedSlots = Number(customSlots);

    if (!trimmedName) {
      alert("Item name is required.");
      return;
    }

    if (!Number.isInteger(parsedSlots) || parsedSlots < 1) {
      alert("Slots must be a whole number of 1 or more.");
      return;
    }

    try {
      if (editingItemId) {
        const updatedItem = await updateCustomLootItem({
          id: editingItemId,
          name: trimmedName,
          category: customCategory,
          rarity: customRarity,
          source: trimmedSource,
          slots: parsedSlots,
        });

        setCustomItems((prev) =>
          prev.map((item) => (item.id === updatedItem.id ? updatedItem : item))
        );
      } else {
        const newItem = await createCustomLootItem({
          name: trimmedName,
          category: customCategory,
          rarity: customRarity,
          source: trimmedSource,
          slots: parsedSlots,
        });

        setCustomItems((prev) => [...prev, newItem]);
      }

      resetCustomForm();
    } catch (error) {
      alert(error.message || "Failed to save custom item.");
    }
  }

  function handleEditCustomItem(item) {
    setCustomName(item.name);
    setCustomCategory(item.category);
    setCustomRarity(item.rarity);
    setCustomSource(item.source);
    setCustomSlots(item.slots);
    setEditingItemId(item.id);
    setShowCustomForm(true);
  }

  async function handleDeleteCustomItem(id) {
    try {
      await deleteCustomLootItem(id);
      setCustomItems((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      alert(error.message || "Failed to delete custom item.");
    }
  }

  return (
    <>
      <div className="loot-top-layout">
        <div className="controls">
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="arcana">Arcana</option>
            <option value="armaments">Armaments</option>
            <option value="implements">Implements</option>
            <option value="relics">Relics</option>
          </select>

          <select value={rarity} onChange={(e) => setRarity(e.target.value)}>
            <option value="common">Common</option>
            <option value="uncommon">Uncommon</option>
            <option value="rare">Rare</option>
            <option value="very-rare">Very Rare</option>
            <option value="legendary">Legendary</option>
          </select>

          <button onClick={handleGenerate}>Generate Table</button>
          <button onClick={handleRoll}>🎲 Roll d100</button>
          <button onClick={handleCopyLootTable}>Copy Loot Table</button>

          <button
            onClick={() => {
              if (showCustomForm) {
                resetCustomForm();
              } else {
                setShowCustomForm(true);
              }
            }}
          >
            {showCustomForm ? "Close Custom Form" : "Add Custom Item"}
          </button>

          <input
            type="number"
            min="1"
            max="100"
            placeholder="Roll 1-100"
            value={roll}
            onChange={(e) => setRoll(e.target.value)}
          />
        </div>

        <div className="source-panel">
          <h3>Sources</h3>

          <div className="source-presets">
            <button onClick={handleSelectAll}>Select All</button>
            <button onClick={handleOfficialOnly}>Official Only</button>
            <button onClick={handleHomebrewOnly}>Homebrew Only</button>
            <button onClick={handleClearAll}>Clear</button>
          </div>

          {allSources.map((source) => (
            <label key={source} className="source-toggle">
              <input
                type="checkbox"
                checked={enabledSources.includes(source)}
                onChange={() => toggleSource(source)}
              />
              {source}
            </label>
          ))}
        </div>
      </div>

      {showCustomForm && (
        <form className="custom-form" onSubmit={handleSaveCustomItem}>
          <h3>{editingItemId ? "Edit Custom Item" : "Add Custom Item"}</h3>

          <div className="custom-form-grid">
            <input
              type="text"
              placeholder="Item name"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
            />

            <select value={customCategory} onChange={(e) => setCustomCategory(e.target.value)}>
              <option value="arcana">Arcana</option>
              <option value="armaments">Armaments</option>
              <option value="implements">Implements</option>
              <option value="relics">Relics</option>
            </select>

            <select value={customRarity} onChange={(e) => setCustomRarity(e.target.value)}>
              <option value="common">Common</option>
              <option value="uncommon">Uncommon</option>
              <option value="rare">Rare</option>
              <option value="very-rare">Very Rare</option>
              <option value="legendary">Legendary</option>
            </select>

            <input
              type="text"
              placeholder="Source"
              value={customSource}
              onChange={(e) => setCustomSource(e.target.value)}
            />

            <input
              type="number"
              min="1"
              placeholder="Slots"
              value={customSlots}
              onChange={(e) => setCustomSlots(e.target.value)}
            />

            <button type="submit">
              {editingItemId ? "Update Custom Item" : "Save Custom Item"}
            </button>

            {editingItemId && (
              <button type="button" onClick={resetCustomForm}>
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      )}

      {customItemsLoading && (
        <div className="empty-state">Loading custom items...</div>
      )}

      {customItems.length > 0 && (
  <div className="custom-items-panel">
    <div className="collapsible-header">
      <div>
        <h3>My Custom Items</h3>
        <div className="custom-item-meta">
          {customItems.length} item{customItems.length !== 1 ? "s" : ""}
        </div>
      </div>

      <button
        type="button"
        onClick={() => setShowCustomItems((prev) => !prev)}
      >
        {showCustomItems ? "Hide Items" : "Show Items"}
      </button>
    </div>

    {showCustomItems && (
      <div className="custom-items-list">
        {customItems.map((item) => (
          <div key={item.id} className="custom-item-card">
            <div>
              <strong>{item.name}</strong>
              <div className="custom-item-meta">
                {item.category} • {item.rarity} • {item.source} • slots: {item.slots}
              </div>
            </div>

            <div className="custom-item-actions">
              <button type="button" onClick={() => handleEditCustomItem(item)}>
                Edit
              </button>
              <button type="button" onClick={() => handleDeleteCustomItem(item.id)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
)}

      <h3>Generated Table</h3>

      {rolledItem && (
        <div className="rolled-result">
          <strong>Roll:</strong> {roll}
          <br />
          <strong>Result:</strong> {rolledItem.item.name} ({rolledItem.item.source})
        </div>
      )}

      {copyMessage && <div className="copy-message">{copyMessage}</div>}

      {generatedTable.length === 0 ? (
        <div className="empty-state">
          No items match the selected sources for this category and rarity.
        </div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>d100</th>
              <th>Item</th>
              <th>Source</th>
            </tr>
          </thead>
          <tbody>
            {generatedTable.map((entry) => {
              const rangeLabel =
                entry.from === entry.to
                  ? String(entry.from).padStart(2, "0")
                  : `${String(entry.from).padStart(2, "0")}-${String(entry.to).padStart(2, "0")}`;

              const isHighlighted =
                rolledItem &&
                rolledItem.from === entry.from &&
                rolledItem.to === entry.to &&
                rolledItem.item.name === entry.item.name;

              return (
                <tr
                  key={`${entry.from}-${entry.to}-${entry.item.name}`}
                  className={isHighlighted ? "highlight" : ""}
                >
                  <td>{rangeLabel}</td>
                  <td>{entry.item.name}</td>
                  <td>{entry.item.source}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </>
  );
}

export default LootGenerator;