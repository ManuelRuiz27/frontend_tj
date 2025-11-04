import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { registerSW } from 'virtual:pwa-register';
import App from './App';
import { store } from './store';
import './styles/theme.css';
import { initSentry } from './lib/sentry';

initSentry();

registerSW({
  immediate: true,
  onRegistered(swRegistration) {
    if (swRegistration && swRegistration.update) {
      swRegistration.update().catch(() => {
        // Ignored: fallback to next autoUpdate cycle
      });
    }
  },
});

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);
