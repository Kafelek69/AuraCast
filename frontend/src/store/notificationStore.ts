import { create } from 'zustand';

export interface NotificationItem {
  id: string;
  streamerId: string;
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  type: 'live' | 'mention' | 'system';
}

interface NotificationState {
  notifications: NotificationItem[];
  unreadCount: () => number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  addNotification: (notification: Omit<NotificationItem, 'id' | 'isRead'>) => void;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: '1',
    streamerId: 'devninja',
    title: 'DevNinja rozpoczął transmisję!',
    message: 'Budujemy AuraCast - Backend i WebSockety na żywo!',
    time: '5 min temu',
    isRead: false,
    type: 'live'
  },
  {
    id: '2',
    streamerId: 'globalelite',
    title: 'GlobalElite gra w CS2',
    message: 'Finały turnieju 3000 ELO na Faceit | Oglądaj!',
    time: '25 min temu',
    isRead: false,
    type: 'live'
  },
  {
    id: '3',
    streamerId: 'craftkreator',
    title: 'Nowy odcinek u CraftKreator',
    message: 'Megamiasto w trybie Hardcore - budujemy doki!',
    time: '2 godz. temu',
    isRead: true,
    type: 'live'
  }
];

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: INITIAL_NOTIFICATIONS,
  unreadCount: () => get().notifications.filter((n) => !n.isRead).length,
  markAsRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, isRead: true } : n
      )
    })),
  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true }))
    })),
  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id)
    })),
  addNotification: (item) =>
    set((state) => ({
      notifications: [
        {
          ...item,
          id: Date.now().toString(),
          isRead: false
        },
        ...state.notifications
      ]
    }))
}));
