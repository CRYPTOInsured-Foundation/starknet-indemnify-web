// src/store/use-claim-settlement-slice.ts
import { StateCreator } from "zustand";
import { getCookie } from "@/lib/utils";
import { API_CONFIG } from "@/config/urls";

// --- Types ---
export interface ClaimSettlement {
  id: string;
  transactionId: string;
  proposal: any;
  policy: any;
  claim: any;
  policyholder: any;
  thirdPartyAccount?: string;
  claimAmount: string;
  approvedSettlementAmount: string;
  settlementDate: string;
  txnHash: string;
  settlementStatus: string;
  settlementSource: string;
  updatedAt: string;
}

export interface ClaimSettlementSlice {
  claimSettlements: ClaimSettlement[];
  selectedClaimSettlement: ClaimSettlement | null;
  isLoadingClaimSettlement: boolean;
  claimSettlementError: string | null;
  hasLoadedClaimSettlements: boolean;

  // Mutators
  setClaimSettlements: (settlements: ClaimSettlement[]) => void;
  setSelectedClaimSettlement: (settlement: ClaimSettlement | null) => void;
  setClaimSettlementLoading: (loading: boolean) => void;
  setClaimSettlementError: (error: string | null) => void;

  // API
  fetchClaimSettlements: () => Promise<{ success: boolean; settlements?: ClaimSettlement[] }>;
  fetchClaimSettlementsByUser: (userId: string) => Promise<{ success: boolean; settlements?: ClaimSettlement[] }>;
  createClaimSettlement: (data: Partial<ClaimSettlement>) => Promise<{ success: boolean; settlement?: ClaimSettlement }>;

  // Utils
  clearSelectedClaimSettlement: () => void;
  clearClaimSettlementError: () => void;
}

export const createClaimSettlementSlice: StateCreator<ClaimSettlementSlice> = (set, get) => ({
  claimSettlements: [],
  selectedClaimSettlement: null,
  isLoadingClaimSettlement: false,
  claimSettlementError: null,
  hasLoadedClaimSettlements: false,

  // Mutators
  setClaimSettlements: (settlements) => set({ claimSettlements: settlements, hasLoadedClaimSettlements: true }),
  setSelectedClaimSettlement: (settlement) => set({ selectedClaimSettlement: settlement }),
  setClaimSettlementLoading: (loading) => set({ isLoadingClaimSettlement: loading }),
  setClaimSettlementError: (error) => set({ claimSettlementError: error }),

  // API
  fetchClaimSettlements: async () => {
    try {
      const csrfToken = await getCookie();
      set({ isLoadingClaimSettlement: true, claimSettlementError: null });
      const res = await fetch(`${API_CONFIG.baseUrl}/claim-settlements`, {
        credentials: "include",
        headers: { "Content-Type": "application/json", "X-CSRF-Token": csrfToken },
      });
      if (!res.ok) throw new Error("Failed to fetch claim settlements");
      const result = await res.json();
      const settlements = result.data?.data || result;
      set({ claimSettlements: settlements, isLoadingClaimSettlement: false, hasLoadedClaimSettlements: true });
      return { success: true, settlements };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to fetch claim settlements";
      set({ claimSettlementError: message, isLoadingClaimSettlement: false });
      return { success: false };
    }
  },

  fetchClaimSettlementsByUser: async (userId) => {
    try {
      const csrfToken = await getCookie();
      set({ isLoadingClaimSettlement: true, claimSettlementError: null });
      const res = await fetch(`${API_CONFIG.baseUrl}/claim-settlements/user/${userId}`, {
        credentials: "include",
        headers: { "Content-Type": "application/json", "X-CSRF-Token": csrfToken },
      });
      if (!res.ok) throw new Error("Failed to fetch user claim settlements");
      const result = await res.json();
      const settlements = result.data?.data || result;
      set({ claimSettlements: settlements, isLoadingClaimSettlement: false, hasLoadedClaimSettlements: true });
      return { success: true, settlements };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to fetch user claim settlements";
      set({ claimSettlementError: message, isLoadingClaimSettlement: false });
      return { success: false };
    }
  },

  createClaimSettlement: async (data) => {
    try {
      const csrfToken = await getCookie();
      set({ isLoadingClaimSettlement: true, claimSettlementError: null });
      const res = await fetch(`${API_CONFIG.baseUrl}/claim-settlements`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", "X-CSRF-Token": csrfToken },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create claim settlement");
      const result = await res.json();
      const settlement = result.data?.data || result;
      set((state) => ({
        claimSettlements: [...state.claimSettlements, settlement],
        isLoadingClaimSettlement: false,
      }));
      return { success: true, settlement };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create claim settlement";
      set({ claimSettlementError: message, isLoadingClaimSettlement: false });
      return { success: false };
    }
  },

  // Utils
  clearSelectedClaimSettlement: () => set({ selectedClaimSettlement: null }),
  clearClaimSettlementError: () => set({ claimSettlementError: null }),
});
