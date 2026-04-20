export function createSystemManager() {
  const systems = [];

  return {
    register(system) {
      systems.push(system);
    },
    runStep(state, ctx, deltaMs) {
      let changed = false;

      for (const system of systems) {
        const didMutate = system.update(state, ctx, deltaMs);
        changed = changed || Boolean(didMutate);
      }

      return changed;
    },
    list() {
      return systems.map((system) => system.id);
    }
  };
}
