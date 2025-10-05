"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { API_CONFIG } from "@/config/urls"; 
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { useWalletStore } from "@/stores/use-wallet-store";
import { useRootStore } from "@/stores/use-root-store";
import { wallet } from "starknet";

export default function RegisterPage() {
  const router = useRouter();
//   const [walletAddress, setWalletAddress] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  let { address, connectWallet, disconnectWallet } = useRootStore();


  const restoreConnection = useRootStore((s) => s.restoreConnection);

  useEffect(() => {
    restoreConnection();
  }, [restoreConnection]);



  const handleRegister = async () => {
    if (!address) {
      setError("Please connect your wallet first");
      return;
    }
    if (!email.trim()) {
      setError("Please enter your email address");
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

      // Step 2: Send registration data
      const response = await fetch(`${API_CONFIG.baseUrl}/user`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },
        body: JSON.stringify({
          walletAddress: address,
          email: email.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Registration failed");
      }

      setSuccess("Registration successful! Redirecting...");
      setTimeout(() => {
        router.push("/auth/login");
      }, 3000);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center text-gray-900">
            Register
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

            {/* Email Address */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Email Address
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
              />
            </div>

            {/* Action Button */}
            <Button
              onClick={ address ? () => handleRegister() : () => connectWallet()}
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
