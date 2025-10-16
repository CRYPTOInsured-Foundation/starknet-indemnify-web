import { StateCreator } from "zustand";
import { getCookie } from "@/lib/utils";
import { API_CONFIG } from "@/config/urls";

// 🔹 Types matching backend entity
export interface Policy {
  id: string;
  policyId: string;
  proposal: any;
  policyholder: any;
  policyClass: string;
  subjectMatter: string;
  sumInsured: string;
  premium: string;
  premiumFrequency: string;
  frequencyFactor: number;
  startDate: string;
  expirationDate: string;
  isActive: boolean;
  isExpired: boolean;
  claimsCount: number;
  hasClaimed: boolean;
  hasReinsurance: boolean;
  reinsuranceTxnId?: string | null;
  aggregateClaimAmount: string;
  createdAt: string;
  updatedAt: string;
}

export interface PolicySlice {
  // --- State ---
  policies: Policy[];
  selectedPolicy: Policy | null;
  isLoadingPolicy: boolean;
  policyError: string | null;
  hasLoadedPolicies: boolean;

  // --- Mutators ---
  setPolicies: (policies: Policy[]) => void;
  setSelectedPolicy: (policy: Policy | null) => void;
  setPolicyLoading: (loading: boolean) => void;
  setPolicyError: (error: string | null) => void;

  // --- API Actions (policyholder only) ---
  fetchPoliciesByUser: (userId: string) => Promise<{ success: boolean; policies?: Policy[] }>;
  fetchPolicyById: (id: string) => Promise<{ success: boolean; policy?: Policy }>;

  // --- Utility Actions ---
  clearSelectedPolicy: () => void;
  clearPolicyError: () => void;
}

export const createPolicySlice: StateCreator<PolicySlice> = (set, get) => ({
  // --- Initial State ---
  policies: [],
  selectedPolicy: null,
  isLoadingPolicy: false,
  policyError: null,
  hasLoadedPolicies: false,

  // --- Mutators ---
  setPolicies: (policies) => set({ policies, hasLoadedPolicies: true }),
  setSelectedPolicy: (policy) => set({ selectedPolicy: policy }),
  setPolicyLoading: (loading) => set({ isLoadingPolicy: loading }),
  setPolicyError: (error) => set({ policyError: error }),

  // --- API Actions ---

  fetchPoliciesByUser: async (userId) => {
    try {
      const csrfToken = await getCookie();
      set({ isLoadingPolicy: true, policyError: null });

      const res = await fetch(`${API_CONFIG.baseUrl}/policies/user/${userId}`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },
      });

      if (!res.ok)
        throw new Error(`Failed to fetch policies: ${res.statusText}`);

    //   const policies = await res.json();
    const result = await res.json();
    const policies = result.data.data;
      set({ policies, isLoadingPolicy: false, hasLoadedPolicies: true });
      return { success: true, policies };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to fetch policies";
      set({ policyError: message, isLoadingPolicy: false });
      return { success: false };
    }
  },

  fetchPolicyById: async (id) => {
    try {
      const csrfToken = await getCookie();
      set({ isLoadingPolicy: true, policyError: null });

      const res = await fetch(`${API_CONFIG.baseUrl}/policies/${id}`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },
      });

      if (!res.ok)
        throw new Error(`Failed to fetch policy: ${res.statusText}`);

    //   const policy = await res.json();
    const result = await res.json();
    const policy = result.data.data;
      set({ selectedPolicy: policy, isLoadingPolicy: false });
      return { success: true, policy };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to fetch policy";
      set({ policyError: message, isLoadingPolicy: false });
      return { success: false };
    }
  },

  // --- Utility Actions ---
  clearSelectedPolicy: () => set({ selectedPolicy: null }),
  clearPolicyError: () => set({ policyError: null }),
});











// // import { StateCreator } from "zustand";
// // import { API_CONFIG } from "@/config";
// // import { getCookie } from "@/lib/csrf";
// // import { RootState } from "../useRootStore";
// import { StateCreator } from "zustand";
// import { getCookie } from "@/lib/utils";
// import { API_CONFIG } from "@/config/urls";

// export interface Policy {
//   id: string;
//   policyId: string;
//   proposal: any;
//   policyholder: any;
//   policyClass: string;
//   subjectMatter: string;
//   sumInsured: string;
//   premium: string;
//   premiumFrequency: string;
//   frequencyFactor: number;
//   startDate: string;
//   expirationDate: string;
//   isActive: boolean;
//   isExpired: boolean;
//   claimsCount: number;
//   hasClaimed: boolean;
//   hasReinsurance: boolean;
//   reinsuranceTxnId?: string;
//   claimIds?: string[];
//   aggregateClaimAmount: string;
//   documents?: any[];
//   createdAt: string;
//   updatedAt: string;
// }

// export interface PolicySlice {
//   policies: Policy[];
//   selectedPolicy: Policy | null;
//   isLoadingPolicies: boolean;
//   policyError: string | null;

//   fetchPolicies: () => Promise<void>;
//   fetchPoliciesByUser: (userId: string) => Promise<void>;
//   fetchPolicyById: (id: string) => Promise<void>;
//   createPolicy: (data: Partial<Policy>) => Promise<void>;
//   updatePolicy: (id: string, data: Partial<Policy>) => Promise<void>;
//   deletePolicy: (id: string) => Promise<void>;
// }

