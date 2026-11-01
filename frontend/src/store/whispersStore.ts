import { create } from 'zustand';

export interface WhisperMessage {
  id: string;
  sender: string;
  text: string;
  time: string;
  isMe: boolean;
}

export interface Conversation {
  id: string;
  username: string;
  avatar: string;
  online: boolean;
  lastMessage: string;
  unread: boolean;
  messages: WhisperMessage[];
}

interface WhispersState {
  isOpen: boolean;
  activeConversationId: string | null;
  conversations: Conversation[];
  toggleOpen: () => void;
  setOpen: (open: boolean) => void;
  setActiveConversation: (id: string | null) => void;
  sendMessage: (conversationId: string, text: string) => void;
  startConversation: (username: string) => void;
  unreadTotal: () => number;
}

const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: 'devninja',
    username: 'DevNinja',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    online: true,
    lastMessage: 'Dzięki za wpadnięcie na stream! Następny live w piątek.',
    unread: true,
    messages: [
      { id: '1', sender: 'DevNinja', text: 'Cześć! Widziałem Twoją wiadomość na czacie.', time: '14:20', isMe: false },
      { id: '2', sender: 'Me', text: 'Hej! Super stream z kodowania, świetna architektura.', time: '14:22', isMe: true },
      { id: '3', sender: 'DevNinja', text: 'Dzięki za wpadnięcie na stream! Następny live w piątek.', time: '14:25', isMe: false }
    ]
  },
  {
    id: 'globalelite',
    username: 'GlobalElite',
    avatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=100&auto=format&fit=crop&q=80',
    online: true,
    lastMessage: 'Grasz z nami dzisiaj mecz na Faceicie?',
    unread: false,
    messages: [
      { id: '1', sender: 'GlobalElite', text: 'Grasz z nami dzisiaj mecz na Faceicie?', time: 'Wczoraj', isMe: false }
    ]
  }
];

export const useWhispersStore = create<WhispersState>((set, get) => ({
  isOpen: false,
  activeConversationId: 'devninja',
  conversations: INITIAL_CONVERSATIONS,
  toggleOpen: () => set((state) => ({ isOpen: !state.isOpen })),
  setOpen: (open) => set({ isOpen: open }),
  setActiveConversation: (id) =>
    set((state) => ({
      activeConversationId: id,
      conversations: state.conversations.map((c) =>
        c.id === id ? { ...c, unread: false } : c
      )
    })),
  sendMessage: (conversationId, text) => {
    if (!text.trim()) return;
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const newMsg: WhisperMessage = {
      id: Date.now().toString(),
      sender: 'Me',
      text: text.trim(),
      time: timeStr,
      isMe: true
    };

    set((state) => ({
      conversations: state.conversations.map((conv) => {
        if (conv.id === conversationId) {
          return {
            ...conv,
            lastMessage: text.trim(),
            messages: [...conv.messages, newMsg]
          };
        }
        return conv;
      })
    }));

    // Automatyczna przykładowa odpowiedź od bota/streamera po 1.5s
    setTimeout(() => {
      const replyMsg: WhisperMessage = {
        id: (Date.now() + 1).toString(),
        sender: conversationId,
        text: `Dzięki za wiadomość! Odpowiem jak skończę rundę/mecz ⚡`,
        time: timeStr,
        isMe: false
      };
      set((state) => ({
        conversations: state.conversations.map((conv) => {
          if (conv.id === conversationId) {
            return {
              ...conv,
              lastMessage: replyMsg.text,
              messages: [...conv.messages, replyMsg]
            };
          }
          return conv;
        })
      }));
    }, 1500);
  },
  startConversation: (username) => {
    const id = username.toLowerCase();
    const existing = get().conversations.find((c) => c.id === id);
    if (!existing) {
      const newConv: Conversation = {
        id,
        username,
        avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80`,
        online: true,
        lastMessage: 'Rozpoczęto nową konwersację.',
        unread: false,
        messages: []
      };
      set((state) => ({
        conversations: [newConv, ...state.conversations],
        activeConversationId: id,
        isOpen: true
      }));
    } else {
      set({ activeConversationId: id, isOpen: true });
    }
  },
  unreadTotal: () => get().conversations.filter((c) => c.unread).length
}));
