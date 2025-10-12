"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useRootStore } from "@/stores/use-root-store";
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

  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   if (!form.policyId || !form.claimDescription || !form.claimAmount || !form.policyClass) {
  //     toast.error("Please fill in all required fields");
  //     return;
  //   }

  //   setIsSubmitting(true);

  //   try {
  //     const policyClassCode = convertPolicyClassToCode(form.policyClass as PolicyClass);
  //     const proofArray = form.proofUrls
  //       ? form.proofUrls.split(",").map((url) => stringToHex(url.trim().slice(0, 31)))
  //       : [];

  //     // ✅ On-chain calldata
  //     const calldata = CallData.compile({
  //       policy_id: uint256.bnToUint256(BigInt(form.policyId)),
  //       claimant: address as string,
  //       claim_description: stringToHex(form.claimDescription.slice(0, 31)),
  //       claim_amount: uint256.bnToUint256(BigInt(form.claimAmount)),
  //       alternative_account: form.alternativeAccount as string || address as string,
  //       policy_class_code: policyClassCode,
  //       proof_urls: proofArray,
  //     });

  //     const contractAddress = process.env.NEXT_PUBLIC_CLAIMS_CONTRACT!;
  //     const call = {
  //       contractAddress,
  //       entrypoint: "file_claim",
  //       calldata,
  //     };

  //     const result: InvokeFunctionResponse = await (account as AccountInterface).execute(call);
  //     await (provider as ProviderInterface).waitForTransaction(result.transaction_hash);

  //     const receipt: GetTransactionReceiptResponse =
  //       await (provider as ProviderInterface).getTransactionReceipt(result.transaction_hash);

  //     const claimSubmittedSelector = hash.getSelectorFromName("ClaimSubmitted");
  //     const event = "events" in receipt
  //       ? (receipt.events as any[]).find(
  //           (e) => e.keys[0].toLowerCase() === claimSubmittedSelector.toLowerCase()
  //         )
  //       : null;

  //     if (!event) throw new Error("ClaimSubmitted event not found");

  //     const onChainClaimId = event.data[0];
  //     toast.success("✅ Claim submitted successfully on-chain!");

  //     // ✅ Off-chain save
  //     const payload = {
  //       claimId: onChainClaimId,
  //       policy: { id: form.policyId },
  //       claimant: { id: user?.id },
  //       claimDescription: form.claimDescription,
  //       claimAmount: form.claimAmount,
  //       alternativeAccount: form.alternativeAccount,
  //       policyClass: form.policyClass,
  //       submissionDate: Date.now(),
  //       updatedAt: Date.now(),
  //     };

  //     const resultOffChain = await createClaim(payload);
  //     if (resultOffChain.success) {
  //       toast.success("✅ Claim recorded off-chain successfully!");
  //       fetchClaimsByUser(user?.id as string);
  //       resetForm();
  //     } else {
  //       toast.error("❌ Failed to create claim off-chain");
  //     }
  //   } catch (err: any) {
  //     toast.error(err?.message || "Failed to submit claim");
  //   } finally {
  //     setIsSubmitting(false);
  //   }
  // };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (!form.policyId || !form.claimDescription || !form.claimAmount || !form.policyClass) {
      toast.error("Please fill in all required fields");
      return;
    }
  
    setIsSubmitting(true);
  
    try {
      // ✅ Simulate an on-chain claimId (normally emitted by ClaimSubmitted event)
      const fakeClaimId = `0x${crypto.randomUUID().replace(/-/g, "").slice(0, 64)}`;
  
      // ✅ Create payload directly for backend
      const payload = {
        claimId: fakeClaimId,
        policy: { id: form.policyId },
        claimant: { id: user?.id },
        claimDescription: form.claimDescription,
        claimAmount: form.claimAmount,
        alternativeAccount: form.alternativeAccount || user?.walletAddress,
        policyClass: form.policyClass,
        submissionDate: Date.now(),
        updatedAt: Date.now(),
      };
  
      // ✅ Call your backend directly (off-chain)
      const resultOffChain = await createClaim(payload);
  
      if (resultOffChain.success) {
        toast.success("✅ Claim created successfully (off-chain mock)!");
        await fetchClaimsByUser(user?.id as string);
        resetForm();
      } else {
        toast.error("❌ Failed to create claim off-chain");
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to create claim");
    } finally {
      setIsSubmitting(false);
    }
  };
  

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
  );
}












// 'use client';

