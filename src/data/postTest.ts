export interface PostComment {
  id?: string;
  username: string;
  userId: string;
  content: string;
  createdAt: string;
}

export interface Post {
  id: string;
  content: string;
  imageUrl?: string;
  createdAt: string;
  userId?: string;
  username?: string;
  fcmToken ?: string;
  profilePic?: string;
  loveCount?: number;
  comments?: PostComment[];
}

export interface NotificationItem {
  id: string;                     // id du document Firestore
  type: "message" | "comment" | "like" | "follow" | "system";  
  contenu: string;                // texte à afficher
  receiverUid?: string;               // celui qui a déclenché la notif
  senderUid?: string;  
  relatedRessourceId?: string;        // nom visible
  createdAt: any;                 // Timestamp Firestore
  lu: boolean;                // a été vu ou pas
}



export const testPosts: Post[] = [
  {
    id: "1",
    content:
      "Aujourd'hui j'ai découvert Cloudinary, c'est super pratique pour stocker des images !",
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    content:
      "Je travaille sur mon profil utilisateur React + Firebase, ça avance bien 😎",
    createdAt: new Date().toISOString(),
  },
  {
    id: "3",
    content:
      "Test de publication : juste pour voir comment ça s'affiche dans l'UI.",
    createdAt: new Date().toISOString(),
  },
  {
    id: "4",
    content: "Envie de coder toute la nuit… qui est avec moi ? 💻🔥",
    createdAt: new Date().toISOString(),
  },
  {
    id: "5",
    content:
      "Aujourd'hui j'ai mis à jour mon profil et ajouté une photo de profil.",
    createdAt: new Date().toISOString(),
  },
];