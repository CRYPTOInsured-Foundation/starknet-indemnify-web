import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { createChipiPaySlice, ChipiSlice } from "./use-chipi-pay-slice";

export const useChipiPayStore = create<ChipiSlice>()(
  persist(
    (set, get, store) => createChipiPaySlice(set, get, store),
    {
      name: "chipi-wallet-store",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (s) => ({
        wallet: s.wallet,
        lastTxs: s.lastTxs,
        lastConnected: s.lastConnected,
      }),
    }
  )
);

export default useChipiPayStore;
















// // src/stores/use-chipi-pay-store.ts
// import { create } from "zustand";
// import { persist, createJSONStorage } from "zustand/middleware";
// import {
//   useCreateWallet,
//   useApprove,
//   useTransfer,
//   useStakeVesuUsdc,
//   useWithdrawVesuUsdc,
//   useCallAnyContract,
// } from "@chipi-pay/chipi-sdk";
// import { getBearerToken } from "../lib/utils";

// // ---------------- Types ----------------
// type MutationResult<T = any> = {
//   data?: T;
//   txHash?: string;
//   error?: string;
// };

// type ChipiWallet = {
//   publicKey: string;
//   encryptedPrivateKey: string;
//   accountAddress?: string;
// };

// type TxRecord = {
//   id: string;
//   type: "createWallet" | "approve" | "transfer" | "stake" | "withdraw" | "call";
//   txHash?: string | null;
//   status?: "pending" | "success" | "failed";
//   timestamp: number;
//   meta?: Record<string, any>;
//   error?: string | null;
// };

// type ChipiState = {
//   wallet: ChipiWallet | null;
//   isConnected: boolean;
//   lastConnected: number | null;

//   // states
//   isCreatingWallet: boolean;
//   createError: string | null;
//   isApproving: boolean;
//   approveError: string | null;
//   isTransferring: boolean;
//   transferError: string | null;
//   isStaking: boolean;
//   stakeError: string | null;
//   isWithdrawing: boolean;
//   withdrawError: string | null;
//   isCallingContract: boolean;
//   callError: string | null;

//   lastTxs: TxRecord[];

//   // actions
//   createWallet: (opts: { encryptKey: string; externalUserId?: string; bearerToken?: string }) => Promise<ChipiWallet>;
//   approve: (opts: {
//     encryptKey: string;
//     walletInput?: ChipiWallet;
//     contractAddress: string;
//     spender: string;
//     amount: string | number;
//     decimals?: number;
//     bearerToken?: string;
//   }) => Promise<string | null>;
  
//   transfer: (opts: {
//     encryptKey: string;
//     walletInput?: ChipiWallet;
//     contractAddress: string;   // ✅ added
//     recipient: string;
//     amount: string | number;
//     bearerToken?: string;
//   }) => Promise<string | null>;
  
//   stake: (opts: {
//     encryptKey: string;
//     walletInput?: ChipiWallet;
//     amount: string | number;
//     receiverWallet?: string;
//     bearerToken?: string;
//   }) => Promise<string | null>;
//   withdraw: (opts: {
//     encryptKey: string;
//     walletInput?: ChipiWallet;
//     amount: string | number;
//     recipient: string;
//     bearerToken?: string;
//   }) => Promise<string | null>;
//   callAnyContract: (opts: {
//     encryptKey: string;
//     walletInput?: ChipiWallet;
//     contractAddress: string;
//     calls: any[];
//     bearerToken?: string;
//   }) => Promise<string | null>;

//   restoreConnection: () => Promise<void>;

//   // utils
//   addTxRecord: (r: TxRecord) => void;
//   clearHistory: () => void;
//   disconnect: () => void;
// };

// // ---------------- Store ----------------
// export const useChipiPayStore = create<ChipiState>()(
//   persist(
//     (set, get) => ({
//       wallet: null,
//       isConnected: false,
//       lastConnected: null,

//       isCreatingWallet: false,
//       createError: null,
//       isApproving: false,
//       approveError: null,
//       isTransferring: false,
//       transferError: null,
//       isStaking: false,
//       stakeError: null,
//       isWithdrawing: false,
//       withdrawError: null,
//       isCallingContract: false,
//       callError: null,

//       lastTxs: [],

//       addTxRecord: (r) => set((s) => ({ lastTxs: [r, ...s.lastTxs].slice(0, 100) })),
//       clearHistory: () => set({ lastTxs: [] }),
//       disconnect: () =>
//         set({
//           wallet: null,
//           isConnected: false,
//           lastConnected: null,
//           lastTxs: [],
//         }),

//       // ---------------- createWallet ----------------
    
//     createWallet: async ({ encryptKey, externalUserId, bearerToken }) => {
//         const { createWalletAsync } = useCreateWallet();
//         set({ isCreatingWallet: true, createError: null });
      
//         const txRecord: TxRecord = {
//           id: `create-${Date.now()}`,
//           type: "createWallet",
//           timestamp: Date.now(),
//           status: "pending",
//         };
//         get().addTxRecord(txRecord);
      
