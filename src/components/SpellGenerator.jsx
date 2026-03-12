import { useEffect, useMemo, useState } from "react";
import spellsData from "../data/spells.json";
import { randomizeSpellTable, rollOnSpellTable } from "../utils/spells";
import { copyTextToClipboard } from "../utils/clipboard";
import { formatSpellTableForClipboard } from "../utils/formatters";
import { mergeCustomSpellsIntoSpellData } from "../utils/spellData";
import {
  fetchCustomSpells,
  createCustomSpell,
  updateCustomSpell,
  deleteCustomSpell,
} from "../utils/supabaseSpells";

function SpellGenerator() {
  /*
    =========================
    DATA / DERIVED DATA
    =========================
  */
  const [customSpells, setCustomSpells] = useState([]);
  const [customSpellsLoading, setCustomSpellsLoading] = useState(true);

  const mergedSpellsData = useMemo(() => {
    return mergeCustomSpellsIntoSpellData(spellsData, customSpells);
  }, [customSpells]);

  /*
    =========================
    SPELL TABLE UI STATE
    =========================
  */
  const [spellLevel, setSpellLevel] = useState("cantrip");
  const [spellRoll, setSpellRoll] = useState("");
  const [generatedSpellTable, setGeneratedSpellTable] = useState([]);
  const [copyMessage, setCopyMessage] = useState("");
  const [showCustomSpells, setShowCustomSpells] = useState(false);

  /*
    =========================
    CUSTOM SPELL FORM STATE
    =========================
  */
  const [showCustomSpellForm, setShowCustomSpellForm] = useState(false);
  const [customSpellName, setCustomSpellName] = useState("");
  const [customSpellLevel, setCustomSpellLevel] = useState("cantrip");
  const [editingSpellId, setEditingSpellId] = useState(null);

  /*
    =========================
    LOAD CUSTOM SPELLS FROM SUPABASE
    =========================
  */
  useEffect(() => {
    async function loadSpells() {
      try {
        const spells = await fetchCustomSpells();
        setCustomSpells(spells);
      } catch (error) {
        console.error("Failed to load custom spells:", error);
      } finally {
        setCustomSpellsLoading(false);
      }
    }

    loadSpells();
  }, []);

  /*
    =========================
    AUTO-GENERATE TABLE WHEN SPELL LEVEL CHANGES
    =========================
  */
  useEffect(() => {
    const selectedSpells = mergedSpellsData[spellLevel];

    if (selectedSpells && selectedSpells.length > 0) {
      setGeneratedSpellTable(randomizeSpellTable(selectedSpells));
    } else {
      setGeneratedSpellTable([]);
    }

    setSpellRoll("");
  }, [spellLevel, mergedSpellsData]);

  /*
    =========================
    ROLLED RESULT
    =========================
  */
  const rolledSpell = useMemo(() => {
    const parsedRoll = Number(spellRoll);

    if (!Number.isInteger(parsedRoll) || parsedRoll < 1 || parsedRoll > 100) {
      return null;
    }

    return rollOnSpellTable(generatedSpellTable, parsedRoll);
  }, [spellRoll, generatedSpellTable]);

  /*
    =========================
    SPELL TABLE ACTIONS
    =========================
  */
  function handleGenerateSpellTable() {
    const selectedSpells = mergedSpellsData[spellLevel];

    if (!selectedSpells || selectedSpells.length === 0) {
      alert("No spells found for that level.");
      return;
    }

    setGeneratedSpellTable(randomizeSpellTable(selectedSpells));
    setSpellRoll("");
  }

  function handleSpellRoll() {
    const newRoll = Math.floor(Math.random() * 100) + 1;
    setSpellRoll(String(newRoll));
  }

  async function handleCopySpellTable() {
    if (generatedSpellTable.length === 0) {
      setCopyMessage("Nothing to copy.");
      return;
    }

    const text = formatSpellTableForClipboard({
      spellLevel,
      generatedSpellTable,
    });

    const success = await copyTextToClipboard(text);
    setCopyMessage(success ? "Spell table copied!" : "Copy failed.");

    setTimeout(() => {
      setCopyMessage("");
    }, 2000);
  }

  /*
    =========================
    CUSTOM SPELL FORM ACTIONS
    =========================
  */
  function resetCustomSpellForm() {
    setCustomSpellName("");
    setCustomSpellLevel("cantrip");
    setEditingSpellId(null);
    setShowCustomSpellForm(false);
  }

  async function handleSaveCustomSpell(e) {
    e.preventDefault();

    const trimmedName = customSpellName.trim();

    if (!trimmedName) {
      alert("Spell name is required.");
      return;
    }

    try {
      if (editingSpellId) {
        const updatedSpell = await updateCustomSpell({
          id: editingSpellId,
          name: trimmedName,
          level: customSpellLevel,
        });

        setCustomSpells((prev) =>
          prev.map((spell) =>
            spell.id === updatedSpell.id ? updatedSpell : spell
          )
        );
      } else {
        const newSpell = await createCustomSpell({
          name: trimmedName,
          level: customSpellLevel,
        });

        setCustomSpells((prev) => [...prev, newSpell]);
      }

      resetCustomSpellForm();
    } catch (error) {
      alert(error.message || "Failed to save custom spell.");
    }
  }

  function handleEditCustomSpell(spell) {
    setCustomSpellName(spell.name);
    setCustomSpellLevel(spell.level);
    setEditingSpellId(spell.id);
    setShowCustomSpellForm(true);
  }

  async function handleDeleteCustomSpell(id) {
    try {
      await deleteCustomSpell(id);
      setCustomSpells((prev) => prev.filter((spell) => spell.id !== id));
    } catch (error) {
      alert(error.message || "Failed to delete custom spell.");
    }
  }

  return (
    <>
      <div className="controls">
        <select value={spellLevel} onChange={(e) => setSpellLevel(e.target.value)}>
          <option value="cantrip">Cantrip</option>
          <option value="1">Level 1</option>
          <option value="2">Level 2</option>
          <option value="3">Level 3</option>
          <option value="4">Level 4</option>
          <option value="5">Level 5</option>
          <option value="6">Level 6</option>
          <option value="7">Level 7</option>
          <option value="8">Level 8</option>
          <option value="9">Level 9</option>
        </select>

        <button onClick={handleGenerateSpellTable}>Generate Spell Table</button>
        <button onClick={handleSpellRoll}>🎲 Roll d100</button>
        <button onClick={handleCopySpellTable}>Copy Spell Table</button>

        <button
          onClick={() => {
            if (showCustomSpellForm) {
              resetCustomSpellForm();
            } else {
              setShowCustomSpellForm(true);
            }
          }}
        >
          {showCustomSpellForm ? "Close Custom Spell Form" : "Add Custom Spell"}
        </button>

        <input
          type="number"
          min="1"
          max="100"
          placeholder="Roll 1-100"
          value={spellRoll}
          onChange={(e) => setSpellRoll(e.target.value)}
        />
      </div>

      {showCustomSpellForm && (
        <form className="custom-form" onSubmit={handleSaveCustomSpell}>
          <h3>{editingSpellId ? "Edit Custom Spell" : "Add Custom Spell"}</h3>

          <div className="custom-form-grid">
            <input
              type="text"
              placeholder="Spell name"
              value={customSpellName}
              onChange={(e) => setCustomSpellName(e.target.value)}
            />

            <select
              value={customSpellLevel}
              onChange={(e) => setCustomSpellLevel(e.target.value)}
            >
              <option value="cantrip">Cantrip</option>
              <option value="1">Level 1</option>
              <option value="2">Level 2</option>
              <option value="3">Level 3</option>
              <option value="4">Level 4</option>
              <option value="5">Level 5</option>
              <option value="6">Level 6</option>
              <option value="7">Level 7</option>
              <option value="8">Level 8</option>
              <option value="9">Level 9</option>
            </select>

            <button type="submit">
              {editingSpellId ? "Update Custom Spell" : "Save Custom Spell"}
            </button>

            {editingSpellId && (
              <button type="button" onClick={resetCustomSpellForm}>
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      )}

      {customSpellsLoading && (
        <div className="empty-state">Loading custom spells...</div>
      )}

      {customSpells.length > 0 && (
  <div className="custom-items-panel">
    <div className="collapsible-header">
      <div>
        <h3>My Custom Spells</h3>
        <div className="custom-item-meta">
          {customSpells.length} spell{customSpells.length !== 1 ? "s" : ""}
        </div>
      </div>

      <button
        type="button"
        onClick={() => setShowCustomSpells((prev) => !prev)}
      >
        {showCustomSpells ? "Hide Spells" : "Show Spells"}
      </button>
    </div>

    {showCustomSpells && (
      <div className="custom-items-list">
        {customSpells.map((spell) => (
          <div key={spell.id} className="custom-item-card">
            <div>
              <strong>{spell.name}</strong>
              <div className="custom-item-meta">
                {spell.level === "cantrip" ? "Cantrip" : `Level ${spell.level}`}
              </div>
            </div>

            <div className="custom-item-actions">
              <button type="button" onClick={() => handleEditCustomSpell(spell)}>
                Edit
              </button>
              <button type="button" onClick={() => handleDeleteCustomSpell(spell.id)}>
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

      {rolledSpell && (
        <div className="rolled-result">
          <strong>Roll:</strong> {spellRoll}
          <br />
          <strong>Spell:</strong> {rolledSpell.spell}
        </div>
      )}

      {copyMessage && <div className="copy-message">{copyMessage}</div>}

      {generatedSpellTable.length === 0 ? (
        <div className="empty-state">No spells found for this level.</div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>d100</th>
              <th>Spell</th>
            </tr>
          </thead>
          <tbody>
            {generatedSpellTable.map((entry) => {
              const rangeLabel =
                entry.from === entry.to
                  ? String(entry.from).padStart(2, "0")
                  : `${String(entry.from).padStart(2, "0")}-${String(entry.to).padStart(2, "0")}`;

              const isHighlighted =
                rolledSpell &&
                rolledSpell.from === entry.from &&
                rolledSpell.to === entry.to &&
                rolledSpell.spell === entry.spell;

              return (
                <tr
                  key={`${entry.from}-${entry.to}-${entry.spell}`}
                  className={isHighlighted ? "highlight" : ""}
                >
                  <td>{rangeLabel}</td>
                  <td>{entry.spell}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </>
  );
}

export default SpellGenerator;