import { create } from "zustand";
import { connect, disconnect, StarknetWindowObject } from "@starknet-io/get-starknet";
import {
  AccountInterface,
  ProviderInterface,
  Call,
  Contract,
  TypedData,
  Signature,
} from "starknet";
import { persist, createJSONStorage } from "zustand/middleware";


interface ExtendedStarknetWindowObject extends StarknetWindowObject {
    isConnected?: boolean;
    enable?: () => Promise<void>;
    account?: AccountInterface;
    provider?: ProviderInterface;
    chainId?: string;
  }

interface WalletState {
  // State
  isConnected: boolean;
  isConnecting: boolean;
  account: AccountInterface | null;
  address: string | null;
  provider: ProviderInterface | null;
  walletType: "argentx" | "braavos" | null;
  error: string | null;
  chainId: string | null;
  lastConnected: number | null;

  // Methods
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  signMessage: (message: string) => Promise<Signature>;
  executeTransaction: (calls: Call[]) => Promise<string>;
  callContract: (
    contractAddress: string,
    entrypoint: string,
    calldata?: any[]
  ) => Promise<any>;
  getStarknetVersion: () => Promise<string | null>;
  switchNetwork: (chainId: string) => Promise<void>;
  watchAsset: (params: {
    type: "ERC20" | "ERC721";
    contractAddress: string;
    symbol?: string;
    decimals?: number;
  }) => Promise<void>;
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set, get) => ({
      // Initial state
      isConnected: false,
      isConnecting: false,
      account: null,
      address: null,
      provider: null,
      walletType: null,
      error: null,
      chainId: null,
      lastConnected: null,

      connectWallet: async () => {
        try {
          set({ isConnecting: true, error: null });

        //   const starknet: StarknetWindowObject | null = await connect({
        //     modalMode: "alwaysAsk",
        //   });


        const starknet: ExtendedStarknetWindowObject | null = await connect({
            modalMode: "alwaysAsk",
          });
          

          if (!starknet) throw new Error("No wallet found");
          if (!starknet.isConnected) throw new Error("User rejected connection");

        //   await starknet.enable();
        if (starknet.enable) {
            await starknet.enable();
          }
          

          const walletType =
            starknet.id === "argentX"
              ? "argentx"
              : starknet.id === "braavos"
              ? "braavos"
              : null;

          if (!walletType) throw new Error("Unsupported wallet");

          set({
            isConnected: true,
            isConnecting: false,
            account: starknet.account ?? null,
            address: starknet.account?.address ?? null,
            provider: starknet.provider ?? null,
            walletType,
            chainId: starknet.chainId ?? null,
            lastConnected: Date.now(),
            error: null,
          });

          starknet.on("accountsChanged", () => get().connectWallet());
          starknet.on("networkChanged", () => get().connectWallet());
        } catch (err) {
          set({
            isConnected: false,
            isConnecting: false,
            error: err instanceof Error ? err.message : "Connection failed",
          });
        }
      },

      disconnectWallet: () => {
        disconnect({ clearLastWallet: true });
        set({
          isConnected: false,
          account: null,
          address: null,
          provider: null,
          walletType: null,
          chainId: null,
          lastConnected: null,
        });
      },

      executeTransaction: async (calls: Call[]) => {
        const { account } = get();
        if (!account) throw new Error("Wallet not connected");

        try {
          const result = await account.execute(calls);
          await account.waitForTransaction(result.transaction_hash);
          return result.transaction_hash;
        } catch (err) {
          set({ error: "Transaction failed" });
          throw err;
        }
      },

      callContract: async (contractAddress, entrypoint, calldata = []) => {
        const { provider } = get();
        if (!provider) throw new Error("Provider not available");

        const contract = new Contract([], contractAddress, provider);
        return contract.call(entrypoint, calldata);
      },

      signMessage: async (message: string) => {
        const { account } = get();
        if (!account) throw new Error("Wallet not connected");

        const typedData: TypedData = {
          domain: {
            name: "NFTopia",
            version: "1",
            chainId: "SN_SEPOLIA",
          },
          types: {
            StarkNetDomain: [
              { name: "name", type: "felt" },
              { name: "version", type: "felt" },
              { name: "chainId", type: "felt" },
            ],
            Message: [{ name: "message", type: "felt" }],
          },
          primaryType: "Message",
          message: { message },
        };

        return account.signMessage(typedData);
      },

      getStarknetVersion: async () => {
        const { provider } = get();
        if (!provider) return null;

        try {
          // some providers don’t expose getSpecVersion
          // @ts-expect-error external provider type mismatch
          return await provider.getSpecVersion?.();
        } catch (err) {
          console.error("Failed to get version:", err);
          return null;
        }
      },

      switchNetwork: async (chainId: string) => {
        const starknet = await connect();
        if (!starknet) throw new Error("Wallet not connected");

        await starknet.request({
          type: "wallet_switchStarknetChain",
          params: { chainId },
        });
        set({ chainId });
      },

      watchAsset: async (params) => {
        const starknet = await connect();
        if (!starknet) throw new Error("Wallet not connected");

        await starknet.request({
            type: "wallet_watchAsset",
            params: {
              type: "ERC20", // ✅ only ERC20 allowed
              options: {
                address: params.contractAddress,
                symbol: params.symbol,
                decimals: params.decimals,
              },
            },
          });
          
      },
    }),
    {
      name: "starknet-wallet-store",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        walletType: state.walletType,
        lastConnected: state.lastConnected,
        chainId: state.chainId,
      }),
    }
  )
);