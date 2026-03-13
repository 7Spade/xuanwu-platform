// Firebase Cloud Messaging Service Worker
//
// Copy this file to `public/firebase-messaging-sw.js` and fill in your
// Firebase configuration values. Do NOT import from src/ here — this file
// runs in a service worker context, outside of the Next.js bundle.
//
// See: https://firebase.google.com/docs/cloud-messaging/js/receive

importScripts("https://www.gstatic.com/firebasejs/10.0.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.0.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "REPLACE_WITH_YOUR_API_KEY",
  authDomain: "REPLACE_WITH_YOUR_AUTH_DOMAIN",
  projectId: "REPLACE_WITH_YOUR_PROJECT_ID",
  storageBucket: "REPLACE_WITH_YOUR_STORAGE_BUCKET",
  messagingSenderId: "REPLACE_WITH_YOUR_MESSAGING_SENDER_ID",
  appId: "REPLACE_WITH_YOUR_APP_ID",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const { title = "Xuanwu Platform", body = "" } = payload.notification ?? {};
  self.registration.showNotification(title, { body, icon: "/icon.png" });
});
