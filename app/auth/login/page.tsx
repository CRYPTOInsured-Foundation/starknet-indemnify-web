"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { API_CONFIG } from "@/config/urls";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useWalletStore } from "@/stores/use-wallet-store";
import { useRootStore } from "@/stores/use-root-store";

export default function LoginPage() {
  const router = useRouter();
  const { address, connectWallet, signMessage } = useWalletStore();
  const { 
    requestNonce, 
    verifySignature, 
    clearError, 
    walletType, 
    loginWithEmail, 
    loginWithOAuth 
  } = useRootStore();

  const [loginMethod, setLoginMethod] = useState<"wallet" | "email" | "google">("wallet");

  const [nonce, setNonce] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const restoreConnection = useWalletStore((s) => s.restoreConnection);
  useEffect(() => {
    restoreConnection()
  }, [restoreConnection]);

  // -----------------------
  // 🧩 Wallet Nonce Login
  // -----------------------
  const getNonce = async () => {
    try {
      if (!address) {
        setError("Please connect your wallet first");
        return;
      }
      clearError();
      const nonceValue = await requestNonce(address);
      setNonce(nonceValue);
    } catch (err) {
      console.error(err);
      setError("Failed to get nonce. Please try again.");
    }
  };

  const handleWalletLogin = async () => {
    try {
      setLoading(true);
      clearError();
      if (!nonce) await getNonce();
      const signature = await signMessage(nonce);
      await verifySignature(address as string, signature, nonce, walletType);
      setSuccess("Wallet login successful! Redirecting...");
      setTimeout(() => router.push("/dashboard"), 2000);
    } catch (err) {
      console.error(err);
      setError("Wallet login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // -----------------------
  // 📧 Email + Password Login
  // -----------------------
  // const handleEmailLogin = async () => {
  //   if (!email.trim() || !password.trim()) {
  //     setError("Please enter both email and password.");
  //     return;
  //   }

  //   try {
  //     setLoading(true);
  //     const csrfRes = await fetch(`${API_CONFIG.baseUrl}/auth/csrf-token`, {
  //       credentials: "include",
  //     });
  //     const { csrfToken } = await csrfRes.json();

  //     const response = await fetch(`${API_CONFIG.baseUrl}/auth/login/email`, {
  //       method: "POST",
  //       credentials: "include",
  //       headers: {
  //         "Content-Type": "application/json",
  //         "X-CSRF-Token": csrfToken,
  //       },
  //       body: JSON.stringify({ email, password }),
  //     });

  //     if (!response.ok) {
  //       const errorData = await response.json().catch(() => ({}));
  //       throw new Error(errorData.message || "Login failed");
  //     }

  //     setSuccess("Login successful! Redirecting...");
  //     setTimeout(() => router.push("/dashboard"), 2000);
  //   } catch (err) {
  //     console.error(err);
  //     setError(err instanceof Error ? err.message : "Login failed");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleEmailLogin = async () => {
    try {
      await loginWithEmail(email, password);
    } catch (err) {
      console.error(err);
    }
  };

  // -----------------------
  // 🔐 Google OAuth Login
  // -----------------------
  // const handleGoogleLogin = async () => {
  //   if (!address) {
  //     setError("Please connect your wallet first before continuing with Google login.");
  //     return;
  //   }

  //   try {
  //     setLoading(true);
  //     const oauthUrl = `${API_CONFIG.baseUrl}/auth/google/start?walletAddress=${address}`;
  //     window.location.href = oauthUrl; // redirects user to Google OAuth
  //   } catch (err) {
  //     console.error(err);
  //     setError("Failed to initiate Google login.");
  //   } finally {
  //     setLoading(false);
  //   }
  // };


const handleGoogleLogin = async () => {
  // user is redirected to backend OAuth
  window.location.href = `${API_CONFIG.baseUrl}/auth/google/start?walletAddress=${address}`;
};

  // -----------------------
  // 💅 UI Section
  // -----------------------
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <Card className="w-full max-w-md shadow-lg border border-gray-200">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center text-gray-900">
            Login
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg border border-red-300">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg border border-green-300">
              {success}
            </div>
          )}

          {/* Select Login Method */}
          <div className="mb-6">
            <p className="text-gray-700 text-sm font-medium mb-2">Login Method</p>
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 text-gray-700">
                <input
                  type="radio"
                  name="loginMethod"
                  value="wallet"
                  checked={loginMethod === "wallet"}
                  onChange={() => setLoginMethod("wallet")}
                />
                Wallet (Nonce-Based)
              </label>
              <label className="flex items-center gap-2 text-gray-700">
                <input
                  type="radio"
                  name="loginMethod"
                  value="email"
                  checked={loginMethod === "email"}
                  onChange={() => setLoginMethod("email")}
                />
                Email & Password
              </label>
              <label className="flex items-center gap-2 text-gray-700">
                <input
                  type="radio"
                  name="loginMethod"
                  value="google"
                  checked={loginMethod === "google"}
                  onChange={() => setLoginMethod("google")}
                />
                Google OAuth
              </label>
            </div>
          </div>

          {/* Wallet Login */}
          {loginMethod === "wallet" && (
            <div className="space-y-4">
              <Input
                type="text"
                value={address ?? ""}
                readOnly
                placeholder="Connect your wallet first"
                className="w-full bg-gray-100"
              />
              {!address ? (
                <Button
                  onClick={() => connectWallet()}
                  disabled={loading}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                >
                  {loading ? "Connecting..." : "Connect Wallet"}
                </Button>
              ) : !nonce ? (
                <Button
                  onClick={getNonce}
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {loading ? "Fetching..." : "Get Nonce"}
                </Button>
              ) : (
                <Button
                  onClick={handleWalletLogin}
                  disabled={loading}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                >
                  {loading ? "Signing..." : "Sign & Login"}
                </Button>
              )}
            </div>
          )}

          {/* Email Login */}
          {loginMethod === "email" && (
            <div className="space-y-4">
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Button
                onClick={handleEmailLogin}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                {loading ? "Logging in..." : "Login"}
              </Button>
            </div>
          )}

          {/* Google OAuth */}
          {loginMethod === "google" && (
            <div className="mt-4">
              <Button
                onClick={handleGoogleLogin}
                // disabled={!address || loading}
                variant="outline"
                className="w-full py-3 px-4 flex items-center justify-center gap-2 border hover:bg-gray-100"
              >
                <img src="/google-icon.svg" alt="Google" className="w-5 h-5" />
                <span>
                  Continue with Google
                </span>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}










// "use client";

// import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import { API_CONFIG } from "@/config/urls";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { useWalletStore } from "@/stores/use-wallet-store";
// // import { AuthStore, useAuthStore } from "../../../stores/use-root-store";
// import { useRootStore } from "../../../stores/use-root-store";


// export default function LoginPage() {
//   const router = useRouter();
//   const { address, connectWallet, disconnectWallet, signMessage, walletType, account } = useWalletStore();

//   const { 
//         requestNonce,
//         verifySignature,
//         clearError
//     } = useRootStore();

//   const [nonce, setNonce] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState("");
//   const [localError, setLocalError] = useState("");

//   const restoreConnection = useWalletStore((s) => s.restoreConnection);

//   useEffect(() => {
//     restoreConnection();
//   }, [restoreConnection]);


 
//   const getNonce = async () => {
//     if (!address) {
//       setLocalError("Please connect your wallet first");
//       return;
//     }
//     try {
//       clearError();
//       setLocalError("");
//       const nonceValue = await requestNonce(address as string);
//       setNonce(nonceValue);
//     } catch (error) {
//       console.error("Nonce request failed:", error);
//       setLocalError("Failed to get nonce. Please try again.");
//     }
//   };


//   const handleLogin = async () => {
//     try {
//       setLocalError("");
//       clearError();

//       // 1. Ensure wallet is connected
//       if (!address || !account || !walletType) {
//         throw new Error("Wallet not connected");
//       }

//       // 2. Get nonce from backend
//       if (!nonce) {
//         await getNonce();
//         return; // Wait for nonce to be set before proceeding
//       }

//       const typedData = {
//         types: {
//           StarkNetDomain: [
//             { name: "name", type: "felt" },
//             { name: "version", type: "felt" },
//             { name: "chainId", type: "felt" },
//           ],
//           Message: [{ name: "content", type: "felt" }],
//         },
//         primaryType: "Message",
//         domain: {
//           name: "StarknetIndemnify",
//           version: "1",
//           chainId: "SN_SEPOLIA",
//         },
//         message: { content: nonce },
//       };


//       // const typedData = {
//       //   domain: {
//       //     name: "StarkNet",       // standard
//       //     version: "1",
//       //     chainId: "0x534e5f5345504f4c4941", // SN_SEPOLIA hex
//       //   },
//       //   types: {
//       //     StarkNetDomain: [
//       //       { name: "name", type: "felt252" },
//       //       { name: "version", type: "felt252" },
//       //       { name: "chainId", type: "felt252" },
//       //     ],
//       //     Message: [
//       //       { name: "nonce", type: "felt252" },
//       //     ],
//       //   },
//       //   primaryType: "Message",
//       //   message: {
//       //     nonce: nonce.toString(),
//       //   },
//       // };

     
      
      

//     //   let signature: [string, string];
//     //   if (walletType === "argentx") {
//     //     const rawSignature = await account.signMessage(typedData);
//     //     console.log(rawSignature);
//     //     signature = [rawSignature[2], rawSignature[3]];
//     //   } else if (walletType === "braavos") {
//     //     const rawSignature = await account.signMessage(typedData);
//     //     console.log(rawSignature);
//     //     signature = [rawSignature[1], rawSignature[2]] ;
//     //   } else {
//     //     throw new Error("Unsupported wallet type");
//     //   }

//     console.log("Address: ", address);


//     let signature = await signMessage(nonce);

   


//     // console.log("Nonce: ", nonce);
//     // console.log("Signature: ", signature);

//       await verifySignature(address, signature, nonce, walletType);
//     } catch (err) {
//       console.error("Login failed: ", err);
//       setLocalError(err instanceof Error ? err.message : "Login failed");
//     }
//   };


// //   const handleLogin = async () => {
// //     if (!address) {
// //       setError("Please connect your wallet first");
// //       return;
// //     }
// //     if (!nonce) {
// //       setError("Please request a nonce first");
// //       return;
// //     }

// //     try {
// //       setLoading(true);
// //       setError("");

// //       // ask wallet to sign nonce
// //     //   const starknet = await connectWallet();
// //     //   if (!starknet?.account) {
// //     //     throw new Error("Wallet not connected");
// //     //   }

// //       const signature = await signMessage(nonce);

// //       // verify with backend
// //       const response = await fetch(`${API_CONFIG.baseUrl}/auth/login`, {
// //         method: "POST",
// //         credentials: "include",
// //         headers: { "Content-Type": "application/json" },
// //         body: JSON.stringify({ address, signature, nonce }),
// //       });

// //       if (!response.ok) {
// //         const errorData = await response.json().catch(() => ({}));
// //         throw new Error(errorData.message || "Login failed");
// //       }

// //       setSuccess("Login successful! Redirecting...");
// //       setTimeout(() => router.push("/dashboard"), 2000);
// //     } catch (err) {
// //       console.error(err);
// //       setError(err instanceof Error ? err.message : "Login failed");
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

//   return (
//     <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
//       <Card className="w-full max-w-md shadow-lg">
//         <CardHeader>
//           <CardTitle className="text-2xl font-bold text-center text-gray-900">
//             Login
//           </CardTitle>
//         </CardHeader>
//         <CardContent>
//           {error && (
//             <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg border border-red-300">
//               {error}
//             </div>
//           )}
//           {success && (
//             <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg border border-green-300">
//               {success}
//             </div>
//           )}

//           <div className="space-y-6">
//             {/* Wallet Address */}
//             <div>
//               <label className="block text-sm font-medium mb-2 text-gray-700">
//                 Wallet Address
//               </label>
//               <Input
//                 type="text"
//                 value={address as string}
//                 readOnly
//                 placeholder="Connect your wallet first"
//                 className="w-full bg-gray-100"
//               />
//             </div>

//             {/* Action Buttons */}
//             <div className="space-y-4">
//               {!address ? (
//                 <Button
//                   onClick={() => connectWallet()}
//                   disabled={loading}
//                   className="w-full bg-purple-600 hover:bg-purple-700 text-white"
//                 >
//                   {loading ? "Connecting..." : "Connect Wallet"}
//                 </Button>
//               ) : !nonce ? (
//                 <Button
//                   onClick={getNonce}
//                   disabled={loading}
//                   className="w-full bg-blue-600 hover:bg-blue-700 text-white"
//                 >
//                   {loading ? "Fetching..." : "Get Nonce"}
//                 </Button>
//               ) : (
//                 <Button
//                   onClick={handleLogin}
//                   disabled={loading}
//                   className="w-full bg-green-600 hover:bg-green-700 text-white"
//                 >
//                   {loading ? "Signing In..." : "Sign & Login"}
//                 </Button>
//               )}
//             </div>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }
