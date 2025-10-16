"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useRootStore } from "@/stores/use-root-store";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import ProtectedRoute from "@/components/guards/ProtectedRoute";
import {
  AlertTriangle,
  ArrowLeft,
  FileText,
  Shield,
  DollarSign,
  Calendar,
  CheckCircle,
} from "lucide-react";
import type { Policy } from "@/stores/use-policy-slice";

export default function PolicyDetailPage() {
  const router = useRouter();
  const params = useParams();
  const policyId = params?.id as string | undefined;

  const {
    selectedPolicy,
    isLoadingPolicy,
    policyError,
    fetchPolicyById,
    clearSelectedPolicy,
  } = useRootStore();

  useEffect(() => {
    if (policyId) fetchPolicyById(policyId);
    return () => clearSelectedPolicy();
  }, [policyId, fetchPolicyById, clearSelectedPolicy]);

  if (isLoadingPolicy) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading policy details...</p>
        </div>
      </div>
    );
  }

  if (policyError || !selectedPolicy) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertTriangle className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Policy Not Found</h2>
          <p className="text-gray-600 mb-6">
            {policyError || "The requested policy could not be found."}
          </p>
          <div className="flex gap-4 justify-center">
            <Button onClick={() => router.back()} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
            <Button onClick={() => router.push("/policies")}>All Policies</Button>
          </div>
        </div>
      </div>
    );
  }

  const policy: Policy = selectedPolicy;

  // === STATUS COLOR MAPPING ===
  const getStatusBadge = () => {
    if (policy.isExpired)
      return <Badge className="bg-red-500 text-white">Expired</Badge>;
    if (policy.isActive)
      return <Badge className="bg-green-500 text-white">Active</Badge>;
    return <Badge className="bg-gray-400 text-white">Inactive</Badge>;
  };

  return (
    <ProtectedRoute>
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-40 backdrop-blur-sm bg-white/95">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          {getStatusBadge()}
        </div>
      </header>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">
        {/* === Policy Overview === */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl font-bold text-gray-800">
              <FileText className="h-6 w-6 text-blue-600" />
              Policy Overview
            </CardTitle>
          </CardHeader>

          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
            <p>
              <span className="text-gray-500 text-sm">Policy ID:</span>{" "}
              <span className="font-medium">{policy.policyId}</span>
            </p>
            <p>
              <span className="text-gray-500 text-sm">Policyholder:</span>{" "}
              <span className="font-medium">
                {policy.policyholder?.name || "N/A"}
              </span>
            </p>
            <p>
              <span className="text-gray-500 text-sm">Policy Class:</span>{" "}
              <span className="font-medium">{policy.policyClass}</span>
            </p>
            <p>
              <span className="text-gray-500 text-sm">Subject Matter:</span>{" "}
              <span className="font-medium">{policy.subjectMatter}</span>
            </p>
            <p>
              <span className="text-gray-500 text-sm">Sum Insured:</span>{" "}
              <span className="font-medium text-blue-700">
                ${policy.sumInsured}
              </span>
            </p>
            <p>
              <span className="text-gray-500 text-sm">Premium:</span>{" "}
              <span className="font-medium text-purple-700">
                ${policy.premium}
              </span>{" "}
              <Badge variant="outline" className="ml-2">
                {policy.premiumFrequency}
              </Badge>
            </p>
            <p>
              <span className="text-gray-500 text-sm">Start Date:</span>{" "}
              <span className="font-medium">
                {new Date(policy.startDate).toLocaleDateString()}
              </span>
            </p>
            <p>
              <span className="text-gray-500 text-sm">Expiration Date:</span>{" "}
              <span className="font-medium text-red-600">
                {new Date(policy.expirationDate).toLocaleDateString()}
              </span>
            </p>
            <p>
              <span className="text-gray-500 text-sm">Claims Count:</span>{" "}
              <span className="font-medium">{policy.claimsCount}</span>
            </p>
            <p>
              <span className="text-gray-500 text-sm">Reinsurance:</span>{" "}
              <span className="font-medium">
                {policy.hasReinsurance ? "Yes" : "No"}
              </span>
            </p>
          </CardContent>
        </Card>

        {/* === Financial Info === */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <DollarSign className="h-5 w-5 text-indigo-600" />
              Financial Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-gray-700">
            <p>
              <span className="text-gray-500 text-sm">Aggregate Claim Amount:</span>{" "}
              <span className="font-medium text-blue-700">
                ${policy.aggregateClaimAmount || "0"}
              </span>
            </p>
            {policy.reinsuranceTxnId && (
              <p>
                <span className="text-gray-500 text-sm">Reinsurance Txn ID:</span>{" "}
                <span className="font-medium break-all text-gray-800">
                  {policy.reinsuranceTxnId}
                </span>
              </p>
            )}
          </CardContent>
        </Card>

        {/* === Activity === */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Calendar className="h-5 w-5 text-green-600" />
              Activity Timeline
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-gray-700">
            <p>
              <span className="text-gray-500 text-sm">Created At:</span>{" "}
              <span className="font-medium">
                {new Date(policy.createdAt).toLocaleString()}
              </span>
            </p>
            <p>
              <span className="text-gray-500 text-sm">Last Updated:</span>{" "}
              <span className="font-medium">
                {new Date(policy.updatedAt).toLocaleString()}
              </span>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
    </ProtectedRoute>
  );
}
