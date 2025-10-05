// // src/store/slices/auth-slice.ts
// import { getCookie } from "@/lib/utils";
// import { API_CONFIG } from "@/config/urls";
// import { Signature } from "starknet";
// import type { StateCreator } from "zustand";
// import type { AuthStore, User } from "@/types/common";

// /**
//  * 🔹 Initial Auth Slice State
//  */
// export const initialAuthState = {
//   user: null,
//   loading: true,
//   isAuthenticated: false,
//   error: null,
// };

// /**
//  * 🔹 Auth Slice Creator (supports Zustand's 3-arg signature)
//  */
// export const createAuthSlice: StateCreator<
//   AuthStore,
//   [["zustand/devtools", never], ["zustand/persist", unknown], ["zustand/immer", never]],
//   [],
//   AuthStore
// > = (set, get, store) => ({
//   ...initialAuthState,

//   /**
//    * ✅ Setters
//    */
//   setUser: (user: User | null) => {
//     set({ user, isAuthenticated: !!user });
//   },

//   setLoading: (loading: boolean) => {
//     set({ loading });
//   },

//   setError: (error: string | null) => {
//     set({ error });
//   },

//   clearError: () => {
//     set({ error: null });
//   },

//   /**
//    * 🔹 Request a nonce from backend for wallet signature verification
//    */
//   requestNonce: async (walletAddress: string): Promise<string> => {
//     try {
//       set({ error: null });
//       const csrfToken = await getCookie();

//       const res = await fetch(`${API_CONFIG.baseUrl}/auth/request-nonce`, {
//         method: "POST",
//         credentials: "include",
//         headers: {
//           "Content-Type": "application/json",
//           "X-CSRF-Token": csrfToken,
//         },
//         body: JSON.stringify({ walletAddress }),
//       });

//       if (!res.ok) throw new Error("Failed to request nonce");

//       const result = await res.json();
//       return result.data.data.nonce;
//     } catch (error) {
//       const message =
//         error instanceof Error ? error.message : "Failed to request nonce";
//       set({ error: message });
//       throw error;
//     }
//   },

//   /**
//    * 🔹 Verify signature for wallet-based login
//    */
//   verifySignature: async (
//     walletAddress: string,
//     signature: Signature,
//     nonce: string,
//     walletType: "argentx" | "braavos"
//   ) => {
//     set({ loading: true });
//     try {
//       const csrfToken = await getCookie();
//       const res = await fetch(`${API_CONFIG.baseUrl}/auth/verify-signature`, {
//         method: "POST",
//         credentials: "include",
//         headers: {
//           "Content-Type": "application/json",
//           "X-CSRF-Token": csrfToken,
//         },
//         body: JSON.stringify({ walletAddress, signature, nonce, walletType }),
//       });

//       if (!res.ok) {
//         const errorData = await res.json();
//         throw new Error(errorData.message || "Verification failed");
//       }

//       const result = await res.json();
//       const user = result.data.data;

//       localStorage.setItem("auth-user", JSON.stringify({ data: user }));

//       set({
//         user,
//         isAuthenticated: true,
//         loading: false,
//         error: null,
//       });

//       window.location.href = "/dashboard";
//     } catch (error) {
//       const message =
//         error instanceof Error ? error.message : "Verification failed";
//       set({ error: message, loading: false });
//       throw error;
//     }
//   },

//   /**
//    * 🔹 Logout the user and clear session
//    */
//   logout: async (): Promise<void> => {
//     try {
//       set({ loading: true, error: null });

//       // Attempt to disconnect from Starknet wallet
//       if (typeof window !== "undefined" && (window as any).starknet) {
//         try {
//           await (window as any).starknet.disable?.();
//         } catch (walletError) {
//           console.warn("Wallet disconnect failed:", walletError);
//         }
//       }

//       // Clear local storage session
//       if (typeof window !== "undefined") {
//         localStorage.removeItem("auth-user");
//       }

