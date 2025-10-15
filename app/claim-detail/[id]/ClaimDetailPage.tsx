"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useRootStore } from "@/stores/use-root-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import ProtectedRoute from "@/components/guards/ProtectedRoute";
import {
  AlertTriangle,
  ArrowLeft,
  FileText,
  CheckCircle,
  ShieldCheck,
} from "lucide-react";
import type { Claim } from "@/stores/use-claim-slice";

export default function ClaimDetailPage() {
  const router = useRouter();
  const params = useParams();
  const claimId = params?.id as string | undefined;

  const {
    selectedClaim,
    isLoadingClaim,
    claimError,
    fetchClaimById,
    clearSelectedClaim,
  } = useRootStore();

  useEffect(() => {
    if (claimId) fetchClaimById(claimId);
    return () => clearSelectedClaim();
  }, [claimId, fetchClaimById, clearSelectedClaim]);

  if (isLoadingClaim) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading claim details...</p>
        </div>
      </div>
    );
  }

  if (claimError || !selectedClaim) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertTriangle className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Claim Not Found</h2>
          <p className="text-gray-600 mb-6">
            {claimError || "The requested claim could not be found."}
          </p>
          <div className="flex gap-4 justify-center">
            <Button onClick={() => router.back()} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
            <Button onClick={() => router.push("/claims")}>All Claims</Button>
          </div>
        </div>
      </div>
    );
  }

  const claim: Claim = selectedClaim;

  // === STATUS COLOR MAPPING ===
  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-500";
      case "SUBMITTED":
      case "UNDER_REVIEW":
        return "bg-yellow-500";
      case "REJECTED":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  // === APPROVAL BADGES ===
  const getApprovalBadge = (approved: boolean) => {
    return approved ? (
      <Badge className="bg-green-500 text-white">Approved</Badge>
    ) : (
      <Badge className="bg-yellow-500 text-white">Pending</Badge>
    );
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

          <Badge
            className={`${getStatusColor(claim.claimStatus)} text-white px-3 py-1`}
          >
            {claim.claimStatus}
          </Badge>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">
        {/* === Claim Details === */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl font-bold text-gray-800">
              <FileText className="h-6 w-6 text-blue-600" />
              Claim Details
            </CardTitle>
          </CardHeader>

          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
            <p>
              <span className="text-gray-500 text-sm">Claim ID:</span>{" "}
              <span className="font-medium">{claim.claimId}</span>
            </p>
            <p>
              <span className="text-gray-500 text-sm">Claimant:</span>{" "}
              <span className="font-medium">{claim.claimant?.name || "N/A"}</span>
            </p>
            <p>
              <span className="text-gray-500 text-sm">Policy Class:</span>{" "}
              <span className="font-medium">{claim.policyClass}</span>
            </p>
            <p>
              <span className="text-gray-500 text-sm">Claim Type:</span>{" "}
              <span className="font-medium">{claim.claimType}</span>
            </p>
            <p>
              <span className="text-gray-500 text-sm">Claim Amount:</span>{" "}
              <span className="font-medium text-blue-700">
                ${claim.claimAmount}
              </span>
            </p>
            <p>
              <span className="text-gray-500 text-sm">Approved Amount:</span>{" "}
              <span className="font-medium text-green-700">
                ${claim.approvedSettlementAmount}
              </span>
            </p>
            <p>
              <span className="text-gray-500 text-sm">Description:</span>{" "}
              <span className="font-medium">{claim.claimDescription}</span>
            </p>
            <p>
              <span className="text-gray-500 text-sm">Submitted:</span>{" "}
              <span className="font-medium">
                {new Date(claim.submissionDate).toLocaleString()}
              </span>
            </p>
            <p>
              <span className="text-gray-500 text-sm">Last Updated:</span>{" "}
              <span className="font-medium">
                {new Date(claim.updatedAt).toLocaleString()}
              </span>
            </p>
          </CardContent>
        </Card>

        {/* === Claim Approvals === */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <ShieldCheck className="h-5 w-5 text-indigo-600" />
              Risk Analytics & Governance Approvals
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
            <div>
              <p className="text-gray-500 text-sm">Risk Analytics Approval:</p>
              <div className="flex items-center gap-2 mt-1">
                {getApprovalBadge(claim.riskAnalyticsApproved)}
              </div>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Governance Approval:</p>
              <div className="flex items-center gap-2 mt-1">
                {getApprovalBadge(claim.governanceApproved)}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* === Repudiation / Escalation === */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Repudiation & Escalation Info
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-gray-700">
            <p>
              <span className="text-gray-500 text-sm">Repudiated:</span>{" "}
              <span className="font-medium">
                {claim.isRepudiated ? "Yes" : "No"}
              </span>
            </p>
            {claim.isRepudiated && (
              <p>
                <span className="text-gray-500 text-sm">Reason:</span>{" "}
                <span className="font-medium text-red-600">
                  {claim.repudiationReason}
                </span>
              </p>
            )}
            <p>
              <span className="text-gray-500 text-sm">Escalated:</span>{" "}
              <span className="font-medium">
                {claim.isEscalated ? "Yes" : "No"}
              </span>
            </p>
            {claim.isEscalated && (
              <p>
                <span className="text-gray-500 text-sm">Escalation Reason:</span>{" "}
                <span className="font-medium text-orange-600">
                  {claim.escalationReason || "N/A"}
                </span>
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
    </ProtectedRoute>
  );
}




// export default function ClaimDetail() {
//   const { restoreConnection } = useRootStore();
//   useEffect(() => { restoreConnection(); }, [restoreConnection]);



//   return (
//     <ProtectedRoute>
//       <ClaimDetailPage />
//     </ProtectedRoute>
//   );
// }