// import { useState } from 'react';
// import ProtectedRoute from '@/components/guards/ProtectedRoute';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Badge } from '@/components/ui/badge';
// import { Textarea } from '@/components/ui/textarea';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { 
//   FileText, 
//   Plus, 
//   Clock, 
//   CheckCircle, 
//   XCircle,
//   AlertTriangle,
//   Upload,
//   ExternalLink
// } from 'lucide-react';

// interface Claim {
//   id: string;
//   policyName: string;
//   type: string;
//   amount: number;
//   status: 'pending' | 'approved' | 'rejected' | 'investigating';
//   submittedDate: Date;
//   description: string;
// }

// function ClaimsContent() {
//   const [showNewClaimForm, setShowNewClaimForm] = useState(false);
//   const [claims] = useState<Claim[]>([
//     {
//       id: '1',
//       policyName: 'DeFi Protocol Coverage',
//       type: 'Smart Contract Exploit',
//       amount: 15000,
//       status: 'investigating',
//       submittedDate: new Date('2024-01-15'),
//       description: 'Funds lost due to reentrancy attack on protocol',
//     },
//     {
//       id: '2',
//       policyName: 'Bridge Protection',
//       type: 'Bridge Failure',
//       amount: 8500,
//       status: 'approved',
//       submittedDate: new Date('2024-01-10'),
//       description: 'Assets stuck due to bridge downtime',
//     },
//   ]);

//   const statusConfig = {
//     pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
//     investigating: { color: 'bg-blue-100 text-blue-800', icon: AlertTriangle },
//     approved: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
//     rejected: { color: 'bg-red-100 text-red-800', icon: XCircle },
//   };

//   const handleSubmitClaim = (e: React.FormEvent) => {
//     e.preventDefault();
//     // Handle claim submission
//     setShowNewClaimForm(false);
//   };

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         {/* Header */}
//         <div className="mb-8">
//           <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
//             <div>
//               <h1 className="text-3xl font-bold text-gray-900">Claims Management</h1>
//               <p className="text-gray-600 mt-1">
//                 File and track your insurance claims.
//               </p>
//             </div>
//             <div className="mt-4 sm:mt-0">
//               <Button 
//                 className="bg-blue-600 hover:bg-blue-700"
//                 onClick={() => setShowNewClaimForm(true)}
//               >
//                 <Plus className="h-4 w-4 mr-2" />
//                 File New Claim
//               </Button>
//             </div>
//           </div>
//         </div>

//         {/* Stats */}
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
//           <Card>
//             <CardContent className="p-6">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm font-medium text-gray-600">Total Claims</p>
//                   <p className="text-2xl font-bold text-gray-900">{claims.length}</p>
//                 </div>
//                 <FileText className="h-8 w-8 text-blue-600" />
//               </div>
//             </CardContent>
//           </Card>
//           <Card>
//             <CardContent className="p-6">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm font-medium text-gray-600">Under Review</p>
//                   <p className="text-2xl font-bold text-blue-600">
//                     {claims.filter(c => c.status === 'investigating' || c.status === 'pending').length}
//                   </p>
//                 </div>
//                 <Clock className="h-8 w-8 text-blue-600" />
//               </div>
//             </CardContent>
//           </Card>
//           <Card>
//             <CardContent className="p-6">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm font-medium text-gray-600">Approved</p>
//                   <p className="text-2xl font-bold text-green-600">
//                     {claims.filter(c => c.status === 'approved').length}
//                   </p>
//                 </div>
//                 <CheckCircle className="h-8 w-8 text-green-600" />
//               </div>
//             </CardContent>
//           </Card>
//           <Card>
//             <CardContent className="p-6">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm font-medium text-gray-600">Total Paid</p>
//                   <p className="text-2xl font-bold text-green-600">
//                     ${claims.filter(c => c.status === 'approved').reduce((sum, c) => sum + c.amount, 0).toLocaleString()}
//                   </p>
//                 </div>
//                 <CheckCircle className="h-8 w-8 text-green-600" />
//               </div>
//             </CardContent>
//           </Card>
//         </div>

//         {/* New Claim Form */}
//         {showNewClaimForm && (
//           <Card className="mb-8">
//             <CardHeader>
//               <CardTitle>File New Claim</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <form onSubmit={handleSubmitClaim} className="space-y-6">
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                   <div>
//                     <Label htmlFor="policy">Policy</Label>
//                     <select id="policy" className="w-full mt-1 rounded-md border border-gray-300 px-3 py-2">
//                       <option>Select a policy</option>
//                       <option>DeFi Protocol Coverage</option>
//                       <option>Smart Contract Protection</option>
//                       <option>Bridge Protection</option>
//                     </select>
//                   </div>
//                   <div>
//                     <Label htmlFor="claimType">Claim Type</Label>
//                     <select id="claimType" className="w-full mt-1 rounded-md border border-gray-300 px-3 py-2">
//                       <option>Select claim type</option>
//                       <option>Smart Contract Exploit</option>
//                       <option>Bridge Failure</option>
//                       <option>Protocol Hack</option>
//                       <option>Rug Pull</option>
//                     </select>
//                   </div>
//                 </div>

