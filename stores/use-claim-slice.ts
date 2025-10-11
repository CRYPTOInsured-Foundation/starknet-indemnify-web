import { StateCreator } from "zustand";
import { getCookie } from "@/lib/utils";
import { API_CONFIG } from "@/config/urls";

// 🔹 Types matching backend entity
export interface Claim {
  id: string;
  claimId: string;
  policy: any;
  proposal: any;
  claimant: any;
  claimDescription: string;
  claimAmount: string;
  approvedSettlementAmount: string;
  alternativeAccount?: string | null;
  policyClass: string;
  claimStatus: string;
  claimType: string;
  submissionDate: number;
  updatedAt: number;
  isApproved: boolean;
  approvedAt?: number | null;
  isRepudiated: boolean;
  repudiatedAt?: number | null;
  riskAnalyticsApproved: boolean;
  governanceApproved: boolean;
  isEscalated: boolean;
  escalationReason?: string | null;
  repudiationReason: string;
  createdAt: string;
  updatedRecord: string;
}

export interface ClaimSlice {
  // --- State ---
  claims: Claim[];
  selectedClaim: Claim | null;
  isLoadingClaim: boolean;
  claimError: string | null;
  hasLoadedClaims: boolean;

  // --- Mutators ---
  setClaims: (claims: Claim[]) => void;
  setSelectedClaim: (claim: Claim | null) => void;
  setClaimLoading: (loading: boolean) => void;
  setClaimError: (error: string | null) => void;

  // --- API Actions (policyholder only) ---
  fetchClaimsByUser: (userId: string) => Promise<{ success: boolean; claims?: Claim[] }>;
  fetchClaimById: (id: string) => Promise<{ success: boolean; claim?: Claim }>;

  // --- Utility Actions ---
  clearSelectedClaim: () => void;
  clearClaimError: () => void;
}

export const createClaimSlice: StateCreator<ClaimSlice> = (set, get) => ({
  // --- Initial State ---
  claims: [],
  selectedClaim: null,
  isLoadingClaim: false,
  claimError: null,
  hasLoadedClaims: false,

  // --- Mutators ---
  setClaims: (claims) => set({ claims, hasLoadedClaims: true }),
  setSelectedClaim: (claim) => set({ selectedClaim: claim }),
  setClaimLoading: (loading) => set({ isLoadingClaim: loading }),
  setClaimError: (error) => set({ claimError: error }),

  // --- API Actions ---

  fetchClaimsByUser: async (userId) => {
    try {
      const csrfToken = await getCookie();
      set({ isLoadingClaim: true, claimError: null });

      const res = await fetch(`${API_CONFIG.baseUrl}/claims/user/${userId}`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },
      });

      if (!res.ok) throw new Error(`Failed to fetch claims: ${res.statusText}`);

      const result = await res.json();
      const claims = result.data?.data || result; // adjust to API shape
      set({ claims, isLoadingClaim: false, hasLoadedClaims: true });
      return { success: true, claims };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to fetch claims";
      set({ claimError: message, isLoadingClaim: false });
      return { success: false };
    }
  },

  fetchClaimById: async (id) => {
    try {
      const csrfToken = await getCookie();
      set({ isLoadingClaim: true, claimError: null });

      const res = await fetch(`${API_CONFIG.baseUrl}/claims/${id}`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },
      });

      if (!res.ok) throw new Error(`Failed to fetch claim: ${res.statusText}`);

      const result = await res.json();
      const claim = result.data?.data || result; // adjust to API shape
      set({ selectedClaim: claim, isLoadingClaim: false });
      return { success: true, claim };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to fetch claim";
      set({ claimError: message, isLoadingClaim: false });
      return { success: false };
    }
  },

  // --- Utility Actions ---
  clearSelectedClaim: () => set({ selectedClaim: null }),
  clearClaimError: () => set({ claimError: null }),
});
