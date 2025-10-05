import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

import { createAppSlice } from "./app-slice";
import { createAuthSlice } from "./auth-slice";
import { createChipiPaySlice } from "./use-chipi-pay-slice";
import { createWalletSlice } from "./use-wallet-slice";

import type { AppStore, AuthStore } from "@/types/common";
import type { ChipiSlice } from "./use-chipi-pay-slice";
import type { WalletSlice } from "./use-wallet-slice";
import type { StateCreator, StoreApi } from "zustand";

/**
 * 🔹 RootStore — combined type of all slices
 */
export type RootStore = AppStore & AuthStore & ChipiSlice & WalletSlice;

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
        }),
      }
    ),
    { name: "RootStore" }
  )
);

