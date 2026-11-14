import { usePop } from '../../components/ui.jsx';
import { composeToShift } from '../../lib/bridge.js';

// "Message volunteers" — opens Messages composing to everyone on the shift
export function useMsgShift() {
  const pop = usePop();
  return (id) => { pop.close(null, true); composeToShift(id); };
}
