// firebase-messaging-sw.js
importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js");

const firebaseConfig = {
  apiKey: "AIzaSyCFEZ3y0-IndIXvWiDCtNnE72BMxovBhhc",
  authDomain: "oselplatform.firebaseapp.com",
  projectId: "oselplatform",
  storageBucket: "oselplatform.firebasestorage.app",
  messagingSenderId: "125834444785",
  appId: "1:125834444785:web:16419d191c54198f874e50",
  measurementId: "G-V5VLX07JG4",
};

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log("[firebase-messaging-sw.js] Received background message:", payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "/logo.png", // facultatif
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
