// Safely patch window.fetch to prevent TypeError: Cannot set property fetch of #<Window> which has only a getter
try {
  const originalFetch = window.fetch;
  Object.defineProperty(window, 'fetch', {
    get() { return originalFetch; },
    set(v) { (window as any)._customFetch = v; }, // safely store it if someone sets it
    configurable: true
  });
} catch (e) {
  console.warn("Failed to patch window.fetch:", e);
}

import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
