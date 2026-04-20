export function createGameLoop({
  state,
  config,
  systemManager,
  onStep,
  onRender,
  onAutosave
}) {
  let running = false;
  let lastFrameTime = performance.now();
  let accumulator = 0;
  let renderAccumulator = 0;
  let autosaveAccumulator = 0;
  let dirty = false;

  function step(deltaMs) {
    const ctx = { events: [] };
    const changed = systemManager.runStep(state, ctx, deltaMs);

    state.runtime.totalPlayTimeMs += deltaMs;
    state.runtime.totalTicks += 1;
    dirty = dirty || changed;

    onStep?.({ state, ctx, dirty, markDirty: () => (dirty = true) });
  }

  async function frame(now) {
    if (!running) return;

    let elapsed = now - lastFrameTime;
    lastFrameTime = now;

    elapsed = Math.min(elapsed, config.tickMs * config.maxStepsPerFrame);
    accumulator += elapsed;
    renderAccumulator += elapsed;
    autosaveAccumulator += elapsed;

    let steps = 0;
    while (accumulator >= config.tickMs && steps < config.maxStepsPerFrame) {
      step(config.tickMs);
      accumulator -= config.tickMs;
      steps += 1;
    }

    if (renderAccumulator >= config.renderIntervalMs) {
      onRender?.(state);
      renderAccumulator = 0;
    }

    if (dirty && autosaveAccumulator >= config.autosaveIntervalMs) {
      try {
        dirty = false;
        autosaveAccumulator = 0;
        await onAutosave?.(state);
      } catch (error) {
        dirty = true;
        console.warn('Autosave failed; keeping loop alive and retrying on next autosave window.', error);
      }
    }

    requestAnimationFrame(frame);
  }

  return {
    start() {
      if (running) return;
      running = true;
      lastFrameTime = performance.now();
      requestAnimationFrame(frame);
    },
    stop() {
      running = false;
    },
    markDirty() {
      dirty = true;
    },
    getDirty() {
      return dirty;
    },
    simulate(ms, stepMs = config.tickMs) {
      const steps = Math.floor(ms / stepMs);
      for (let i = 0; i < steps; i += 1) {
        step(stepMs);
      }
      return steps;
    }
  };
}
