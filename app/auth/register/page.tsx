"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { API_CONFIG } from "@/config/urls";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { useRootStore } from "@/stores/use-root-store";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const { address, connectWallet } = useRootStore();
  const restoreConnection = useRootStore((s) => s.restoreConnection);

  useEffect(() => {
    restoreConnection();
  }, [restoreConnection]);

  // -----------------------
  // 🧩 Normal registration
  // -----------------------
  const handleRegister = async () => {
    setError("");
    setSuccess("");

    if (!address) {
      setError("Please connect your wallet first.");
      return;
    }
    if (!email.trim()) {
      setError("Email is required.");
      return;
    }
    if (!name.trim()) {
      setError("Name is required.");
      return;
    }
    if (!password.trim() || !confirm.trim()) {
      setError("Please fill in both password fields.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      // Step 1: Get CSRF token
      const csrfRes = await fetch(`${API_CONFIG.baseUrl}/auth/csrf-token`, {
        credentials: "include",
      });
      if (!csrfRes.ok) throw new Error("Failed to fetch CSRF token");
      const { csrfToken } = await csrfRes.json();

      // Step 2: Register user
      const response = await fetch(`${API_CONFIG.baseUrl}/user`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password: password.trim(),
          walletAddress: address,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Registration failed");
      }

      setSuccess("Registration successful! Redirecting...");
      setTimeout(() => router.push("/auth/login"), 2500);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  // -----------------------
  // 🔐 Google OAuth Signup
  // -----------------------
  const handleGoogleSignup = async () => {
    if (!address) {
      setError("Please connect your wallet first before signing up with Google.");
      return;
    }

    try {
      setLoading(true);
      // Construct OAuth URL with walletAddress as query param
      const oauthUrl = `${API_CONFIG.baseUrl}/auth/google/start?walletAddress=${address}`;
      // Redirect to backend Google OAuth flow
      window.location.href = oauthUrl;
    } catch (err) {
      console.error(err);
      setError("Failed to initiate Google signup.");
    } finally {
      setLoading(false);
    }
  };

  // -----------------------
  // 💅 UI Section
  // -----------------------
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <Card className="w-full max-w-md shadow-lg border border-gray-200">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center text-gray-900">
            Create Account
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

          <div className="space-y-6">
            {/* Wallet Address */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Wallet Address
              </label>
              <Input
                type="text"
                value={address as string}
                readOnly
                placeholder="Connect your wallet first"
                className="w-full bg-gray-100"
              />
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Full Name
              </label>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Email Address
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>

            {/* Password */}
            <div className="relative">
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Password
              </label>
              <Input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
              />
              <button
                type="button"
                onClick={() => setShowPass((p) => !p)}
                className="absolute right-3 top-9 text-gray-500 hover:text-gray-700"
              >
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Confirm Password */}
            <div className="relative">
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Confirm Password
              </label>
              <Input
                type={showConfirm ? "text" : "password"}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Confirm password"
              />
              <button
                type="button"
                onClick={() => setShowConfirm((p) => !p)}
                className="absolute right-3 top-9 text-gray-500 hover:text-gray-700"
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Register Button */}
            <Button
              onClick={address ? () => handleRegister() : () => connectWallet()}
              disabled={loading}
              className={`w-full py-3 px-4 rounded-lg font-medium transition ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : address
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "bg-purple-600 hover:bg-purple-700 text-white"
              }`}
            >
              {loading
                ? address
                  ? "Registering..."
                  : "Connecting..."
                : address
                ? "Register"
                : "Connect Wallet"}
            </Button>

            {/* Divider */}
            <div className="flex items-center justify-center">
              <span className="text-gray-500 text-sm">or</span>
            </div>

            {/* Google OAuth Signup */}
            <Button
              onClick={handleGoogleSignup}
              disabled={!address || loading}
              variant="outline"
              className={`w-full py-3 px-4 flex items-center justify-center gap-2 border ${
                address
                  ? "hover:bg-gray-100"
                  : "opacity-50 cursor-not-allowed"
              }`}
            >
              <img
                src="/google-icon.svg"
                alt="Google"
                className="w-5 h-5"
              />
              <span>
                {address ? "Sign up with Google" : "Connect wallet to enable Google signup"}
              </span>
            </Button>
          </div>
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
// import { Eye, EyeOff } from "lucide-react";

// import { useRootStore } from "@/stores/use-root-store";

// export default function RegisterPage() {
//   const router = useRouter();
//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [confirm, setConfirm] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [showPass, setShowPass] = useState(false);
//   const [showConfirm, setShowConfirm] = useState(false);
//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState("");

//   const { address, connectWallet } = useRootStore();
//   const restoreConnection = useRootStore((s) => s.restoreConnection);

//   useEffect(() => {
//     restoreConnection();
//   }, [restoreConnection]);

//   const handleRegister = async () => {
//     setError("");
//     setSuccess("");

//     if (!address) {
//       setError("Please connect your wallet first.");
//       return;
//     }
//     if (!email.trim()) {
//       setError("Email is required.");
//       return;
//     }
//     if (!name.trim()) {
//       setError("Name is required.");
//       return;
//     }
//     if (!password.trim() || !confirm.trim()) {
//       setError("Please fill in both password fields.");
//       return;
//     }
//     if (password !== confirm) {
//       setError("Passwords do not match.");
//       return;
//     }

//     try {
//       setLoading(true);

//       // Step 1: Get CSRF token
//       const csrfRes = await fetch(`${API_CONFIG.baseUrl}/auth/csrf-token`, {
//         credentials: "include",
//       });
//       if (!csrfRes.ok) throw new Error("Failed to fetch CSRF token");
//       const { csrfToken } = await csrfRes.json();

//       // Step 2: Register user
//       const response = await fetch(`${API_CONFIG.baseUrl}/user`, {
//         method: "POST",
//         credentials: "include",
//         headers: {
//           "Content-Type": "application/json",
//           "X-CSRF-Token": csrfToken,
//         },
//         body: JSON.stringify({
//           name: name.trim(),
//           email: email.trim(),
//           password: password.trim(),
//           walletAddress: address,
//         }),
//       });

//       if (!response.ok) {
//         const errorData = await response.json().catch(() => ({}));
//         throw new Error(errorData.message || "Registration failed");
//       }

//       setSuccess("Registration successful! Redirecting...");
//       setTimeout(() => router.push("/auth/login"), 2500);
//     } catch (err) {
//       console.error(err);
//       setError(err instanceof Error ? err.message : "Registration failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
//       <Card className="w-full max-w-md shadow-lg border border-gray-200">
//         <CardHeader>
//           <CardTitle className="text-2xl font-bold text-center text-gray-900">
//             Create Account
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

//             {/* Name */}
//             <div>
//               <label className="block text-sm font-medium mb-2 text-gray-700">
//                 Full Name
//               </label>
//               <Input
//                 type="text"
//                 value={name}
//                 onChange={(e) => setName(e.target.value)}
//                 placeholder="Enter your full name"
//                 required
//               />
//             </div>

//             {/* Email Address */}
//             <div>
//               <label className="block text-sm font-medium mb-2 text-gray-700">
//                 Email Address
//               </label>
//               <Input
//                 type="email"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 placeholder="Enter your email"
//                 required
//               />
//             </div>

//             {/* Password */}
//             <div className="relative">
//               <label className="block text-sm font-medium mb-2 text-gray-700">
//                 Password
//               </label>
//               <Input
//                 type={showPass ? "text" : "password"}
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 placeholder="Enter password"
//               />
//               <button
//                 type="button"
//                 onClick={() => setShowPass((prev) => !prev)}
//                 className="absolute right-3 top-9 text-gray-500 hover:text-gray-700"
//               >
//                 {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
//               </button>
//             </div>

//             {/* Confirm Password */}
//             <div className="relative">
//               <label className="block text-sm font-medium mb-2 text-gray-700">
//                 Confirm Password
//               </label>
//               <Input
//                 type={showConfirm ? "text" : "password"}
//                 value={confirm}
//                 onChange={(e) => setConfirm(e.target.value)}
//                 placeholder="Confirm password"
//               />
//               <button
//                 type="button"
//                 onClick={() => setShowConfirm((prev) => !prev)}
//                 className="absolute right-3 top-9 text-gray-500 hover:text-gray-700"
//               >
//                 {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
//               </button>
//             </div>

//             {/* Action Button */}
//             <Button
//               onClick={address ? () => handleRegister() : () => connectWallet()}
//               disabled={loading}
//               className={`w-full py-3 px-4 rounded-lg font-medium transition ${
//                 loading
//                   ? "bg-gray-400 cursor-not-allowed"
//                   : address
//                   ? "bg-blue-600 hover:bg-blue-700 text-white"
//                   : "bg-purple-600 hover:bg-purple-700 text-white"
//               }`}
//             >
//               {loading
//                 ? address
//                   ? "Registering..."
//                   : "Connecting..."
//                 : address
//                 ? "Register"
//                 : "Connect Wallet"}
//             </Button>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }
