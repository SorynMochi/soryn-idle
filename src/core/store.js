/**
 * Small central state store for browser runtime.
 * Keeps mutation flow explicit without introducing external packages.
 */
export function createStore(initialState) {
  let state = initialState;
  const listeners = new Set();

  return {
    getState() {
      return state;
    },
    setState(nextState, reason = 'setState') {
      state = nextState;
      listeners.forEach((listener) => listener(state, reason));
    },
    update(updater, reason = 'update') {
      const next = updater(state);
      state = next;
      listeners.forEach((listener) => listener(state, reason));
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    }
  };
}
