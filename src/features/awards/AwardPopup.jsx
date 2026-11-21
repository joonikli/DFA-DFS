// Figma: Final › Banner › "MacBook Pro 16 - 61" (2324:46144) — "You're a Super Volunteer!" popup
import { useNavigate } from 'react-router-dom'
import Modal from '../../components/Modal/Modal.jsx'
import AwardPopupContent from './AwardPopupContent.jsx'
import { PERSONAS } from '../../store/DemoStore.jsx'

export default function AwardPopup({ onClose }) {
  const navigate = useNavigate()
  return (
    <Modal open onClose={onClose} width={400} padding="0" showClose={false} label="Volunteer award">
      <AwardPopupContent name={PERSONAS.volunteer.name} onClose={onClose} onViewAwards={() => { onClose(); navigate('/profile?tab=awards') }} />
    </Modal>
  )
}
