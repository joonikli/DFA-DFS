// Manager app (Bridget): Dashboard · Messages · Report composer
import { PopProvider, ToastProvider, LiveRegion, useGlobalTooltips } from './components/ui.jsx';
import { Shell } from './components/Shell.jsx';
import { useRoute } from './lib/router.js';
import Dashboard from './features/dashboard/Dashboard.jsx';
import Messages from './features/messages/Messages.jsx';
import Report from './features/report/Report.jsx';

function Routes() {
  useGlobalTooltips();
  const { route, params } = useRoute();
  if (route === 'report') return <div className="route-enter" key="report"><Report params={params} /></div>;
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
