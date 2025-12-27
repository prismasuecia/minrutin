import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { registerSW } from 'virtual:pwa-register'

ReactDOM.createRoot(document.getElementById("root")!).render(
<React.StrictMode>
  <App />
</React.StrictMode>
);

// PWA update flow: prompt user or auto-apply updates, then reload
const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    const confirmUpdate = window.confirm('Ny uppdatering finns. Starta om appen för att få den senaste versionen?');
    if (confirmUpdate) {
      updateSW(true);
    }
  },
  onOfflineReady() {
    // App is ready to work offline; no action needed
  },
  onRegisterError(error) {
    console.error('SW register error:', error);
  }
});

// Fallback: if a new controller takes over, reload to apply updates
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    window.location.reload();
  });
}