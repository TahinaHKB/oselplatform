import { collection, addDoc, serverTimestamp, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

type NotificationType = "message" | "commentaire" | "like" | "systeme";

export async function addGlobalNotification(
  senderUid: string | undefined,
  receiverUid: string | undefined,
  type: NotificationType,
  contenu: string,
  fcmToken:string | undefined,
  relatedResourceId?: string,
) {
  const notifRef = collection(db, "notifications");

  await addDoc(notifRef, {
    senderUid,
    receiverUid,
    type,
    contenu,
    relatedResourceId: relatedResourceId || null,
    lu: false,
    createdAt: serverTimestamp(),
    fcmToken
  });
}

export function listenToUserNotifications(uid: string, callback: Function) {
  const q = query(
    collection(db, "notifications"),
    where("receiverUid", "==", uid),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(q, (snapshot) => {
    const notifs = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    callback(notifs);
  });
}
