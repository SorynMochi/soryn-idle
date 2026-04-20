export function calculateOfflineProgress(state, config, now = Date.now()) {
  const lastActiveAt = Number(state.meta?.lastActiveAt);
  const rawDurationMs = Number.isFinite(lastActiveAt) ? Math.max(0, now - lastActiveAt) : 0;
  const maxMs = Math.max(0, Number(config?.offline?.maxMs) || 0);
  const stepMs = Math.max(1, Number(config?.offline?.stepMs) || 250);
  const simulatedMs = maxMs > 0 ? Math.min(rawDurationMs, maxMs) : rawDurationMs;
  const steps = Math.floor(simulatedMs / stepMs);

  return { rawDurationMs, simulatedMs, stepMs, steps };
}

export function applyOfflineProgress(state, systemManager, config, now = Date.now()) {
  const plan = calculateOfflineProgress(state, config, now);
  const before = {
    gil: state.economy.gold,
    shards: state.economy.shards,
    xp: state.hero.xp
  };

  for (let i = 0; i < plan.steps; i += 1) {
    systemManager.runStep(state, { events: [] }, plan.stepMs);
    state.runtime.totalPlayTimeMs += plan.stepMs;
    state.runtime.totalTicks += 1;
  }

  state.runtime.lastOfflineDurationMs = plan.simulatedMs;
  state.meta.updatedAt = now;
  state.meta.lastActiveAt = now;

  const applied = {
    gil: Math.max(0, state.economy.gold - before.gil),
    crystalShards: Math.max(0, state.economy.shards - before.shards),
    heroXp: Math.max(0, state.hero.xp - before.xp)
  };

  const seconds = Math.floor(plan.simulatedMs / 1000);
  const capped = plan.rawDurationMs > plan.simulatedMs;
  const summary = plan.simulatedMs > 0
    ? `Offline progress applied for ${seconds}s${capped ? ' (capped).' : '.'}`
    : 'No offline time detected.';

  return { ...plan, applied, summary };
}
