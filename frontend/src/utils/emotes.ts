export interface EmoteInfo {
  code: string;
  url: string;
  name: string;
  group: 'Popularne' | 'Klasyczne' | 'Memy';
}

export const EMOTE_LIST: EmoteInfo[] = [
  { code: 'Kappa', url: 'https://static-cdn.jtvnw.net/emoticons/v2/25/default/dark/2.0', name: 'Kappa', group: 'Klasyczne' },
  { code: 'LUL', url: 'https://static-cdn.jtvnw.net/emoticons/v2/425618/default/dark/2.0', name: 'LUL', group: 'Klasyczne' },
  { code: 'PogChamp', url: 'https://static-cdn.jtvnw.net/emoticons/v2/30259/default/dark/2.0', name: 'PogChamp', group: 'Klasyczne' },
  { code: 'Kreygasm', url: 'https://static-cdn.jtvnw.net/emoticons/v2/41/default/dark/2.0', name: 'Kreygasm', group: 'Klasyczne' },
  { code: 'BibleThump', url: 'https://static-cdn.jtvnw.net/emoticons/v2/86/default/dark/2.0', name: 'BibleThump', group: 'Klasyczne' },
  { code: 'ResidentSleeper', url: 'https://static-cdn.jtvnw.net/emoticons/v2/245/default/dark/2.0', name: 'ResidentSleeper', group: 'Klasyczne' },
  { code: 'KEKW', url: 'https://cdn.betterttv.net/emote/5e9c6c187e090362f8b0b614/2x', name: 'KEKW', group: 'Memy' },
  { code: 'PepeHands', url: 'https://cdn.betterttv.net/emote/59f27b3f49e4386e71329977/2x', name: 'PepeHands', group: 'Memy' },
  { code: 'monkaS', url: 'https://cdn.betterttv.net/emote/56e9f494fff3cc5c35e5287e/2x', name: 'monkaS', group: 'Memy' },
  { code: 'catJAM', url: 'https://cdn.betterttv.net/emote/5f1b0186cf6d2144653d2970/2x', name: 'catJAM', group: 'Popularne' },
  { code: 'EZ', url: 'https://cdn.betterttv.net/emote/5590b223b344e2c1600d703d/2x', name: 'EZ', group: 'Popularne' },
  { code: 'Sadge', url: 'https://cdn.betterttv.net/emote/5e0fa9d40550d42106b8a489/2x', name: 'Sadge', group: 'Memy' },
  { code: 'POGGERS', url: 'https://cdn.betterttv.net/emote/58ae8407ff7b7276f8e594f2/2x', name: 'POGGERS', group: 'Popularne' },
  { code: 'Gigachad', url: 'https://cdn.betterttv.net/emote/60bf6083f8b3f62601c3600f/2x', name: 'Gigachad', group: 'Memy' },
  { code: 'RushB', url: 'https://static-cdn.jtvnw.net/emoticons/v2/301436573/default/dark/2.0', name: 'RushB', group: 'Popularne' }
];

export const EMOTE_MAP: Record<string, string> = EMOTE_LIST.reduce((acc, curr) => {
  acc[curr.code] = curr.url;
  return acc;
}, {} as Record<string, string>);

// Paleta kolorów nicków wzorowana na Twitch & Kick
const CHAT_COLORS = [
  '#FF0000', '#0000FF', '#00FF7F', '#B22222', '#FF7F50',
  '#9ACD32', '#FF4500', '#2E8B57', '#DAA520', '#D2691E',
  '#5F9EA0', '#1E90FF', '#FF69B4', '#8A2BE2', '#00FF00',
  '#39FF14', '#53FC18', '#A970FF', '#FF9900', '#00E701'
];

export const stringToChatColor = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % CHAT_COLORS.length;
  return CHAT_COLORS[index] || '#9146FF';
};