//         try {
       
//         const token = bearerToken ?? (getBearerToken());

//         const res = await createWalletAsync({
//         encryptKey,     // 🔐 required key
//         bearerToken: token, // ✅ token belongs inside object
//         });


//         // Log the response to inspect what it returns
//         console.log("createWallet response:", res);

//         // Some SDKs wrap response under `.data`
//         const walletData = (res as any)?.data ?? res;

//         // Now safely construct the wallet object
//         const wallet: ChipiWallet = {
//         publicKey: walletData?.publicKey ?? "",
//         encryptedPrivateKey: walletData?.encryptedPrivateKey ?? "",
//         accountAddress: walletData?.accountAddress ?? "",
//         };

      
//           set({
//             wallet,
//             isConnected: true,
//             lastConnected: Date.now(),
//             isCreatingWallet: false,
//           });
      
//           get().addTxRecord({ ...txRecord, txHash: res.txHash ?? null, status: "success", meta: { raw: res } });
//           return wallet;
//         } catch (err: any) {
//           const msg = err?.message ?? String(err);
//           set({ createError: msg, isCreatingWallet: false });
//           get().addTxRecord({ ...txRecord, status: "failed", error: msg });
//           throw err;
//         }
//       },
      

//       // ---------------- approve ----------------
//       approve: async ({ encryptKey, walletInput, contractAddress, spender, amount, decimals = 18, bearerToken }) => {
//         const { approveAsync } = useApprove();
//         set({ isApproving: true, approveError: null });

//         const txRecord: TxRecord = {
//           id: `approve-${Date.now()}`,
//           type: "approve",
//           timestamp: Date.now(),
//           status: "pending",
//           meta: { contractAddress, spender, amount },
//         };
//         get().addTxRecord(txRecord);

//         try {
//             const token = bearerToken ?? (await getBearerToken());
//             const wallet = walletInput ?? get().wallet;
//             if (!wallet) throw new Error("Chipi wallet not available.");
          
//             // ✅ Flatten the params and include bearerToken inside
//             const txHash = await approveAsync({
//               encryptKey,
//               wallet,
//               contractAddress,
//               spender,
//               amount,
//               decimals,
//               bearerToken: token,
//             });
          
//             // ✅ txHash is likely a string
//             set({ isApproving: false });
//             get().addTxRecord({
//               ...txRecord,
//               txHash,
//               status: "success",
//               meta: { raw: txHash },
//             });
          
//             return txHash;
          
//           } catch (err: any) {
//             const msg = err?.message ?? String(err);
//             set({ approveError: msg, isApproving: false });
//             get().addTxRecord({
//               ...txRecord,
//               status: "failed",
//               error: msg,
//             });
//             throw err;
//           }
          
//       },

//       // ---------------- transfer ----------------
//       transfer: async ({ 
//         encryptKey, walletInput, contractAddress, recipient, amount, bearerToken 
//     }) => {
//         const { transferAsync } = useTransfer();
//         set({ isTransferring: true, transferError: null });

//         const txRecord: TxRecord = {
//           id: `transfer-${Date.now()}`,
//           type: "transfer",
//           timestamp: Date.now(),
//           status: "pending",
//           meta: { recipient, amount },
//         };
//         get().addTxRecord(txRecord);

//         try {
//             const token = bearerToken ?? (await getBearerToken());
//             const wallet = walletInput ?? get().wallet;
//             if (!wallet) throw new Error("Chipi wallet not available.");
          
//             // ✅ add the contractAddress as required by Chipi SDK
//             const txHash = await transferAsync({
//               encryptKey,
//               wallet,
//               contractAddress, // ← REQUIRED by SDK
//               recipient,
//               amount,
//               bearerToken: token,
//             });
          
//             set({ isTransferring: false });
//             get().addTxRecord({
//               ...txRecord,
//               txHash,
//               status: "success",
//               meta: { raw: txHash },
//             });
          
//             return txHash;
          
//           } catch (err: any) {
//             const msg = err?.message ?? String(err);
//             set({ transferError: msg, isTransferring: false });
//             get().addTxRecord({
//               ...txRecord,
//               status: "failed",
//               error: msg,
//             });
//             throw err;
//           }         
          
//       },

//       // ---------------- stake ----------------
//       stake: async ({ encryptKey, walletInput, amount, receiverWallet, bearerToken }) => {
//         const { stakeAsync, stakeData, isLoading, isError } = useStakeVesuUsdc();

//         set({ isStaking: true, stakeError: null });

//         const txRecord: TxRecord = {
//           id: `stake-${Date.now()}`,
//           type: "stake",
//           timestamp: Date.now(),
//           status: "pending",
//           meta: { amount, receiverWallet },
//         };
//         get().addTxRecord(txRecord);

        
//         try {
//             const token = bearerToken ?? (getBearerToken());
//             const wallet = walletInput ?? get().wallet;
//             if (!wallet) throw new Error("Chipi wallet not available.");

