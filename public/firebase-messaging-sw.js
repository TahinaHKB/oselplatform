// firebase-messaging-sw.js
importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js");

const firebaseConfig = {
  apiKey: "AIzaSyDD8cIbN4xaZkKn08FAvRhrv1Lbkdo2JQw",
  authDomain: "platformosel.firebaseapp.com",
  projectId: "platformosel",
  storageBucket: "platformosel.firebasestorage.app",
  messagingSenderId: "267687643639",
  appId: "1:267687643639:web:7feb782d38d9c3322e46f2",
  measurementId: "G-DLYG43HN8M",
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
