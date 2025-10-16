import { StateCreator } from "zustand";
import { getCookie } from "@/lib/utils";
import { API_CONFIG } from "@/config/urls";

// Types matching backend entity
export interface Proposal {
  id: string;
  proposalId: string;
  proposer: any;
  policyClass: string;
  subjectMatter: string;
  sumInsured: string;
  premiumPayable: string;
  premiumFrequency: string;
  frequencyFactor: number;
  hasKyc: boolean;
  submissionDate: string;
  lastUpdated: string;
  expirationDate?: string | null;
  isActive: boolean;
  isExpired: boolean;
  isPremiumPaid: boolean;
  riskAnalyticsApproved: boolean;
  governanceApproved: boolean;
  proposalStatus: string;
  rejectionReason?: string | null;
  riskScore?: string | null;
  premiumRate?: number | null;
  hasReinsurance: boolean;
  reinsuranceTxnId?: string | null;
}

export interface ProposalSlice {
  // 🔹 State
  proposals: Proposal[];
  selectedProposal: Proposal | null;
  isLoadingProposal: boolean;
  proposalError: string | null;
  hasLoadedProposals: boolean;

  // 🔹 Mutators
  setProposals: (proposals: Proposal[]) => void;
  setSelectedProposal: (proposal: Proposal | null) => void;
  setProposalLoading: (loading: boolean) => void;
  setProposalError: (error: string | null) => void;

  // 🔹 API Actions
  fetchProposalsByUser: (userId: string) => Promise<{ success: boolean; proposals?: Proposal[] }>;
  fetchProposalById: (id: string) => Promise<{ success: boolean; proposal?: Proposal }>;
  createProposal: (data: Partial<Proposal>) => Promise<{ success: boolean; proposal?: Proposal }>;
  updateProposal: (id: string, data: Partial<Proposal>) => Promise<{ success: boolean; proposal?: Proposal }>;
  deleteProposal: (id: string) => Promise<{ success: boolean }>;

  // 🔹 Utility Actions
  clearSelectedProposal: () => void;
  clearProposalError: () => void;
}

export const createProposalSlice: StateCreator<ProposalSlice> = (set, get) => ({
  // --- Initial State ---
  proposals: [],
  selectedProposal: null,
  isLoadingProposal: false,
  proposalError: null,
  hasLoadedProposals: false,

  // --- Mutators ---
  setProposals: (proposals) =>
    set({ proposals, hasLoadedProposals: true }),
  setSelectedProposal: (proposal) => set({ selectedProposal: proposal }),
  setProposalLoading: (loading) => set({ isLoadingProposal: loading }),
  setProposalError: (error) => set({ proposalError: error }),

  // --- API Actions ---

  fetchProposalsByUser: async (userId) => {
    try {
      const csrfToken = await getCookie();
      set({ isLoadingProposal: true, proposalError: null });

      const res = await fetch(`${API_CONFIG.baseUrl}/proposals/user/${userId}`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },
      });

      if (!res.ok) throw new Error(`Failed to fetch proposals: ${res.statusText}`);

      const result = await res.json();
      const proposals = result.data.data;
      set({ proposals, isLoadingProposal: false });
      return { success: true, proposals };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to fetch proposals";
      set({ proposalError: message, isLoadingProposal: false });
      return { success: false };
    }
  },

  fetchProposalById: async (id) => {
    try {
      const csrfToken = await getCookie();
      set({ isLoadingProposal: true, proposalError: null });

      const res = await fetch(`${API_CONFIG.baseUrl}/proposals/${id}`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },
      });

      if (!res.ok) throw new Error(`Failed to fetch proposal: ${res.statusText}`);

    //   const proposal = await res.json();
    const result = await res.json();
    const proposal = result.data.data;
      set({ selectedProposal: proposal, isLoadingProposal: false });
      return { success: true, proposal };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to fetch proposal";
      set({ proposalError: message, isLoadingProposal: false });
      return { success: false };
    }
  },

  createProposal: async (data) => {
    try {
      const csrfToken = await getCookie();
      set({ isLoadingProposal: true, proposalError: null });

      const res = await fetch(`${API_CONFIG.baseUrl}/proposals`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error(`Failed to create proposal: ${res.statusText}`);

      const proposal = await res.json();
      set({
        proposals: [...get().proposals, proposal],
        selectedProposal: proposal,
        isLoadingProposal: false,
      });

      return { success: true, proposal };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to create proposal";
      set({ proposalError: message, isLoadingProposal: false });
      return { success: false };
    }
  },

  updateProposal: async (id, data) => {
    try {
      const csrfToken = await getCookie();
      set({ isLoadingProposal: true, proposalError: null });

      const res = await fetch(`${API_CONFIG.baseUrl}/proposals/${id}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error(`Failed to update proposal: ${res.statusText}`);

      const updatedProposal = await res.json();
      set({
        proposals: get().proposals.map((p) =>
          p.id === id ? updatedProposal : p
        ),
        selectedProposal: updatedProposal,
        isLoadingProposal: false,
      });

      return { success: true, proposal: updatedProposal };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to update proposal";
      set({ proposalError: message, isLoadingProposal: false });
      return { success: false };
    }
  },

  deleteProposal: async (id) => {
    try {
      const csrfToken = await getCookie();
      set({ isLoadingProposal: true, proposalError: null });

      const res = await fetch(`${API_CONFIG.baseUrl}/proposals/${id}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },
      });

      if (!res.ok) throw new Error(`Failed to delete proposal: ${res.statusText}`);

      set({
        proposals: get().proposals.filter((p) => p.id !== id),
        isLoadingProposal: false,
      });

      return { success: true };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to delete proposal";
      set({ proposalError: message, isLoadingProposal: false });
      return { success: false };
    }
  },

  // --- Utility Actions ---
  clearSelectedProposal: () => set({ selectedProposal: null }),
  clearProposalError: () => set({ proposalError: null }),
});
