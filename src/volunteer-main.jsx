import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import VolunteerApp from './volunteer/VolunteerApp.jsx';
import './styles.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <VolunteerApp />
  </StrictMode>,
);
