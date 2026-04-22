import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";

export function useAuth() {
  const [User, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [emailVerified, setEmailVerified] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setEmailVerified(false);
        setLoading(false);
        return;
      }

      // 🔥 recharge pour avoir valeur à jour
      await firebaseUser.reload();

      setUser(firebaseUser);
      setEmailVerified(firebaseUser.emailVerified);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { User, emailVerified, loading };
}
