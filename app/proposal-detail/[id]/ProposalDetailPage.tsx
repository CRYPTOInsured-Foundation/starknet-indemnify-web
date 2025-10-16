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
import type { Proposal } from "@/stores/use-proposal-slice";
import {
  ProposalStatus,
  RejectionReason,
  convertRejectionCodeToReason,
} from "@/lib/utils";

export default function ProposalDetailPage() {
  const router = useRouter();
  const params = useParams();
  const proposalId = params?.id as string | undefined;

  const {
    selectedProposal,
    isLoadingProposal,
    proposalError,
    fetchProposalById,
    clearSelectedProposal,
  } = useRootStore();

  useEffect(() => {
    if (proposalId) fetchProposalById(proposalId);
    return () => clearSelectedProposal();
  }, [proposalId, fetchProposalById, clearSelectedProposal]);

  if (isLoadingProposal) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading proposal details...</p>
        </div>
      </div>
    );
  }

  if (proposalError || !selectedProposal) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertTriangle className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Proposal Not Found</h2>
          <p className="text-gray-600 mb-6">
            {proposalError || "The requested proposal could not be found."}
          </p>
          <div className="flex gap-4 justify-center">
            <Button onClick={() => router.back()} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
            <Button onClick={() => router.push("/proposals")}>All Proposals</Button>
          </div>
        </div>
      </div>
    );
  }

  const proposal: Proposal = selectedProposal;

  // === STATUS BADGE COLORS ===
  const getStatusColor = (status: ProposalStatus) => {
    switch (status) {
      case ProposalStatus.Approved:
        return "bg-green-500";
      case ProposalStatus.Submitted:
      case ProposalStatus.UnderReview:
        return "bg-yellow-500";
      case ProposalStatus.Rejected:
        return "bg-red-500";
      case ProposalStatus.Expired:
        return "bg-gray-500";
      default:
        return "bg-gray-400";
    }
  };

  // === APPROVAL LOGIC ===
  const getApprovalBadge = (approvalType: "risk" | "governance") => {
    const { proposalStatus } = proposal;

    // 🔸 If proposal is Rejected → Rejected for all
    if (proposalStatus === ProposalStatus.Rejected)
      return <Badge className="bg-red-500 text-white">Rejected</Badge>;

    // 🔸 If proposal is Approved → Approved for all
    if (proposalStatus === ProposalStatus.Approved)
      return <Badge className="bg-green-500 text-white">Approved</Badge>;

    // 🔸 Otherwise show pending
    return <Badge className="bg-yellow-500 text-white">Pending</Badge>;
  };

  // === OPTIONAL REJECTION REASON TEXT ===
  const rejectionText =
    proposal.proposalStatus === ProposalStatus.Rejected && proposal.rejectionReason
      ? convertRejectionCodeToReason(Number(proposal.rejectionReason))
      : null;

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
            className={`${getStatusColor(proposal.proposalStatus as ProposalStatus)} text-white px-3 py-1`}
          >
            {proposal.proposalStatus}
          </Badge>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">
        {/* === Proposal Details === */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl font-bold text-gray-800">
              <FileText className="h-6 w-6 text-blue-600" />
              Proposal Details
            </CardTitle>
          </CardHeader>

          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
            <p>
              <span className="text-gray-500 text-sm">Proposal ID:</span>{" "}
              <span className="font-medium">{proposal.proposalId}</span>
            </p>
            <p>
              <span className="text-gray-500 text-sm">Proposer:</span>{" "}
              <span className="font-medium">{proposal.proposer?.name || "N/A"}</span>
            </p>
            <p>
              <span className="text-gray-500 text-sm">Policy Class:</span>{" "}
              <span className="font-medium">{proposal.policyClass}</span>
            </p>
            <p>
              <span className="text-gray-500 text-sm">Subject Matter:</span>{" "}
              <span className="font-medium">{proposal.subjectMatter}</span>
            </p>
            <p>
              <span className="text-gray-500 text-sm">Sum Insured:</span>{" "}
              <span className="font-medium">${proposal.sumInsured}</span>
            </p>
            <p>
              <span className="text-gray-500 text-sm">Premium Payable:</span>{" "}
              <span className="font-medium text-blue-700">
                ${proposal.premiumPayable}
              </span>
            </p>
            <p>
              <span className="text-gray-500 text-sm">Premium Frequency:</span>{" "}
              <span className="font-medium">{proposal.premiumFrequency}</span>
            </p>
            <p>
              <span className="text-gray-500 text-sm">Frequency Factor:</span>{" "}
              <span className="font-medium">{proposal.frequencyFactor}x</span>
            </p>
            <p>
              <span className="text-gray-500 text-sm">Submitted:</span>{" "}
              <span className="font-medium">
                {new Date(proposal.submissionDate).toLocaleString()}
              </span>
            </p>
            <p>
              <span className="text-gray-500 text-sm">Last Updated:</span>{" "}
              <span className="font-medium">
                {new Date(proposal.lastUpdated).toLocaleString()}
              </span>
            </p>
          </CardContent>
        </Card>

        {/* === KYC / Meta Status === */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Proposal Status & Validation
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
            <p>
              <span className="text-gray-500 text-sm">Has KYC:</span>{" "}
              <span className="font-medium">
                {proposal.hasKyc ? "✅ Verified" : "❌ Not Verified"}
              </span>
            </p>
            <p>
              <span className="text-gray-500 text-sm">Premium Paid:</span>{" "}
              <span className="font-medium">
                {proposal.isPremiumPaid ? "✅ Paid" : "❌ Pending"}
              </span>
            </p>
            <p>
              <span className="text-gray-500 text-sm">Reinsured:</span>{" "}
              <span className="font-medium">
                {proposal.hasReinsurance ? "✅ Yes" : "❌ No"}
              </span>
            </p>
            {proposal.reinsuranceTxnId && (
              <p>
                <span className="text-gray-500 text-sm">Reinsurance Txn ID:</span>{" "}
                <span className="font-medium">{proposal.reinsuranceTxnId}</span>
              </p>
            )}
            {rejectionText && (
              <p className="md:col-span-2 text-red-600">
                <span className="text-gray-500 text-sm">Rejection Reason:</span>{" "}
                {rejectionText}
              </p>
            )}
          </CardContent>
        </Card>

        {/* === Approval Section === */}
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
                {getApprovalBadge("risk")}
                   {/* ✅ Pay Premium Button shows only if Approved */}
      {proposal.proposalStatus === ProposalStatus.Approved && (
        <Button
          variant="default"
          onClick={() => router.push("/payments")}
        >
          Pay Premium
        </Button>
      )}
              </div>
            </div>

            <div>
              <p className="text-gray-500 text-sm">Governance Approval:</p>
              <div className="flex items-center gap-2 mt-1">
                {getApprovalBadge("governance")}
                   {/* ✅ Pay Premium Button shows only if Approved */}
      {proposal.proposalStatus === ProposalStatus.Approved && (
        <Button
          variant="default"
          onClick={() => router.push("/payments")}
        >
          Pay Premium
        </Button>
      )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    </ProtectedRoute>
  );
}



// export default function ProposalDetail() {
//   const { restoreConnection } = useRootStore();
//   useEffect(() => { restoreConnection(); }, [restoreConnection]);



//   return (
//     <ProtectedRoute>
//       <ProposalDetailPage />
//     </ProtectedRoute>
//   );
// }