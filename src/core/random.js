const MODULUS = 2 ** 32;
const MULTIPLIER = 1664525;
const INCREMENT = 1013904223;

export function nextRandomFloat(state) {
  const seed = Number.isFinite(state.meta.rngSeed) ? state.meta.rngSeed : Date.now();
  const nextSeed = (seed * MULTIPLIER + INCREMENT) % MODULUS;
  state.meta.rngSeed = nextSeed;
  return nextSeed / MODULUS;
}

export function pickWeighted(entries, randomValue) {
  const totalWeight = entries.reduce((sum, entry) => sum + entry.weight, 0);
  const roll = randomValue * totalWeight;

  let running = 0;
  for (const entry of entries) {
    running += entry.weight;
    if (roll <= running) {
      return entry;
    }
  }

  return entries[entries.length - 1];
}

export function pickOne(items, randomValue) {
  if (!items.length) {
    return null;
  }

  const index = Math.floor(randomValue * items.length);
  return items[Math.min(items.length - 1, index)];
}
