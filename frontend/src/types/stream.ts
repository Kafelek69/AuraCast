export interface StreamChannel {
  id?: string | number;
  display_name: string;
  title: string;
  current_category: string;
  is_live: boolean;
  avatar_url?: string;
  offline_banner?: string;
  bio?: string;
  viewers?: number;
  tags?: string[];
  stream_key?: string;
  started_at?: string;
}

export interface CategoryItem {
  id: string;
  name: string;
  viewers: string;
  tags: string[];
  image: string;
  isNew?: boolean;
}

export interface ChatMessage {
  id?: string;
  username: string;
  message: string;
  timestamp?: string | Date;
  badges?: string[];
  color?: string;
}

export interface EmoteData {
  code: string;
  url: string;
  category: 'Twitch Classic' | 'Kick & Memes' | 'Gry';
}
