import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './ManagerApp.jsx';
// Design-system tokens + text styles, so the shared components (src/components) render correctly here
import './tokens/tokens.css';
import './styles/typography.css';
import './styles.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