//                 <div>
//                   <Label htmlFor="amount">Claim Amount ($)</Label>
//                   <Input id="amount" type="number" placeholder="Enter claim amount" className="mt-1" />
//                 </div>

//                 <div>
//                   <Label htmlFor="description">Description</Label>
//                   <Textarea 
//                     id="description" 
//                     placeholder="Provide detailed description of the incident..."
//                     className="mt-1"
//                     rows={4}
//                   />
//                 </div>

//                 <div>
//                   <Label>Supporting Documents</Label>
//                   <div className="mt-1 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
//                     <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
//                     <p className="text-gray-600 mb-2">Upload transaction hashes, screenshots, or other evidence</p>
//                     <Button variant="outline" type="button">Choose Files</Button>
//                   </div>
//                 </div>

//                 <div className="flex justify-end space-x-4">
//                   <Button 
//                     type="button" 
//                     variant="outline"
//                     onClick={() => setShowNewClaimForm(false)}
//                   >
//                     Cancel
//                   </Button>
//                   <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
//                     Submit Claim
//                   </Button>
//                 </div>
//               </form>
//             </CardContent>
//           </Card>
//         )}

//         {/* Claims List */}
//         <div className="space-y-6">
//           {claims.length === 0 ? (
//             <Card>
//               <CardContent className="p-12 text-center">
//                 <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
//                 <h3 className="text-lg font-medium text-gray-900 mb-2">No claims yet</h3>
//                 <p className="text-gray-600 mb-6">
//                   If you experience a covered incident, you can file a claim here.
//                 </p>
//                 <Button 
//                   className="bg-blue-600 hover:bg-blue-700"
//                   onClick={() => setShowNewClaimForm(true)}
//                 >
//                   File Your First Claim
//                 </Button>
//               </CardContent>
//             </Card>
//           ) : (
//             claims.map((claim) => {
//               const statusInfo = statusConfig[claim.status];
//               const StatusIcon = statusInfo.icon;

//               return (
//                 <Card key={claim.id} className="hover:shadow-md transition-shadow">
//                   <CardContent className="p-6">
//                     <div className="flex items-start justify-between mb-4">
//                       <div className="flex-1">
//                         <div className="flex items-center space-x-3 mb-2">
//                           <h3 className="text-lg font-semibold text-gray-900">
//                             Claim #{claim.id}
//                           </h3>
//                           <Badge className={statusInfo.color}>
//                             <StatusIcon className="h-3 w-3 mr-1" />
//                             {claim.status.charAt(0).toUpperCase() + claim.status.slice(1)}
//                           </Badge>
//                         </div>
//                         <p className="text-gray-600 mb-1">{claim.policyName}</p>
//                         <p className="text-sm text-gray-500">
//                           Submitted {claim.submittedDate.toLocaleDateString()}
//                         </p>
//                       </div>
//                       <div className="text-right">
//                         <p className="text-2xl font-bold text-gray-900">
//                           ${claim.amount.toLocaleString()}
//                         </p>
//                         <p className="text-sm text-gray-600">{claim.type}</p>
//                       </div>
//                     </div>

//                     <p className="text-gray-700 mb-4">{claim.description}</p>

//                     <div className="flex items-center justify-between pt-4 border-t border-gray-100">
//                       <div className="flex space-x-4">
//                         <Button variant="outline" size="sm">
//                           View Details
//                           <ExternalLink className="h-4 w-4 ml-2" />
//                         </Button>
//                         {claim.status === 'pending' && (
//                           <Button variant="outline" size="sm">
//                             Upload Documents
//                           </Button>
//                         )}
//                       </div>
                      
//                       {claim.status === 'investigating' && (
//                         <p className="text-sm text-blue-600">
//                           Estimated review time: 3-5 business days
//                         </p>
//                       )}
//                     </div>
//                   </CardContent>
//                 </Card>
//               );
//             })
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// export default function Claims() {
//   return (
//     <ProtectedRoute>
//       <ClaimsContent />
//     </ProtectedRoute>
//   );
// }