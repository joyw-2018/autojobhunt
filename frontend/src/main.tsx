import React from 'react';
import ReactDOM from 'react-dom/client';
import { datadogRum } from '@datadog/browser-rum';
import App from './App';
import './index.css';

datadogRum.init({
  applicationId: 'ba9747e4-23e1-4a49-9597-387e21751e18',
  clientToken: 'pube5e1d0a5c6eef449474533a410a9bfa4',
  site: 'datadoghq.com',
  service: 'autojobhunt-web',
  env: import.meta.env.MODE || 'dev',
  version: '1.0.0',
  sessionSampleRate: 100,
  sessionReplaySampleRate: 20,
  trackResources: true,
  trackUserInteractions: true,
  trackLongTasks: true,
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
