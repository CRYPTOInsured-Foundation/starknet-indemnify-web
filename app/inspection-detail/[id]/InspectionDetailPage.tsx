"use client";
export const dynamic = "force-dynamic";

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
import {
  ArrowLeft,
  Image as ImageIcon,
  FileText,
  Clock,
  AlertTriangle,
} from "lucide-react";

export default function InspectionDetailPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const {
    selectedInspection,
    inspections,
    isLoadingInspection,
    setSelectedInspection,
    clearSelectedInspection,
  } = useRootStore();

  useEffect(() => {
    if (!id) return;

    // Try to find in store first
    const found = inspections.find((i) => i.id === id);
    if (found) {
      setSelectedInspection(found);
      return;
    }

    // Fetch directly if not in store
    const fetchInspection = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/inspections/${id}`
        );

        if (!res.ok) throw new Error("Failed to fetch inspection.");

        const data = await res.json();
        // Adjust based on your API structure (if wrapped in { data })
        const inspection = data?.data || data;
        if (inspection?.id) {
          setSelectedInspection(inspection);
        }
      } catch (error) {
        console.error("Error fetching inspection by ID:", error);
      }
    };

    fetchInspection();

    return () => clearSelectedInspection();
  }, [id, inspections, setSelectedInspection, clearSelectedInspection]);

  if (isLoadingInspection) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading inspection details...</p>
        </div>
      </div>
    );
  }

  if (!selectedInspection) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto">
          <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-3" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Inspection Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            The requested inspection record could not be found.
          </p>
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const { mediaUrl, notes, createdAt, proposal } = selectedInspection;
  const proposalId = proposal?.id || selectedInspection.proposalId;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-10 px-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <h1 className="text-2xl font-bold text-gray-800">
          Inspection Details
        </h1>
      </div>

      {/* Inspection Card */}
      <Card className="shadow-md border border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-800">
            <ImageIcon className="h-5 w-5 text-blue-600" />
            Inspection Evidence
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="w-full flex justify-center">
            {mediaUrl?.match(/\.(mp4|webm|ogg)$/i) ? (
              <video
                controls
                src={mediaUrl}
                className="rounded-lg shadow-md max-h-[400px]"
              />
            ) : (
              <img
                src={mediaUrl}
                alt="Inspection Evidence"
                className="rounded-lg shadow-md max-h-[400px] object-contain"
              />
            )}
          </div>

          <div className="space-y-2">
            <p className="text-gray-700">
              <strong>Notes:</strong>{" "}
              {notes?.trim() ? (
                notes
              ) : (
                <span className="text-gray-500 italic">No notes provided</span>
              )}
            </p>
            <p className="text-gray-600 text-sm flex items-center gap-2">
              <Clock className="h-4 w-4" />
              {new Date(createdAt).toLocaleString()}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Proposal Summary (if linked) */}
      {proposalId && (
        <Card className="mt-10 border border-indigo-100 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-indigo-700">
              <FileText className="h-5 w-5" />
              Linked Proposal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-gray-700">
            <p>
              <strong>Proposal ID:</strong> {proposalId}
            </p>
            <Button
              variant="outline"
              className="text-blue-700 border-blue-300 hover:bg-blue-50"
              onClick={() => router.push(`/proposal-detail/${proposalId}`)}
            >
              View Proposal
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Status */}
      <div className="mt-6 flex justify-end">
        <Badge className="bg-green-100 text-green-800 px-3 py-1">
          Submitted
        </Badge>
      </div>
    </div>
  );
}












// "use client";

// import { useEffect } from "react";
// import { useParams, useRouter } from "next/navigation";
// import { useRootStore } from "@/stores/use-root-store";
// import {
//   Card,
//   CardHeader,
//   CardContent,
//   CardTitle,
// } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import {
//   ArrowLeft,
//   Image as ImageIcon,
//   FileText,
//   Clock,
//   AlertTriangle,
// } from "lucide-react";

// export default function InspectionDetailPage() {
//   const router = useRouter();
//   const { id } = useParams();

//   const {
//     selectedInspection,
//     inspections,
//     isLoadingInspection,
//     setSelectedInspection,
//     clearSelectedInspection,
//   } = useRootStore();

//   useEffect(() => {
//     // Try to find locally from store (fetched earlier from proposal view)
//     const found = inspections.find((i) => i.id === id);
//     if (found) {
//       setSelectedInspection(found);
//     } else {
//       console.warn("Inspection not found in local store. Fetch by ID if backend supports it.");
//     }

//     return () => clearSelectedInspection();
//   }, [id, inspections, setSelectedInspection, clearSelectedInspection]);

//   if (isLoadingInspection) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
//           <p className="text-gray-600">Loading inspection details...</p>
//         </div>
//       </div>
//     );
//   }

//   if (!selectedInspection) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50">
//         <div className="text-center max-w-md mx-auto">
//           <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-3" />
//           <h2 className="text-xl font-semibold text-gray-900 mb-2">Inspection Not Found</h2>
//           <p className="text-gray-600 mb-6">
//             The requested inspection record could not be found.
//           </p>
//           <Button variant="outline" onClick={() => router.back()}>
//             <ArrowLeft className="h-4 w-4 mr-2" />
//             Go Back
//           </Button>
//         </div>
//       </div>
//     );
//   }

//   const { mediaUrl, notes, createdAt, proposalId } = selectedInspection;

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-10 px-6">
//       {/* Header */}
//       <div className="flex justify-between items-center mb-8">
//         <Button
//           variant="ghost"
//           onClick={() => router.back()}
//           className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
//         >
//           <ArrowLeft className="h-4 w-4" />
//           Back
//         </Button>
//         <h1 className="text-2xl font-bold text-gray-800">
//           Inspection Details
//         </h1>
//       </div>

//       {/* Inspection Card */}
//       <Card className="shadow-md border border-gray-200">
//         <CardHeader>
//           <CardTitle className="flex items-center gap-2 text-gray-800">
//             <ImageIcon className="h-5 w-5 text-blue-600" />
//             Inspection Evidence
//           </CardTitle>
//         </CardHeader>
//         <CardContent className="space-y-6">
//           <div className="w-full flex justify-center">
//             {mediaUrl?.match(/\.(mp4|webm|ogg)$/i) ? (
//               <video
//                 controls
//                 src={mediaUrl}
//                 className="rounded-lg shadow-md max-h-[400px]"
//               />
//             ) : (
//               <img
//                 src={mediaUrl}
//                 alt="Inspection Evidence"
//                 className="rounded-lg shadow-md max-h-[400px] object-contain"
//               />
//             )}
//           </div>

//           <div className="space-y-2">
//             <p className="text-gray-700">
//               <strong>Notes:</strong>{" "}
//               {notes?.trim() ? notes : <span className="text-gray-500 italic">No notes provided</span>}
//             </p>
//             <p className="text-gray-600 text-sm flex items-center gap-2">
//               <Clock className="h-4 w-4" />
//               {new Date(createdAt).toLocaleString()}
//             </p>
//           </div>
//         </CardContent>
//       </Card>

//       {/* Proposal Summary (if linked) */}
//       {proposalId && (
//         <Card className="mt-10 border border-indigo-100 shadow-sm">
//           <CardHeader>
//             <CardTitle className="flex items-center gap-2 text-indigo-700">
//               <FileText className="h-5 w-5" />
//               Linked Proposal
//             </CardTitle>
//           </CardHeader>
//           <CardContent className="space-y-3 text-gray-700">
//             <p>
//               <strong>Proposal ID:</strong> {proposalId}
//             </p>
//             <Button
//               variant="outline"
//               className="text-blue-700 border-blue-300 hover:bg-blue-50"
//               onClick={() => router.push(`/proposal-detail/${proposalId}`)}
//             >
//               View Proposal
//             </Button>
//           </CardContent>
//         </Card>
//       )}

//       {/* Status */}
//       <div className="mt-6 flex justify-end">
//         <Badge className="bg-green-100 text-green-800 px-3 py-1">
//           Submitted
//         </Badge>
//       </div>
//     </div>
//   );
// }
