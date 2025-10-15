"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useRootStore } from "@/stores/use-root-store";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ProtectedRoute from "@/components/guards/ProtectedRoute";
import {
  ArrowLeft,
  Image as ImageIcon,
  Loader2,
  AlertTriangle,
  Calendar,
  Clock,
  Link as LinkIcon,
} from "lucide-react";

export default function ClaimEvidenceDetailPage() {
  const router = useRouter();
  const params = useParams();
  const claimId = params.claimId as string;

  const {
    selectedEvidence,
    isLoadingEvidence,
    evidenceError,
    fetchEvidenceByClaim,
    clearSelectedEvidence,
  } = useRootStore();

  useEffect(() => {
    if (claimId) fetchEvidenceByClaim(claimId);
    return () => clearSelectedEvidence();
  }, [claimId]);

  // Loading UI
  if (isLoadingEvidence) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading claim evidence...</p>
        </div>
      </div>
    );
  }

  // Error UI
  if (evidenceError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto">
          <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-3" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Error Loading Evidence
          </h2>
          <p className="text-gray-600 mb-4">{evidenceError}</p>
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  // Not Found UI
  if (!selectedEvidence) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto">
          <AlertTriangle className="h-12 w-12 text-yellow-400 mx-auto mb-3" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Evidence Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            No claim evidence was found for this claim ID.
          </p>
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const { proofUrls, policyId, submissionDate, createdAt, claim } = selectedEvidence;

  return (
    <ProtectedRoute>
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Claim Evidence Details</h1>
          <div className="w-20" />
        </div>

        {/* Main Card */}
        <Card className="shadow-lg border-0">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
            <CardTitle className="flex items-center gap-3 text-gray-900">
              <ImageIcon className="h-6 w-6 text-blue-600" />
              Evidence Files
            </CardTitle>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            {/* Proof URLs */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Proof Files</h3>
              {proofUrls && proofUrls.length > 0 ? (
                <ul className="space-y-3">
                  {proofUrls.map((url, i) => (
                    <li key={i} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg">
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-600 hover:underline"
                      >
                        <LinkIcon className="h-4 w-4" />
                        {url.split("/").pop()}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 italic">No proof files uploaded.</p>
              )}
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900">Basic Info</h3>
                <div className="mt-3 space-y-2">
                  <p><strong>Policy ID:</strong> {policyId}</p>
                  <p><strong>Submission:</strong> {new Date(submissionDate).toLocaleString()}</p>
                  <p><strong>Created At:</strong> {new Date(createdAt).toLocaleString()}</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900">Linked Claim</h3>
                {claim ? (
                  <div className="mt-3 space-y-2">
                    <p><strong>Claim ID:</strong> {claim.claimId}</p>
                    <p><strong>Status:</strong> <Badge>{claim.claimStatus}</Badge></p>
                    <p><strong>Type:</strong> {claim.claimType}</p>
                  </div>
                ) : (
                  <p className="text-gray-500 italic mt-2">No claim linked.</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="flex justify-end mt-6">
          <Button variant="outline" onClick={() => router.back()}>
            Back to Claims
          </Button>
        </div>
      </div>
    </div>
    </ProtectedRoute>
  );
}



// export default function ClaimEvidenceDetail() {
//   const { restoreConnection } = useRootStore();
//   useEffect(() => { restoreConnection(); }, [restoreConnection]);



//   return (
//     <ProtectedRoute>
//       <ClaimEvidenceDetailPage />
//     </ProtectedRoute>
//   );
// }