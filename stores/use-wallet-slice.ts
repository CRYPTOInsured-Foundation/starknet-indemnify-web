import { connect, disconnect } from "@starknet-io/get-starknet";
import {
  Abi,
  AccountInterface,
  ProviderInterface,
  Call,
  Contract,
  TypedData,
  Signature,
} from "starknet";
import { StateCreator } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { useCreateWallet } from "@chipi-pay/chipi-sdk"; // Keep if needed for Chipi integration

interface ExtendedStarknetWindowObject extends Window {
  id?: string;
  isConnected?: boolean;
  enable?: () => Promise<void>;
  account?: AccountInterface;
  provider?: ProviderInterface;
  chainId?: string;
  on?: (ev: string, cb: (...args: any[]) => void) => void;
  request?: (args: { type: string; params?: Record<string, any> }) => Promise<any>;
}

export interface WalletSlice {
  isConnected: boolean;
  isConnecting: boolean;
  account: AccountInterface | null;
  address: string | null;
  provider: ProviderInterface | null;
  walletType: "argentx" | "braavos" | null;
  error: string | null;
  chainId: string | null;
  lastConnected: number | null;

  connectWallet: (opts?: { silent?: boolean }) => Promise<void>;
  disconnectWallet: () => Promise<void>;
  restoreConnection: () => Promise<void>;
  signMessage: (message: string) => Promise<Signature>;
  executeTransaction: (calls: Call[]) => Promise<string>;
  callContract: (contractAddress: string, entrypoint: string, calldata?: any[]) => Promise<any>;
  getStarknetVersion: () => Promise<string | null>;
  switchNetwork: (chainId: string) => Promise<void>;
  watchAsset: (params: {
    type: "ERC20" | "ERC721";
    contractAddress: string;
    symbol?: string;
    decimals?: number;
  }) => Promise<void>;
}

export const createWalletSlice: StateCreator<WalletSlice> = (set, get) => ({
  isConnected: false,
  isConnecting: false,
  account: null,
  address: null,
  provider: null,
  walletType: null,
  error: null,
  chainId: null,
  lastConnected: null,

  connectWallet: async (opts) => {
    try {
      set({ isConnecting: true, error: null });

      const starknet = (await connect({
        modalMode: opts?.silent ? "neverAsk" : "alwaysAsk",
      })) as ExtendedStarknetWindowObject | null;

      if (!starknet) throw new Error("No wallet found or user cancelled connection");

      if (starknet.enable) await starknet.enable();

      const acct = starknet.account ?? null;
      if (!acct) throw new Error("No account available from wallet");

      const walletType =
        starknet.id === "argentX"
          ? "argentx"
          : starknet.id === "braavos"
          ? "braavos"
          : null;

      set({
        isConnected: true,
        isConnecting: false,
        account: acct,
        address: acct.address ?? null,
        provider: starknet.provider ?? null,
        walletType,
        chainId: starknet.chainId ?? null,
        lastConnected: Date.now(),
        error: null,
      });

      starknet.on?.("accountsChanged", () => get().connectWallet({ silent: true }));
      starknet.on?.("networkChanged", () => get().connectWallet({ silent: true }));
    } catch (err) {
      set({
        isConnected: false,
        isConnecting: false,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  },

  disconnectWallet: async () => {
    try {
      await disconnect({ clearLastWallet: true });
    } finally {
      set({
        isConnected: false,
        account: null,
        address: null,
        provider: null,
        walletType: null,
        chainId: null,
        lastConnected: null,
      });
    }
  },

  restoreConnection: async () => {
    const { walletType, lastConnected, connectWallet } = get();
    if (walletType && lastConnected) {
      await connectWallet({ silent: true });
    }
  },

  executeTransaction: async (calls) => {
    const { account } = get();
    if (!account) throw new Error("Wallet not connected");
    const result = await account.execute(calls);
    await account.waitForTransaction(result.transaction_hash);
    return result.transaction_hash;
  },

  callContract: async (contractAddress, entrypoint, calldata = []) => {
    const { provider } = get();
    if (!provider) throw new Error("Provider not available");

    const abi: Abi = [] as any;
    const contract = new Contract({ abi, address: contractAddress, providerOrAccount: provider });
    return contract.call(entrypoint, calldata);
  },

  signMessage: async (message) => {
    const { account } = get();
    if (!account) throw new Error("Wallet not connected");
    const typedData: TypedData = {
      domain: {
        name: "Starknet-Indemnify",
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
      return await provider.getSpecVersion?.();
    } catch {
      return null;
    }
  },

  switchNetwork: async (chainId) => {
    const starknet = (await connect()) as ExtendedStarknetWindowObject | null;
    if (!starknet) throw new Error("Wallet not connected");
    await starknet.request?.({
      type: "wallet_switchStarknetChain",
      params: { chainId },
    });
    set({ chainId });
  },

  watchAsset: async (params) => {
    const starknet = (await connect()) as ExtendedStarknetWindowObject | null;
    if (!starknet) throw new Error("Wallet not connected");
    await starknet.request?.({
      type: "wallet_watchAsset",
      params: {
        type: "ERC20",
        options: {
          address: params.contractAddress,
          symbol: params.symbol,
          decimals: params.decimals,
        },
      },
    });
  },
});
