import { useEffect, useState } from "react";
import { listenToUserNotifications } from "../component/Notification";
import { Card, CardContent } from "@/components/ui/card";
import { Bell } from "lucide-react";
import { motion } from "framer-motion";
import { auth } from "../firebase";
import type { NotificationItem } from "../data/postTest";
import NavBar from "@/component/NavBar";

export default function NotificationsPage() {
  const [notifs, setNotifs] = useState<NotificationItem[]>([]);
  const currentUser = auth.currentUser;

  useEffect(() => {
    if (!currentUser) return;
    const unsub = listenToUserNotifications(currentUser.uid, setNotifs);
    return () => unsub();
  }, [currentUser?.uid]);

  return (
    <>
      <NavBar />
      <div className="min-h-screen p-4 flex flex-col items-center bg-gray-50 dark:bg-gray-900">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-2xl font-bold mb-4 text-gray-900 dark:text-white"
        >
          Notifications
        </motion.h1>

        <div className="w-full max-w-xl space-y-3">
          {notifs.length === 0 && (
            <p className="text-center text-gray-500 dark:text-gray-400">
              No notifications yet.
            </p>
          )}

          {notifs.map((notif, index) => (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="rounded-2xl shadow p-2 bg-white dark:bg-gray-800">
                <CardContent className="flex items-start gap-3 p-4">
                  <Bell className="w-6 h-6 text-blue-500 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-gray-900 dark:text-white font-semibold">
                      {notif.type.charAt(0).toUpperCase() + notif.type.slice(1)}
                    </p>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      {notif.contenu}
                    </p>

                    {notif.createdAt && (
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(
                          notif.createdAt.seconds * 1000
                        ).toLocaleString()}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </>
  );
}