//       const csrfToken = await getCookie();
//       const response = await fetch(`${API_CONFIG.baseUrl}/auth/logout`, {
//         method: "POST",
//         credentials: "include",
//         headers: {
//           "Content-Type": "application/json",
//           "X-CSRF-Token": csrfToken,
//         },
//       });

//       // Reset state
//       set({
//         user: null,
//         isAuthenticated: false,
//         loading: false,
//       });

//       if (!response.ok)
//         console.warn("Logout API failed but local state cleared");

//       window.location.href = "/auth/login";
//     } catch (error) {
//       const message =
//         error instanceof Error ? error.message : "Logout failed";
//       set({
//         user: null,
//         isAuthenticated: false,
//         loading: false,
//         error: message,
//       });

//       if (typeof window !== "undefined") {
//         localStorage.removeItem("auth-user");
//       }

//       console.error("Logout error:", error);
//       throw error;
//     }
//   },
// });














// src/store/slices/auth-slice.ts
import { getCookie } from '@/lib/utils';
import { API_CONFIG } from '@/config/urls';
import { Signature } from 'starknet';
import type { StateCreator } from 'zustand';
import type { AuthStore, User } from '@/types/common';

export const initialAuthState = {
  user: null,
  loading: true,
  isAuthenticated: false,
  error: null,
};

export const createAuthSlice: StateCreator<AuthStore> = (set, get) => ({
  ...initialAuthState,

  // ✅ simple setters now set partial objects
  setUser: (user: User | null) => {
    set({ user, isAuthenticated: !!user });
  },

  setLoading: (loading: boolean) => {
    set({ loading });
  },

  setError: (error: string | null) => {
    set({ error });
  },

  clearError: () => {
    set({ error: null });
  },

  requestNonce: async (walletAddress: string): Promise<string> => {
    try {
      set({ error: null });
      const csrfToken = await getCookie();

      const res = await fetch(`${API_CONFIG.baseUrl}/auth/request-nonce`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
        },
        body: JSON.stringify({ walletAddress }),
      });

      if (!res.ok) throw new Error('Failed to request nonce');

      const result = await res.json();
      return result.data.data.nonce;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to request nonce';
      set({ error: message });
      throw error;
    }
  },

  verifySignature: async (
    walletAddress: string,
    signature: Signature,
    nonce: string,
    walletType: 'argentx' | 'braavos'
  ) => {
    set({ loading: true });
    try {
      const csrfToken = await getCookie();
      const res = await fetch(`${API_CONFIG.baseUrl}/auth/verify-signature`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
        },
        body: JSON.stringify({ walletAddress, signature, nonce, walletType }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Verification failed');
      }

      const result = await res.json();
      const user = result.data.data;

      localStorage.setItem('auth-user', JSON.stringify({ data: user }));

      set({
        user,
        isAuthenticated: true,
        loading: false,
        error: null,
      });

      window.location.href = '/dashboard';
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Verification failed';
      set({ error: message, loading: false });
      throw error;
    }
  },

  logout: async (): Promise<void> => {
    try {
      set({ loading: true, error: null });

      if (typeof window !== 'undefined' && (window as any).starknet) {
        try {
          await (window as any).starknet.disable();
        } catch (walletError) {
          console.warn('Wallet disconnect failed:', walletError);
        }
      }

      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth-user');
      }

      const csrfToken = await getCookie();
      const response = await fetch(`${API_CONFIG.baseUrl}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
        },
      });

      set({
        user: null,
        isAuthenticated: false,
        loading: false,
      });

      if (!response.ok) console.warn('Logout API failed but local state cleared');
      window.location.href = '/auth/login';
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Logout failed';
      set({
        user: null,
        isAuthenticated: false,
        loading: false,
        error: message,
      });

      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth-user');
      }

      console.error('Logout error:', error);
      throw error;
    }
  },
});
