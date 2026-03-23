import { useEffect, useRef } from "react";

export function usePushNotifications(unreadCount: number) {
  const prevCountRef = useRef<number>(unreadCount);

  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    const prev = prevCountRef.current;
    if (unreadCount > prev && Notification.permission === "granted") {
      new Notification("ParkPing - New Message", {
        body: "Someone left a message on one of your vehicles.",
        icon: "/favicon.ico",
      });
    }
    prevCountRef.current = unreadCount;
  }, [unreadCount]);
}
