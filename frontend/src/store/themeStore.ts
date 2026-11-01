import { create } from 'zustand';

interface LayoutState {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
}

export const useThemeStore = create<LayoutState>((set) => ({
  sidebarCollapsed: localStorage.getItem('auracast_sidebar') === 'true',
  toggleSidebar: () => set((state) => {
    const next = !state.sidebarCollapsed;
    localStorage.setItem('auracast_sidebar', String(next));
    return { sidebarCollapsed: next };
  }),
  setSidebarCollapsed: (collapsed) => {
    localStorage.setItem('auracast_sidebar', String(collapsed));
    set({ sidebarCollapsed: collapsed });
  }
}));
