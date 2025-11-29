import * as Notifications from 'expo-notifications';
import { Marker } from '../types';

export interface ActiveNotification { // для активных уведомлений
  markerId: string;
  notificationId: string;
  timestamp: number;
}

class NotificationManager {
  private activeNotifications: Map<string, ActiveNotification>;
  private readonly PROXIMITY_THRESHOLD = 50; // 50 метров радиус

  constructor() {
    this.activeNotifications = new Map();
  }

  async initialize(): Promise<void> {
    const { status } = await Notifications.requestPermissionsAsync(); //запрашивает разрешение на уведомления у пользователя?
    if (status !== 'granted') {
      throw new Error('Разрешение на уведомления не предоставлено');
    }

    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,    
        shouldShowList: true       
      }),
    });
  }

  async showNotification(marker: Marker): Promise<void> {
    if (this.activeNotifications.has(marker.id)) {
      return; // Если уведомление уже активно, выходим, предотвращая дубликаты
    }

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: "Вы рядом с меткой!",
        body: `Вы находитесь рядом с "${marker.title}"`,
        data: { markerId: marker.id },
      },
      trigger: null
    });

    this.activeNotifications.set(marker.id, { // Сохранение в Map!!
      markerId: marker.id,
      notificationId,
      timestamp: Date.now()
    });
  }

async removeNotification(markerId: string): Promise<void> {
  const notification = this.activeNotifications.get(markerId);
  if (notification) {
    await Notifications.dismissNotificationAsync(notification.notificationId);
    this.activeNotifications.delete(markerId);
  }
}

  getProximityThreshold(): number {
    return this.PROXIMITY_THRESHOLD; // 50 м
  }

  getActiveNotifications(): Map<string, ActiveNotification> {
    return new Map(this.activeNotifications); //копия с активными уведамлениями
  }
}

export const notificationManager = new NotificationManager(); 