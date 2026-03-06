import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

const vapidKey =
  "BCnhGpIlv_iCA2rUyyYH4ZX2Zo2VRt0ZZ8nv6AFlFg75hE3vARPPEgTJKiUOdidoKzQb0zMM3nDeU6Ayp_v0ofk"; // depuis Firebase console

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
