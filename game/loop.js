import { runSystems } from './systems.js';

export function startLoop(state) {
  const TICK_MS = 1000;

  setInterval(() => {
    runSystems(state);
    state.tick += 1;
  }, TICK_MS);
}
