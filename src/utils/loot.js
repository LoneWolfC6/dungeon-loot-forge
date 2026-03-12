export function shuffle(array) {
  const arr = [...array];

  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }

  return arr;
}

export function pad2(n) {
  return n.toString().padStart(2, "0");
}

export function randomizeLootTable(items) {
  const totalSlots = items.reduce((sum, item) => sum + (item.slots || 1), 0);

  if (totalSlots <= 0) {
    throw new Error("Total slots for this table is 0.");
  }

  let calc = items.map((item) => {
    const weight = item.slots || 1;
    const ideal = (weight / totalSlots) * 100;
    const base = Math.floor(ideal);
    const remainder = ideal - base;

    return {
      ...item,
      _size: base,
      _remainder: remainder,
    };
  });

  let used = calc.reduce((sum, item) => sum + item._size, 0);
  let remaining = 100 - used;

  if (remaining > 0) {
    const byRemainder = [...calc].sort((a, b) => b._remainder - a._remainder);

    for (let i = 0; i < remaining && i < byRemainder.length; i++) {
      byRemainder[i]._size += 1;
    }
  }

  const finalTotal = calc.reduce((sum, item) => sum + item._size, 0);

  if (finalTotal !== 100) {
    const diff = 100 - finalTotal;
    calc[calc.length - 1]._size += diff;
  }

  calc = calc.filter((item) => item._size > 0);
  calc = shuffle(calc);

  let currentStart = 1;

  return calc.map((item) => {
    const from = currentStart;
    const to = currentStart + item._size - 1;
    currentStart = to + 1;

    return {
      from,
      to,
      item,
    };
  });
}

export function rollOnTable(ranges, roll) {
  return ranges.find((range) => roll >= range.from && roll <= range.to) || null;
}