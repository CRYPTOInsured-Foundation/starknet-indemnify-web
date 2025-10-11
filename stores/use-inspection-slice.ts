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

  fetchInspectionsByProposal: async (proposalId) => {
    try {
      const csrfToken = await getCookie();
      set({ isLoadingInspection: true, inspectionError: null });

      const res = await fetch(`${API_CONFIG.baseUrl}/inspections/${proposalId}`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch inspections");

      const result = await res.json();
      console.log("🧩 Fetch Inspections result:", result);

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
        body: JSON.stringify(data),
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












// // src/store/use-inspection-slice.ts
// import { StateCreator } from "zustand";
// import { getCookie } from "@/lib/utils";
// import { API_CONFIG } from "@/config/urls";
// import { Proposal } from "./use-proposal-slice";

// // --- Types ---
// export interface Inspection {
//   id: string;
//   proposal: any;
//   mediaUrl: string;
//   notes?: string;
//   createdAt: string;
// }

// export interface InspectionSlice {
//   inspections: Inspection[];
//   selectedInspection: Inspection | null;
//   isLoadingInspection: boolean;
//   inspectionError: string | null;
//   hasLoadedInspections: boolean;

//   // Mutators
//   setInspections: (inspections: Inspection[]) => void;
//   setSelectedInspection: (inspection: Inspection | null) => void;
//   setInspectionLoading: (loading: boolean) => void;
//   setInspectionError: (error: string | null) => void;

//   // API - UPDATED: Changed from proposal object to proposalId
//   fetchInspectionsByProposal: (proposalId: string) => Promise<{ success: boolean; inspections?: Inspection[] }>;
//   createInspection: (data: { proposalId: string; mediaUrl: string; notes?: string }) => Promise<{ success: boolean; inspection?: Inspection }>;

//   // Utils
//   clearSelectedInspection: () => void;
//   clearInspectionError: () => void;
// }

// export const createInspectionSlice: StateCreator<InspectionSlice> = (set, get) => ({
//   inspections: [],
//   selectedInspection: null,
//   isLoadingInspection: false,
//   inspectionError: null,
//   hasLoadedInspections: false,

//   // Mutators
//   setInspections: (inspections) => set({ inspections, hasLoadedInspections: true }),
//   setSelectedInspection: (inspection) => set({ selectedInspection: inspection }),
//   setInspectionLoading: (loading) => set({ isLoadingInspection: loading }),
//   setInspectionError: (error) => set({ inspectionError: error }),

//   // API Actions
//   // fetchInspectionsByProposal: async (proposalId) => {
//   //   try {
//   //     const csrfToken = await getCookie();
//   //     set({ isLoadingInspection: true, inspectionError: null });

//   //     const res = await fetch(`${API_CONFIG.baseUrl}/inspections/${proposalId}`, {
//   //       method: "GET",
//   //       credentials: "include",
//   //       headers: {
//   //         "Content-Type": "application/json",
//   //         "X-CSRF-Token": csrfToken,
//   //       },
//   //     });

//   //     if (!res.ok) throw new Error(`Failed to fetch inspections`);

//   //     const result = await res.json();
//   //     const inspections = result.data?.data || result;
//   //     set({ inspections, isLoadingInspection: false, hasLoadedInspections: true });
//   //     return { success: true, inspections };
//   //   } catch (error) {
//   //     const message = error instanceof Error ? error.message : "Failed to fetch inspections";
//   //     set({ inspectionError: message, isLoadingInspection: false });
//   //     return { success: false };
//   //   }
//   // },

//   fetchInspectionsByProposal: async (proposalId) => {
//     try {
//       const csrfToken = await getCookie();
//       set({ isLoadingInspection: true, inspectionError: null });
  
//       const res = await fetch(`${API_CONFIG.baseUrl}/inspections/${proposalId}`, {
//         method: "GET",
//         credentials: "include",
//         headers: {
//           "Content-Type": "application/json",
//           "X-CSRF-Token": csrfToken,
//         },
//       });
  
//       if (!res.ok) throw new Error(`Failed to fetch inspections`);
  
//       const result = await res.json();

//       console.log("Raw Result: ", result);
  
//       // ✅ Fix: ensure we always extract an array correctly
//       const inspections = Array.isArray(result.data)
//         ? result.data
//         : result.data?.data
//         ? result.data.data
//         : [];
  
//       console.log("✅ Loaded inspections:", inspections);
  
//       set({
//         inspections,
//         isLoadingInspection: false,
//         hasLoadedInspections: true,
//       });
  
//       return { success: true, inspections };
//     } catch (error) {
//       const message =
//         error instanceof Error ? error.message : "Failed to fetch inspections";
//       console.error("❌ Inspection fetch error:", message);
//       set({ inspectionError: message, isLoadingInspection: false });
//       return { success: false };
//     }
//   },
  

//   createInspection: async (data) => {
//     try {
//       const csrfToken = await getCookie();
//       set({ isLoadingInspection: true, inspectionError: null });

//       console.log('Sending inspection data:', data); // Debug log

//       const res = await fetch(`${API_CONFIG.baseUrl}/inspections`, {
//         method: "POST",
//         credentials: "include",
//         headers: {
//           "Content-Type": "application/json",
//           "X-CSRF-Token": csrfToken,
//         },
//         body: JSON.stringify(data),
//       });

//       if (!res.ok) {
//         const errorText = await res.text();
//         console.error('Backend error response:', errorText);
//         throw new Error(`Failed to create inspection: ${res.status} ${res.statusText}`);
//       }

//       const result = await res.json();
//       console.log('Backend response:', result); // Debug log
      
//       const inspection = result.data?.data || result.data || result;

//       set((state) => ({
//         inspections: [...state.inspections, inspection],
//         isLoadingInspection: false,
//       }));

//       return { success: true, inspection };
//     } catch (error) {
//       const message = error instanceof Error ? error.message : "Failed to create inspection";
//       console.error('Create inspection error:', error);
//       set({ inspectionError: message, isLoadingInspection: false });
//       return { success: false };
//     }
//   },

//   // Utils
//   clearSelectedInspection: () => set({ selectedInspection: null }),
//   clearInspectionError: () => set({ inspectionError: null }),
// });









// // src/store/use-inspection-slice.ts
// import { StateCreator } from "zustand";
// import { getCookie } from "@/lib/utils";
// import { API_CONFIG } from "@/config/urls";
// import { Proposal } from "./use-proposal-slice";

// // --- Types ---
// export interface Inspection {
//   id: string;
//   proposal: any;
//   mediaUrl: string;
//   notes?: string;
//   createdAt: string;
// }

// export interface InspectionSlice {
//   inspections: Inspection[];
//   selectedInspection: Inspection | null;
//   isLoadingInspection: boolean;
//   inspectionError: string | null;
//   hasLoadedInspections: boolean;

//   // Mutators
//   setInspections: (inspections: Inspection[]) => void;
//   setSelectedInspection: (inspection: Inspection | null) => void;
//   setInspectionLoading: (loading: boolean) => void;
//   setInspectionError: (error: string | null) => void;

//   // API
//   fetchInspectionsByProposal: (proposalId: string) => Promise<{ success: boolean; inspections?: Inspection[] }>;
//   createInspection: (data: { proposal: Proposal, mediaUrl: string; notes?: string }) => Promise<{ success: boolean; inspection?: Inspection }>;

//   // Utils
//   clearSelectedInspection: () => void;
//   clearInspectionError: () => void;
// }

// export const createInspectionSlice: StateCreator<InspectionSlice> = (set, get) => ({
//   inspections: [],
//   selectedInspection: null,
//   isLoadingInspection: false,
//   inspectionError: null,
//   hasLoadedInspections: false,

//   // Mutators
//   setInspections: (inspections) => set({ inspections, hasLoadedInspections: true }),
//   setSelectedInspection: (inspection) => set({ selectedInspection: inspection }),
//   setInspectionLoading: (loading) => set({ isLoadingInspection: loading }),
//   setInspectionError: (error) => set({ inspectionError: error }),

//   // API Actions
//   fetchInspectionsByProposal: async (proposalId) => {
//     try {
//       const csrfToken = await getCookie();
//       set({ isLoadingInspection: true, inspectionError: null });

//       const res = await fetch(`${API_CONFIG.baseUrl}/inspections/${proposalId}`, {
//         method: "GET",
//         credentials: "include",
//         headers: {
//           "Content-Type": "application/json",
//           "X-CSRF-Token": csrfToken,
//         },
//       });

//       if (!res.ok) throw new Error(`Failed to fetch inspections`);

//       const result = await res.json();
//       const inspections = result.data?.data || result;
//       set({ inspections, isLoadingInspection: false, hasLoadedInspections: true });
//       return { success: true, inspections };
//     } catch (error) {
//       const message = error instanceof Error ? error.message : "Failed to fetch inspections";
//       set({ inspectionError: message, isLoadingInspection: false });
//       return { success: false };
//     }
//   },

//   createInspection: async (data) => {
//     try {
//       const csrfToken = await getCookie();
//       set({ isLoadingInspection: true, inspectionError: null });

//       const res = await fetch(`${API_CONFIG.baseUrl}/inspections`, {
//         method: "POST",
//         credentials: "include",
//         headers: {
//           "Content-Type": "application/json",
//           "X-CSRF-Token": csrfToken,
//         },
//         body: JSON.stringify(data),
//       });

//       if (!res.ok) throw new Error(`Failed to create inspection`);

//       const result = await res.json();
//       const inspection = result.data?.data || result;

//       set((state) => ({
//         inspections: [...state.inspections, inspection],
//         isLoadingInspection: false,
//       }));

//       return { success: true, inspection };
//     } catch (error) {
//       const message = error instanceof Error ? error.message : "Failed to create inspection";
//       set({ inspectionError: message, isLoadingInspection: false });
//       return { success: false };
//     }
//   },

//   // Utils
//   clearSelectedInspection: () => set({ selectedInspection: null }),
//   clearInspectionError: () => set({ inspectionError: null }),
// });
