/**
 * Placeholder offline calculation.
 * Keeps the contract in place for future passive/combat simulation.
 */
export function calculateOfflineProgress(state, now = Date.now()) {
  const last = state.meta.lastActiveAt ?? now;
  const durationMs = Math.max(0, now - last);

  return {
    durationMs,
    applied: {
      gil: 0,
      crystalShards: 0
    },
    summary:
      durationMs > 0
        ? `Offline for ${Math.floor(durationMs / 1000)}s. No simulation rewards yet (placeholder).`
        : 'No offline time detected.'
  };
}
