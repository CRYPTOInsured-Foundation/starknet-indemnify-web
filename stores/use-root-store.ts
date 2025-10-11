import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

import { createAppSlice } from "./app-slice";
import { createAuthSlice } from "./auth-slice";
import { createChipiPaySlice } from "./use-chipi-pay-slice";
import { createWalletSlice } from "./use-wallet-slice";
import { createInsuranceProductSlice } from "./use-insurance-product-slice";
import { createProposalSlice } from "./use-proposal-slice";
import { createPolicySlice } from "./use-policy-slice";
import { createClaimSlice } from "./use-claim-slice";
import { createInspectionSlice } from "./use-inspection-slice";
import { createClaimEvidenceSlice } from "./use-claim-evidence-slice";
import { createPremiumPaymentSlice } from "./use-premium-payment-slice";
import { createClaimSettlementSlice } from "./use-claim-settlement-slice";
import { createNativeTokenPurchaseSlice } from "./use-native-token-purchase-slice";
import { createNativeTokenRecoverySlice } from "./use-native-token-recovery-slice";



import type { AppStore, AuthStore } from "@/types/common";
import type { ChipiSlice } from "./use-chipi-pay-slice";
import type { WalletSlice } from "./use-wallet-slice";
import type { StateCreator, StoreApi } from "zustand";
import type { InsuranceProductSlice } from "./use-insurance-product-slice";
import type { ProposalSlice } from "./use-proposal-slice";
import type { PolicySlice } from "./use-policy-slice";
import type { ClaimSlice } from "./use-claim-slice";
import type { InspectionSlice } from "./use-inspection-slice";
import type { ClaimEvidenceSlice } from "./use-claim-evidence-slice";
import type { PremiumPaymentSlice } from "./use-premium-payment-slice";
import type { ClaimSettlementSlice } from "./use-claim-settlement-slice";
import type { NativeTokenPurchaseSlice } from "./use-native-token-purchase-slice";
import type { NativeTokenRecoverySlice } from "./use-native-token-recovery-slice";






/**
 * 🔹 RootStore — combined type of all slices
 */
export type RootStore = 
AppStore & 
AuthStore & 
ChipiSlice & 
WalletSlice & 
InsuranceProductSlice & 
ProposalSlice & 
PolicySlice &
ClaimSlice &
InspectionSlice &
ClaimEvidenceSlice &
PremiumPaymentSlice & 
ClaimSettlementSlice & 
NativeTokenPurchaseSlice &       
NativeTokenRecoverySlice;      

/**
 * 🔹 useRootStore — unified Zustand store integrating all slices
 */
export const useRootStore = create<RootStore>()(
  devtools(
    persist(
      immer((set, get, store) => {
        // Typecast set/get for compatibility with slices
        const _set = set as unknown as Parameters<StateCreator<RootStore>>[0];
        const _get = get as unknown as Parameters<StateCreator<RootStore>>[1];
        const _store = store as StoreApi<RootStore>;

        return {
          ...createAppSlice(_set, _get, _store),
          ...createAuthSlice(_set, _get, _store),
          ...createChipiPaySlice(_set, _get, _store),
          ...createWalletSlice(_set, _get, _store),
          ...createInsuranceProductSlice(_set, _get, _store),
          ...createProposalSlice(_set, _get, _store),
          ...createPolicySlice(_set, _get, _store),
          ...createClaimSlice(_set, _get, _store),
          ...createInspectionSlice(_set, _get, _store),
          ...createClaimEvidenceSlice(_set, _get, _store),
          ...createPremiumPaymentSlice(_set, _get, _store),  
          ...createClaimSettlementSlice(_set, _get, _store),  
          ...createNativeTokenPurchaseSlice(_set, _get, _store),  
          ...createNativeTokenRecoverySlice(_set, _get, _store),  


        };
      }),
      {
        name: "starknet-indemnify-root-store",
        partialize: (state) => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated,
          wallet: state.wallet,
          isConnected: state.isConnected,
          lastConnected: state.lastConnected,
          address: state.address,
          chainId: state.chainId,
          searchFilters: state.searchFilters,
          selectedProduct: state.selectedProduct,
          insuranceProducts: state.insuranceProducts,
          proposals: state.proposals,
          policies: state.policies,
          claims: state.claims,
          inspections: state.inspections,
          evidences: state.evidences,
          premiumPayments: state.premiumPayments, 
          claimSettlements: state.claimSettlements,
          tokenPurchases: state.tokenPurchases,   
          tokenRecoveries: state.tokenRecoveries, 
        }),
      }
    ),
    { name: "RootStore" }
  )
);

