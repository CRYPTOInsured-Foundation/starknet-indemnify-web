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
import ProtectedRoute from "@/components/guards/ProtectedRoute";
import {
  Table,
  TableHeader,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@/components/ui/table";
import { ArrowLeft, Upload, FileText, Eye } from "lucide-react";
import type { ClaimEvidence } from "@/stores/use-claim-evidence-slice";

export default function ClaimEvidenceFormPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const claimId = searchParams.get("claimId");
  const policyId = searchParams.get("policyId");

  const {
    fetchEvidenceByClaim,
    selectedEvidence,
    createEvidence,
    isLoadingEvidence,
  } = useRootStore();

  const [form, setForm] = useState({
    files: [] as File[],
    notes: "",
  });

  useEffect(() => {
    if (!claimId) return;
    (async () => {
      await fetchEvidenceByClaim(claimId);
    })();
  }, [claimId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = e.target.files ? Array.from(e.target.files) : [];
    setForm((prev) => ({ ...prev, files: [...prev.files, ...newFiles] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!policyId || !claimId) {
      toast.error("Invalid policy or claim reference.");
      return;
    }

    if (form.files.length === 0) {
      toast.error("Please upload at least one proof file.");
      return;
    }

    const toastId = toast.loading("Uploading files...");
    try {
      const uploadedUrls: string[] = [];

      for (const file of form.files) {
        const uploadResult = await uploadSingleFile(file);
        const fileUrl = getUploadUrl(uploadResult);
        if (!fileUrl) throw new Error(`Failed to upload ${file.name}`);
        uploadedUrls.push(fileUrl);
      }

      toast.dismiss(toastId);
      toast.loading("Saving claim evidence record...");

      const result = await createEvidence({
        policyId,
        submissionDate: Date.now(),
        proofUrls: uploadedUrls,
        claim: claimId,
      });

      toast.dismiss();

      if (result.success) {
        toast.success("Claim evidence submitted successfully!");
        setForm({ files: [], notes: "" });
        await fetchEvidenceByClaim(claimId);
      } else {
        toast.error("Failed to save claim evidence.");
      }
    } catch (err: any) {
      toast.dismiss();
      console.error("Error submitting claim evidence:", err);
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
        <h1 className="text-2xl font-bold text-gray-800">
          Claim Evidence Submission
        </h1>
      </div>

      {/* Upload Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Upload className="h-5 w-5 text-blue-600" />
            Upload Proof Files
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label>Proof Files (Photos/Videos/Documents)</Label>
              <Input
                type="file"
                accept="image/*,video/*,.pdf,.doc,.docx"
                multiple
                onChange={handleFileChange}
              />
              {form.files.length > 0 && (
                <ul className="mt-2 text-sm text-gray-600 list-disc pl-4">
                  {form.files.map((file, idx) => (
                    <li key={idx}>{file.name}</li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <Label>Notes (Optional)</Label>
              <Textarea
                placeholder="Add remarks or claim details..."
                value={form.notes}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, notes: e.target.value }))
                }
              />
            </div>

            <Button
              type="submit"
              disabled={isLoadingEvidence}
              className="w-full"
            >
              {isLoadingEvidence ? "Submitting..." : "Submit Evidence"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Previous Evidence */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5 text-indigo-600" />
            Previous Evidence Submissions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!selectedEvidence ? (
            <p className="text-gray-500 text-center py-4">
              No evidence submitted yet.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Proof Files</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow key={selectedEvidence.id}>
                  <TableCell>
                    {new Date(selectedEvidence.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {selectedEvidence.proofUrls?.map((url, idx) => (
                      <div key={idx}>
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          Proof {idx + 1}
                        </a>
                      </div>
                    ))}
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        router.push(`/claim-evidence-detail/${selectedEvidence.id}`)
                      }
                    >
                      <Eye className="h-4 w-4 mr-1" /> View
                    </Button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
    </ProtectedRoute>
  );
}



// export default function ClaimEvidenceForm() {
//   const { restoreConnection } = useRootStore();
//   useEffect(() => { restoreConnection(); }, [restoreConnection]);



//   return (
//     <ProtectedRoute>
//       <ClaimEvidenceFormPage />
//     </ProtectedRoute>
//   );
// }