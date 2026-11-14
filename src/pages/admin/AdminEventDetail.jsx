// Figma: Final › Admin - Single Event › Single Event - Admin (2324:46296 empty, 2324:46374 with volunteers)
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import Button from '../../components/Button/Button.jsx'
import { EditButton, EventDetails, EventMain } from '../../features/admin/EventOverview.jsx'
import CreateEventModal from '../../features/admin/CreateEventModal.jsx'
import { useAdminEvents } from '../../features/admin/useAdminEvents.js'
import { useDemo } from '../../store/DemoStore.jsx'
import './AdminEventDetail.css'

export default function AdminEventDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { adminCancelEvent, showToast } = useDemo()
  const event = useAdminEvents().find((e) => e.id === id)
  const [editing, setEditing] = useState(false)

  if (!event) {
    return (
      <div className="event-detail">
        <p className="text-body">
          That event doesn’t exist. <Link to="/events">Back to events</Link>
        </p>
      </div>
    )
  }

  const cancelled = event.status === 'cancelled'

  return (
    <div className="event-detail">
      <Link to="/events" className="event-detail__back text-label-2">
        <ArrowLeft size={16} strokeWidth={2} aria-hidden="true" />
        All events
      </Link>
      {cancelled && <p className="event-detail__banner text-body">This event was cancelled. Volunteers no longer see it.</p>}
      <div className="event-detail__grid">
        <EventMain
          event={event}
          onEdit={() => setEditing(true)}
          onViewSurvey={() => navigate(`/surveys?event=${event.id}`)}
        />
        <div className="event-detail__side">
          <EventDetails event={event} action={<EditButton onClick={() => setEditing(true)} />} />
          {event.status !== 'completed' && (
            <Button
              color="secondary"
              size="sm"
              className="event-detail__cancel"
              onClick={() => {
                adminCancelEvent(event.id)
                showToast({
                  variant: cancelled ? 'success' : 'alert',
                  parts: [[cancelled ? 'Event restored' : 'Event cancelled', true]],
                  preview: event.name,
                  time: 'Now',
                  category: 'Event',
                })
              }}
            >
              {cancelled ? 'Restore event' : 'Cancel event'}
            </Button>
          )}
        </div>
      </div>
      {editing && <CreateEventModal draft={event} onClose={() => setEditing(false)} />}
    </div>
  )
}
