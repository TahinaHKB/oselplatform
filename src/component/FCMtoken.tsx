import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

const vapidKey =
  "BFrAnJeX1GZw4CJ8a2aIdeh5wRJp0wCzcZP01W6VsyybbV6FLdQtmc0EMe8YyGwkAPUSjW7TkI2wZ88yZXCNJfw"; // depuis Firebase console

export default async function updateFCMToken() {
  const user = auth.currentUser;
  if (!user) return;
  const messaging = getMessaging();

  try {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    // Récupère le token FCM
    const newToken = await getToken(messaging, { vapidKey });
    if (!newToken) {
      console.warn("Impossible de récupérer le token FCM");
      return;
    }

    // Sauvegarde le token dans Firestore
    await setDoc(
      doc(db, "users", user.uid),
      { fcmToken: newToken },
      { merge: true }
    );

    // Écoute les notifications entrantes
    onMessage(messaging, (payload) => {
      console.log("📩 Nouveau message reçu :", payload);
      new Notification(payload.notification?.title || "Nouvelle notif", {
        body: payload.notification?.body,
      });
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du FCM token :", error);
  }
}
