"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useRootStore } from "@/stores/use-root-store";
import { uploadSingleFile, getUploadUrl } from "@/lib/utils";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Table,
  TableHeader,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@/components/ui/table";
import ProtectedRoute from "@/components/guards/ProtectedRoute";
import { ArrowLeft, Upload, FileText, Eye } from "lucide-react";
import type { Inspection } from "@/stores/use-inspection-slice";

export default function InspectionFormPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const proposalId = searchParams.get("proposalId");

  const {
    fetchProposalById,
    selectedProposal,
    fetchInspectionsByProposal,
    createInspection,
    inspections,
    isLoadingInspection,
  } = useRootStore();

  const [form, setForm] = useState({
    mediaFile: null as File | null,
    notes: "",
  });

  useEffect(() => {
    if (!proposalId) return;
    (async () => {
      await fetchProposalById(proposalId);
      await fetchInspectionsByProposal(proposalId);
    })();
  }, [proposalId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setForm((prev) => ({ ...prev, mediaFile: file }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!proposalId) {
      toast.error("Invalid proposal reference.");
      return;
    }

    if (!form.mediaFile) {
      toast.error("Please upload an inspection file.");
      return;
    }

    const toastId = toast.loading("Uploading file...");
    try {
      const uploadResult = await uploadSingleFile(form.mediaFile);
      const mediaUrl = getUploadUrl(uploadResult);

      if (!mediaUrl) throw new Error("File upload failed.");

      toast.dismiss(toastId);
      toast.loading("Saving inspection record...");

      const result = await createInspection({
        proposalId,
        mediaUrl,
        notes: form.notes || "",
      });

      toast.dismiss();

      if (result.success) {
        toast.success("Inspection submitted successfully!");
        setForm({ mediaFile: null, notes: "" });
        await fetchInspectionsByProposal(proposalId);
      } else {
        toast.error("Failed to save inspection.");
      }
    } catch (err: any) {
      toast.dismiss();
      console.error("Error submitting inspection:", err);
      toast.error(err.message || "Unexpected error occurred.");
    }
  };

  return (
    <ProtectedRoute>
    <div className="max-w-5xl mx-auto py-10 px-6 space-y-10">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <h1 className="text-2xl font-bold text-gray-800">Inspection Form</h1>
      </div>

      {/* Proposal Info */}
      {selectedProposal && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800">
              Proposal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="text-gray-700 space-y-2">
            <p><strong>ID:</strong> {selectedProposal.proposalId}</p>
            <p><strong>Subject:</strong> {selectedProposal.subjectMatter}</p>
            <p><strong>Sum Insured:</strong> ${selectedProposal.sumInsured}</p>
          </CardContent>
        </Card>
      )}

      {/* Upload Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Upload className="h-5 w-5 text-blue-600" />
            Upload Inspection Evidence
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label>Inspection Media (Photo/Video)</Label>
              <Input type="file" accept="image/*,video/*" onChange={handleFileChange} />
            </div>

            <div>
              <Label>Notes (Optional)</Label>
              <Textarea
                placeholder="Add comments or findings..."
                value={form.notes}
                onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
              />
            </div>

            <Button type="submit" disabled={isLoadingInspection} className="w-full">
              {isLoadingInspection ? "Submitting..." : "Submit Inspection"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Inspection History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5 text-indigo-600" />
            Previous Inspections
          </CardTitle>
        </CardHeader>
        <CardContent>
          {inspections.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              No inspections recorded yet.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead>Media</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inspections.map((insp) => (
                  <TableRow key={insp.id}>
                    <TableCell>{new Date(insp.createdAt).toLocaleString()}</TableCell>
                    <TableCell>{insp.notes || "—"}</TableCell>
                    <TableCell>
                      <a
                        href={insp.mediaUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        View Media
                      </a>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => router.push(`/inspection-detail/${insp.id}`)}
                      >
                        <Eye className="h-4 w-4 mr-1" /> View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
    </ProtectedRoute>
  );
}



// export default function InspectionForm() {
//   const { restoreConnection } = useRootStore();
//   useEffect(() => { restoreConnection(); }, [restoreConnection]);



//   return (
//     <ProtectedRoute>
//       <InspectionFormPage />
//     </ProtectedRoute>
//   );
// }