// src/store/use-native-token-recovery-slice.ts
import { StateCreator } from "zustand";
import { getCookie } from "@/lib/utils";
import { API_CONFIG } from "@/config/urls";

export interface NativeTokenRecovery {
  id: string;
  transactionId: string;
  sellerAddress: string;
  buyerAddress: string;
  tokenAddress: string;
  tokenSymbol: string;
  quantity: string;
  unitPrice: string;
  totalPricePaid: string;
  paymentDate: string;
  updatedAtChain: string;
  txnHash: string;
  paymentStatus: string;
  createdAt: string;
  updatedAt: string;
}

export interface NativeTokenRecoverySlice {
  tokenRecoveries: NativeTokenRecovery[];
  selectedTokenRecovery: NativeTokenRecovery | null;
  isLoadingTokenRecovery: boolean;
  tokenRecoveryError: string | null;
  hasLoadedTokenRecoveries: boolean;

  // Mutators
  setTokenRecoveries: (recoveries: NativeTokenRecovery[]) => void;
  setSelectedTokenRecovery: (recovery: NativeTokenRecovery | null) => void;
  setTokenRecoveryLoading: (loading: boolean) => void;
  setTokenRecoveryError: (error: string | null) => void;

  // API
  fetchTokenRecoveries: () => Promise<{ success: boolean; recoveries?: NativeTokenRecovery[] }>;
  fetchTokenRecoveriesByBuyer: (buyerAddress: string) => Promise<{ success: boolean; recoveries?: NativeTokenRecovery[] }>;
  fetchTokenRecoveriesBySeller: (sellerAddress: string) => Promise<{ success: boolean; recoveries?: NativeTokenRecovery[] }>;
  createTokenRecovery: (data: Partial<NativeTokenRecovery>) => Promise<{ success: boolean; recovery?: NativeTokenRecovery }>;

  // Utils
  clearSelectedTokenRecovery: () => void;
  clearTokenRecoveryError: () => void;
}

export const createNativeTokenRecoverySlice: StateCreator<NativeTokenRecoverySlice> = (set, get) => ({
  tokenRecoveries: [],
  selectedTokenRecovery: null,
  isLoadingTokenRecovery: false,
  tokenRecoveryError: null,
  hasLoadedTokenRecoveries: false,

  // Mutators
  setTokenRecoveries: (recoveries) => set({ tokenRecoveries: recoveries, hasLoadedTokenRecoveries: true }),
  setSelectedTokenRecovery: (recovery) => set({ selectedTokenRecovery: recovery }),
  setTokenRecoveryLoading: (loading) => set({ isLoadingTokenRecovery: loading }),
  setTokenRecoveryError: (error) => set({ tokenRecoveryError: error }),

  // API
  fetchTokenRecoveries: async () => {
    try {
      const csrfToken = await getCookie();
      set({ isLoadingTokenRecovery: true, tokenRecoveryError: null });

      const res = await fetch(`${API_CONFIG.baseUrl}/native-token-recoveries`, {
        credentials: "include",
        headers: { "Content-Type": "application/json", "X-CSRF-Token": csrfToken },
      });

      if (!res.ok) throw new Error("Failed to fetch token recoveries");

      const result = await res.json();
      const recoveries = result.data?.data || result;
      set({ tokenRecoveries: recoveries, isLoadingTokenRecovery: false, hasLoadedTokenRecoveries: true });
      return { success: true, recoveries };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to fetch token recoveries";
      set({ tokenRecoveryError: message, isLoadingTokenRecovery: false });
      return { success: false };
    }
  },

  fetchTokenRecoveriesByBuyer: async (buyerAddress) => {
    try {
      const csrfToken = await getCookie();
      set({ isLoadingTokenRecovery: true, tokenRecoveryError: null });

      const res = await fetch(`${API_CONFIG.baseUrl}/native-token-recoveries/buyer/${buyerAddress}`, {
        credentials: "include",
        headers: { "Content-Type": "application/json", "X-CSRF-Token": csrfToken },
      });

      if (!res.ok) throw new Error("Failed to fetch buyer recoveries");

      const result = await res.json();
      const recoveries = result.data?.data || result;
      set({ tokenRecoveries: recoveries, isLoadingTokenRecovery: false, hasLoadedTokenRecoveries: true });
      return { success: true, recoveries };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to fetch buyer recoveries";
      set({ tokenRecoveryError: message, isLoadingTokenRecovery: false });
      return { success: false };
    }
  },

  fetchTokenRecoveriesBySeller: async (sellerAddress) => {
    try {
      const csrfToken = await getCookie();
      set({ isLoadingTokenRecovery: true, tokenRecoveryError: null });

      const res = await fetch(`${API_CONFIG.baseUrl}/native-token-recoveries/seller/${sellerAddress}`, {
        credentials: "include",
        headers: { "Content-Type": "application/json", "X-CSRF-Token": csrfToken },
      });

      if (!res.ok) throw new Error("Failed to fetch seller recoveries");

      const result = await res.json();
      const recoveries = result.data?.data || result;
      set({ tokenRecoveries: recoveries, isLoadingTokenRecovery: false, hasLoadedTokenRecoveries: true });
      return { success: true, recoveries };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to fetch seller recoveries";
      set({ tokenRecoveryError: message, isLoadingTokenRecovery: false });
      return { success: false };
    }
  },

  createTokenRecovery: async (data) => {
    try {
      const csrfToken = await getCookie();
      set({ isLoadingTokenRecovery: true, tokenRecoveryError: null });

      const res = await fetch(`${API_CONFIG.baseUrl}/native-token-recoveries`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", "X-CSRF-Token": csrfToken },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Failed to create token recovery");

      const result = await res.json();
      const recovery = result.data?.data || result;

      set((state) => ({
        tokenRecoveries: [...state.tokenRecoveries, recovery],
        isLoadingTokenRecovery: false,
      }));

      return { success: true, recovery };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create token recovery";
      set({ tokenRecoveryError: message, isLoadingTokenRecovery: false });
      return { success: false };
    }
  },

  // Utils
  clearSelectedTokenRecovery: () => set({ selectedTokenRecovery: null }),
  clearTokenRecoveryError: () => set({ tokenRecoveryError: null }),
});