//             if (!receiverWallet) {
//                 throw new Error("Receiver wallet is required for staking");
//             }
          
//             const txHash = await stakeAsync({
//               encryptKey,
//               wallet,
//               amount,
//               receiverWallet, //?? wallet.address,
//               bearerToken: token,
//             });
          
//             set({ isStaking: false });
//             get().addTxRecord({
//               ...txRecord,
//               txHash,
//               status: "success",
//               meta: { raw: txHash },
//             });
          
//             return txHash;
//           } catch (err: any) {
//             const msg = err?.message ?? String(err);
//             set({ stakeError: msg, isStaking: false });
//             get().addTxRecord({ ...txRecord, status: "failed", error: msg });
//             throw err;
//           }
          
//       },

//       // ---------------- withdraw ----------------
   
//     withdraw: async ({ encryptKey, walletInput, amount, recipient, bearerToken }) => {
//         const { withdrawAsync } = useWithdrawVesuUsdc();  // ✅ correct name
//         set({ isWithdrawing: true, withdrawError: null });
      
//         const txRecord: TxRecord = {
//           id: `withdraw-${Date.now()}`,
//           type: "withdraw",
//           timestamp: Date.now(),
//           status: "pending",
//           meta: { amount, recipient },
//         };
//         get().addTxRecord(txRecord);
      
//         try {
//           const token = bearerToken ?? (await getBearerToken());
//           const wallet = walletInput ?? get().wallet;
//           if (!wallet) throw new Error("Chipi wallet not available.");
      
//           const txHash = await withdrawAsync({
//             encryptKey,
//             wallet,
//             amount,
//             recipient,
//             bearerToken: token,
//           }); // ✅ returns string directly (the txHash)
      
//           set({ isWithdrawing: false });
//           get().addTxRecord({ ...txRecord, txHash, status: "success", meta: { raw: txHash } });
      
//           return txHash;
//         } catch (err: any) {
//           const msg = err?.message ?? String(err);
//           set({ withdrawError: msg, isWithdrawing: false });
//           get().addTxRecord({ ...txRecord, status: "failed", error: msg });
//           throw err;
//         }
//       },
      

//       // ---------------- callAnyContract ----------------
    
//     callAnyContract: async ({ encryptKey, walletInput, contractAddress, calls, bearerToken }) => {
//         // ✅ use the correct function name from SDK
//         const { callAnyContractAsync } = useCallAnyContract();
//         set({ isCallingContract: true, callError: null });
      
//         const txRecord: TxRecord = {
//           id: `call-${Date.now()}`,
//           type: "call",
//           timestamp: Date.now(),
//           status: "pending",
//           meta: { contractAddress, calls },
//         };
//         get().addTxRecord(txRecord);
      
//         try {
//           const token = bearerToken ?? (await getBearerToken());
//           const wallet = walletInput ?? get().wallet;
//           if (!wallet) throw new Error("Chipi wallet not available.");
      
//           // ✅ flat structure — no 'params'
//           const txHash = await callAnyContractAsync({
//             encryptKey,
//             wallet,
//             contractAddress,
//             calls,
//             bearerToken: token,
//           });
      
//           set({ isCallingContract: false });
//           get().addTxRecord({ ...txRecord, txHash, status: "success", meta: { raw: txHash } });
      
//           return txHash;
//         } catch (err: any) {
//           const msg = err?.message ?? String(err);
//           set({ callError: msg, isCallingContract: false });
//           get().addTxRecord({ ...txRecord, status: "failed", error: msg });
//           throw err;
//         }
//       },

//       restoreConnection: async () => {
//         const savedWallet = get().wallet;
      
//         // if no wallet is saved, nothing to restore
//         if (!savedWallet) {
//           console.warn("No saved Chipi wallet found in session.");
//           set({ isConnected: false });
//           return;
//         }
      
//         try {
//           // Optionally refresh bearer token
//           const token = getBearerToken();
//           console.log("Restoring Chipi connection with saved wallet:", savedWallet);
      
//           // You can test the wallet’s validity or balance here if SDK exposes a call
//           // e.g., await getWalletBalanceAsync({ wallet: savedWallet, bearerToken: token });
      
//           set({
//             wallet: savedWallet,
//             isConnected: true,
//             lastConnected: Date.now(),
//           });
      
//           console.info("✅ Chipi connection restored.");
//         } catch (err: any) {
//           console.error("❌ Failed to restore Chipi connection:", err);
//           set({
//             wallet: null,
//             isConnected: false,
//             lastConnected: null,
//           });
//         }
//       },
      
      
//     }),
//     {
//       name: "chipi-wallet-store",
//       storage: createJSONStorage(() => sessionStorage),
//       partialize: (s) => ({
//         wallet: s.wallet,
//         lastTxs: s.lastTxs,
//         lastConnected: s.lastConnected,
//       }),
//     }
//   )
// );

// export default useChipiPayStore;
