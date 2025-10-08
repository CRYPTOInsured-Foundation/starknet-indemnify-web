// src/store/slices/app-slice.ts
import type { StateCreator } from "zustand";
import type { AppStore } from "@/types/common";

type ToastKind = "success" | "error" | "warning" | "info";

export const initialAppState: Pick<
  AppStore,
  | "isOnline"
  | "sidebarOpen"
  | "modalStack"
  | "toast"
  | "searchQuery"
  | "searchFilters"
> = {
  isOnline: true,
  sidebarOpen: false,
  modalStack: [],
  toast: null,
  searchQuery: "",
  searchFilters: {
    category: "",
    priceRange: [0, 1000],
    sortBy: "newest",
  },
};

export const createAppSlice: StateCreator<AppStore> = (set, get) => ({
  ...initialAppState,

  // Online status
  setOnline: (online: boolean) => {
    set({ isOnline: online });
  },

  // Sidebar actions
  setSidebarOpen: (open: boolean) => {
    set({ sidebarOpen: open });
  },

  // Modal actions
  pushModal: (modalId: string) => {
    const prev = get().modalStack;
    set({ modalStack: [...prev, modalId] });
  },

  popModal: () => {
    const prev = get().modalStack;
    set({ modalStack: prev.slice(0, -1) });
  },

  clearModals: () => {
    set({ modalStack: [] });
  },

  // Toast actions — type is strongly typed
  showToast: (message: string, type: ToastKind) => {
    set({
      toast: {
        message,
        type,
        id: Date.now().toString(),
      },
    });
  },

  hideToast: () => {
    set({ toast: null });
  },

  // Search actions
  setSearchQuery: (query: string) => {
    set({ searchQuery: query });
  },

  setSearchFilters: (filters: Partial<AppStore["searchFilters"]>) => {
    set({ searchFilters: { ...get().searchFilters, ...filters } });
  },

  resetSearchFilters: () => {
    set({
      searchFilters: {
        category: "",
        priceRange: [0, 1000],
        sortBy: "newest",
      },
    });
  },
});











// import { AppStore } from "../types/common";

// export const initialAppState = {
//   isOnline: true,
//   sidebarOpen: false,
//   modalStack: [] as string[],
//   toast: null as AppStore["toast"],
//   searchQuery: "",
//   searchFilters: {
//     category: "",
//     priceRange: [0, 1000] as [number, number],
//     sortBy: "newest" as const,
//   },
// };

// export const createAppSlice = (
//   set: (fn: (state: AppStore) => void) => void,
//   get: () => AppStore
// ): AppStore => ({
//   ...initialAppState,

//   // Online status
//   setOnline: (online) =>
//     set((state) => {
//       state.isOnline = online;
//     }),

//   // Sidebar actions
//   setSidebarOpen: (open) =>
//     set((state) => {
//       state.sidebarOpen = open;
//     }),

//   // Modal actions
//   pushModal: (modalId) =>
//     set((state) => {
//       state.modalStack.push(modalId);
//     }),

//   popModal: () =>
//     set((state) => {
//       state.modalStack.pop();
//     }),

//   clearModals: () =>
//     set((state) => {
//       state.modalStack = [];
//     }),

//   // Toast actions
//   showToast: (message, type) =>
//     set((state) => {
//       state.toast = {
//         message,
//         type,
//         id: Date.now().toString(),
//       };
//     }),

//   hideToast: () =>
//     set((state) => {
//       state.toast = null;
//     }),

//   // Search actions
//   setSearchQuery: (query) =>
//     set((state) => {
//       state.searchQuery = query;
//     }),

//   setSearchFilters: (filters) =>
//     set((state) => {
//       state.searchFilters = { ...state.searchFilters, ...filters };
//     }),

//   resetSearchFilters: () =>
//     set((state) => {
//       state.searchFilters = {
//         category: "",
//         priceRange: [0, 1000],
//         sortBy: "newest",
//       };
//     }),
// });
