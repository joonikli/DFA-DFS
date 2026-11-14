// Manager app (Bridget): Dashboard · Messages · Report composer
import { PopProvider, ToastProvider, LiveRegion, useGlobalTooltips } from './components/ui.jsx';
import { Shell } from './components/Shell.jsx';
import { useRoute } from './lib/router.js';
import Dashboard from './features/dashboard/Dashboard.jsx';
import Messages from './features/messages/Messages.jsx';
import Report from './features/report/Report.jsx';
import Events from './features/events/Events.jsx';
import Profiles from './features/profiles/Profiles.jsx';
import Surveys from './features/surveys/Surveys.jsx';
import Grants from './features/grants/Grants.jsx';
import GrantReport from './features/grants/GrantReport.jsx';

function Routes() {
  useGlobalTooltips();
  const { route, params } = useRoute();
  if (route === 'grant-report') return <div className="route-enter" key="grant-report"><GrantReport params={params} /></div>;
  if (route === 'report') return <div className="route-enter" key="report"><Report params={params} /></div>;
  if (route === 'events') return <div className="route-enter" key="events"><Shell route="events" routes={['dashboard', 'events', 'surveys', 'grants', 'messages']}><Events /></Shell></div>;
  if (route === 'surveys') return <div className="route-enter" key="surveys"><Shell route="surveys" routes={['dashboard', 'events', 'surveys', 'grants', 'messages']}><Surveys /></Shell></div>;
  if (route === 'grants') return <div className="route-enter" key="grants"><Shell route="grants" routes={['dashboard', 'events', 'surveys', 'grants', 'messages']}><Grants /></Shell></div>;
  if (route === 'profile') return <div className="route-enter" key="profile"><Shell route="profile"><Profiles key={`${params.get('type')}/${params.get('id')}`} params={params} /></Shell></div>;
  return (
    <div className="route-enter" key={route}>
      <Shell route={route === 'messages' ? 'messages' : 'dashboard'}>
        {route === 'messages' ? <Messages /> : <Dashboard />}
      </Shell>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <PopProvider>
        <Routes />
        <LiveRegion />
      </PopProvider>
    </ToastProvider>
  );
}
