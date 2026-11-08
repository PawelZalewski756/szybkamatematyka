import { streakReminderMessage } from "@/lib/reminders/streak-reminder";

const NOTIFICATION_ICON = "/icons/icon-192.png";

export type NotificationPermissionState = NotificationPermission | "unsupported";

export function getNotificationPermission(): NotificationPermissionState {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported";
  }
  return Notification.permission;
}

export function canUseBrowserNotifications(): boolean {
  return getNotificationPermission() !== "unsupported";
}

/** Prośba o zgodę - wywoływać tylko w reakcji na gest użytkownika. */
export async function requestNotificationPermission(): Promise<NotificationPermissionState> {
  if (!canUseBrowserNotifications()) return "unsupported";
  try {
    const result = await Notification.requestPermission();
    return result;
  } catch {
    return Notification.permission;
  }
}

/** Jednorazowe powiadomienie systemowe - tylko gdy permission === granted. */
export function showStreakBrowserNotification(streak: number): boolean {
  if (getNotificationPermission() !== "granted") return false;

  const { title, body } = streakReminderMessage(streak);
  try {
    new Notification(title, {
      body,
      icon: NOTIFICATION_ICON,
    });
    return true;
  } catch {
    return false;
  }
}
