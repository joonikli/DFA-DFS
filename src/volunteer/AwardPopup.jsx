import { useEffect } from 'react';
import AwardPopupContent from '../features/awards/AwardPopupContent.jsx';
import { navigate } from '../lib/router.js';
import { firstName, vol } from './shared.js';
import { Modal } from './Modal.jsx';

export default function VolunteerAwardPopup({ onClosed }) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previousOverflow; };
  }, []);
  return <Modal label="Volunteer award" onClosed={onClosed}>{close => <AwardPopupContent name={firstName(vol.name)} onClose={() => close()} onViewAwards={() => { close(true); navigate('profile?tab=awards'); }} />}</Modal>;
}
