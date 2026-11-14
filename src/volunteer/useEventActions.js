import { SHIFTS } from '../data.js';
import { emit } from '../lib/store.js';
import { hideTip, usePop, useToast } from '../components/ui.jsx';
import { useRegistration } from './Registration.jsx';

// Cancellation confirmation stays supplied by the caller so this hook remains
// plain JavaScript and the existing popover UI is reused unchanged.
export function useVolunteerEventActions({ registered, setRegistered, saved, setSaved, confirmation }) {
  const toast = useToast(), pop = usePop();
  const { openRegistration } = useRegistration();
  const onSave = id => {
    hideTip();
    setSaved(current => { const next = new Set(current); if (next.has(id)) next.delete(id); else next.add(id); return next; });
    toast(saved.has(id) ? 'Event removed from saved' : 'Event saved', { ic: 'bookmark' });
  };
  const cancel = id => {
    if (!registered.has(id)) return;
    setRegistered(current => { const next = new Set(current); next.delete(id); return next; });
    SHIFTS[id].filled = Math.max(0, SHIFTS[id].filled - 1); emit();
    toast(`You’ve cancelled ${SHIFTS[id].title}`, { action: 'Undo', onAction: () => { setRegistered(current => new Set(current).add(id)); SHIFTS[id].filled += 1; emit(); } });
  };
  const onRegister = (anchor, id) => {
    if (registered.has(id)) { pop.toggle(anchor, confirmation(id, cancel), { align: 'end' }); return; }
    openRegistration(id, anchor);
  };
  return { onSave, onRegister };
}
