// Cross-feature intents. The dashboard (and notifications) ask Messages to open something;
// Messages consumes the pending intent when it mounts or when the route changes to #messages.
import { navigate } from './router.js';

export const intents = { pending: null };

// Open an existing conversation by id (e.g. 'c2')
export function openConversation(id) {
  intents.pending = { type: 'open', id };
  navigate('messages');
}

// New message to everyone on a shift, with the shift attached and a starter draft
export function composeToShift(shiftId) {
  intents.pending = { type: 'shift', id: shiftId };
  navigate('messages');
}

export function takeIntent() {
  const i = intents.pending;
  intents.pending = null;
  return i;
}
