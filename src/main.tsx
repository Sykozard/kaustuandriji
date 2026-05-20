import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

declare global {
  interface Window {
    OneSignalDeferred: any[];
  }
}

window.OneSignalDeferred = window.OneSignalDeferred || [];

const script = document.createElement('script');
script.src = 'https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js';
script.defer = true;
document.head.appendChild(script);

const params = new URLSearchParams(window.location.search);
const user = params.get('user');

window.OneSignalDeferred.push(async function (OneSignal) {
  await OneSignal.init({
    appId: "e46f14ac-f050-4201-a38f-1a2a861f5881",
    notifyButton: {
      enable: false,
    },
  });

  if (user) {
    await OneSignal.login(user);
  }
});

createRoot(document.getElementById('root')!).render(<App />);
