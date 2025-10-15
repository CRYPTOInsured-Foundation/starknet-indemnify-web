"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { API_CONFIG } from "@/config/urls";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, } from "@/components/ui/card";
import { Eye, EyeOff } from "lucide-react";
import { useWalletStore } from "@/stores/use-wallet-store";
import { useRootStore } from "@/stores/use-root-store";
import { Signature } from "starknet";

export default function LoginPage() {
  const router = useRouter();
  const { address, connectWallet, signMessage } = useWalletStore();
  const { 
    requestNonce, 
    verifySignature, 
    clearError, 
    walletType, 
    loginWithEmail, 
    account
  } = useRootStore();

  const [loginMethod, setLoginMethod] = useState<"wallet" | "email" | "google">("wallet");

  const [nonce, setNonce] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailLogging, setEmailLogging] = useState(false);
  const [showPass, setShowPass] = useState(false);

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

      const typedData = {
        types: {
          StarkNetDomain: [
            { name: 'name', type: 'felt' },
            { name: 'version', type: 'felt' },
            { name: 'chainId', type: 'felt' },
          ],
          Message: [{ name: 'nonce', type: 'felt' }],
        },
        primaryType: 'Message',
        domain: {
          name: 'Starknet-Indemnify',
          version: '1',
          chainId: 'SN_SEPOLIA',
        },
        message: { nonce },
      };
      const signature = await account?.signMessage(typedData);
      await verifySignature(address as string, signature as Signature, nonce, walletType);
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

  const handleEmailLogin = async () => {
    try {
      setEmailLogging(true);
      await loginWithEmail(email, password);
      setEmailLogging(false);
    } catch (err) {
      setEmailLogging(false);
      console.error(err);
    } finally {
      setEmailLogging(true);
    }
  };

  // -----------------------
  // 🔐 Google OAuth Login
  // -----------------------
 

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
            <form className="space-y-4">
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {/* <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              /> */}
              <div className="relative">
                <Input
                  type={showPass ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10" // ensures space for the eye icon
                />
                <button
                  type="button"
                  onClick={() => setShowPass((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <Button
                onClick={handleEmailLogin}
                disabled={emailLogging}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                {emailLogging ? "Logging in..." : "Login"}
              </Button>
            </form>
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
                <img src="https://ymrzppmnwkodgjfaikne.supabase.co/storage/v1/object/public/starknet_indemnify_bucket/google-icon-logo.svg" alt="Google" className="w-5 h-5" />
                <span>
                  Continue with Google
                </span>
              </Button>
            </div>
          )}

<p className="text-sm text-center mt-3 text-gray-600">
                Don’t have an account?{" "}
                <button
                  onClick={() => router.push("/auth/register")}
                  className="text-blue-600 hover:underline font-medium"
                >
                  Register here
                </button>
              </p>
        </CardContent>
      </Card>
    </div>
  );
}


