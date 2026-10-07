export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  const result = await Notification.requestPermission();
  return result === 'granted';
}

export function isNotificationSupported(): boolean {
  return 'Notification' in window;
}

export function getNotificationStatus(): string {
  if (!isNotificationSupported()) return 'Not supported';
  return Notification.permission;
}

export function scheduleNotification(title: string, body: string, delayMs: number): number | null {
  if (!isNotificationSupported() || Notification.permission !== 'granted') return null;
  const id = window.setTimeout(() => {
    new Notification(title, {
      body,
      icon: '/icon.svg',
      badge: '/icon.svg',
    });
  }, delayMs);
  return id;
}

export function cancelScheduledNotification(timerId: number): void {
  window.clearTimeout(timerId);
}
