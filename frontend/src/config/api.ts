const isBrowser = typeof window !== 'undefined';
const host = isBrowser ? window.location.hostname : 'localhost';
const protocol = isBrowser ? window.location.protocol : 'http:';

export const API_URL = 
  import.meta.env.VITE_API_URL || 
  (host === 'localhost' || host === '127.0.0.1' ? 'http://localhost:4000' : `${protocol}//${host}:4000`);

export const MEDIA_URL = 
  import.meta.env.VITE_MEDIA_URL || 
  (host === 'localhost' || host === '127.0.0.1' ? 'http://localhost:8000' : `${protocol}//${host}:8000`);

export const WS_URL = 
  import.meta.env.VITE_WS_URL || API_URL;
