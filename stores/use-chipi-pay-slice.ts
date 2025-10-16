import { StateCreator, StoreApi } from "zustand";
import {
  useCreateWallet,
  useApprove,
  useTransfer,
  useStakeVesuUsdc,
  useWithdrawVesuUsdc,
  useCallAnyContract,
} from "@chipi-pay/chipi-sdk";
import { getBearerToken } from "../lib/utils";

// ---------- Types ----------
export type MutationResult<T = any> = {
  data?: T;
  txHash?: string;
  error?: string;
};

export type ChipiWallet = {
  publicKey: string;
  encryptedPrivateKey: string;
  accountAddress?: string;
};

export type TxRecord = {
  id: string;
  type: "createWallet" | "approve" | "transfer" | "stake" | "withdraw" | "call" | "connect";
  txHash?: string | null;
  status?: "pending" | "success" | "failed";
  timestamp: number;
  meta?: Record<string, any>;
  error?: string | null;
};

export interface ChipiSlice {
  wallet: ChipiWallet | null;
  isConnected: boolean;
  lastConnected: number | null;

  // states
  isCreatingWallet: boolean;
  createError: string | null;
  isApproving: boolean;
  approveError: string | null;
  isTransferring: boolean;
  transferError: string | null;
  isStaking: boolean;
  stakeError: string | null;
  isWithdrawing: boolean;
  withdrawError: string | null;
  isCallingContract: boolean;
  callError: string | null;

  lastTxs: TxRecord[];

  connect: (opts: {
    encryptKey: string;
    bearerToken?: string;
  }) => Promise<ChipiWallet | null>;

  // actions
  createWallet: (opts: {
    encryptKey: string;
    externalUserId?: string;
    bearerToken?: string;
  }) => Promise<ChipiWallet>;

  approve: (opts: {
    encryptKey: string;
    walletInput?: ChipiWallet;
    contractAddress: string;
    spender: string;
    amount: string | number;
    decimals?: number;
    bearerToken?: string;
  }) => Promise<string | null>;

  transfer: (opts: {
    encryptKey: string;
    walletInput?: ChipiWallet;
    contractAddress: string;
    recipient: string;
    amount: string | number;
    bearerToken?: string;
  }) => Promise<string | null>;

  stake: (opts: {
    encryptKey: string;
    walletInput?: ChipiWallet;
    amount: string | number;
    receiverWallet?: string;
    bearerToken?: string;
  }) => Promise<string | null>;

  withdraw: (opts: {
    encryptKey: string;
    walletInput?: ChipiWallet;
    amount: string | number;
    recipient: string;
    bearerToken?: string;
  }) => Promise<string | null>;

  callAnyContract: (opts: {
    encryptKey: string;
    walletInput?: ChipiWallet;
    contractAddress: string;
    calls: any[];
    bearerToken?: string;
  }) => Promise<string | null>;

  restoreChipiConnection: () => Promise<void>;
  addTxRecord: (r: TxRecord) => void;
  clearHistory: () => void;
  disconnect: () => void;
}

// ---------- Slice ----------
export const createChipiPaySlice: StateCreator<
  ChipiSlice,
  [],
  [],
  ChipiSlice
