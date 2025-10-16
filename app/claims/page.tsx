"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useRootStore } from "@/stores/use-root-store";
import ProtectedRoute from "@/components/guards/ProtectedRoute";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableHead,
  TableHeader,
  TableRow,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import {
  CallData,
  InvokeFunctionResponse,
  AccountInterface,
  GetTransactionReceiptResponse,
  ProviderInterface,
  hash,
  uint256,
} from "starknet";
import { PolicyClass, convertPolicyClassToCode, stringToHex } from "@/lib/utils";

import claimsAbi from "../../contract_abis/claims_contract.json" assert { type: "json" }; 


export default function ClaimsPage() {
  const router = useRouter();
  const {
    user,
    address,
    account,
    provider,
    claims,
    createClaim,
    updateClaim,
    fetchClaimsByUser,
    restoreConnection
  } = useRootStore();

  const [form, setForm] = useState({
    policyId: "",
    claimDescription: "",
    claimAmount: "",
    alternativeAccount: "",
    policyClass: "",
    proofUrls: "",
  });

  const [editingClaim, setEditingClaim] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    restoreConnection();
  }, [restoreConnection]);


  // Fetch user's claims
  useEffect(() => {
    if (user?.id) fetchClaimsByUser(user.id);
  }, [user?.id, fetchClaimsByUser]);
 

  const handleChange = (key: string, value: any) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const resetForm = () => {
    setForm({
      policyId: "",
      claimDescription: "",
      claimAmount: "",
      alternativeAccount: "",
      policyClass: "",
      proofUrls: "",
    });
    setEditingClaim(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.policyId || !form.claimDescription || !form.claimAmount || !form.policyClass) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      const policyClassCode = convertPolicyClassToCode(form.policyClass as PolicyClass);
      const proofArray = form.proofUrls
        ? form.proofUrls.split(",").map((url) => stringToHex(url.trim().slice(0, 31)))
        : [];

      // ✅ On-chain calldata
      const calldata = new CallData(claimsAbi).compile("file_claim",{
        policy_id: uint256.bnToUint256(BigInt(form.policyId)),
        claimant: address as string,
        claim_description: stringToHex(form.claimDescription.slice(0, 31)),
        claim_amount: uint256.bnToUint256(BigInt(form.claimAmount)),
        alternative_account: form.alternativeAccount as string || address as string,
        policy_class_code: policyClassCode,
        proof_urls: proofArray,
      });

      const contractAddress = process.env.NEXT_PUBLIC_CLAIMS_CONTRACT!;
      const call = {
        contractAddress,
        entrypoint: "file_claim",
        calldata,
      };

      const result: InvokeFunctionResponse = await (account as AccountInterface).execute(call);
      await (provider as ProviderInterface).waitForTransaction(result.transaction_hash);

      const receipt: GetTransactionReceiptResponse =
        await (provider as ProviderInterface).getTransactionReceipt(result.transaction_hash);

      const claimSubmittedSelector = hash.getSelectorFromName("ClaimSubmitted");
      const event = "events" in receipt
        ? (receipt.events as any[]).find(
            (e) => e.keys[0].toLowerCase() === claimSubmittedSelector.toLowerCase()
          )
        : null;

      if (!event) throw new Error("ClaimSubmitted event not found");

      const onChainClaimId = event.data[0];
      toast.success("✅ Claim submitted successfully on-chain!");

      // ✅ Off-chain save
      const payload = {
        claimId: onChainClaimId,
        policy: { id: form.policyId },
        claimant: { id: user?.id },
        claimDescription: form.claimDescription,
        claimAmount: form.claimAmount,
        alternativeAccount: form.alternativeAccount,
        policyClass: form.policyClass,
        submissionDate: Date.now(),
        updatedAt: Date.now(),
      };

      const resultOffChain = await createClaim(payload);
      if (resultOffChain.success) {
        toast.success("✅ Claim recorded off-chain successfully!");
        fetchClaimsByUser(user?.id as string);
        resetForm();
      } else {
        toast.error("❌ Failed to create claim off-chain");
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to submit claim");
    } finally {
      setIsSubmitting(false);
    }
  };

  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();
  
  //   if (!form.policyId || !form.claimDescription || !form.claimAmount || !form.policyClass) {
  //     toast.error("Please fill in all required fields");
  //     return;
  //   }
  
  //   setIsSubmitting(true);
  
  //   try {
  //     // ✅ Simulate an on-chain claimId (normally emitted by ClaimSubmitted event)
  //     const fakeClaimId = `0x${crypto.randomUUID().replace(/-/g, "").slice(0, 64)}`;
  
  //     // ✅ Create payload directly for backend
  //     const payload = {
  //       claimId: fakeClaimId,
  //       policy: { id: form.policyId },
  //       claimant: { id: user?.id },
  //       claimDescription: form.claimDescription,
  //       claimAmount: form.claimAmount,
  //       alternativeAccount: form.alternativeAccount || user?.walletAddress,
  //       policyClass: form.policyClass,
  //       submissionDate: Date.now(),
  //       updatedAt: Date.now(),
  //     };
  
  //     // ✅ Call your backend directly (off-chain)
  //     const resultOffChain = await createClaim(payload);
  
  //     if (resultOffChain.success) {
  //       toast.success("✅ Claim created successfully (off-chain mock)!");
  //       await fetchClaimsByUser(user?.id as string);
  //       resetForm();
  //     } else {
  //       toast.error("❌ Failed to create claim off-chain");
  //     }
  //   } catch (err: any) {
  //     toast.error(err?.message || "Failed to create claim");
  //   } finally {
  //     setIsSubmitting(false);
  //   }
  // };
  

  const handleUpdate = async () => {
    if (!editingClaim) return;
    setIsSubmitting(true);
    try {
      const result = await updateClaim(editingClaim, {
        claimDescription: form.claimDescription,
        claimAmount: form.claimAmount,
        alternativeAccount: form.alternativeAccount,
        updatedAt: Date.now(),
      });
      if (result.success) {
        toast.success("✅ Claim updated successfully!");
        fetchClaimsByUser(user?.id as string);
        resetForm();
      } else toast.error("❌ Failed to update claim");
    } catch (err: any) {
      toast.error(err.message || "Error updating claim");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (claim: any) => {
    setEditingClaim(claim.id);
    setForm({
      policyId: claim.policy?.id || "",
      claimDescription: claim.claimDescription,
      claimAmount: claim.claimAmount,
      alternativeAccount: claim.alternativeAccount || "",
      policyClass: claim.policyClass,
      proofUrls: "",
    });
  };

  return (
    <ProtectedRoute>
    <div className="max-w-6xl mx-auto py-12 px-6 space-y-10">
      {/* --- Claim Form --- */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            {editingClaim ? "Update Claim" : "File New Claim"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={editingClaim ? handleUpdate : handleSubmit} className="space-y-5">
            <div>
              <Label>Policy ID</Label>
              <Input
                value={form.policyId}
                onChange={(e) => handleChange("policyId", e.target.value)}
                placeholder="Enter Policy ID (u256)"
                required
              />
            </div>

            <div>
              <Label>Policy Class</Label>
              <Select
                value={form.policyClass}
                onValueChange={(v) => handleChange("policyClass", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(PolicyClass)
                    .filter((v) => v !== PolicyClass.InvalidClassOfInsurance)
                    .map((cls) => (
                      <SelectItem key={cls} value={cls}>
                        {cls}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Claim Description</Label>
              <Textarea
                value={form.claimDescription}
                onChange={(e) => handleChange("claimDescription", e.target.value)}
                placeholder="Describe the loss or damage"
                required
              />
            </div>

            <div>
              <Label>Claim Amount</Label>
              <Input
                type="number"
                value={form.claimAmount}
                onChange={(e) => handleChange("claimAmount", e.target.value)}
                required
              />
            </div>

            <div>
              <Label>Alternative Account (optional)</Label>
              <Input
                value={form.alternativeAccount}
                onChange={(e) => handleChange("alternativeAccount", e.target.value)}
                placeholder="0x..."
              />
            </div>

            <div>
              <Label>Proof URLs (comma-separated)</Label>
              <Input
                value={form.proofUrls}
                onChange={(e) => handleChange("proofUrls", e.target.value)}
                placeholder="ipfs://proof1, ipfs://proof2"
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? editingClaim
                  ? "Updating Claim..."
                  : "Submitting Claim..."
                : editingClaim
                ? "Update Claim"
                : "Submit Claim"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* --- Claims Table --- */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">My Claims</CardTitle>
        </CardHeader>
        <CardContent>
          {claims.length === 0 ? (
            <p className="text-gray-500 text-center py-6">No claims found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Policy Class</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {claims.map((claim) => (
                  <TableRow key={claim.id}>
                    <TableCell>{claim.policyClass}</TableCell>
                    <TableCell>{claim.claimAmount}</TableCell>
                    <TableCell>{claim.claimStatus}</TableCell>
                    <TableCell className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(claim)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => router.push(`/claim-detail/${claim.id}`)}
                      >
                        View
                      </Button>
                      <Button
                          size="sm"
                          variant="secondary"
                          onClick={() =>
                            router.push(`/claim-evidence-form?claimId=${claim.id}`)
                          }
                        >
                          Add Evidence
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



// export default function Claims() {
//   const { restoreConnection } = useRootStore();
//   useEffect(() => { restoreConnection(); }, [restoreConnection]);



//   return (
//     <ProtectedRoute>
//       <ClaimsPage/>
//     </ProtectedRoute>
//   );
// }
