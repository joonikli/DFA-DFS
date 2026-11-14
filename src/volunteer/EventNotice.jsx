// Event confirmation popups for the volunteer portal (save / register / cancel).
// Uses the same Figma Notification component (Components › Notification 2084:28493,
// "Upon registering event/Confirmation") and top-center toaster as the router prototype,
// instead of the generic black toast.
import { createContext, useCallback, useContext, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Notification from '../components/Notification/Notification.jsx';
import '../tokens/tokens.css';
import '../styles/typography.css';
import './eventNotice.css';

const NoticeContext = createContext(() => {});
export const useEventNotice = () => useContext(NoticeContext);

const DURATION = 4000;

/** notice({ variant, parts, preview, action: { label, onClick } }) — time/category default to "Now" / "Event". */
export function EventNoticeProvider({ children }) {
  const [notices, setNotices] = useState([]);
  const seq = useRef(0);
  const dismiss = useCallback(id => setNotices(list => list.filter(item => item.id !== id)), []);
  const notice = useCallback(props => {
    const id = ++seq.current;
    setNotices(list => [...list, { time: 'Now', category: 'Event', ...props, id }]);
    setTimeout(() => dismiss(id), DURATION);
  }, [dismiss]);
  return <NoticeContext.Provider value={notice}>
    {children}
    {createPortal(<div className="toaster vp-event-toaster" aria-live="polite">
      {notices.map(({ id, action, ...props }) => <Notification key={id} {...props}
        action={action && { label: action.label, onClick: () => { action.onClick(); dismiss(id); } }} />)}
    </div>, document.body)}
  </NoticeContext.Provider>;
}
