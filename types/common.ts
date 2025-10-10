import { Signature } from "starknet";

// Auth Store Types
export interface User {
    id: string;
    sub: string;
    walletAddress: string;
    name?: string;
    email?: string;
    avatar?: string;
    token?: string;
    createdAt?: string;
    updatedAt?: string;
  }
  
  export interface AuthState {
    user: User | null;
    loading: boolean;
    isAuthenticated: boolean;
    error: string | null;
  }
  
  export interface AuthActions {
    setUser: (user: User | null) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    requestNonce: (walletAddress: string) => Promise<string>;
    verifySignature: (walletAddress: string, signature: Signature) => Promise<void>;
    logout: () => Promise<void>;
    clearError: () => void;
  }
  
  // export type AuthStore = AuthState & AuthActions;
  
  export type AuthStore = {
    user: User | null;
    loading: boolean;
    isAuthenticated: boolean;
    error: string | null;
    setUser: (user: User | null) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    clearError: () => void;
    requestNonce: (walletAddress: string) => Promise<string>;
    verifySignature: (
      walletAddress: string,
      // signature: [string, string], // Changed from string to [string, string]
      signature: Signature,
      nonce: string,
      walletType: 'argentx' | 'braavos' | null,
    ) => Promise<void>;
    loginWithEmail: (
      email: string,
      password: string

    ) => Promise<void>;
    loginWithOAuth: () => Promise<void>;
    logout: () => Promise<void>;
  };
  

  
  // User Preferences Store Types
  export interface Theme {
    mode: 'light' | 'dark' | 'system';
    primaryColor: string;
    fontFamily: string;
  }
  
  export interface NotificationSettings {
    email: boolean;
    push: boolean;
    newListings: boolean;
    priceUpdates: boolean;
    bidActivity: boolean;
    auctions: boolean;
  }
  
  export interface DisplaySettings {
    gridView: 'grid' | 'list';
    itemsPerPage: number;
    showPrice: boolean;
    showCreator: boolean;
    showLikes: boolean;
    currency: 'ETH' | 'STRK' | 'USD';
  }
  
  export interface PreferencesState {
    theme: Theme;
    notifications: NotificationSettings;
    display: DisplaySettings;
    language: string;
    timezone: string;
    recentSearches: string[];
    favoriteCollections: string[];
    watchlist: string[];
    isHydrated: boolean;
  }
  
  export interface PreferencesActions {
    setTheme: (theme: Partial<Theme>) => void;
    setNotifications: (notifications: Partial<NotificationSettings>) => void;
    setDisplay: (display: Partial<DisplaySettings>) => void;
    setLanguage: (language: string) => void;
    setTimezone: (timezone: string) => void;
    addRecentSearch: (search: string) => void;
    clearRecentSearches: () => void;
    addToFavorites: (collectionId: string) => void;
    removeFromFavorites: (collectionId: string) => void;
    addToWatchlist: (nftId: string) => void;
    removeFromWatchlist: (nftId: string) => void;
    resetPreferences: () => void;
    setHydrated: (hydrated: boolean) => void;
  }
  
  export type PreferencesStore = PreferencesState & PreferencesActions;
  
  // App Store Types (Global UI state)
  export interface AppState {
    isOnline: boolean;
    sidebarOpen: boolean;
    modalStack: string[];
    toast: {
      message: string;
      type: 'success' | 'error' | 'warning' | 'info';
      id: string;
    } | null;
    searchQuery: string;
    searchFilters: {
      category: string;
      priceRange: [number, number];
      sortBy: 'newest' | 'oldest' | 'price_low' | 'price_high' | 'most_liked';
    };
  }
  
  export interface AppActions {
    setOnline: (online: boolean) => void;
    setSidebarOpen: (open: boolean) => void;
    pushModal: (modalId: string) => void;
    popModal: () => void;
    clearModals: () => void;
    showToast: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
    hideToast: () => void;
    setSearchQuery: (query: string) => void;
    setSearchFilters: (filters: Partial<AppState['searchFilters']>) => void;
    resetSearchFilters: () => void;
  }
  
  export type AppStore = AppState & AppActions;
  
  // Combined store type for DevTools
  export interface RootStore {
    auth: AuthStore;
    preferences: PreferencesStore;
    app: AppStore;
  } 