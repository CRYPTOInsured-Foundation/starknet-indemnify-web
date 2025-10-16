import { StateCreator } from "zustand";
import { getCookie } from "@/lib/utils";
import { API_CONFIG } from "@/config/urls";

export interface Inspection {
  id: string;
  proposalId: string;
  mediaUrl: string;
  notes?: string;
  createdAt: string;
}

export interface InspectionSlice {
  inspections: Inspection[];
  selectedInspection: Inspection | null;
  isLoadingInspection: boolean;
  inspectionError: string | null;
  hasLoadedInspections: boolean;

  // Mutators
  setInspections: (inspections: Inspection[]) => void;
  setSelectedInspection: (inspection: Inspection | null) => void;
  setInspectionLoading: (loading: boolean) => void;
  setInspectionError: (error: string | null) => void;

  // API
  fetchInspectionsByProposal: (proposalId: string) => Promise<{ success: boolean; inspections?: Inspection[] }>;
  fetchInspectionById: (id: string) => Promise<{ success: boolean; inspection?: Inspection }>;
  fetchAllInspections: () => Promise<{ success: boolean; inspections?: Inspection[] }>;
  createInspection: (data: { proposalId: string; mediaUrl: string; notes?: string }) => Promise<{ success: boolean; inspection?: Inspection }>;

  // Utils
  clearSelectedInspection: () => void;
  clearInspectionError: () => void;
}

export const createInspectionSlice: StateCreator<InspectionSlice> = (set, get) => ({
  inspections: [],
  selectedInspection: null,
  isLoadingInspection: false,
  inspectionError: null,
  hasLoadedInspections: false,

  setInspections: (inspections) => set({ inspections, hasLoadedInspections: true }),
  setSelectedInspection: (inspection) => set({ selectedInspection: inspection }),
  setInspectionLoading: (loading) => set({ isLoadingInspection: loading }),
  setInspectionError: (error) => set({ inspectionError: error }),

  // ✅ Fetch inspections by proposal ID
  fetchInspectionsByProposal: async (proposalId) => {
    try {
      const csrfToken = await getCookie();
      set({ isLoadingInspection: true, inspectionError: null });

      const res = await fetch(`${API_CONFIG.baseUrl}/inspections/proposal/${proposalId}`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch inspections");
      const result = await res.json();

      const inspections =
        Array.isArray(result.data)
          ? result.data
          : result.data?.data ?? [];

      set({
        inspections,
        isLoadingInspection: false,
        hasLoadedInspections: true,
      });

      return { success: true, inspections };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to fetch inspections";
      console.error("❌ Fetch Inspections error:", message);
      set({ inspectionError: message, isLoadingInspection: false });
      return { success: false };
    }
  },

  // ✅ Fetch a single inspection by ID
  fetchInspectionById: async (id) => {
    try {
      const csrfToken = await getCookie();
      set({ isLoadingInspection: true, inspectionError: null });

      const res = await fetch(`${API_CONFIG.baseUrl}/inspections/${id}`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch inspection by ID");

      const result = await res.json();
      const inspection = result.data?.data || result.data || result;

      set({
        selectedInspection: inspection,
        isLoadingInspection: false,
      });

      return { success: true, inspection };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to fetch inspection";
      console.error("❌ Fetch Inspection by ID error:", message);
      set({ inspectionError: message, isLoadingInspection: false });
      return { success: false };
    }
  },

  // ✅ Fetch all inspections (optional, useful for admin or static params)
  fetchAllInspections: async () => {
    try {
      const csrfToken = await getCookie();
      set({ isLoadingInspection: true, inspectionError: null });

      const res = await fetch(`${API_CONFIG.baseUrl}/inspections`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch inspections list");

      const result = await res.json();
      const inspections =
        Array.isArray(result.data)
          ? result.data
          : result.data?.data ?? [];

      set({
        inspections,
        isLoadingInspection: false,
        hasLoadedInspections: true,
      });

      return { success: true, inspections };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to fetch all inspections";
      console.error("❌ Fetch All Inspections error:", message);
      set({ inspectionError: message, isLoadingInspection: false });
      return { success: false };
    }
  },

  // ✅ Create inspection
  createInspection: async (data) => {
    try {
      const csrfToken = await getCookie();
      set({ isLoadingInspection: true, inspectionError: null });

      console.log("📤 Sending inspection payload:", data);

      const res = await fetch(`${API_CONFIG.baseUrl}/inspections`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },
        body: JSON.stringify({
          proposalId: data.proposalId,
          mediaUrl: data.mediaUrl,
          notes: data.notes || "",
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error("Backend error:", errText);
        throw new Error(`Failed to create inspection: ${res.statusText}`);
      }

      const result = await res.json();
      const inspection = result.data?.data || result.data || result;

      set((state) => ({
        inspections: [...state.inspections, inspection],
        isLoadingInspection: false,
      }));

      return { success: true, inspection };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to create inspection";
      console.error("❌ Create inspection error:", message);
      set({ inspectionError: message, isLoadingInspection: false });
      return { success: false };
    }
  },

  clearSelectedInspection: () => set({ selectedInspection: null }),
  clearInspectionError: () => set({ inspectionError: null }),
});









