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
  FileText,
  Clock,
  Calendar,
  MapPin,
  AlertTriangle,
  Loader2,
} from "lucide-react";

export default function InspectionDetailPage() {
  const router = useRouter();
  const params = useParams();
  const inspectionId = params.id as string;

  const {
    selectedInspection,
    isLoadingInspection,
    inspectionError,
    fetchInspectionById,
    clearSelectedInspection,
  } = useRootStore();

  useEffect(() => {
    if (inspectionId) {
      fetchInspectionById(inspectionId);
    }

    return () => {
      clearSelectedInspection();
    };
  }, [inspectionId, fetchInspectionById, clearSelectedInspection]);

  // Loading state
  if (isLoadingInspection) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading inspection details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (inspectionError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto">
          <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-3" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Error Loading Inspection
          </h2>
          <p className="text-gray-600 mb-4">{inspectionError}</p>
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  // Inspection not found
  if (!selectedInspection) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto">
          <AlertTriangle className="h-12 w-12 text-yellow-400 mx-auto mb-3" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Inspection Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            The requested inspection could not be found.
          </p>
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const { mediaUrl, notes, createdAt, proposalId } = selectedInspection;

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
          <h1 className="text-2xl font-bold text-gray-900">Inspection Details</h1>
          <div className="w-20" /> {/* Spacer for alignment */}
        </div>

        {/* Inspection Card */}
        <Card className="shadow-lg border-0">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
            <CardTitle className="flex items-center gap-3 text-gray-900">
              <ImageIcon className="h-6 w-6 text-blue-600" />
              Inspection Evidence
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* Media Display */}
            <div className="flex justify-center">
              {mediaUrl ? (
                mediaUrl.match(/\.(mp4|webm|ogg|mov)$/i) ? (
                  <div className="w-full max-w-2xl">
                    <video
                      controls
                      src={mediaUrl}
                      className="rounded-lg shadow-md w-full max-h-96 object-contain bg-black"
                    >
                      Your browser does not support the video tag.
                    </video>
                  </div>
                ) : (
                  <div className="w-full max-w-2xl">
                    <img
                      src={mediaUrl}
                      alt="Inspection Evidence"
                      className="rounded-lg shadow-md w-full max-h-96 object-contain"
                      onError={(e) => {
                        e.currentTarget.src = "/api/placeholder/600/400";
                      }}
                    />
                  </div>
                )
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <ImageIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <p>No media available</p>
                </div>
              )}
            </div>

            {/* Inspection Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-600" />
                  Inspection Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Inspection ID</label>
                    <p className="text-sm text-gray-900 font-mono bg-gray-100 px-3 py-2 rounded mt-1">
                      {selectedInspection.id}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Created</label>
                    <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-500 flex items-center gap-2 mt-1">
                      <Clock className="h-3 w-3" />
                      {new Date(createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Notes & Status */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Notes & Status</h3>
                <div>
                  <label className="text-sm font-medium text-gray-700">Inspection Notes</label>
                  <div className="mt-1 p-3 bg-gray-50 rounded-lg border">
                    {notes ? (
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{notes}</p>
                    ) : (
                      <p className="text-sm text-gray-500 italic">
                        No notes provided for this inspection
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex justify-between items-center pt-4 border-t">
                  <span className="text-sm font-medium text-gray-700">Status</span>
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                    Completed
                  </Badge>
                </div>
              </div>
            </div>

            {/* Linked Proposal */}
            {proposalId && (
              <div className="pt-6 border-t">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-indigo-600" />
                      Linked Proposal
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      This inspection is associated with proposal {proposalId}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => router.push(`/proposals/${proposalId}`)}
                    className="text-indigo-700 border-indigo-200 hover:bg-indigo-50"
                  >
                    View Proposal
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Back Button Only */}
        <div className="flex justify-end gap-4 mt-6">
          <Button variant="outline" onClick={() => router.back()}>
            Back to List
          </Button>
        </div>
      </div>
    </div>
    </ProtectedRoute>
  );
}



// export default function InspectionDetail() {
//   const { restoreConnection } = useRootStore();
//   useEffect(() => { restoreConnection(); }, [restoreConnection]);



//   return (
//     <ProtectedRoute>
//       <InspectionDetailPage />
//     </ProtectedRoute>
//   );
// }