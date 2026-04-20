import { createInitialState } from './game/state.js';
import { startLoop } from './game/loop.js';

const state = createInitialState();
startLoop(state);
