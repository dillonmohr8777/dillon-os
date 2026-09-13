import React from 'react';
import ReactDOM from 'react-dom/client';
import './fonts.css';
import './styles.css';
import { SignalHomepage } from './concepts/SignalHomepage';

document.title = 'Need Momentum — Make It Move.';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SignalHomepage />
  </React.StrictMode>
);
