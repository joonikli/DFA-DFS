import { SHIFTS } from '../data.js';
import { emit } from '../lib/store.js';
import { hideTip } from '../components/ui.jsx';
import { useRegistration } from './Registration.jsx';
import { useEventNotice } from './EventNotice.jsx';

// Cancelling and unsaving ask first via the registration-style confirm popup (Registration.jsx).
export function useVolunteerEventActions({ registered, setRegistered, saved, setSaved }) {
  const notice = useEventNotice();
  const { openRegistration, openCancel, openUnsave } = useRegistration();
  const onSave = id => {
    hideTip();
    const title = SHIFTS[id]?.title;
    if (saved.has(id)) {
      openUnsave(id, document.activeElement, () => {
        setSaved(current => { const next = new Set(current); next.delete(id); return next; });
        notice({ variant: 'alert', parts: [['Removed from saved', true]], preview: title });
      });
      return;
    }
    setSaved(current => new Set(current).add(id));
    notice({ variant: 'success', parts: [['Saved!', true]], preview: `${title} is now in your Saved events.` });
  };
  const cancel = id => {
    if (!registered.has(id)) return;
    setRegistered(current => { const next = new Set(current); next.delete(id); return next; });
    SHIFTS[id].filled = Math.max(0, SHIFTS[id].filled - 1); emit();
    notice({ variant: 'alert', parts: [['Registration cancelled', true], [' for ', false], [SHIFTS[id].title, true]],
      action: { label: 'Undo', onClick: () => { setRegistered(current => new Set(current).add(id)); SHIFTS[id].filled += 1; emit(); } } });
  };
  const onRegister = (anchor, id) => {
    if (registered.has(id)) { openCancel(id, anchor, () => cancel(id)); return; }
    openRegistration(id, anchor);
  };
  return { onSave, onRegister };
}
