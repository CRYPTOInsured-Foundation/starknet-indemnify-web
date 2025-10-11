// src/store/use-premium-payment-slice.ts
import { StateCreator } from "zustand";
import { getCookie } from "@/lib/utils";
import { API_CONFIG } from "@/config/urls";

// --- Types ---
export interface PremiumPayment {
  id: string;
  transactionId: string;
  proposal: any;
  policy: any;
  policyholder: any;
  payerAddress: string;
  amountPaid: string;
  sumInsured: string;
  paymentDate: string;
  txnHash: string;
  paymentStatus: string;
  createdAt: string;
  updatedAt: string;
}

export interface PremiumPaymentSlice {
  premiumPayments: PremiumPayment[];
  selectedPremiumPayment: PremiumPayment | null;
  isLoadingPremium: boolean;
  premiumError: string | null;
  hasLoadedPremiumPayments: boolean;

  // Mutators
  setPremiumPayments: (payments: PremiumPayment[]) => void;
  setSelectedPremiumPayment: (payment: PremiumPayment | null) => void;
  setPremiumLoading: (loading: boolean) => void;
  setPremiumError: (error: string | null) => void;

  // API Actions
  fetchPremiumPayments: () => Promise<{ success: boolean; payments?: PremiumPayment[] }>;
  fetchPremiumPaymentsByUser: (userId: string) => Promise<{ success: boolean; payments?: PremiumPayment[] }>;
  createPremiumPayment: (data: Partial<PremiumPayment>) => Promise<{ success: boolean; payment?: PremiumPayment }>;

  // Utils
  clearSelectedPremiumPayment: () => void;
  clearPremiumError: () => void;
}

export const createPremiumPaymentSlice: StateCreator<PremiumPaymentSlice> = (set, get) => ({
  premiumPayments: [],
  selectedPremiumPayment: null,
  isLoadingPremium: false,
  premiumError: null,
  hasLoadedPremiumPayments: false,

  // Mutators
  setPremiumPayments: (payments) => set({ premiumPayments: payments, hasLoadedPremiumPayments: true }),
  setSelectedPremiumPayment: (payment) => set({ selectedPremiumPayment: payment }),
  setPremiumLoading: (loading) => set({ isLoadingPremium: loading }),
  setPremiumError: (error) => set({ premiumError: error }),

  // API Actions
  fetchPremiumPayments: async () => {
    try {
      const csrfToken = await getCookie();
      set({ isLoadingPremium: true, premiumError: null });
      const res = await fetch(`${API_CONFIG.baseUrl}/premium-payments`, {
        credentials: "include",
        headers: { "Content-Type": "application/json", "X-CSRF-Token": csrfToken },
      });
      if (!res.ok) throw new Error("Failed to fetch premium payments");
      const result = await res.json();
      const payments = result.data?.data || result;
      set({ premiumPayments: payments, isLoadingPremium: false, hasLoadedPremiumPayments: true });
      return { success: true, payments };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to fetch premium payments";
      set({ premiumError: message, isLoadingPremium: false });
      return { success: false };
    }
  },

  fetchPremiumPaymentsByUser: async (userId) => {
    try {
      const csrfToken = await getCookie();
      set({ isLoadingPremium: true, premiumError: null });
      const res = await fetch(`${API_CONFIG.baseUrl}/premium-payments/user/${userId}`, {
        credentials: "include",
        headers: { "Content-Type": "application/json", "X-CSRF-Token": csrfToken },
      });
      if (!res.ok) throw new Error("Failed to fetch user premium payments");
      const result = await res.json();
      const payments = result.data?.data || result;
      set({ premiumPayments: payments, isLoadingPremium: false, hasLoadedPremiumPayments: true });
      return { success: true, payments };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to fetch user premium payments";
      set({ premiumError: message, isLoadingPremium: false });
      return { success: false };
    }
  },

  createPremiumPayment: async (data) => {
    try {
      const csrfToken = await getCookie();
      set({ isLoadingPremium: true, premiumError: null });
      const res = await fetch(`${API_CONFIG.baseUrl}/premium-payments`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", "X-CSRF-Token": csrfToken },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create premium payment");
      const result = await res.json();
      const payment = result.data?.data || result;
      set((state) => ({
        premiumPayments: [...state.premiumPayments, payment],
        isLoadingPremium: false,
      }));
      return { success: true, payment };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create premium payment";
      set({ premiumError: message, isLoadingPremium: false });
      return { success: false };
    }
  },

  // Utils
  clearSelectedPremiumPayment: () => set({ selectedPremiumPayment: null }),
  clearPremiumError: () => set({ premiumError: null }),
});
