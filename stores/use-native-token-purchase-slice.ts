// src/store/use-native-token-purchase-slice.ts
import { StateCreator } from "zustand";
import { getCookie } from "@/lib/utils";
import { API_CONFIG } from "@/config/urls";

export interface NativeTokenPurchase {
  id: string;
  transactionId: string;
  buyer: any;
  seller?: any;
  tokenAddress: string;
  tokenSymbol: string;
  quantity: string;
  unitPrice: string;
  totalPricePaid: string;
  paymentDate: string;
  updatedAt: string;
  txnHash: string;
  paymentStatus: string;
}

export interface NativeTokenPurchaseSlice {
  tokenPurchases: NativeTokenPurchase[];
  selectedTokenPurchase: NativeTokenPurchase | null;
  isLoadingTokenPurchase: boolean;
  tokenPurchaseError: string | null;
  hasLoadedTokenPurchases: boolean;

  // Mutators
  setTokenPurchases: (purchases: NativeTokenPurchase[]) => void;
  setSelectedTokenPurchase: (purchase: NativeTokenPurchase | null) => void;
  setTokenPurchaseLoading: (loading: boolean) => void;
  setTokenPurchaseError: (error: string | null) => void;

  // API
  fetchTokenPurchases: () => Promise<{ success: boolean; purchases?: NativeTokenPurchase[] }>;
  fetchTokenPurchasesByUser: (userId: string) => Promise<{ success: boolean; purchases?: NativeTokenPurchase[] }>;
  createTokenPurchase: (data: Partial<NativeTokenPurchase>) => Promise<{ success: boolean; purchase?: NativeTokenPurchase }>;

  // Utils
  clearSelectedTokenPurchase: () => void;
  clearTokenPurchaseError: () => void;
}

export const createNativeTokenPurchaseSlice: StateCreator<NativeTokenPurchaseSlice> = (set, get) => ({
  tokenPurchases: [],
  selectedTokenPurchase: null,
  isLoadingTokenPurchase: false,
  tokenPurchaseError: null,
  hasLoadedTokenPurchases: false,

  // Mutators
  setTokenPurchases: (purchases) => set({ tokenPurchases: purchases, hasLoadedTokenPurchases: true }),
  setSelectedTokenPurchase: (purchase) => set({ selectedTokenPurchase: purchase }),
  setTokenPurchaseLoading: (loading) => set({ isLoadingTokenPurchase: loading }),
  setTokenPurchaseError: (error) => set({ tokenPurchaseError: error }),

  // API
  fetchTokenPurchases: async () => {
    try {
      const csrfToken = await getCookie();
      set({ isLoadingTokenPurchase: true, tokenPurchaseError: null });

      const res = await fetch(`${API_CONFIG.baseUrl}/native-token-purchases`, {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch token purchases");

      const result = await res.json();
      const purchases = result.data?.data || result;
      set({ tokenPurchases: purchases, isLoadingTokenPurchase: false, hasLoadedTokenPurchases: true });
      return { success: true, purchases };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to fetch token purchases";
      set({ tokenPurchaseError: message, isLoadingTokenPurchase: false });
      return { success: false };
    }
  },

  fetchTokenPurchasesByUser: async (userId) => {
    try {
      const csrfToken = await getCookie();
      set({ isLoadingTokenPurchase: true, tokenPurchaseError: null });

      const res = await fetch(`${API_CONFIG.baseUrl}/native-token-purchases/user/${userId}`, {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch user token purchases");

      const result = await res.json();
      const purchases = result.data?.data || result;
      set({ tokenPurchases: purchases, isLoadingTokenPurchase: false, hasLoadedTokenPurchases: true });
      return { success: true, purchases };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to fetch user token purchases";
      set({ tokenPurchaseError: message, isLoadingTokenPurchase: false });
      return { success: false };
    }
  },

  createTokenPurchase: async (data) => {
    try {
      const csrfToken = await getCookie();
      set({ isLoadingTokenPurchase: true, tokenPurchaseError: null });

      const res = await fetch(`${API_CONFIG.baseUrl}/native-token-purchases`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Failed to create token purchase");

      const result = await res.json();
      const purchase = result.data?.data || result;

      set((state) => ({
        tokenPurchases: [...state.tokenPurchases, purchase],
        isLoadingTokenPurchase: false,
      }));

      return { success: true, purchase };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create token purchase";
      set({ tokenPurchaseError: message, isLoadingTokenPurchase: false });
      return { success: false };
    }
  },

  // Utils
  clearSelectedTokenPurchase: () => set({ selectedTokenPurchase: null }),
  clearTokenPurchaseError: () => set({ tokenPurchaseError: null }),
});
