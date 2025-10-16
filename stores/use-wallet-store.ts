import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { createWalletSlice, WalletSlice } from "./use-wallet-slice";

export const useWalletStore = create<WalletSlice>()(
  persist(
    (set, get, store) => createWalletSlice(set, get, store),
    {
      name: "starknet-wallet-store",
      storage: createJSONStorage(() => sessionStorage),
      // Persist only specific fields
      partialize: (state) => ({
        walletType: state.walletType,
        lastConnected: state.lastConnected,
        chainId: state.chainId,
      }),
    }
  )
);

















// import { create } from "zustand";
// import { connect, disconnect } from "@starknet-io/get-starknet";
// import {
//   type Abi,
//   AccountInterface,
//   ProviderInterface,
//   Call,
//   Contract,
//   TypedData,
//   Signature,
// } from "starknet";
// import { persist, createJSONStorage } from "zustand/middleware";
// import { useCreateWallet } from '@chipi-pay/chipi-sdk';

// interface ExtendedStarknetWindowObject extends Window {
//   id?: string;
//   isConnected?: boolean;
//   enable?: () => Promise<void>;
//   account?: AccountInterface;
//   provider?: ProviderInterface;
//   chainId?: string;
//   on?: (ev: string, cb: (...args: any[]) => void) => void;
//   request?: (args: { type: string; params?: Record<string, any> }) => Promise<any>;
// }

// interface WalletState {
//   isConnected: boolean;
//   isConnecting: boolean;
//   account: AccountInterface | null;
//   address: string | null;
//   provider: ProviderInterface | null;
//   walletType: "argentx" | "braavos" | null;
//   error: string | null;
//   chainId: string | null;
//   lastConnected: number | null;

//   connectWallet: (opts?: { silent?: boolean }) => Promise<void>;
//   disconnectWallet: () => Promise<void>;
//   restoreConnection: () => Promise<void>;

//   signMessage: (message: string) => Promise<Signature>;
//   executeTransaction: (calls: Call[]) => Promise<string>;
//   callContract: (contractAddress: string, entrypoint: string, calldata?: any[]) => Promise<any>;
//   getStarknetVersion: () => Promise<string | null>;
//   switchNetwork: (chainId: string) => Promise<void>;
//   watchAsset: (params: {
//     type: "ERC20" | "ERC721";
//     contractAddress: string;
//     symbol?: string;
//     decimals?: number;
//   }) => Promise<void>;
// }

// export const useWalletStore = create<WalletState>()(
//   persist(
//     (set, get) => ({
//       isConnected: false,
//       isConnecting: false,
//       account: null,
//       address: null,
//       provider: null,
//       walletType: null,
//       error: null,
//       chainId: null,
//       lastConnected: null,

//       connectWallet: async (opts?: { silent?: boolean }) => {
//         try {
//           set({ isConnecting: true, error: null });

//           const starknet = (await connect({
//             modalMode: opts?.silent ? "neverAsk" : "alwaysAsk",
//           })) as ExtendedStarknetWindowObject | null;

//           if (!starknet) throw new Error("No wallet found or user cancelled connection");

//           if (starknet.enable) await starknet.enable();

//           const acct = starknet.account ?? null;
//           if (!acct) throw new Error("No account available from wallet");

//           const walletType =
//             starknet.id === "argentX"
//               ? "argentx"
//               : starknet.id === "braavos"
//               ? "braavos"
//               : null;

//           set({
//             isConnected: true,
//             isConnecting: false,
//             account: acct,
//             address: acct.address ?? null,
//             provider: starknet.provider ?? null,
//             walletType,
//             chainId: starknet.chainId ?? null,
//             lastConnected: Date.now(),
//             error: null,
//           });

//           starknet.on?.("accountsChanged", () => get().connectWallet({ silent: true }));
//           starknet.on?.("networkChanged", () => get().connectWallet({ silent: true }));
//         } catch (err) {
//           set({
//             isConnected: false,
//             isConnecting: false,
//             error: err instanceof Error ? err.message : String(err),
//           });
//         }
//       },

//       disconnectWallet: async () => {
//         try {
//           await disconnect({ clearLastWallet: true });
//         } finally {
//           set({
//             isConnected: false,
//             account: null,
//             address: null,
//             provider: null,
//             walletType: null,
//             chainId: null,
//             lastConnected: null,
//           });
//         }
//       },

//       restoreConnection: async () => {
//         const { walletType, lastConnected, connectWallet } = get();
//         if (walletType && lastConnected) {
//           // try reconnect silently
//           await connectWallet({ silent: true });
//         }
//       },

//       executeTransaction: async (calls: Call[]) => {
//         const { account } = get();
//         if (!account) throw new Error("Wallet not connected");
//         const result = await account.execute(calls);
//         await account.waitForTransaction(result.transaction_hash);
//         return result.transaction_hash;
//       },

