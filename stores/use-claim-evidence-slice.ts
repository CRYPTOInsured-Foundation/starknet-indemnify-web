// src/store/use-claim-evidence-slice.ts
import { StateCreator } from "zustand";
import { getCookie } from "@/lib/utils";
import { API_CONFIG } from "@/config/urls";

// --- Types ---
export interface ClaimEvidence {
  id: string;
  policyId: string;
  submissionDate: number;
  proofUrls: string[];
  claim: any;
  createdAt: string;
  updatedAt: string;
}

export interface ClaimEvidenceSlice {
  evidences: ClaimEvidence[];
  selectedEvidence: ClaimEvidence | null;
  isLoadingEvidence: boolean;
  evidenceError: string | null;
  hasLoadedEvidences: boolean;

  // Mutators
  setEvidences: (evidences: ClaimEvidence[]) => void;
  setSelectedEvidence: (evidence: ClaimEvidence | null) => void;
  setEvidenceLoading: (loading: boolean) => void;
  setEvidenceError: (error: string | null) => void;

  // API
  fetchEvidences: () => Promise<{ success: boolean; evidences?: ClaimEvidence[] }>;
  fetchEvidenceByClaim: (claimId: string) => Promise<{ success: boolean; evidence?: ClaimEvidence }>;
  createEvidence: (data: Partial<ClaimEvidence>) => Promise<{ success: boolean; evidence?: ClaimEvidence }>;

  // Utils
  clearSelectedEvidence: () => void;
  clearEvidenceError: () => void;
}

export const createClaimEvidenceSlice: StateCreator<ClaimEvidenceSlice> = (set, get) => ({
  evidences: [],
  selectedEvidence: null,
  isLoadingEvidence: false,
  evidenceError: null,
  hasLoadedEvidences: false,

  // Mutators
  setEvidences: (evidences) => set({ evidences, hasLoadedEvidences: true }),
  setSelectedEvidence: (evidence) => set({ selectedEvidence: evidence }),
  setEvidenceLoading: (loading) => set({ isLoadingEvidence: loading }),
  setEvidenceError: (error) => set({ evidenceError: error }),

  // API
  fetchEvidences: async () => {
    try {
      const csrfToken = await getCookie();
      set({ isLoadingEvidence: true, evidenceError: null });

      const res = await fetch(`${API_CONFIG.baseUrl}/claim-evidences`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },
      });

      if (!res.ok) throw new Error(`Failed to fetch claim evidences`);

      const result = await res.json();
      const evidences = result.data?.data || result;
      set({ evidences, isLoadingEvidence: false, hasLoadedEvidences: true });
      return { success: true, evidences };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to fetch evidences";
      set({ evidenceError: message, isLoadingEvidence: false });
      return { success: false };
    }
  },

  fetchEvidenceByClaim: async (claimId) => {
    try {
      const csrfToken = await getCookie();
      set({ isLoadingEvidence: true, evidenceError: null });

      const res = await fetch(`${API_CONFIG.baseUrl}/claim-evidences/claim/${claimId}`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },
      });

      if (!res.ok) throw new Error(`Failed to fetch evidence for claim`);

      const result = await res.json();
      const evidence = result.data?.data || result;
      set({ selectedEvidence: evidence, isLoadingEvidence: false });
      return { success: true, evidence };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to fetch claim evidence";
      set({ evidenceError: message, isLoadingEvidence: false });
      return { success: false };
    }
  },

  createEvidence: async (data) => {
    try {
      const csrfToken = await getCookie();
      set({ isLoadingEvidence: true, evidenceError: null });

      const res = await fetch(`${API_CONFIG.baseUrl}/claim-evidences`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error(`Failed to create claim evidence`);

      const result = await res.json();
      const evidence = result.data?.data || result;

      set((state) => ({
        evidences: [...state.evidences, evidence],
        isLoadingEvidence: false,
      }));

      return { success: true, evidence };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create claim evidence";
      set({ evidenceError: message, isLoadingEvidence: false });
      return { success: false };
    }
  },

  // Utils
  clearSelectedEvidence: () => set({ selectedEvidence: null }),
  clearEvidenceError: () => set({ evidenceError: null }),
});