// export const createPolicySlice: StateCreator<
//   RootState,
//   [],
//   [],
//   PolicySlice
// > = (set, get) => ({
//   policies: [],
//   selectedPolicy: null,
//   isLoadingPolicies: false,
//   policyError: null,

//   // 🔹 Fetch all policies
//   fetchPolicies: async () => {
//     try {
//       const csrfToken = await getCookie();
//       set({ isLoadingPolicies: true, policyError: null });

//       const res = await fetch(`${API_CONFIG.baseUrl}/policies`, {
//         method: "GET",
//         credentials: "include",
//         headers: { "X-CSRF-Token": csrfToken },
//       });

//       if (!res.ok) throw new Error(`Failed to fetch policies: ${res.statusText}`);

//       const data = await res.json();
//       set({ policies: data, isLoadingPolicies: false });
//     } catch (error) {
//       set({
//         policyError:
//           error instanceof Error ? error.message : "Failed to fetch policies",
//         isLoadingPolicies: false,
//       });
//     }
//   },

//   // 🔹 Fetch policies by user
//   fetchPoliciesByUser: async (userId: string) => {
//     try {
//       const csrfToken = await getCookie();
//       set({ isLoadingPolicies: true, policyError: null });

//       const res = await fetch(`${API_CONFIG.baseUrl}/policies/user/${userId}`, {
//         method: "GET",
//         credentials: "include",
//         headers: { "X-CSRF-Token": csrfToken },
//       });

//       if (!res.ok) throw new Error(`Failed to fetch user policies`);

//       const data = await res.json();
//       set({ policies: data, isLoadingPolicies: false });
//     } catch (error) {
//       set({
//         policyError:
//           error instanceof Error ? error.message : "Failed to fetch user policies",
//         isLoadingPolicies: false,
//       });
//     }
//   },

//   // 🔹 Fetch single policy by ID
//   fetchPolicyById: async (id: string) => {
//     try {
//       const csrfToken = await getCookie();
//       set({ isLoadingPolicies: true, policyError: null });

//       const res = await fetch(`${API_CONFIG.baseUrl}/policies/${id}`, {
//         method: "GET",
//         credentials: "include",
//         headers: { "X-CSRF-Token": csrfToken },
//       });

//       if (!res.ok) throw new Error(`Policy not found`);

//       const policy = await res.json();
//       set({ selectedPolicy: policy, isLoadingPolicies: false });
//     } catch (error) {
//       set({
//         policyError:
//           error instanceof Error ? error.message : "Failed to fetch policy",
//         isLoadingPolicies: false,
//       });
//     }
//   },

//   // 🔹 Create a new policy
//   createPolicy: async (data: Partial<Policy>) => {
//     try {
//       const csrfToken = await getCookie();
//       set({ isLoadingPolicies: true, policyError: null });

//       const res = await fetch(`${API_CONFIG.baseUrl}/policies`, {
//         method: "POST",
//         credentials: "include",
//         headers: {
//           "Content-Type": "application/json",
//           "X-CSRF-Token": csrfToken,
//         },
//         body: JSON.stringify(data),
//       });

//       if (!res.ok) throw new Error(`Failed to create policy`);

//       const newPolicy = await res.json();
//       set((state) => ({
//         policies: [...state.policies, newPolicy],
//         isLoadingPolicies: false,
//       }));
//     } catch (error) {
//       set({
//         policyError:
//           error instanceof Error ? error.message : "Failed to create policy",
//         isLoadingPolicies: false,
//       });
//     }
//   },

//   // 🔹 Update existing policy
//   updatePolicy: async (id: string, data: Partial<Policy>) => {
//     try {
//       const csrfToken = await getCookie();
//       set({ isLoadingPolicies: true, policyError: null });

//       const res = await fetch(`${API_CONFIG.baseUrl}/policies/${id}`, {
//         method: "PATCH",
//         credentials: "include",
//         headers: {
//           "Content-Type": "application/json",
//           "X-CSRF-Token": csrfToken,
//         },
//         body: JSON.stringify(data),
//       });

//       if (!res.ok) throw new Error(`Failed to update policy`);

//       const updatedPolicy = await res.json();
//       set((state) => ({
//         policies: state.policies.map((p) =>
//           p.id === id ? updatedPolicy : p
//         ),
//         selectedPolicy:
//           state.selectedPolicy?.id === id ? updatedPolicy : state.selectedPolicy,
//         isLoadingPolicies: false,
//       }));
//     } catch (error) {
//       set({
//         policyError:
//           error instanceof Error ? error.message : "Failed to update policy",
//         isLoadingPolicies: false,
//       });
//     }
//   },

//   // 🔹 Delete a policy
//   deletePolicy: async (id: string) => {
//     try {
//       const csrfToken = await getCookie();
//       set({ isLoadingPolicies: true, policyError: null });

//       const res = await fetch(`${API_CONFIG.baseUrl}/policies/${id}`, {
//         method: "DELETE",
//         credentials: "include",
//         headers: { "X-CSRF-Token": csrfToken },
//       });

//       if (!res.ok) throw new Error(`Failed to delete policy`);

//       set((state) => ({
//         policies: state.policies.filter((p) => p.id !== id),
//         isLoadingPolicies: false,
//       }));
//     } catch (error) {
//       set({
//         policyError:
//           error instanceof Error ? error.message : "Failed to delete policy",
//         isLoadingPolicies: false,
//       });
//     }
//   },
// });