//       callContract: async (
//         contractAddress: string,
//         entrypoint: string,
//         calldata: any[] = []
//       ) => {
//         const { provider } = get();
//         if (!provider) throw new Error("Provider not available");
      
//         // ⚠️ In production you should import the ABI JSON of the contract.
//         // For generic calls, you can keep [] as a placeholder.
//         const abi: Abi = [] as any;
      
//         const contract = new Contract({
//           abi,
//           address: contractAddress,
//           providerOrAccount: provider,
//         });
      
//         return contract.call(entrypoint, calldata);
//       },

//       signMessage: async (message: string) => {
//         const { account } = get();
//         if (!account) throw new Error("Wallet not connected");
//         const typedData: TypedData = {
//           domain: {
//             name: "Starknet-Indemnify",
//             version: "1",
//             chainId: "SN_SEPOLIA",
//           },
//           types: {
//             StarkNetDomain: [
//               { name: "name", type: "felt" },
//               { name: "version", type: "felt" },
//               { name: "chainId", type: "felt" },
//             ],
//             Message: [{ name: "message", type: "felt" }],
//           },
//           primaryType: "Message",
//           message: { message },
//         };
//         return account.signMessage(typedData);
//       },

//       getStarknetVersion: async () => {
//         const { provider } = get();
//         if (!provider) return null;
//         try {
//           return await provider.getSpecVersion?.();
//         } catch {
//           return null;
//         }
//       },

//       switchNetwork: async (chainId: string) => {
//         const starknet = (await connect()) as ExtendedStarknetWindowObject | null;
//         if (!starknet) throw new Error("Wallet not connected");
//         await starknet.request?.({
//           type: "wallet_switchStarknetChain",
//           params: { chainId },
//         });
//         set({ chainId });
//       },

//       watchAsset: async (params) => {
//         const starknet = (await connect()) as ExtendedStarknetWindowObject | null;
//         if (!starknet) throw new Error("Wallet not connected");
//         await starknet.request?.({
//           type: "wallet_watchAsset",
//           params: {
//             type: "ERC20",
//             options: {
//               address: params.contractAddress,
//               symbol: params.symbol,
//               decimals: params.decimals,
//             },
//           },
//         });
//       },
//     }),
//     {
//       name: "starknet-wallet-store",
//       storage: createJSONStorage(() => sessionStorage),
//       partialize: (s) => ({
//         walletType: s.walletType,
//         lastConnected: s.lastConnected,
//         chainId: s.chainId,
//       }),
//     }
//   )
// );








// "use client";
// import { useState } from "react";
// import { ChipiPay } from "@chipi-pay/chipi-sdk";

// export default function PayWithChipi() {
//   const [loading, setLoading] = useState(false);

//   const handlePay = async () => {
//     setLoading(true);
//     try {
//       const chipi = new ChipiPay({
//         apiKey: process.env.NEXT_PUBLIC_CHIPI_PUBLIC_KEY!, // ✅ from env
//       });

//       const tx = await chipi.pay({
//         amount: 50, // USD or supported fiat
//         currency: "USD",
//         description: "Insurance Premium Payment",
//       });

//       console.log("Transaction started:", tx);
//     } catch (err) {
//       console.error("Chipi payment failed", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <button
//       onClick={handlePay}
//       disabled={loading}
//       className="px-4 py-2 bg-blue-600 text-white rounded"
//     >
//       {loading ? "Processing..." : "Pay with Chipi"}
//     </button>
//   );
// }



// import Link from "next/link";
// import { Button } from "./ui/button";

// export function PayWithExternalWalletButton({ usdAmount }: { usdAmount: number}) {
//     const merchantWallet = process.env.NEXT_PUBLIC_MERCHANT_WALLET;
//     const redirectUrl = process.env.NEXT_PUBLIC_URL + "/checkout";
//     const encodedRedirectUrl = encodeURIComponent(redirectUrl);
//     const href = `https://pay.chipipay.com/?usdAmount=${usdAmount}&token=USDC&starknetWallet=${merchantWallet}&redirectUrlEncoded=${encodedRedirectUrl}`;
    
//     return (
//         <Button asChild className="w-full transform   bg-purple-500  text-center  font-semibold text-white  transition-all duration-200 ease-in-out  hover:bg-purple-600 active:bg-purple-700">
//             <Link
//                 href={href}
//                 target="_blank"
//                 rel="noopener noreferrer"
//                 className="flex items-center justify-center gap-2"
//             >
//                 <img
//                     src="/starknet-logo.svg"
//                     alt="Starknet Logo"
//                     className="h-6 w-6"
//                 />
//                 Pay with Starknet
//             </Link>
//         </Button>
//     );
// }   