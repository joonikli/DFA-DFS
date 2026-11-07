// Figma: Final › Banner › "MacBook Pro 16 - 61" (2324:46144) — "You're a Super Volunteer!" popup
import { useNavigate } from 'react-router-dom'
import Modal from '../../components/Modal/Modal.jsx'
import Button from '../../components/Button/Button.jsx'
import topBadge from '../../assets/awards/top-5.png'
import { PERSONAS } from '../../store/DemoStore.jsx'

export default function AwardPopup({ onClose }) {
  const navigate = useNavigate()
  return (
    <Modal open onClose={onClose} width={400} padding="18px 18px 14px">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0', borderRadius: 8, background: 'var(--primary-lightest-purple)' }}>
          <img src={topBadge} width="80" height="80" alt="Top 15% badge" style={{ borderRadius: 6, boxShadow: '0 0 0 3px var(--green-light-green)' }} />
        </div>
        <h2 className="text-heading-2" style={{ fontSize: 24, marginTop: 14 }}>
          You’re a Super Volunteer!
        </h2>
        <p className="text-label-2" style={{ fontWeight: 400, color: 'var(--neutral-darker-gray)', lineHeight: 1.35 }}>
          Hi {PERSONAS.volunteer.name}! We wanted to give you a token of appreciation for being in the top 15% of our volunteers this month.
          <br />
          <br />
          This is based on your volunteer hours, recognition, and dedicated work!
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 10 }}>
          <Button color="tertiary" size="sm" onClick={onClose}>
            Close
          </Button>
          <Button
            size="sm"
            onClick={() => {
              onClose()
              navigate('/profile?tab=awards')
            }}
          >
            See your awards
          </Button>
        </div>
      </div>
    </Modal>
  )
}