> = (set, get, store: StoreApi<ChipiSlice>) => ({
  wallet: null,
  isConnected: false,
  lastConnected: null,

  isCreatingWallet: false,
  createError: null,
  isApproving: false,
  approveError: null,
  isTransferring: false,
  transferError: null,
  isStaking: false,
  stakeError: null,
  isWithdrawing: false,
  withdrawError: null,
  isCallingContract: false,
  callError: null,

  lastTxs: [],

  addTxRecord: (r) => set((s) => ({ lastTxs: [r, ...s.lastTxs].slice(0, 100) })),
  clearHistory: () => set({ lastTxs: [] }),
  disconnect: () =>
    set({
      wallet: null,
      isConnected: false,
      lastConnected: null,
      lastTxs: [],
    }),

      // ---------- connect Wallet ----------


    connect: async ({ encryptKey, bearerToken }) => {
        const txRecord: TxRecord = {
          id: `connect-${Date.now()}`,
          type: "connect",
          timestamp: Date.now(),
          status: "pending",
        };
        get().addTxRecord(txRecord);
    
        try {
          const token = bearerToken ?? (await getBearerToken());
    
          // If a wallet already exists in memory, reuse it
          const existingWallet = get().wallet;
          if (existingWallet) {
            console.log("Chipi: Restoring existing wallet...");
            set({
              isConnected: true,
              lastConnected: Date.now(),
            });
            get().addTxRecord({
              ...txRecord,
              status: "success",
              meta: { restored: true },
            });
            return existingWallet;
          }
    
          // Otherwise, create a new wallet via Chipi SDK
          const { createWalletAsync } = useCreateWallet();
          const res = await createWalletAsync({ encryptKey, bearerToken: token });
          const walletData = (res as any)?.data ?? res;
    
          const wallet: ChipiWallet = {
            publicKey: walletData?.publicKey ?? "",
            encryptedPrivateKey: walletData?.encryptedPrivateKey ?? "",
            accountAddress: walletData?.accountAddress ?? "",
          };
    
          set({
            wallet,
            isConnected: true,
            lastConnected: Date.now(),
          });
    
          get().addTxRecord({
            ...txRecord,
            txHash: res.txHash ?? null,
            status: "success",
            meta: { raw: res },
          });
    
          return wallet;
        } catch (err: any) {
          const msg = err?.message ?? String(err);
          get().addTxRecord({ ...txRecord, status: "failed", error: msg });
          set({ isConnected: false });
          console.error("Chipi connect failed:", msg);
          throw err;
        }
      },

  // ---------- createWallet ----------
  createWallet: async ({ encryptKey, externalUserId, bearerToken }) => {
    const { createWalletAsync } = useCreateWallet();
    set({ isCreatingWallet: true, createError: null });

    const txRecord: TxRecord = {
      id: `create-${Date.now()}`,
      type: "createWallet",
      timestamp: Date.now(),
      status: "pending",
    };
    get().addTxRecord(txRecord);

    try {
      const token = bearerToken ?? getBearerToken();
      const res = await createWalletAsync({ encryptKey, bearerToken: token });
      const walletData = (res as any)?.data ?? res;

      const wallet: ChipiWallet = {
        publicKey: walletData?.publicKey ?? "",
        encryptedPrivateKey: walletData?.encryptedPrivateKey ?? "",
        accountAddress: walletData?.accountAddress ?? "",
      };

      set({
        wallet,
        isConnected: true,
        lastConnected: Date.now(),
        isCreatingWallet: false,
      });

      get().addTxRecord({
        ...txRecord,
        txHash: res.txHash ?? null,
        status: "success",
        meta: { raw: res },
      });

      return wallet;
    } catch (err: any) {
      const msg = err?.message ?? String(err);
      set({ createError: msg, isCreatingWallet: false });
      get().addTxRecord({ ...txRecord, status: "failed", error: msg });
      throw err;
    }
  },

  // ---------- approve ----------
  approve: async ({
    encryptKey,
    walletInput,
    contractAddress,
    spender,
    amount,
    decimals = 18,
    bearerToken,
  }) => {
    const { approveAsync } = useApprove();
    set({ isApproving: true, approveError: null });

    const txRecord: TxRecord = {
      id: `approve-${Date.now()}`,
      type: "approve",
      timestamp: Date.now(),
      status: "pending",
      meta: { contractAddress, spender, amount },
    };
    get().addTxRecord(txRecord);

    try {
      const token = bearerToken ?? (await getBearerToken());
      const wallet = walletInput ?? get().wallet;
      if (!wallet) throw new Error("Chipi wallet not available.");

      const txHash = await approveAsync({
        encryptKey,
        wallet,
        contractAddress,
        spender,
        amount,
        decimals,
        bearerToken: token,
      });

      set({ isApproving: false });
      get().addTxRecord({
        ...txRecord,
        txHash,
        status: "success",
        meta: { raw: txHash },
      });

      return txHash;
    } catch (err: any) {
      const msg = err?.message ?? String(err);
      set({ approveError: msg, isApproving: false });
      get().addTxRecord({ ...txRecord, status: "failed", error: msg });
      throw err;
    }
  },

  // ---------- transfer ----------
  transfer: async ({ encryptKey, walletInput, contractAddress, recipient, amount, bearerToken }) => {
    const { transferAsync } = useTransfer();
    set({ isTransferring: true, transferError: null });

    const txRecord: TxRecord = {
      id: `transfer-${Date.now()}`,
      type: "transfer",
      timestamp: Date.now(),
      status: "pending",
      meta: { recipient, amount },
    };
    get().addTxRecord(txRecord);

    try {
      const token = bearerToken ?? (await getBearerToken());
      const wallet = walletInput ?? get().wallet;
      if (!wallet) throw new Error("Chipi wallet not available.");

      const txHash = await transferAsync({
        encryptKey,
        wallet,
        contractAddress,
        recipient,
        amount,
        bearerToken: token,
      });

      set({ isTransferring: false });
      get().addTxRecord({
        ...txRecord,
        txHash,
        status: "success",
        meta: { raw: txHash },
      });

      return txHash;
    } catch (err: any) {
      const msg = err?.message ?? String(err);
      set({ transferError: msg, isTransferring: false });
      get().addTxRecord({ ...txRecord, status: "failed", error: msg });
      throw err;
    }
  },

  // ---------- stake ----------
  stake: async ({ encryptKey, walletInput, amount, receiverWallet, bearerToken }) => {
    const { stakeAsync } = useStakeVesuUsdc();
    set({ isStaking: true, stakeError: null });

    const txRecord: TxRecord = {
      id: `stake-${Date.now()}`,
      type: "stake",
      timestamp: Date.now(),
      status: "pending",
      meta: { amount, receiverWallet },
    };
    get().addTxRecord(txRecord);

    try {
      const token = bearerToken ?? getBearerToken();
      const wallet = walletInput ?? get().wallet;
      if (!wallet) throw new Error("Chipi wallet not available.");
      if (!receiverWallet) throw new Error("Receiver wallet is required for staking");

      const txHash = await stakeAsync({
        encryptKey,
        wallet,
        amount,
        receiverWallet,
        bearerToken: token,
      });

      set({ isStaking: false });
      get().addTxRecord({
        ...txRecord,
        txHash,
        status: "success",
        meta: { raw: txHash },
      });

      return txHash;
    } catch (err: any) {
      const msg = err?.message ?? String(err);
      set({ stakeError: msg, isStaking: false });
      get().addTxRecord({ ...txRecord, status: "failed", error: msg });
      throw err;
    }
  },

  // ---------- withdraw ----------
  withdraw: async ({ encryptKey, walletInput, amount, recipient, bearerToken }) => {
    const { withdrawAsync } = useWithdrawVesuUsdc();
    set({ isWithdrawing: true, withdrawError: null });

    const txRecord: TxRecord = {
      id: `withdraw-${Date.now()}`,
      type: "withdraw",
      timestamp: Date.now(),
      status: "pending",
      meta: { amount, recipient },
    };
    get().addTxRecord(txRecord);

    try {
      const token = bearerToken ?? (await getBearerToken());
      const wallet = walletInput ?? get().wallet;
      if (!wallet) throw new Error("Chipi wallet not available.");

      const txHash = await withdrawAsync({
        encryptKey,
        wallet,
        amount,
        recipient,
        bearerToken: token,
      });

      set({ isWithdrawing: false });
      get().addTxRecord({
        ...txRecord,
        txHash,
        status: "success",
        meta: { raw: txHash },
      });

      return txHash;
    } catch (err: any) {
      const msg = err?.message ?? String(err);
      set({ withdrawError: msg, isWithdrawing: false });
      get().addTxRecord({ ...txRecord, status: "failed", error: msg });
      throw err;
    }
  },

  // ---------- callAnyContract ----------
  callAnyContract: async ({ encryptKey, walletInput, contractAddress, calls, bearerToken }) => {
    const { callAnyContractAsync } = useCallAnyContract();
    set({ isCallingContract: true, callError: null });

    const txRecord: TxRecord = {
      id: `call-${Date.now()}`,
      type: "call",
      timestamp: Date.now(),
      status: "pending",
      meta: { contractAddress, calls },
    };
    get().addTxRecord(txRecord);

    try {
      const token = bearerToken ?? (await getBearerToken());
      const wallet = walletInput ?? get().wallet;
      if (!wallet) throw new Error("Chipi wallet not available.");

      const txHash = await callAnyContractAsync({
        encryptKey,
        wallet,
        contractAddress,
        calls,
        bearerToken: token,
      });

      set({ isCallingContract: false });
      get().addTxRecord({
        ...txRecord,
        txHash,
        status: "success",
        meta: { raw: txHash },
      });

      return txHash;
    } catch (err: any) {
      const msg = err?.message ?? String(err);
      set({ callError: msg, isCallingContract: false });
      get().addTxRecord({ ...txRecord, status: "failed", error: msg });
      throw err;
    }
  },

  // ---------- restoreConnection ----------
  restoreChipiConnection: async () => {
    const savedWallet = get().wallet;
    if (!savedWallet) {
      console.warn("No saved Chipi wallet found in session.");
      set({ isConnected: false });
      return;
    }

    try {
      const token = getBearerToken();
      console.log("Restoring Chipi connection:", savedWallet);

      set({
        wallet: savedWallet,
        isConnected: true,
        lastConnected: Date.now(),
      });
    } catch (err: any) {
      console.error("Failed to restore Chipi connection:", err);
      set({
        wallet: null,
        isConnected: false,
        lastConnected: null,
      });
    }
  },
});
