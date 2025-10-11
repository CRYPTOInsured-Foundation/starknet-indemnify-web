"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useRootStore } from "@/stores/use-root-store";
import { PolicyClass, PremiumFrequency } from "@/lib/utils";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function NewProposalPage() {
  const router = useRouter();

  const {
    insuranceProducts,
    fetchProducts,
    createProposal,
    updateProposal,
    fetchProposalsByUser,
    proposals,
    isLoadingProposal,
    user,
  } = useRootStore();

  const [form, setForm] = useState({
    id: null,
    proposer: user,
    policyClass: "",
    subjectMatter: "",
    sumInsured: "",
    premiumFrequency: "",
    frequencyFactor: 1,
  });

  const [calculatedPremium, setCalculatedPremium] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Fetch products and user proposals
  useEffect(() => {
    if (insuranceProducts.length === 0) fetchProducts();
    if (user?.id) fetchProposalsByUser(user.id);
  }, [fetchProducts, fetchProposalsByUser, insuranceProducts.length, user?.id]);

  const handleChange = (key: string, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  // 🔹 Calculate premium dynamically
  useEffect(() => {
    if (!form.policyClass || !form.sumInsured) return;

    const selectedProduct = insuranceProducts.find(
      (p) => p.policyClass === form.policyClass
    );

    if (selectedProduct?.basicRate) {
      const premium =
        (Number(form.sumInsured) * Number(selectedProduct.basicRate)) / 100;
      setCalculatedPremium(premium);
    } else {
      setCalculatedPremium(null);
    }
  }, [form.sumInsured, form.policyClass, insuranceProducts]);

  // 🔹 Submit or update proposal
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !form.policyClass ||
      !form.sumInsured ||
      !form.premiumFrequency ||
      !calculatedPremium
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    const payload = {
      proposalId: "100",
      proposer: user,
      policyClass: form.policyClass,
      subjectMatter: form.subjectMatter,
      sumInsured: form.sumInsured,
      premiumPayable: calculatedPremium.toString(),
      premiumFrequency: form.premiumFrequency,
      frequencyFactor: form.frequencyFactor,
      submissionDate: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    };

    let result;
    if (isEditing && form.id) {
      result = await updateProposal(form.id, payload);
    } else {
      result = await createProposal(payload);
    }

    if (result.success) {
      toast.success(
        isEditing
          ? "Proposal updated successfully!"
          : "Proposal submitted successfully!"
      );
      fetchProposalsByUser(user?.id as string);
      resetForm();
    } else {
      toast.error("Failed to submit proposal");
    }
  };

  // 🔹 Fill form with proposal data for editing
  const handleEdit = (proposal: any) => {
    setForm({
      id: proposal.id,
      proposer: user,
      policyClass: proposal.policyClass,
      subjectMatter: proposal.subjectMatter,
      sumInsured: proposal.sumInsured,
      premiumFrequency: proposal.premiumFrequency,
      frequencyFactor: proposal.frequencyFactor,
    });
    setCalculatedPremium(Number(proposal.premiumPayable));
    setIsEditing(true);
  };

  // 🔹 Reset form after submission or cancel
  const resetForm = () => {
    setForm({
      ...form,
      id: null,
      policyClass: "",
      subjectMatter: "",
      sumInsured: "",
      premiumFrequency: "",
      frequencyFactor: 1,
    });
    setCalculatedPremium(null);
    setIsEditing(false);
  };


const paginatedProposals = proposals
  ?.slice()
  .sort(
    (a: any, b: any) =>
      new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime()
  )
  .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);


  const totalPages = Math.ceil(proposals.length / itemsPerPage);

  return (
    <div className="max-w-6xl mx-auto py-12 px-6 space-y-10">
      {/* --- Proposal Form --- */}
      <Card className="shadow-md border border-gray-200">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-800">
            {isEditing ? "Edit Proposal" : "Submit New Insurance Proposal"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Policy Class */}
            <div>
              <Label>Policy Class</Label>
              <Select
                value={form.policyClass}
                onValueChange={(v) => handleChange("policyClass", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select policy class" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(PolicyClass)
                    .filter((v) => v !== PolicyClass.InvalidClassOfInsurance)
                    .map((cls) => (
                      <SelectItem key={cls} value={cls}>
                        {cls.replace(/([A-Z])/g, " $1").trim()}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {/* Subject Matter */}
            <div>
              <Label>Subject Matter</Label>
              <Textarea
                value={form.subjectMatter}
                onChange={(e) => handleChange("subjectMatter", e.target.value)}
                placeholder="Describe the property or activity to be insured..."
              />
            </div>

            {/* Sum Insured */}
            <div>
              <Label>Sum Insured (USD)</Label>
              <Input
                type="number"
                value={form.sumInsured}
                onChange={(e) => handleChange("sumInsured", e.target.value)}
                placeholder="Enter sum insured"
              />
            </div>

            {/* Computed Premium */}
            <div>
              <Label>Estimated Premium (USD)</Label>
              <Input
                type="text"
                value={
                  calculatedPremium
                    ? calculatedPremium.toFixed(2)
                    : "Select a policy and enter sum insured"
                }
                readOnly
                className="bg-gray-100 cursor-not-allowed"
              />
            </div>

            {/* Premium Frequency */}
            <div>
              <Label>Premium Frequency</Label>
              <Select
                value={form.premiumFrequency}
                onValueChange={(v) => handleChange("premiumFrequency", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select payment frequency" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(PremiumFrequency)
                    .filter((v) => v !== PremiumFrequency.INVALID)
                    .map((freq) => (
                      <SelectItem key={freq} value={freq}>
                        {freq}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {/* Frequency Factor */}
            <div>
              <Label>Frequency Factor</Label>
              <Input
                type="number"
                value={form.frequencyFactor}
                onChange={(e) =>
                  handleChange("frequencyFactor", Number(e.target.value))
                }
                min={1}
              />
            </div>

            {/* Submit/Update Button */}
            <div className="flex gap-3">
              <Button type="submit" className="w-full" disabled={isLoadingProposal}>
                {isLoadingProposal
                  ? isEditing
                    ? "Updating..."
                    : "Submitting..."
                  : isEditing
                  ? "Update Proposal"
                  : "Submit Proposal"}
              </Button>

              {isEditing && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                  className="w-1/3"
                >
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* --- User Proposals Table --- */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">
            My Proposals
          </CardTitle>
        </CardHeader>
        <CardContent>
          {proposals.length === 0 ? (
            <p className="text-gray-500 text-center py-6">
              No proposals yet. Submit one above!
            </p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Policy Class</TableHead>
                    <TableHead>Sum Insured</TableHead>
                    <TableHead>Premium</TableHead>
                    <TableHead>Frequency</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                {paginatedProposals.map((proposal) => (
                    <TableRow key={proposal.id}>
                    <TableCell>{proposal.policyClass}</TableCell>
                    <TableCell>${proposal.sumInsured}</TableCell>
                    <TableCell>${proposal.premiumPayable}</TableCell>
                    <TableCell>{proposal.premiumFrequency}</TableCell>
                    <TableCell>{proposal.proposalStatus || "Pending"}</TableCell>
                    {/* <TableCell className="flex gap-2">
                        <Button
                        size="sm"
                        variant="outline"
                        onClick={() => router.push(`/proposal-detail/${proposal.id}`)} // ✅ Updated route
                        >
                        View
                        </Button>
                        <Button size="sm" onClick={() => handleEdit(proposal)}>
                        Edit
                        </Button>
                    </TableCell> */}
                    <TableCell className="flex gap-2">
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => router.push(`/proposal-detail/${proposal.id}`)}
                        >
                            View
                        </Button>

                        <Button size="sm" onClick={() => handleEdit(proposal)}>
                            Edit
                        </Button>

                        <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => router.push(`/inspection-form?proposalId=${proposal.id}`)}
                        >
                            Inspect
                        </Button>
                    </TableCell>
                    </TableRow>
                ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center mt-4 gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    Prev
                  </Button>
                  <span>
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

